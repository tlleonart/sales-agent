import { mutation } from "./_generated/server";

/**
 * Seed de datos para OOH Agent
 * Basado en datos reales de inventario Nutreco (publicidad exterior Argentina)
 *
 * Ejecutar con: npx convex run seed:seedAll
 */

// =============================================================================
// IMAGE CONFIGURATION FOR PROTOTYPE
// =============================================================================
// Base image from GitHub repository - this is the billboard photo used for AI mockup generation.
// The AI will take this image and composite the client's branding into the advertising space.
// =============================================================================

// GitHub raw URL for the base billboard image
const BASE_BILLBOARD_IMAGE = "https://raw.githubusercontent.com/tlleonart/sales-agent/main/image-example.png";

// All inventory items use the same base image for the prototype
// In production, each support would have its own unique photo
const BILLBOARD_IMAGES = {
  // All types use the same base image for AI mockup generation
  medianera: BASE_BILLBOARD_IMAGE,
  espectacular: BASE_BILLBOARD_IMAGE,
  columna: BASE_BILLBOARD_IMAGE,
  default: BASE_BILLBOARD_IMAGE,
};

// Datos de inventario basados en ubicaciones reales de GBA y CABA
const INVENTORY_DATA = [
  // === GBA NORTE ===
  {
    code: "GFG001",
    type: "Medianera",
    owner: "Global",
    location: {
      address: "Av. Maipú 2500, Vicente López",
      city: "Vicente López",
      zone: "GBA Norte",
      coordinates: { lat: -34.5267, long: -58.4726 },
    },
    pricing: {
      rental_monthly: 850000,
      production_cost: 180000,
      installation_cost: 95000,
      municipal_tax: 42000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "12m x 6m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.medianera,
    },
    metrics: {
      daily_ots: 45000,
    },
  },
  {
    code: "GFG002",
    type: "Espectacular",
    owner: "Global",
    location: {
      address: "Panamericana Km 28, Pilar",
      city: "Pilar",
      zone: "GBA Norte",
      coordinates: { lat: -34.4587, long: -58.9142 },
    },
    pricing: {
      rental_monthly: 1200000,
      production_cost: 250000,
      installation_cost: 150000,
      municipal_tax: 65000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "18m x 8m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.espectacular,
    },
    metrics: {
      daily_ots: 120000,
    },
  },
  {
    code: "GFG003",
    type: "Columna",
    owner: "Global",
    location: {
      address: "Av. Del Libertador 15000, San Isidro",
      city: "San Isidro",
      zone: "GBA Norte",
      coordinates: { lat: -34.4712, long: -58.5234 },
    },
    pricing: {
      rental_monthly: 320000,
      production_cost: 85000,
      installation_cost: 45000,
      municipal_tax: 18000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "4m x 3m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.columna,
    },
    metrics: {
      daily_ots: 28000,
    },
  },
  // === GBA SUR ===
  {
    code: "GFG010",
    type: "Medianera",
    owner: "Global",
    location: {
      address: "Av. Hipólito Yrigoyen 8500, Lomas de Zamora",
      city: "Lomas de Zamora",
      zone: "GBA Sur",
      coordinates: { lat: -34.7612, long: -58.4089 },
    },
    pricing: {
      rental_monthly: 680000,
      production_cost: 160000,
      installation_cost: 85000,
      municipal_tax: 35000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "10m x 5m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.medianera,
    },
    metrics: {
      daily_ots: 38000,
    },
  },
  {
    code: "GFG011",
    type: "Espectacular",
    owner: "MediaMax",
    location: {
      address: "Autopista Buenos Aires - La Plata Km 15, Quilmes",
      city: "Quilmes",
      zone: "GBA Sur",
      coordinates: { lat: -34.7234, long: -58.2567 },
    },
    pricing: {
      rental_monthly: 950000,
      production_cost: 220000,
      installation_cost: 120000,
      municipal_tax: 55000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "16m x 7m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.espectacular,
    },
    metrics: {
      daily_ots: 95000,
    },
  },
  // === GBA OESTE ===
  {
    code: "GFG020",
    type: "Medianera",
    owner: "Global",
    location: {
      address: "Av. Rivadavia 22000, Morón",
      city: "Morón",
      zone: "GBA Oeste",
      coordinates: { lat: -34.6512, long: -58.6198 },
    },
    pricing: {
      rental_monthly: 720000,
      production_cost: 170000,
      installation_cost: 90000,
      municipal_tax: 38000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "11m x 5m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.medianera,
    },
    metrics: {
      daily_ots: 42000,
    },
  },
  {
    code: "GFG021",
    type: "Columna",
    owner: "VíaPublica SA",
    location: {
      address: "Acceso Oeste Km 22, Ituzaingó",
      city: "Ituzaingó",
      zone: "GBA Oeste",
      coordinates: { lat: -34.6589, long: -58.6734 },
    },
    pricing: {
      rental_monthly: 280000,
      production_cost: 75000,
      installation_cost: 40000,
      municipal_tax: 15000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "3.5m x 2.5m",
      lighting: false,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.columna,
    },
    metrics: {
      daily_ots: 22000,
    },
  },
  // === CABA ===
  {
    code: "GFG050",
    type: "Medianera",
    owner: "Global",
    location: {
      address: "Av. Corrientes 3200, Abasto",
      city: "CABA",
      zone: "CABA",
      coordinates: { lat: -34.6037, long: -58.4116 },
    },
    pricing: {
      rental_monthly: 1500000,
      production_cost: 280000,
      installation_cost: 140000,
      municipal_tax: 85000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "14m x 7m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.medianera,
    },
    metrics: {
      daily_ots: 180000,
    },
  },
  {
    code: "GFG051",
    type: "Espectacular",
    owner: "Global",
    location: {
      address: "Av. 9 de Julio 1200, Microcentro",
      city: "CABA",
      zone: "CABA",
      coordinates: { lat: -34.6045, long: -58.3816 },
    },
    pricing: {
      rental_monthly: 2800000,
      production_cost: 450000,
      installation_cost: 220000,
      municipal_tax: 150000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "20m x 10m",
      lighting: true,
    },
    availability: {
      blocked_dates: ["2026-02-01", "2026-02-15"],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.espectacular,
    },
    metrics: {
      daily_ots: 350000,
    },
  },
  {
    code: "GFG052",
    type: "Columna",
    owner: "UrbanMedia",
    location: {
      address: "Av. Santa Fe 2500, Palermo",
      city: "CABA",
      zone: "CABA",
      coordinates: { lat: -34.5875, long: -58.4056 },
    },
    pricing: {
      rental_monthly: 420000,
      production_cost: 95000,
      installation_cost: 55000,
      municipal_tax: 28000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "4.5m x 3m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.columna,
    },
    metrics: {
      daily_ots: 65000,
    },
  },
  {
    code: "GFG053",
    type: "Medianera",
    owner: "Global",
    location: {
      address: "Av. Cabildo 1800, Belgrano",
      city: "CABA",
      zone: "CABA",
      coordinates: { lat: -34.5612, long: -58.4534 },
    },
    pricing: {
      rental_monthly: 1100000,
      production_cost: 240000,
      installation_cost: 120000,
      municipal_tax: 68000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "12m x 6m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "available",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.medianera,
    },
    metrics: {
      daily_ots: 95000,
    },
  },
  {
    code: "GFG054",
    type: "Espectacular",
    owner: "OutdoorPlus",
    location: {
      address: "Autopista 25 de Mayo, Constitución",
      city: "CABA",
      zone: "CABA",
      coordinates: { lat: -34.6278, long: -58.3834 },
    },
    pricing: {
      rental_monthly: 1850000,
      production_cost: 350000,
      installation_cost: 180000,
      municipal_tax: 110000,
      currency: "ARS",
    },
    specs: {
      visible_dimensions: "18m x 9m",
      lighting: true,
    },
    availability: {
      blocked_dates: [],
      status: "reserved",
    },
    media: {
      base_image_url: BILLBOARD_IMAGES.espectacular,
    },
    metrics: {
      daily_ots: 220000,
    },
  },
];

