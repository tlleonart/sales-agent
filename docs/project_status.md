# Project Status - OOH Agent

**Last Updated:** 2026-01-17
**Current Phase:** Phase 1 - Prototype Initialization
**Project Start:** January 2026

---

## Estado actual

### Fase 0: Definición y Arquitectura ✅ COMPLETADA

- [x] Definición de project_spec.md (v2.1)
- [x] Documentación base (CLAUDE.md, architecture.md)
- [x] Definición de flujos de datos y lógica de precios
- [x] Selección de Tech Stack (n8n + Convex + Replicate)

### Fase 1.1: Data Layer (Convex) ⏳ EN PROGRESO

- [ ] Inicializar proyecto Convex
- [ ] Implementar `schema.ts` (Inventory, Pricing, Specs)
- [ ] Crear script de seed `seed_inventory.ts` con datos de Nutreco
- [ ] Ejecutar seed y validar datos en dashboard

### Fase 1.2: Logic Layer (n8n) 🔄 PENDIENTE

- [ ] Setup de n8n (Docker local o Cloud)
- [ ] Configurar credenciales (Convex, OpenAI, Replicate)
- [ ] Workflow: Master Chat & NLU
- [ ] Workflow: Inventory Search & Filtering
- [ ] Workflow: Pricing Engine & Commission Logic

### Fase 1.3: Integraciones y Assets 🔄 PENDIENTE

- [ ] Conexión con Replicate (Image Compositing)
- [ ] Configurar motor de PDF (Gotenberg/APITemplate)
- [ ] Implementar lógica de emails para Terceros

### Fase 2: MVP (Web App) 🛑 NO INICIADA

- [ ] Setup Next.js App Router
- [ ] Integración BetterAuth
- [ ] UI de Chat con historial

---

## Métricas de progreso

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Documentación** | **Completa** | **100%** |
| Base de Datos (Convex) | Definida (Schema listo) | 10% |
| Workflows (n8n) | Pendiente | 0% |
| Integraciones AI | Pendiente | 0% |
| **Total Prototipo** | **Inicialización** | **15%** |

---

## Próximos pasos inmediatos

1.  **Inicializar Convex:** Ejecutar `npx convex dev` para crear el proyecto.
2.  **Copiar Schema:** Implementar el archivo `convex/schema.ts` definido en la spec.
3.  **Poblar DB:** Crear y correr `convex/seed_inventory.ts` para tener datos reales de prueba.
4.  **Setup n8n:** Levantar la instancia de n8n y conectar las credenciales de Convex.

---

## Archivos clave

### Documentación
- `project_spec.md` - La fuente de verdad.
- `docs/architecture.md` - Diagrama de flujos.

### Backend (Convex - A crear)
- `convex/schema.ts` - Definición de tablas y tipos.
- `convex/seed_inventory.ts` - Script de carga inicial.

### Workflows (n8n - A crear)
- Se guardarán en carpeta `/workflows` (si aplica exportación JSON).

---

## Configuración requerida

- [x] Definición de Tech Stack
- [ ] **Convex Project**: Pendiente crear.
- [ ] **OpenAI API Key**: Necesaria para NLU.
- [ ] **Replicate API Key**: Necesaria para generación de imágenes.
- [ ] **SMTP/Sendgrid**: Necesario para correos a terceros.

---

## Decisiones tomadas

- [x] **Base de Datos:** Usar **Convex** desde el inicio (en lugar de Google Sheets) para tipado fuerte y facilidad de migración a Fase 2.
- [x] **Interfaz Fase 1:** Usar chat nativo de n8n para validar lógica sin gastar tiempo en Frontend.
- [x] **Manejo de Terceros:** Separar flujo; no cotizar automáticamente, sino enviar email de consulta y notificar estado "Pendiente".
- [x] **Precios:** Calcular en tiempo real (Base + Costos Unicos + Markup) en lugar de guardar precio final fijo.

---

## Blockers actuales

- **Credenciales:** Necesitamos asegurar acceso a las API Keys de OpenAI y Replicate antes de testear los workflows de IA.
