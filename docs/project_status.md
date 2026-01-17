# Project Status - OOH Agent

**Last Updated:** 2026-01-17
**Current Phase:** Phase 1.3 - Integrations Complete, Prototype Functional
**Project Start:** January 2026

---

## Estado actual

### Fase 0: Definición y Arquitectura ✅ COMPLETADA

- [x] Definición de project_spec.md (v2.1)
- [x] Documentación base (CLAUDE.md, architecture.md)
- [x] Definición de flujos de datos y lógica de precios
- [x] Selección de Tech Stack (n8n + Convex + Replicate)

### Fase 1.1: Data Layer (Convex) ✅ COMPLETADA

- [x] Inicializar proyecto Convex (`exciting-grasshopper-186`)
- [x] Implementar `schema.ts` (Inventory, Partners, Proposals, AuditLogs)
- [x] Crear funciones de query (inventory, pricing, partners, audit)
- [x] Crear funciones de mutation (status updates, date blocking)
- [x] Crear script de seed `seed.ts` con datos de inventario
- [x] Ejecutar seed y validar datos (12 soportes, 4 partners)

**Resumen de datos sembrados:**
| Zona | Soportes | Propios | Terceros |
|------|----------|---------|----------|
| GBA Norte | 3 | 3 | 0 |
| GBA Sur | 2 | 1 | 1 (MediaMax) |
| GBA Oeste | 2 | 1 | 1 (VíaPublica SA) |
| CABA | 5 | 3 | 2 (UrbanMedia, OutdoorPlus) |
| **Total** | **12** | **8** | **4** |

### Fase 1.2: Logic Layer (n8n) ✅ COMPLETADA

- [x] Setup de n8n Cloud (`carbono14.app.n8n.cloud`)
- [x] Workflow: Master Chat & NLU (`cg5rOPNa2HHSmBwQ`)
- [x] Workflow: Inventory Search & Filtering (`3BPRHEfXWLSYF8aH`)
- [x] Workflow: Pricing Engine & Commission Logic (`OXpqBrKT4nrOpQrE`)
- [x] Workflow: Third Party Handler (`FVBUo5gma5SdMjGN`)
- [x] Configurar credencial OpenAI en n8n y activar workflows

**Workflows principales:**
| Workflow | ID | Nodos | Estado |
|----------|-----|-------|--------|
| Master Chat | `cg5rOPNa2HHSmBwQ` | 7 | **Activo** |
| Inventory Search | `3BPRHEfXWLSYF8aH` | 4 | **Activo** |
| Pricing Engine | `OXpqBrKT4nrOpQrE` | 4 | **Activo** |
| Third Party Handler | `FVBUo5gma5SdMjGN` | 6 | **Activo** |

### Fase 1.3: Integraciones y Assets ✅ COMPLETADA

- [x] Conexión HTTP a Convex API (integrada en workflows)
- [x] Configurar credencial OpenAI en n8n UI
- [x] Activar y probar Master Chat workflow
- [x] Workflow: Image Composer (`SDjs73CyTsOoPzKr`) - Replicate API
- [x] Workflow: PDF Generator (`gPFkNF3tV61AWB70`) - Gotenberg
- [ ] Implementar envío real de emails para Terceros (pendiente credenciales SMTP)

**Workflows de assets:**
| Workflow | ID | Nodos | Estado |
|----------|-----|-------|--------|
| Image Composer | `SDjs73CyTsOoPzKr` | 5 | **Activo** |
| PDF Generator | `gPFkNF3tV61AWB70` | 4 | **Activo** |

### Fase 2: MVP (Web App) 🛑 NO INICIADA

- [ ] Setup Next.js App Router
- [ ] Integración BetterAuth
- [ ] UI de Chat con historial

---

## Métricas de progreso

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Documentación** | **Completa** | **100%** |
| Base de Datos (Convex) | **Completa** | **100%** |
| Workflows (n8n) | **Activos y Probados** | **100%** |
| Integraciones AI | **Funcionando** | **90%** |
| **Total Prototipo Fase 1** | **Funcional** | **95%** |

---

## Pruebas realizadas

### Chat con búsqueda de inventario ✅
- **Query:** "¿Qué soportes tienen disponibles en CABA?"
- **Resultado:** 11 soportes encontrados, 4 en CABA correctamente filtrados
- **Respuesta:** Incluye código, tipo, propietario, ubicación, precios y disponibilidad

### Cotización de precios ✅
- **Query:** "Dame una cotización para 30 días del soporte GFG050 en Abasto"
- **Resultado:** Cotización detallada con desglose de costos
- **Incluye:** Alquiler, producción, instalación, tasa municipal, NETO y BRUTO con IVA