// Datos de partners (terceros)
const PARTNERS_DATA = [
  {
    name: "MediaMax",
    email: "comercial@mediamax.com.ar",
    phone: "+54 11 4555-1234",
    notes: "Principal proveedor en GBA Sur. Tiempo de respuesta: 24-48hs.",
  },
  {
    name: "VíaPublica SA",
    email: "ventas@viapublica.com.ar",
    phone: "+54 11 4333-5678",
    notes: "Especialistas en columnas y refugios. Descuentos por volumen.",
  },
  {
    name: "UrbanMedia",
    email: "contacto@urbanmedia.com.ar",
    phone: "+54 11 4777-9012",
    notes: "Fuerte presencia en CABA. Trabajan con contratos mínimos de 3 meses.",
  },
  {
    name: "OutdoorPlus",
    email: "info@outdoorplus.com.ar",
    phone: "+54 11 4222-3456",
    notes: "Espectaculares premium en autopistas. Requieren aprobación de diseño.",
  },
];

/**
 * Mutation: Sembrar todo el inventario
 */
export const seedInventory = mutation({
  args: {},
  handler: async (ctx) => {
    // Verificar si ya hay datos
    const existingItems = await ctx.db.query("inventory").take(1);
    if (existingItems.length > 0) {
      return {
        success: false,
        message: "El inventario ya tiene datos. Usa clearInventory primero si quieres reiniciar.",
        itemsCreated: 0,
      };
    }

    // Insertar todos los items
    const insertedIds: string[] = [];
    for (const item of INVENTORY_DATA) {
      const id = await ctx.db.insert("inventory", item);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: `Inventario sembrado exitosamente`,
      itemsCreated: insertedIds.length,
    };
  },
});

