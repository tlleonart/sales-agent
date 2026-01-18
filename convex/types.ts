/**
 * Shared types and validators for OOH Agent
 *
 * This file contains type definitions and Convex validators that are used
 * across multiple modules to ensure consistency and type safety.
 */

import { v } from "convex/values";

// =============================================================================
// STATUS TYPES
// =============================================================================

/**
 * Valid inventory status values
 */
export const INVENTORY_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
  PENDING_THIRD_PARTY: "pending_third_party",
} as const;

export type InventoryStatus = typeof INVENTORY_STATUS[keyof typeof INVENTORY_STATUS];

/**
 * Convex validator for inventory status
 */
export const inventoryStatusValidator = v.union(
  v.literal("available"),
  v.literal("reserved"),
  v.literal("maintenance"),
  v.literal("pending_third_party")
);

/**
 * Valid proposal status values
 */
export const PROPOSAL_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ProposalStatus = typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS];

/**
 * Convex validator for proposal status
 */
export const proposalStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("approved"),
  v.literal("rejected")
);

// =============================================================================
// INVENTORY TYPES
// =============================================================================

/**
 * Valid support types
 */
export const SUPPORT_TYPES = {
  MEDIANERA: "Medianera",
  COLUMNA: "Columna",
  ESPECTACULAR: "Espectacular",
} as const;

export type SupportType = typeof SUPPORT_TYPES[keyof typeof SUPPORT_TYPES];

/**
 * Convex validator for support type
 */
export const supportTypeValidator = v.union(
  v.literal("Medianera"),
  v.literal("Columna"),
  v.literal("Espectacular")
);

/**
 * Valid geographic zones
 */
export const ZONES = {
  GBA_NORTE: "GBA Norte",
  GBA_SUR: "GBA Sur",
  GBA_OESTE: "GBA Oeste",
  CABA: "CABA",
} as const;

export type Zone = typeof ZONES[keyof typeof ZONES];

/**
 * Convex validator for zone
 */
export const zoneValidator = v.union(
  v.literal("GBA Norte"),
  v.literal("GBA Sur"),
  v.literal("GBA Oeste"),
  v.literal("CABA")
);

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================

/**
 * Valid audit event types
 */
export const EVENT_TYPES = {
  EMAIL_SENT: "email_sent",
  PROPOSAL_GENERATED: "proposal_generated",
  PROPOSAL_PENDING_PDF: "proposal_pending_pdf",
  PROPOSAL_RICH_PENDING: "proposal_rich_pending",
  PROPOSAL_PDF_GENERATED: "proposal_pdf_generated",
  AVAILABILITY_CHANGED: "availability_changed",
  THIRD_PARTY_REQUEST: "third_party_request",
  PRICE_CALCULATED: "price_calculated",
  PDF_GENERATED: "pdf_generated",
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * Convex validator for event types
 */
export const eventTypeValidator = v.union(
  v.literal("email_sent"),
  v.literal("proposal_generated"),
  v.literal("proposal_pending_pdf"),
  v.literal("proposal_rich_pending"),
  v.literal("proposal_pdf_generated"),
  v.literal("availability_changed"),
  v.literal("third_party_request"),
  v.literal("price_calculated"),
  v.literal("pdf_generated")
);

// =============================================================================
// METADATA TYPES (for audit logs)
// =============================================================================

/**
 * Metadata for email_sent events
 */
export const emailSentMetadataValidator = v.object({
  partnerName: v.string(),
  partnerEmail: v.string(),
  inventoryCode: v.string(),
  clientName: v.string(),
});

/**
 * Metadata for proposal_generated events
 */
export const proposalGeneratedMetadataValidator = v.object({
  clientName: v.string(),
  itemCount: v.number(),
  totalBruto: v.number(),
  pdfUrl: v.optional(v.string()),
});

/**
 * Metadata for third_party_request events
 */
export const thirdPartyRequestMetadataValidator = v.object({
  partnerName: v.string(),
  inventoryCodes: v.array(v.string()),
  clientName: v.string(),
  campaignDates: v.object({
    start: v.string(),
    end: v.string(),
  }),
});

/**
 * Metadata for proposal_pending_pdf events
 */
export const proposalPendingMetadataValidator = v.object({
  proposalId: v.string(),
  clientName: v.string(),
  clientLogoUrl: v.optional(v.string()),
  campaignStart: v.optional(v.string()),
  campaignEnd: v.optional(v.string()),
  campaignDays: v.optional(v.number()),
  proposalItems: v.optional(v.array(v.any())),
  items: v.optional(v.array(v.any())),
  totalNeto: v.number(),
  totalBruto: v.number(),
  generatedAt: v.optional(v.string()),
  hasMockups: v.optional(v.boolean()),
});

/**
 * Metadata for proposal_pdf_generated events
 */
export const proposalPdfGeneratedMetadataValidator = v.object({
  proposalId: v.string(),
  pdfUrl: v.string(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if an owner represents a third-party (non-Global)
 */
export function isThirdParty(owner: string): boolean {
  return owner !== "Global";
}

/**
 * Get display text for inventory status
 */
export function getStatusDisplay(status: InventoryStatus): string {
  switch (status) {
    case INVENTORY_STATUS.AVAILABLE:
      return "Disponible";
    case INVENTORY_STATUS.RESERVED:
      return "Reservado";
    case INVENTORY_STATUS.MAINTENANCE:
      return "En mantenimiento";
    case INVENTORY_STATUS.PENDING_THIRD_PARTY:
      return "Pendiente confirmación";
    default:
      return "Desconocido";
  }
}
