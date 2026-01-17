import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query: Obtener todos los partners
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("partners").collect();
  },
});

/**
 * Query: Buscar partner por nombre
 */
export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/**
 * Query: Obtener partner por ID
 */
export const getById = query({
  args: {
    partnerId: v.id("partners"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.partnerId);
  },
});

/**
 * Mutation: Crear nuevo partner
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const partnerId = await ctx.db.insert("partners", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
    });

    return { partnerId };
  },
});

/**
 * Mutation: Actualizar partner
 */
export const update = mutation({
  args: {
    partnerId: v.id("partners"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { partnerId, ...updates } = args;

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error("Partner no encontrado");
    }

    // Filtrar campos undefined
    const cleanUpdates: Record<string, string | undefined> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.email !== undefined) cleanUpdates.email = updates.email;
    if (updates.phone !== undefined) cleanUpdates.phone = updates.phone;
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;

    await ctx.db.patch(partnerId, cleanUpdates);

    return { success: true };
  },
});

/**
 * Mutation: Eliminar partner
 */
export const remove = mutation({
  args: {
    partnerId: v.id("partners"),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);
    if (!partner) {
      throw new Error("Partner no encontrado");
    }

    await ctx.db.delete(args.partnerId);

    return { success: true };
  },
});

/**
 * Mutation: Actualizar todos los emails de partners (útil para testing)
 */
export const updateAllEmails = mutation({
  args: {
    newEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const partners = await ctx.db.query("partners").collect();

    for (const partner of partners) {
      await ctx.db.patch(partner._id, { email: args.newEmail });
    }

    return {
      success: true,
      partnersUpdated: partners.length,
      newEmail: args.newEmail,
    };
  },
});

/**
 * Query: Obtener contacto de partner para un soporte de tercero
 * Busca el partner asociado a un item del inventario.
 */
export const getContactForInventory = query({
  args: {
    inventoryId: v.id("inventory"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return { found: false, reason: "Soporte no encontrado" };
    }

    if (item.owner === "Global") {
      return { found: false, reason: "Soporte propio, no requiere contacto externo" };
    }

    // Buscar partner por nombre del owner
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_name", (q) => q.eq("name", item.owner))
      .first();

    if (!partner) {
      return {
        found: false,
        reason: `No se encontró contacto para el partner: ${item.owner}`
      };
    }

    return {
      found: true,
      partner: {
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
      },
      inventoryCode: item.code,
      inventoryLocation: item.location.address,
    };
  },
});
