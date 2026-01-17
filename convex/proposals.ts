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
 * Mutation: Store proposal data for PDF generation
 * Called by the AI Agent before triggering PDF generation.
 * Returns the proposal ID which can be used to retrieve the data.
 */
export const storePendingProposal = mutation({
  args: {
    client_name: v.string(),
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
