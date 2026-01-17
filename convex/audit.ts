import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Tipos de eventos para audit log
 */
export const EVENT_TYPES = {
  EMAIL_SENT: "email_sent",
  PROPOSAL_GENERATED: "proposal_generated",
  AVAILABILITY_CHANGED: "availability_changed",
  THIRD_PARTY_REQUEST: "third_party_request",
  PRICE_CALCULATED: "price_calculated",
  PDF_GENERATED: "pdf_generated",
} as const;

/**
 * Mutation: Registrar evento en el audit log
 */
export const log = mutation({
  args: {
    eventType: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("audit_logs", {
      event_type: args.eventType,
      description: args.description,
      metadata: args.metadata,
      timestamp: new Date().toISOString(),
    });

    return { logId };
  },
});

/**
 * Query: Obtener logs recientes
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const logs = await ctx.db
      .query("audit_logs")
      .order("desc")
      .take(limit);

    return logs;
  },
});

/**
 * Query: Obtener logs por tipo de evento
 */
export const getByEventType = query({
  args: {
    eventType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("audit_logs")
      .withIndex("by_event_type", (q) => q.eq("event_type", args.eventType))
      .order("desc")
      .take(limit);
  },
});

/**
 * Query: Obtener logs en un rango de fechas
 */
export const getByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const allLogs = await ctx.db.query("audit_logs").collect();

    return allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);

      return logDate >= start && logDate <= end;
    });
  },
});

/**
 * Mutation: Registrar envío de email a tercero
 * Helper específico para el flujo de terceros.
 */
export const logEmailSent = mutation({
  args: {
    partnerName: v.string(),
    partnerEmail: v.string(),
    inventoryCode: v.string(),
    clientName: v.string(),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("audit_logs", {
      event_type: EVENT_TYPES.EMAIL_SENT,
      description: `Email enviado a ${args.partnerName} (${args.partnerEmail}) para soporte ${args.inventoryCode}`,
      metadata: {
        partnerName: args.partnerName,
        partnerEmail: args.partnerEmail,
        inventoryCode: args.inventoryCode,
        clientName: args.clientName,
      },
      timestamp: new Date().toISOString(),
    });

    return { logId };
  },
});

/**
 * Mutation: Registrar generación de propuesta
 */
export const logProposalGenerated = mutation({
  args: {
    clientName: v.string(),
    itemCount: v.number(),
    totalBruto: v.number(),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("audit_logs", {
      event_type: EVENT_TYPES.PROPOSAL_GENERATED,
      description: `Propuesta generada para ${args.clientName}: ${args.itemCount} items, total $${args.totalBruto}`,
      metadata: {
        clientName: args.clientName,
        itemCount: args.itemCount,
        totalBruto: args.totalBruto,
        pdfUrl: args.pdfUrl,
      },
      timestamp: new Date().toISOString(),
    });

    return { logId };
  },
});

/**
 * Mutation: Registrar solicitud a tercero
 */
export const logThirdPartyRequest = mutation({
  args: {
    partnerName: v.string(),
    inventoryCodes: v.array(v.string()),
    clientName: v.string(),
    campaignDates: v.object({
      start: v.string(),
      end: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("audit_logs", {
      event_type: EVENT_TYPES.THIRD_PARTY_REQUEST,
      description: `Solicitud a tercero ${args.partnerName} para ${args.inventoryCodes.length} soporte(s): ${args.inventoryCodes.join(", ")}`,
      metadata: {
        partnerName: args.partnerName,
        inventoryCodes: args.inventoryCodes,
        clientName: args.clientName,
        campaignDates: args.campaignDates,
      },
      timestamp: new Date().toISOString(),
    });

    return { logId };
  },
});
