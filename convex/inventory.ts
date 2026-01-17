import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query: Obtener todo el inventario
 * Uso: Para visualización general o debugging.
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inventory").collect();
  },
});

/**
 * Query: Obtener inventario disponible
 * Filtra solo soportes con status "available".
 */
export const getAvailable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("inventory")
      .filter((q) => q.eq(q.field("availability.status"), "available"))
      .collect();
  },
});

/**
 * Query: Buscar por zona geográfica
 * Filtra soportes por zona (GBA Norte, GBA Sur, CABA, etc.)
 */
export const getByZone = query({
  args: {
    zone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_zone", (q) => q.eq("location.zone", args.zone))
      .collect();
  },
});

/**
 * Query: Buscar por tipo de soporte
 * Filtra por Medianera, Columna o Espectacular.
 */
export const getByType = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

/**
 * Query: Buscar por propietario
 * Útil para filtrar soportes propios vs terceros.
 */
export const getByOwner = query({
  args: {
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .collect();
  },
});

/**
 * Query: Obtener soportes de terceros
 * Retorna todos los soportes que no son de "Global".
 */
export const getThirdParty = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("inventory")
      .filter((q) => q.neq(q.field("owner"), "Global"))
      .collect();
  },
});

/**
 * Query: Búsqueda avanzada con múltiples filtros
 * Soporta filtrado por zona, tipo, propietario y disponibilidad.
 */
export const search = query({
  args: {
    zone: v.optional(v.string()),
    type: v.optional(v.string()),
    owner: v.optional(v.string()),
    onlyAvailable: v.optional(v.boolean()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = ctx.db.query("inventory");

    // Aplicar filtros opcionales
    const allItems = await results.collect();

    return allItems.filter((item) => {
      // Filtro por zona
      if (args.zone && item.location.zone !== args.zone) {
        return false;
      }

      // Filtro por tipo
      if (args.type && item.type !== args.type) {
        return false;
      }

      // Filtro por propietario
      if (args.owner && item.owner !== args.owner) {
        return false;
      }

      // Filtro por disponibilidad
      if (args.onlyAvailable && item.availability.status !== "available") {
        return false;
      }

      // Filtro por precio máximo (alquiler mensual)
      if (args.maxPrice && item.pricing.rental_monthly > args.maxPrice) {
        return false;
      }

      return true;
    });
  },
});

/**
 * Query: Obtener soporte por código
 * Búsqueda exacta por el código del soporte (ej: "GFG072").
 */
export const getByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

/**
 * Query: Verificar disponibilidad para un rango de fechas
 * Retorna true si el soporte está disponible en las fechas indicadas.
 */
export const checkAvailability = query({
  args: {
    inventoryId: v.id("inventory"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return { available: false, reason: "Soporte no encontrado" };
    }

    if (item.availability.status !== "available") {
      return {
        available: false,
        reason: `Estado actual: ${item.availability.status}`
      };
    }

    // Verificar si hay fechas bloqueadas en el rango
    const blockedDates = item.availability.blocked_dates;
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);

    for (const blockedDate of blockedDates) {
      const blocked = new Date(blockedDate);
      if (blocked >= start && blocked <= end) {
        return {
          available: false,
          reason: `Fecha bloqueada: ${blockedDate}`
        };
      }
    }

    return { available: true, reason: null };
  },
});

/**
 * Mutation: Actualizar estado de disponibilidad
 * Cambia el status de un soporte.
 */
export const updateStatus = mutation({
  args: {
    inventoryId: v.id("inventory"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      throw new Error("Soporte no encontrado");
    }

    await ctx.db.patch(args.inventoryId, {
      availability: {
        ...item.availability,
        status: args.status,
      },
    });

    return { success: true, newStatus: args.status };
  },
});

/**
 * Mutation: Bloquear fechas
 * Agrega fechas al array de blocked_dates.
 */
export const blockDates = mutation({
  args: {
    inventoryId: v.id("inventory"),
    dates: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      throw new Error("Soporte no encontrado");
    }

    const existingDates = item.availability.blocked_dates;
    const newDates = [...new Set([...existingDates, ...args.dates])];

    await ctx.db.patch(args.inventoryId, {
      availability: {
        ...item.availability,
        blocked_dates: newDates,
      },
    });

    return { success: true, blockedDates: newDates };
  },
});