/**
 * Mutation: Sembrar partners
 */
export const seedPartners = mutation({
  args: {},
  handler: async (ctx) => {
    // Verificar si ya hay datos
    const existingPartners = await ctx.db.query("partners").take(1);
    if (existingPartners.length > 0) {
      return {
        success: false,
        message: "Los partners ya tienen datos. Usa clearPartners primero si quieres reiniciar.",
        partnersCreated: 0,
      };
    }

    // Insertar todos los partners
    const insertedIds: string[] = [];
    for (const partner of PARTNERS_DATA) {
      const id = await ctx.db.insert("partners", partner);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: `Partners sembrados exitosamente`,
      partnersCreated: insertedIds.length,
    };
  },
});

/**
 * Mutation: Sembrar todo (inventario + partners)
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Verificar si ya hay datos
    const existingItems = await ctx.db.query("inventory").take(1);
    const existingPartners = await ctx.db.query("partners").take(1);

    if (existingItems.length > 0 || existingPartners.length > 0) {
      return {
        success: false,
        message: "Ya existen datos en la base de datos. Usa clearAll primero para reiniciar.",
        itemsCreated: 0,
        partnersCreated: 0,
      };
    }

    // Insertar inventario
    let itemsCreated = 0;
    for (const item of INVENTORY_DATA) {
      await ctx.db.insert("inventory", item);
      itemsCreated++;
    }

    // Insertar partners
    let partnersCreated = 0;
    for (const partner of PARTNERS_DATA) {
      await ctx.db.insert("partners", partner);
      partnersCreated++;
    }

    return {
      success: true,
      message: "Base de datos sembrada exitosamente",
      itemsCreated,
      partnersCreated,
    };
  },
});

/**
 * Mutation: Limpiar inventario
 */
export const clearInventory = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("inventory").collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    return {
      success: true,
      itemsDeleted: items.length,
    };
  },
});

/**
 * Mutation: Limpiar partners
 */
export const clearPartners = mutation({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();

    for (const partner of partners) {
      await ctx.db.delete(partner._id);
    }

    return {
      success: true,
      partnersDeleted: partners.length,
    };
  },
});

/**
 * Mutation: Limpiar todo
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Limpiar inventario
    const items = await ctx.db.query("inventory").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Limpiar partners
    const partners = await ctx.db.query("partners").collect();
    for (const partner of partners) {
      await ctx.db.delete(partner._id);
    }

    // Limpiar proposals
    const proposals = await ctx.db.query("proposals").collect();
    for (const proposal of proposals) {
      await ctx.db.delete(proposal._id);
    }

    // Limpiar audit logs
    const logs = await ctx.db.query("audit_logs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    return {
      success: true,
      deleted: {
        inventory: items.length,
        partners: partners.length,
        proposals: proposals.length,
        auditLogs: logs.length,
      },
    };
  },
});
