import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  PRICING_CONFIG,
  GLOBAL_OWNER,
  calculatePriceBreakdown,
  type PriceBreakdown,
} from "./config";

/**
 * Query: Calcular precio para un soporte específico
 * Aplica la fórmula completa de pricing.
 */
export const calculateItemPrice = query({
  args: {
    inventoryId: v.id("inventory"),
    campaignDays: v.number(),
    includeIntermediaryCommission: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ success: true; data: PriceBreakdown } | { success: false; error: string }> => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return {
        success: false,
        error: `No se encontró el soporte con ID ${args.inventoryId}`,
      };
    }

    const { pricing, owner, code } = item;
    const isThirdParty = owner !== GLOBAL_OWNER;

    const priceBreakdown = calculatePriceBreakdown({
      inventoryId: args.inventoryId,
      code,
      campaignDays: args.campaignDays,
      rentalMonthly: pricing.rental_monthly,
      productionCost: pricing.production_cost,
      installationCost: pricing.installation_cost,
      municipalTax: pricing.municipal_tax,
      currency: pricing.currency,
      isThirdParty,
      includeIntermediaryCommission: args.includeIntermediaryCommission,
    });

    return {
      success: true,
      data: priceBreakdown,
    };
  },
});

/**
 * Query: Calcular precio de múltiples items (propuesta completa)
 * Suma los precios de varios soportes para una campaña.
 */
