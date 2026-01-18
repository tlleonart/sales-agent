import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  inventoryStatusValidator,
  proposalStatusValidator,
  eventTypeValidator,
} from "./types";

/**
 * Schema para OOH Agent - Fase 1 Prototipo
 * Define las tablas principales para el inventario de soportes publicitarios
 * y la gestión de partners (terceros).
 */
export default defineSchema({
  /**
   * Tabla de Inventario de Soportes Publicitarios
   * Contiene el catálogo maestro de medianeras, columnas y espectaculares.
   */
  inventory: defineTable({
    // Identificador único visible (ej: "GFG072")
    code: v.string(),

    // Tipo de soporte: "Medianera", "Columna", "Espectacular"
    type: v.string(),

    // Propietario: "Global" para propios, nombre de empresa para terceros
    owner: v.string(),

    // Ubicación del soporte
    location: v.object({
      address: v.string(),
      city: v.string(),
      zone: v.string(), // Clave para filtrado: "GBA Norte", "GBA Sur", "CABA", etc.
      neighborhood: v.optional(v.string()), // Barrio específico ej: "Barrio Norte", "Palermo", "Recoleta"
      coordinates: v.object({
        lat: v.number(),
        long: v.number(),
      }),
    }),

    // Estructura de precios (todos en moneda base, típicamente ARS)
    pricing: v.object({
      rental_monthly: v.number(),      // Alquiler mensual neto
      production_cost: v.number(),     // Costo de producción (pago único)
      installation_cost: v.number(),   // Costo de instalación (pago único)
      municipal_tax: v.number(),       // Tasa municipal mensual
      currency: v.string(),            // "ARS" por defecto
    }),

    // Especificaciones técnicas del soporte
    specs: v.object({
      visible_dimensions: v.string(),  // Ej: "10m x 5m" (dimensiones visibles)
      total_dimensions: v.optional(v.string()), // Dimensiones totales incluyendo bolsillos
      resolution: v.optional(v.string()), // Ej: "el archivo de armado al 10% del tamaño a 300 dpi"
      lighting: v.boolean(),           // Si tiene iluminación
      sub_format: v.optional(v.string()), // Ej: "Front", "No"
      material_spec: v.optional(v.string()), // Ej: "Lona Front 8 oz- Medida final incluye bolsillo..."
      send_format: v.optional(v.string()), // Ej: "Illustrator: CS / AI – EPS_Photoshop: CS / TI..."
      send_deadline: v.optional(v.string()), // Ej: "7 días hábiles antes exhibición"
      additional_info: v.optional(v.string()), // Notas adicionales del soporte
    }),

    // Disponibilidad y estado
    availability: v.object({
      blocked_dates: v.array(v.string()), // Fechas ISO bloqueadas
      status: inventoryStatusValidator, // Type-safe status values
    }),

    // Material visual
    media: v.object({
      base_image_url: v.string(), // URL de la foto vacía para montaje
    }),

    // Métricas de alcance
    metrics: v.object({
      daily_ots: v.number(), // Opportunity To See diario
    }),
  })
    .index("by_code", ["code"])
    .index("by_zone", ["location.zone"])
    .index("by_type", ["type"])
    .index("by_owner", ["owner"])
    .index("by_status", ["availability.status"]),

  /**
   * Tabla de Partners (Terceros)
   * Datos de contacto de propietarios de soportes externos.
   */
  partners: defineTable({
    // Nombre de la empresa
    name: v.string(),

    // Email de contacto principal
    email: v.string(),

    // Teléfono de contacto
    phone: v.optional(v.string()),

    // Notas adicionales
    notes: v.optional(v.string()),
  })
    .index("by_name", ["name"]),

  /**
   * Tabla de Proposals (Para Fase 2 - MVP)
   * Guardará las cotizaciones históricas y su estado.
   */
  proposals: defineTable({
    // Cliente de la propuesta
    client_name: v.string(),

    // Fechas de la campaña
    campaign_start: v.string(),
    campaign_end: v.string(),

    // Items incluidos (referencias a inventory)
    items: v.array(v.object({
      inventory_id: v.id("inventory"),
      calculated_price: v.number(),
      days: v.number(),
    })),

    // Totales calculados
    total_neto: v.number(),
    total_bruto: v.number(),

    // Estado de la propuesta
    status: proposalStatusValidator, // Type-safe status values

    // URL del PDF generado
    pdf_url: v.optional(v.string()),

    // Timestamps
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_client", ["client_name"])
    .index("by_status", ["status"]),

  /**
   * Tabla de Audit Logs
   * Para tracking de acciones importantes (emails enviados, propuestas generadas).
   */
  audit_logs: defineTable({
    // Tipo de evento
    event_type: eventTypeValidator, // Type-safe event types

    // Descripción del evento
    description: v.string(),

    // Datos adicionales del evento
    metadata: v.optional(v.any()),

    // Timestamp
    timestamp: v.string(),
  })
    .index("by_event_type", ["event_type"]),
});
