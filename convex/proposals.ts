import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Proposals module for OOH Agent
 * Handles storage and retrieval of proposal data for PDF generation.
 *
 * This module implements a state-based approach to work around n8n's
 * $fromAI() parameter passing limitations with toolWorkflow.
 */

/**
 * Item specification for professional PDF generation
 * Contains all fields needed for the product sheet
 */
const proposalItemSpec = v.object({
  code: v.string(),
  type: v.string(),
  owner: v.string(),
  isThirdParty: v.boolean(),

  // Location
  address: v.string(),
  city: v.string(),
  zone: v.string(),
  neighborhood: v.string(),
  lat: v.number(),
  long: v.number(),

  // Specs for product sheet
  visible_dimensions: v.string(),
  total_dimensions: v.string(),
  resolution: v.string(),
  lighting: v.boolean(),
  sub_format: v.string(),
  material_spec: v.string(),
  send_format: v.string(),
  send_deadline: v.string(),
  additional_info: v.string(),

  // Metrics
  daily_ots: v.number(),

  // Media
  base_image_url: v.string(),
  mockup_image_url: v.optional(v.string()), // AI-generated mockup

  // Pricing for this item
  days: v.number(),
  rental_monthly: v.number(),
  production_cost: v.number(),
  installation_cost: v.number(),
  municipal_tax: v.number(),
  totalNeto: v.number(),
  totalBruto: v.number(),

  // Availability display
  availabilityDisplay: v.string(),
});

/**
 * Mutation: Store proposal data for PDF generation (Enhanced Version)
 * Called by the AI Agent before triggering PDF generation.
 * Stores full inventory snapshots for professional multi-page PDF.
 */
export const storePendingProposal = mutation({
  args: {
    client_name: v.string(),
    client_logo_url: v.optional(v.string()), // Client logo for AI mockups
    campaign_start: v.string(),
    campaign_end: v.string(),
    items: v.array(v.object({
      code: v.string(),
      type: v.string(),
      location: v.string(),
      days: v.number(),
      totalNeto: v.number(),
      totalBruto: v.number(),
    })),
    total_neto: v.number(),
    total_bruto: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Generate a unique ID for this pending proposal
    const pendingId = `pending_${Date.now()}`;

    // Store the full display data in audit_logs for PDF generation
    // This bypasses the proposals table schema constraint on inventory_id
    // The proposals table entry will be created after PDF generation with proper inventory references
    await ctx.db.insert("audit_logs", {
      event_type: "proposal_pending_pdf",
      description: `Proposal for ${args.client_name} pending PDF generation`,
      metadata: {
        proposalId: pendingId,
        clientName: args.client_name,
        clientLogoUrl: args.client_logo_url,
        campaignStart: args.campaign_start,
        campaignEnd: args.campaign_end,
        proposalItems: args.items,
        totalNeto: args.total_neto,
        totalBruto: args.total_bruto,
      },
      timestamp: now,
    });

    return {
      proposalId: pendingId,
      message: "Proposal stored successfully",
    };
  },
});

/**
 * Mutation: Store rich proposal data with full inventory details
 * For professional multi-page PDF generation with product sheets.
 */
export const storeRichProposal = mutation({
  args: {
    client_name: v.string(),
    client_logo_url: v.optional(v.string()),
    campaign_start: v.string(),
    campaign_end: v.string(),
    items: v.array(proposalItemSpec),
    total_neto: v.number(),
    total_bruto: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const pendingId = `rich_${Date.now()}`;

    await ctx.db.insert("audit_logs", {
      event_type: "proposal_rich_pending",
      description: `Rich proposal for ${args.client_name} with ${args.items.length} items`,
      metadata: {
        proposalId: pendingId,
        clientName: args.client_name,
        clientLogoUrl: args.client_logo_url,
        campaignStart: args.campaign_start,
        campaignEnd: args.campaign_end,
        items: args.items,
        totalNeto: args.total_neto,
        totalBruto: args.total_bruto,
        generatedAt: now,
      },
      timestamp: now,
    });

    return {
      proposalId: pendingId,
      itemCount: args.items.length,
      message: "Rich proposal stored successfully",
    };
  },
});

/**
 * Query: Get the latest rich proposal for PDF generation
 */
export const getLatestRichProposal = query({
  args: {},
  handler: async (ctx) => {
    const latestLog = await ctx.db
      .query("audit_logs")
      .withIndex("by_event_type", (q) => q.eq("event_type", "proposal_rich_pending"))
      .order("desc")
      .first();

    if (!latestLog || !latestLog.metadata) {
      return null;
    }

    return latestLog.metadata;
  },
});

/**
 * Query: Get the latest pending proposal for PDF generation
 * Called by the PDF Generator workflow to retrieve the data.
 */
export const getLatestPendingProposal = query({
  args: {},
  handler: async (ctx) => {
    // Find the most recent pending_pdf audit log
    const latestLog = await ctx.db
      .query("audit_logs")
      .withIndex("by_event_type", (q) => q.eq("event_type", "proposal_pending_pdf"))
      .order("desc")
      .first();

    if (!latestLog || !latestLog.metadata) {
      return null;
    }

    const metadata = latestLog.metadata as {
      proposalId: string;
      clientName: string;
      campaignStart: string;
      campaignEnd: string;
      proposalItems: Array<{
        code: string;
        type: string;
        location: string;
        days: number;
        totalNeto: number;
        totalBruto: number;
      }>;
      totalNeto: number;
      totalBruto: number;
    };

    return {
      proposalId: metadata.proposalId,
      clientName: metadata.clientName,
      campaignStart: metadata.campaignStart,
      campaignEnd: metadata.campaignEnd,
      proposalItems: metadata.proposalItems,
      totalNeto: metadata.totalNeto,
      totalBruto: metadata.totalBruto,
      createdAt: latestLog.timestamp,
    };
  },
});

/**
 * Mutation: Mark proposal as completed with PDF URL
 * Called after PDF generation is successful.
 */
export const completeProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
    pdf_url: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    await ctx.db.patch(args.proposalId, {
      status: "draft",
      pdf_url: args.pdf_url,
      updated_at: now,
    });

    // Log the completion
    await ctx.db.insert("audit_logs", {
      event_type: "proposal_pdf_generated",
      description: `PDF generated for proposal ${args.proposalId}`,
      metadata: {
        proposalId: args.proposalId,
        pdfUrl: args.pdf_url,
      },
      timestamp: now,
    });

    return {
      success: true,
      message: "Proposal updated with PDF URL",
    };
  },
});

/**
 * Query: Get proposal by ID
 */
export const getProposal = query({
  args: {
    proposalId: v.id("proposals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.proposalId);
  },
});

/**
 * Query: List recent proposals
 */
export const listProposals = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const proposals = await ctx.db
        .query("proposals")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit ?? 10);
      return proposals;
    }

    const proposals = await ctx.db
      .query("proposals")
      .order("desc")
      .take(args.limit ?? 10);

    return proposals;
  },
});