export const calculateProposalTotal = query({
  args: {
    items: v.array(v.object({
      inventoryId: v.id("inventory"),
      campaignDays: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const itemPrices: PriceBreakdown[] = [];
    const notFoundIds: string[] = [];
    let totalNeto = 0;
    let totalBruto = 0;
    let hasThirdParty = false;

    for (const itemRequest of args.items) {
      const item = await ctx.db.get(itemRequest.inventoryId);

      if (!item) {
        notFoundIds.push(itemRequest.inventoryId);
        continue;
      }

      const { pricing, owner, code } = item;
      const isThirdParty = owner !== GLOBAL_OWNER;

      if (isThirdParty) {
        hasThirdParty = true;
      }

      const priceBreakdown = calculatePriceBreakdown({
        inventoryId: itemRequest.inventoryId,
        code,
        campaignDays: itemRequest.campaignDays,
        rentalMonthly: pricing.rental_monthly,
        productionCost: pricing.production_cost,
        installationCost: pricing.installation_cost,
        municipalTax: pricing.municipal_tax,
        currency: pricing.currency,
        isThirdParty,
      });

      itemPrices.push(priceBreakdown);
      totalNeto += priceBreakdown.totalNeto;
      totalBruto += priceBreakdown.totalBruto;
    }

    return {
      success: true,
      items: itemPrices,
      summary: {
        itemCount: itemPrices.length,
        totalNeto: Math.round(totalNeto * 100) / 100,
        totalBruto: Math.round(totalBruto * 100) / 100,
        currency: "ARS",
        hasThirdPartyItems: hasThirdParty,
      },
      warnings: notFoundIds.length > 0
        ? {
            message: `${notFoundIds.length} soporte(s) no encontrado(s)`,
            notFoundIds
          }
        : null,
    };
  },
});

/**
 * Query: Obtener configuración de precios actual
 * Útil para mostrar las tasas aplicadas en la UI.
 */
export const getPricingConfig = query({
  args: {},
  handler: async () => {
    return {
      agencyCommissionRate: PRICING_CONFIG.AGENCY_COMMISSION_RATE * 100,
      intermediaryCommissionRate: PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE * 100,
      ivaRate: PRICING_CONFIG.IVA_RATE * 100,
      daysPerMonth: PRICING_CONFIG.DAYS_PER_MONTH,
    };
  },
});

/**
 * Query: Calcular precio por código de inventario
 * Versión simplificada que acepta código en lugar de ID.
 * Útil para integraciones con AI tools.
 */
export const calculateByCode = query({
  args: {
    inventoryCode: v.string(),
    campaignDays: v.number(),
  },
  handler: async (ctx, args) => {
    // Buscar el item por código
    const item = await ctx.db
      .query("inventory")
      .filter((q) => q.eq(q.field("code"), args.inventoryCode))
      .first();

    if (!item) {
      return {
        success: false,
        error: `No se encontró el soporte con código ${args.inventoryCode}`,
      };
    }

    const { pricing, owner, code, location, type } = item;
    const isThirdParty = owner !== GLOBAL_OWNER;

    // Cálculos
    const rentalProportional = (pricing.rental_monthly / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;
    const municipalTaxProportional = (pricing.municipal_tax / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;

    const subtotalNeto =
      rentalProportional +
      pricing.production_cost +
      pricing.installation_cost +
      municipalTaxProportional;

    const agencyCommission = subtotalNeto * PRICING_CONFIG.AGENCY_COMMISSION_RATE;
    const intermediaryCommission = isThirdParty
      ? subtotalNeto * PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE
      : 0;

    const totalNeto = subtotalNeto + agencyCommission + intermediaryCommission;
    const iva = totalNeto * PRICING_CONFIG.IVA_RATE;
    const totalBruto = totalNeto + iva;

    return {
      success: true,
      codigo: code,
      tipo: type,
      ubicacion: location.address,
      zona: location.zone,
      propietario: owner,
      esTercero: isThirdParty,
      diasCampana: args.campaignDays,
      desglose: {
        alquilerProporcional: Math.round(rentalProportional),
        produccion: pricing.production_cost,
        instalacion: pricing.installation_cost,
        tasaMunicipal: Math.round(municipalTaxProportional),
        subtotalNeto: Math.round(subtotalNeto),
        comisionAgencia: Math.round(agencyCommission),
        comisionIntermediario: Math.round(intermediaryCommission),
      },
      totalNeto: Math.round(totalNeto),
      iva: Math.round(iva),
      totalBruto: Math.round(totalBruto),
      moneda: "ARS",
      nota: isThirdParty ? "Precio sujeto a confirmación de disponibilidad (tercero)" : null,
    };
  },
});

/**
 * Query: Simular precio con diferentes comisiones
 * Para negociación de descuentos.
 */
export const simulatePrice = query({
  args: {
    inventoryId: v.id("inventory"),
    campaignDays: v.number(),
    customAgencyRate: v.optional(v.number()),
    customIntermediaryRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return {
        success: false,
        error: `No se encontró el soporte con ID ${args.inventoryId}`,
      };
    }

    const { pricing, owner, code } = item;
    const isThirdParty = owner !== GLOBAL_OWNER;

    // Usar tasas custom o las default
    const agencyRate = args.customAgencyRate ?? PRICING_CONFIG.AGENCY_COMMISSION_RATE;
    const intermediaryRate = args.customIntermediaryRate ??
      (isThirdParty ? PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE : 0);

    // Cálculos
    const rentalProportional = (pricing.rental_monthly / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;
    const municipalTaxProportional = (pricing.municipal_tax / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;

    const subtotalNeto =
      rentalProportional +
      pricing.production_cost +
      pricing.installation_cost +
      municipalTaxProportional;

    const agencyCommission = subtotalNeto * agencyRate;
    const intermediaryCommission = subtotalNeto * intermediaryRate;

    const totalNeto = subtotalNeto + agencyCommission + intermediaryCommission;
    const iva = totalNeto * PRICING_CONFIG.IVA_RATE;
    const totalBruto = totalNeto + iva;

    return {
      success: true,
      code,
      campaignDays: args.campaignDays,
      appliedRates: {
        agencyRate: agencyRate * 100,
        intermediaryRate: intermediaryRate * 100,
        ivaRate: PRICING_CONFIG.IVA_RATE * 100,
      },
      subtotalNeto: Math.round(subtotalNeto * 100) / 100,
      agencyCommission: Math.round(agencyCommission * 100) / 100,
      intermediaryCommission: Math.round(intermediaryCommission * 100) / 100,
      totalNeto: Math.round(totalNeto * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      totalBruto: Math.round(totalBruto * 100) / 100,
      currency: pricing.currency,
    };
  },
});
