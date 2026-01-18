/**
 * Mockup Generation Module for OOH Agent
 *
 * This module provides FREE mockup generation options for the prototype:
 *
 * Option 1: Cloudinary Text Overlay (FREE, recommended for prototype)
 * - Uses Cloudinary's free tier for text overlays
 * - No API costs, just URL generation
 *
 * Option 2: Placeholder Image (100% FREE, fallback)
 * - Generates a placeholder image URL with client branding
 *
 * Future: Hugging Face Inpainting (FREE tier available)
 * - For real image editing when ready to upgrade
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Configuration for mockup generation
export const MOCKUP_CONFIG = {
  // Cloudinary cloud name (set this if using Cloudinary)
  CLOUDINARY_CLOUD_NAME: "", // TODO: Set this in production

  // Base billboard image URL (the Harry Potter billboard)
  BASE_BILLBOARD_IMAGE: "https://raw.githubusercontent.com/tlleonart/sales-agent/main/image-example.png",

  // Placeholder service for quick mockups
  PLACEHOLDER_SERVICE: "https://placehold.co",

  // Default billboard dimensions
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
} as const;

/**
 * Generate a simple placeholder mockup URL
 * Uses placehold.co which is 100% free
 *
 * Format: Billboard-style image with client name and support code
 */
export function generatePlaceholderMockup(
  clientName: string,
  supportCode: string,
  supportType: string,
  options?: {
    width?: number;
    height?: number;
    bgColor?: string;
    textColor?: string;
  }
): string {
  const width = options?.width ?? MOCKUP_CONFIG.DEFAULT_WIDTH;
  const height = options?.height ?? MOCKUP_CONFIG.DEFAULT_HEIGHT;
  const bgColor = options?.bgColor ?? "1a365d"; // Dark blue
  const textColor = options?.textColor ?? "ffffff"; // White

  // Encode the text for URL
  const text = encodeURIComponent(`${clientName}\n\n${supportType} - ${supportCode}`);

  // Generate placehold.co URL
  return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}/png?text=${text}&font=roboto`;
}

/**
 * Generate Cloudinary overlay URL (if configured)
 * Uses Cloudinary's free tier text overlay feature
 *
 * Requires:
 * 1. Cloudinary account (free tier)
 * 2. Base image uploaded to Cloudinary
 * 3. Cloud name configured
 */
export function generateCloudinaryMockup(
  clientName: string,
  baseImagePublicId: string,
  cloudName: string
): string {
  if (!cloudName || !baseImagePublicId) {
    // Fall back to placeholder if Cloudinary not configured
    return generatePlaceholderMockup(clientName, "PROTO", "Billboard");
  }

  // Encode client name for URL (replace spaces with %20)
  const encodedName = encodeURIComponent(clientName).replace(/%20/g, "%20");

  // Cloudinary text overlay URL
  // This overlays text on the base image for FREE
  // l_text: = text overlay
  // Arial_120_bold = font, size, weight
  // co_white = color white
  // g_center = gravity center
  // y_-50 = offset up slightly
  return `https://res.cloudinary.com/${cloudName}/image/upload/l_text:Arial_120_bold:${encodedName},co_white,g_center,y_-50/${baseImagePublicId}`;
}

/**
 * Query: Generate mockup URL for a support
 *
 * Returns the best available mockup option:
 * 1. If Cloudinary configured: Cloudinary overlay
 * 2. Otherwise: Placeholder image
 */
export const generateMockupUrl = query({
  args: {
    clientName: v.string(),
    inventoryCode: v.string(),
    inventoryType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, use placeholder (100% free, no setup needed)
    // TODO: Switch to Cloudinary when configured
    const mockupUrl = generatePlaceholderMockup(
      args.clientName,
      args.inventoryCode,
      args.inventoryType ?? "Soporte OOH"
    );

    return {
      success: true,
      mockupUrl,
      method: "placeholder",
      note: "Mockup generado con servicio placeholder (prototipo). Para mockups con la imagen real del soporte, configurar Cloudinary.",
    };
  },
});

/**
 * Query: Generate mockup URLs for multiple supports
 */
export const generateBatchMockups = query({
  args: {
    clientName: v.string(),
    inventoryCodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const mockups = [];

    for (const code of args.inventoryCodes) {
      // Look up inventory item for type info
      const item = await ctx.db
        .query("inventory")
        .filter((q) => q.eq(q.field("code"), code))
        .first();

      const mockupUrl = generatePlaceholderMockup(
        args.clientName,
        code,
        item?.type ?? "Soporte OOH"
      );

      mockups.push({
        code,
        mockupUrl,
        type: item?.type ?? "unknown",
      });
    }

    return {
      success: true,
      clientName: args.clientName,
      mockups,
      method: "placeholder",
      count: mockups.length,
    };
  },
});

/**
 * Mutation: Store proposal with generated mockups
 *
 * Generates free mockups for each support and stores the proposal
 */