/**
 * Query: Obtener detalles completos de un soporte
 * Retorna toda la información necesaria para la ficha de producto en el PDF.
 */
export const getFullDetails = query({
  args: {
    inventoryId: v.id("inventory"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      return null;
    }

    // Return all fields needed for product sheet PDF
    return {
      _id: item._id,
      code: item.code,
      type: item.type,
      owner: item.owner,
      isThirdParty: item.owner !== "Global",

      // Location details
      location: {
        address: item.location.address,
        city: item.location.city,
        zone: item.location.zone,
        neighborhood: item.location.neighborhood ?? item.location.city,
        coordinates: item.location.coordinates,
      },

      // All specs for product sheet
      specs: {
        visible_dimensions: item.specs.visible_dimensions,
        total_dimensions: item.specs.total_dimensions ?? item.specs.visible_dimensions,
        resolution: item.specs.resolution ?? "el archivo de armado al 10% del tamaño a 300 dpi",
        lighting: item.specs.lighting,
        sub_format: item.specs.sub_format ?? "No",
        material_spec: item.specs.material_spec ?? "Lona Front 8 oz",
        send_format: item.specs.send_format ?? "Illustrator: CS / AI – EPS / Photoshop: CS / TIFF",
        send_deadline: item.specs.send_deadline ?? "7 días hábiles antes exhibición",
        additional_info: item.specs.additional_info ?? "Sin información adicional",
      },

      // Pricing
      pricing: item.pricing,

      // Availability
      availability: {
        status: item.availability.status,
        blocked_dates: item.availability.blocked_dates,
        displayStatus: item.availability.status === "available"
          ? "Disponible"
          : item.availability.status === "reserved"
          ? "Reservado"
          : item.availability.status === "maintenance"
          ? "En mantenimiento"
          : "Pendiente confirmación",
      },

      // Media
      media: item.media,

      // Metrics
      metrics: item.metrics,
    };
  },
});

/**
 * Query: Obtener múltiples soportes con detalles completos
 * Útil para generar propuestas con múltiples items.
 */
export const getMultipleFullDetails = query({
  args: {
    inventoryIds: v.array(v.id("inventory")),
  },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.inventoryIds.map(async (id) => {
        const item = await ctx.db.get(id);
        if (!item) return null;

        return {
          _id: item._id,
          code: item.code,
          type: item.type,
          owner: item.owner,
          isThirdParty: item.owner !== "Global",
          location: {
            address: item.location.address,
            city: item.location.city,
            zone: item.location.zone,
            neighborhood: item.location.neighborhood ?? item.location.city,
            coordinates: item.location.coordinates,
          },
          specs: {
            visible_dimensions: item.specs.visible_dimensions,
            total_dimensions: item.specs.total_dimensions ?? item.specs.visible_dimensions,
            resolution: item.specs.resolution ?? "el archivo de armado al 10% del tamaño a 300 dpi",
            lighting: item.specs.lighting,
            sub_format: item.specs.sub_format ?? "No",
            material_spec: item.specs.material_spec ?? "Lona Front 8 oz",
            send_format: item.specs.send_format ?? "Illustrator: CS / AI – EPS / Photoshop: CS / TIFF",
            send_deadline: item.specs.send_deadline ?? "7 días hábiles antes exhibición",
            additional_info: item.specs.additional_info ?? "Sin información adicional",
          },
          pricing: item.pricing,
          availability: {
            status: item.availability.status,
            blocked_dates: item.availability.blocked_dates,
            displayStatus: item.availability.status === "available"
              ? "Disponible"
              : item.availability.status === "reserved"
              ? "Reservado"
              : item.availability.status === "maintenance"
              ? "En mantenimiento"
              : "Pendiente confirmación",
          },
          media: item.media,
          metrics: item.metrics,
        };
      })
    );

    return items.filter((item) => item !== null);
  },
});

/**
 * Mutation: Desbloquear fechas
 * Remueve fechas del array de blocked_dates.
 */
export const unblockDates = mutation({
  args: {
    inventoryId: v.id("inventory"),
    dates: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);

    if (!item) {
      throw new Error("Soporte no encontrado");
    }

    const newDates = item.availability.blocked_dates.filter(
      (date) => !args.dates.includes(date)
    );

    await ctx.db.patch(args.inventoryId, {
      availability: {
        ...item.availability,
        blocked_dates: newDates,
      },
    });

    return { success: true, blockedDates: newDates };
  },
});
