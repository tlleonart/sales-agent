import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Constantes de configuración de precios
 * Estos valores podrían moverse a una tabla de configuración en el futuro.
 */
const PRICING_CONFIG = {
  // Comisión de la agencia (20%)
  AGENCY_COMMISSION_RATE: 0.20,

  // Comisión de intermediario para terceros (10%)
  INTERMEDIARY_COMMISSION_RATE: 0.10,

  // IVA Argentina
  IVA_RATE: 0.21,

  // Días por mes para cálculos proporcionales
  DAYS_PER_MONTH: 30,
};

/**
 * Interface para el cálculo de precio de un item
 */
interface PriceBreakdown {
  // Item info
  inventoryId: string;
  code: string;

  // Días de campaña
  campaignDays: number;

  // Desglose de costos
  rentalProportional: number;    // (Alquiler mensual / 30) * días
  productionCost: number;        // Costo único de producción
  installationCost: number;      // Costo único de instalación
  municipalTax: number;          // Tasa municipal proporcional

  // Subtotales
  subtotalNeto: number;          // Suma de todos los costos base
  agencyCommission: number;      // Comisión de agencia
  intermediaryCommission: number; // Comisión de intermediario (si aplica)

  // Totales
  totalNeto: number;             // Sin IVA
  iva: number;                   // IVA calculado
  totalBruto: number;            // Con IVA

  // Metadata
  currency: string;
  isThirdParty: boolean;
}

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
  handler: async (ctx, args): Promise<PriceBreakdown | null> => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return null;
    }

    const { pricing, owner, code } = item;
    const isThirdParty = owner !== "Global";
    const includeIntermediary = args.includeIntermediaryCommission ?? isThirdParty;

    // Cálculo proporcional del alquiler
    const rentalProportional = (pricing.rental_monthly / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;

    // Tasa municipal proporcional (asumiendo que es mensual)
    const municipalTaxProportional = (pricing.municipal_tax / PRICING_CONFIG.DAYS_PER_MONTH) * args.campaignDays;

    // Subtotal neto (sin comisiones)
    const subtotalNeto =
      rentalProportional +
      pricing.production_cost +
      pricing.installation_cost +
      municipalTaxProportional;

    // Comisiones
    const agencyCommission = subtotalNeto * PRICING_CONFIG.AGENCY_COMMISSION_RATE;
    const intermediaryCommission = includeIntermediary
      ? subtotalNeto * PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE
      : 0;

    // Total neto (con comisiones, sin IVA)
    const totalNeto = subtotalNeto + agencyCommission + intermediaryCommission;

    // IVA y total bruto
    const iva = totalNeto * PRICING_CONFIG.IVA_RATE;
    const totalBruto = totalNeto + iva;

    return {
      inventoryId: args.inventoryId,
      code,
      campaignDays: args.campaignDays,
      rentalProportional: Math.round(rentalProportional * 100) / 100,
      productionCost: pricing.production_cost,
      installationCost: pricing.installation_cost,
      municipalTax: Math.round(municipalTaxProportional * 100) / 100,
      subtotalNeto: Math.round(subtotalNeto * 100) / 100,
      agencyCommission: Math.round(agencyCommission * 100) / 100,
      intermediaryCommission: Math.round(intermediaryCommission * 100) / 100,
      totalNeto: Math.round(totalNeto * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      totalBruto: Math.round(totalBruto * 100) / 100,
      currency: pricing.currency,
      isThirdParty,
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
    let totalNeto = 0;
    let totalBruto = 0;
    let hasThirdParty = false;

    for (const itemRequest of args.items) {
      const item = await ctx.db.get(itemRequest.inventoryId);

      if (!item) {
        continue;
      }

      const { pricing, owner, code } = item;
      const isThirdParty = owner !== "Global";

      if (isThirdParty) {
        hasThirdParty = true;
      }

      // Cálculos
      const rentalProportional = (pricing.rental_monthly / PRICING_CONFIG.DAYS_PER_MONTH) * itemRequest.campaignDays;
      const municipalTaxProportional = (pricing.municipal_tax / PRICING_CONFIG.DAYS_PER_MONTH) * itemRequest.campaignDays;

      const subtotalNeto =
        rentalProportional +
        pricing.production_cost +
        pricing.installation_cost +
        municipalTaxProportional;

      const agencyCommission = subtotalNeto * PRICING_CONFIG.AGENCY_COMMISSION_RATE;
      const intermediaryCommission = isThirdParty
        ? subtotalNeto * PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE
        : 0;

      const itemTotalNeto = subtotalNeto + agencyCommission + intermediaryCommission;
      const iva = itemTotalNeto * PRICING_CONFIG.IVA_RATE;
      const itemTotalBruto = itemTotalNeto + iva;

      itemPrices.push({
        inventoryId: itemRequest.inventoryId,
        code,
        campaignDays: itemRequest.campaignDays,
        rentalProportional: Math.round(rentalProportional * 100) / 100,
        productionCost: pricing.production_cost,
        installationCost: pricing.installation_cost,
        municipalTax: Math.round(municipalTaxProportional * 100) / 100,
        subtotalNeto: Math.round(subtotalNeto * 100) / 100,
        agencyCommission: Math.round(agencyCommission * 100) / 100,
        intermediaryCommission: Math.round(intermediaryCommission * 100) / 100,
        totalNeto: Math.round(itemTotalNeto * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        totalBruto: Math.round(itemTotalBruto * 100) / 100,
        currency: pricing.currency,
        isThirdParty,
      });

      totalNeto += itemTotalNeto;
      totalBruto += itemTotalBruto;
    }

    return {
      items: itemPrices,
      summary: {
        itemCount: itemPrices.length,
        totalNeto: Math.round(totalNeto * 100) / 100,
        totalBruto: Math.round(totalBruto * 100) / 100,
        currency: "ARS",
        hasThirdPartyItems: hasThirdParty,
      },
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
    const isThirdParty = owner !== "Global";

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
      return null;
    }

    const { pricing, owner, code } = item;
    const isThirdParty = owner !== "Global";

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