export const storeProposalWithGeneratedMockups = mutation({
  args: {
    clientName: v.string(),
    campaignDays: v.number(),
    inventoryCodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const pendingId = `mockup_${Date.now()}`;

    // Generate mockups and build items array
    const items = [];
    let totalNeto = 0;
    let totalBruto = 0;

    // Pricing config (imported from config.ts values)
    const AGENCY_COMMISSION_RATE = 0.20;
    const INTERMEDIARY_COMMISSION_RATE = 0.10;
    const IVA_RATE = 0.21;
    const DAYS_PER_MONTH = 30;
    const GLOBAL_OWNER = "Global";

    for (const code of args.inventoryCodes) {
      const item = await ctx.db
        .query("inventory")
        .filter((q) => q.eq(q.field("code"), code))
        .first();

      if (!item) {
        continue;
      }

      const isThirdParty = item.owner !== GLOBAL_OWNER;

      // Calculate pricing
      const rentalProportional =
        (item.pricing.rental_monthly / DAYS_PER_MONTH) * args.campaignDays;
      const municipalTaxProportional =
        (item.pricing.municipal_tax / DAYS_PER_MONTH) * args.campaignDays;

      const subtotalNeto =
        rentalProportional +
        item.pricing.production_cost +
        item.pricing.installation_cost +
        municipalTaxProportional;

      const agencyCommission = subtotalNeto * AGENCY_COMMISSION_RATE;
      const intermediaryCommission = isThirdParty
        ? subtotalNeto * INTERMEDIARY_COMMISSION_RATE
        : 0;

      const itemTotalNeto =
        subtotalNeto + agencyCommission + intermediaryCommission;
      const iva = itemTotalNeto * IVA_RATE;
      const itemTotalBruto = itemTotalNeto + iva;

      totalNeto += itemTotalNeto;
      totalBruto += itemTotalBruto;

      // Generate FREE mockup URL
      const mockupUrl = generatePlaceholderMockup(
        args.clientName,
        item.code,
        item.type
      );

      // Build rich item data for PDF
      items.push({
        code: item.code,
        type: item.type,
        owner: item.owner,
        isThirdParty,

        // Location
        address: item.location.address,
        city: item.location.city,
        zone: item.location.zone,
        neighborhood: item.location.neighborhood ?? item.location.city,
        lat: item.location.coordinates.lat,
        long: item.location.coordinates.long,

        // Specs
        visible_dimensions: item.specs.visible_dimensions,
        total_dimensions:
          item.specs.total_dimensions ?? item.specs.visible_dimensions,
        resolution:
          item.specs.resolution ??
          "el archivo de armado al 10% del tamaño a 300 dpi",
        lighting: item.specs.lighting,
        sub_format: item.specs.sub_format ?? "No",
        material_spec: item.specs.material_spec ?? "Lona Front 8 oz",
        send_format:
          item.specs.send_format ??
          "Illustrator: CS / AI – EPS / Photoshop: CS / TIFF",
        send_deadline:
          item.specs.send_deadline ?? "7 días hábiles antes exhibición",
        additional_info:
          item.specs.additional_info ?? "Sin información adicional",

        // Metrics
        daily_ots: item.metrics?.daily_ots ?? 50000,

        // Media - FREE MOCKUP
        base_image_url: item.media?.base_image_url,
        mockup_image_url: mockupUrl, // Generated mockup with client branding

        // Pricing
        days: args.campaignDays,
        rental_monthly: item.pricing.rental_monthly,
        production_cost: item.pricing.production_cost,
        installation_cost: item.pricing.installation_cost,
        municipal_tax: item.pricing.municipal_tax,
        totalNeto: Math.round(itemTotalNeto),
        totalBruto: Math.round(itemTotalBruto),

        // Availability display
        availabilityDisplay:
          item.availability.status === "available"
            ? "Disponible"
            : item.availability.status === "reserved"
            ? "Reservado"
            : "Pendiente",
      });
    }

    if (items.length === 0) {
      return {
        success: false,
        error: "No se encontraron soportes con los códigos proporcionados",
      };
    }

    // Store rich proposal with mockups
    await ctx.db.insert("audit_logs", {
      event_type: "proposal_rich_pending",
      description: `Propuesta con mockups GRATUITOS para ${args.clientName} con ${items.length} soportes`,
      metadata: {
        proposalId: pendingId,
        clientName: args.clientName,
        campaignDays: args.campaignDays,
        items: items,
        totalNeto: Math.round(totalNeto),
        totalBruto: Math.round(totalBruto),
        generatedAt: now,
        hasMockups: true,
        mockupMethod: "placeholder-free",
      },
      timestamp: now,
    });

    return {
      success: true,
      proposalId: pendingId,
      clientName: args.clientName,
      itemCount: items.length,
      totalNeto: Math.round(totalNeto),
      totalBruto: Math.round(totalBruto),
      mockupMethod: "placeholder-free",
      message: `Propuesta con mockups GRATUITOS guardada. ${items.length} soportes. Total: $${Math.round(totalBruto).toLocaleString()}`,
    };
  },
});