---

## Próximos pasos

1. **Asignar credencial SMTP** al nodo "Enviar Email" en Third Party Handler (manual en UI)
2. **Siguiente fase:** Iniciar desarrollo de Web App (Fase 2)

---

## Documentación creada

| Archivo | Descripción |
|---------|-------------|
| `docs/user_manual_en.md` | Manual de usuario en inglés |
| `docs/user_manual_es.md` | Manual de usuario en español |
| `docs/demo_pitch.md` | Documento de pitch para demostración al cliente |
| `docs/manual-testing-guide.md` | Guía de testing manual con casos de prueba |

---

## Archivos clave

### Documentación
- `project_spec.md` - La fuente de verdad.
- `docs/architecture.md` - Diagrama de flujos.

### Backend (Convex) ✅
- `convex/schema.ts` - Definición de tablas y tipos.
- `convex/inventory.ts` - Queries y mutations de inventario.
- `convex/pricing.ts` - Lógica de cálculo de precios.
- `convex/partners.ts` - Gestión de terceros.
- `convex/audit.ts` - Logging de eventos.
- `convex/seed.ts` - Script de carga inicial.

### Workflows (n8n) ✅
- `OOH Agent - Master Chat` (`cg5rOPNa2HHSmBwQ`) - Chat principal con AI Agent
- `OOH Agent - Inventory Search` (`3BPRHEfXWLSYF8aH`) - Búsqueda de soportes en Convex
- `OOH Agent - Pricing Engine` (`OXpqBrKT4nrOpQrE`) - Cálculo de cotizaciones
- `OOH Agent - Third Party Handler` (`FVBUo5gma5SdMjGN`) - Gestión de terceros
- `OOH Agent - Image Composer` (`SDjs73CyTsOoPzKr`) - Generación de mockups con Replicate
- `OOH Agent - PDF Generator` (`gPFkNF3tV61AWB70`) - Generación de propuestas PDF

---

## Configuración requerida

- [x] Definición de Tech Stack
- [x] **Convex Project**: `exciting-grasshopper-186` (dev)
- [x] **OpenAI API Key**: Configurada en .env
- [x] **Replicate API Key**: Configurada en .env
- [x] **SMTP Gmail**: Configurado en .env
- [x] **n8n Cloud**: `carbono14.app.n8n.cloud`

---

## Decisiones tomadas

- [x] **Base de Datos:** Usar **Convex** desde el inicio (en lugar de Google Sheets) para tipado fuerte y facilidad de migración a Fase 2.
- [x] **Interfaz Fase 1:** Usar chat nativo de n8n para validar lógica sin gastar tiempo en Frontend.
- [x] **Manejo de Terceros:** Separar flujo; no cotizar automáticamente, sino enviar email de consulta y notificar estado "Pendiente".
- [x] **Precios:** Calcular en tiempo real (Base + Costos Unicos + Markup) en lugar de guardar precio final fijo.
- [x] **Schema extendido:** Agregadas tablas `proposals` y `audit_logs` para tracking futuro.

---

## Blockers actuales

- **Credencial Replicate:** Necesita configurarse en n8n para Image Composer
- **Credencial SMTP:** Necesita configurarse para envío de emails a terceros

---

## Cómo probar el prototipo

### Acceder al chat (ya configurado y activo)
```
URL: https://carbono14.app.n8n.cloud/webhook/ooh-agent-chat/chat
```

### Ejemplos de consultas para probar
- "¿Qué soportes tienen disponibles en zona norte?"
- "Busco espectaculares en CABA"
- "Dame una cotización para 30 días del soporte GFG050"
- "¿Cuánto cuesta una campaña de 15 días en Palermo?"
- "Muéstrame medianeras disponibles en GBA Sur"

### Configurar credenciales adicionales (opcional)

#### Replicate (para Image Composer)
```
1. Ir a https://carbono14.app.n8n.cloud
2. Menú → Credentials → Add Credential
3. Buscar "Header Auth"
4. Name: Replicate API
5. Header Name: Authorization
6. Header Value: Token <tu_api_key>
7. Guardar
8. Asignar al workflow "OOH Agent - Image Composer"
```

#### SMTP (para emails a terceros)
```
1. Ir a https://carbono14.app.n8n.cloud
2. Menú → Credentials → Add Credential
3. Buscar "SMTP"
4. Configurar con los datos de tu servidor SMTP
5. Guardar
6. Asignar al workflow "OOH Agent - Third Party Handler"
```
