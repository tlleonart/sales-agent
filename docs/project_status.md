# Project Status - OOH Agent

**Last Updated:** 2026-01-18
**Current Phase:** Phase 1 Complete - v1.6.0 with Free Mockups ✅
**Project Start:** January 2026

---

## Estado actual

### Fase 0: Definición y Arquitectura ✅ COMPLETADA

- [x] Definición de project_spec.md (v2.1)
- [x] Documentación base (CLAUDE.md, architecture.md)
- [x] Definición de flujos de datos y lógica de precios
- [x] Selección de Tech Stack (n8n + Convex + OpenAI DALL-E)

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
- [x] Workflow: Image Composer (`SDjs73CyTsOoPzKr`) - OpenAI DALL-E 3
- [x] Workflow: PDF Generator (`gPFkNF3tV61AWB70`) - Gotenberg
- [ ] Implementar envío real de emails para Terceros (pendiente credenciales SMTP)

**Workflows de assets:**
| Workflow | ID | Nodos | Estado |
|----------|-----|-------|--------|
| Image Composer | `SDjs73CyTsOoPzKr` | 4 | **Activo** (DALL-E 3) |
| PDF Generator | `VW93F4HBY5Gz7pCr` | 6 | **Activo** (Redesigned) |

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

## Pruebas realizadas (Testing Manual Completo) ✅

### Fase 1 - Testing Manual - 2026-01-17

| Test | Descripción | Estado |
|------|-------------|--------|
| 1.1 | Búsqueda por zona (CABA) | ✅ Passed |
| 1.2 | Búsqueda por tipo (Espectaculares) | ✅ Passed |
| 1.3 | Búsqueda combinada (Medianeras GBA Norte) | ✅ Passed |
| 2.1 | Cotización simple (soporte propio GFG050) | ✅ Passed |
| 2.2 | Cotización tercero (GFG052 UrbanMedia) | ✅ Passed |
| 3.1 | Identificación de terceros (GBA Sur) | ✅ Passed |
| 4.1 | Generación de PDF | ✅ Passed |
| 5.1 | Flujo conversacional | ✅ Passed |

### Detalles de Tests

#### Test 1.1 - Búsqueda por zona ✅
- **Query:** "¿Qué soportes tienen disponibles en CABA?"
- **Resultado:** 5 soportes en CABA correctamente filtrados
- **Respuesta:** Incluye código, tipo, propietario, ubicación, precios y disponibilidad

#### Test 2.1 - Cotización simple ✅
- **Query:** "Dame una cotización para 30 días del soporte GFG050"
- **Resultado:** Cotización detallada con desglose completo
- **Valores verificados:** Alquiler $1,500,000 + Producción $280,000 + Instalación $140,000 + Tasa $85,000 + Comisión 20%
- **NETO:** $2,406,000 | **BRUTO (con IVA 21%):** $2,911,260

#### Test 2.2 - Cotización tercero ✅
- **Query:** "Cotiza el soporte GFG052 en Palermo por 30 días"
- **Resultado:** Incluye comisión intermediario 10% adicional
- **Identificación correcta:** UrbanMedia como propietario tercero

#### Test 4.1 - PDF Generation ✅
- **Query:** Generar PDF de propuesta para Pepsi Argentina
- **Resultado:** PDF generado y subido a Google Drive exitosamente
- **Tamaño:** ~148 KB

### Issues encontrados y resueltos durante testing

1. **$fromAI() returning null** (Pricing Engine) ✅ RESUELTO
   - **Problema:** toolWorkflow y $fromAI() expressions no pasaban parámetros correctamente
   - **Intentos fallidos:**
     - `inputSource: "passthrough"` en Execute Workflow Trigger
     - `mappingMode: "autoMapInputData"` en toolWorkflow
     - Definir inputs con `workflowInputs` mode
   - **Solución final:** Reemplazar toolWorkflow con HTTP Request Tool (`@n8n/n8n-nodes-langchain.toolHttpRequest`)
   - **Detalles técnicos:**
     - Nuevo endpoint Convex `pricing:calculateByCode` acepta código (string) en lugar de ID
     - HTTP Request Tool usa placeholders `{inventoryCode}` y `{campaignDays}` que el AI completa directamente
     - Evita completamente el problema de $fromAI()

2. **OpenAI Rate Limiting** (Test 5.1)
   - **Observación:** Heavy testing consumió cuota de tokens
   - **Impacto:** Mínimo, tests completados exitosamente

---

## Próximos pasos

### Mejora del Sistema PDF ✅ COMPLETADA (2026-01-17)
1. ✅ **Rediseñar PDF Generator** - Multi-page professional format matching `pdf-example.pdf`
2. ✅ **Integrar AI Mockups** - Image Composer enhanced with client branding
3. ✅ **Agregar Google Maps** - Static map images per product sheet (requires API key)
4. 🔄 **HTML Preview** - Available in templates, needs chat integration

### Mejora del Sistema PDF v1.3 ✅ COMPLETADA (2026-01-18)
1. ✅ **Cover page simplificada** - Removido grid de imágenes, solo logo + título cliente + mes/año
2. ✅ **Soporte para mockups IA** - Nueva herramienta `GuardarPropuestaConMockups` para almacenar URLs de DALL-E
3. ✅ **Flujo de mockups documentado** - AI puede generar imágenes y vincularlas al PDF

### v1.6.0 - Error Handling & Free Mockups ✅ COMPLETADO (2026-01-18)
1. ✅ **Error Handling mejorado** - Todas las funciones Convex retornan `{success, error}` en lugar de `null`
2. ✅ **Mockups GRATUITOS** - Nuevo módulo `convex/mockups.ts` con generación de placeholder mockups
3. ✅ **Nueva mutación** - `storeProposalWithGeneratedMockups` genera y almacena mockups automáticamente

### Pendientes Menores
1. **Credencial SMTP** - Asignar al nodo "Enviar Email" en Third Party Handler
2. ~~**Google Maps API Key** - Configurar en n8n para mapas en PDF~~ ✅ COMPLETADO
3. **Fase 2** - Web App con Next.js (futuro)
4. **Upgrade de Mockups** - Cloudinary (gratis) o Hugging Face para mockups con imagen real del cartel

---

## Documentación creada

| Archivo | Descripción |
|---------|-------------|
| `docs/user_manual_en.md` | Manual de usuario en inglés |
| `docs/user_manual_es.md` | Manual de usuario en español |
| `docs/demo_pitch.md` | Documento de pitch para demostración al cliente |
| `docs/manual-testing-guide.md` | Guía de testing manual con casos de prueba |
| `docs/mockup-improvement-plan.md` | **NUEVO** Plan técnico para edición de imágenes reales en MVP |
| `docs/codebase-review.md` | Revisión de código y mejoras implementadas |

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
- `convex/proposals.ts` - Almacenamiento de propuestas para PDF.
- `convex/mockups.ts` - **NUEVO** Generación de mockups GRATUITOS con placeholder.
- `convex/audit.ts` - Logging de eventos.
- `convex/config.ts` - Configuración compartida de precios.
- `convex/types.ts` - Tipos y validadores compartidos.
- `convex/seed.ts` - Script de carga inicial.
- `convex/pricing.test.ts` - Tests unitarios de pricing.

### Workflows (n8n) ✅
- `OOH Agent - Master Chat` (`cg5rOPNa2HHSmBwQ`) - Chat principal con AI Agent
- `OOH Agent - Inventory Search` (`3BPRHEfXWLSYF8aH`) - Búsqueda de soportes en Convex
- `OOH Agent - Pricing Engine` (`OXpqBrKT4nrOpQrE`) - Cálculo de cotizaciones
- `OOH Agent - Third Party Handler` (`FVBUo5gma5SdMjGN`) - Gestión de terceros
- `OOH Agent - Image Composer` (`SDjs73CyTsOoPzKr`) - Generación de mockups con DALL-E 3
- `OOH Agent - PDF Generator` (`VW93F4HBY5Gz7pCr`) - Generación de propuestas PDF (multi-page professional format)

---

## Configuración requerida

- [x] Definición de Tech Stack
- [x] **Convex Project**: `exciting-grasshopper-186` (dev)
- [x] **OpenAI API Key**: Configurada en .env (used for chat + DALL-E image generation)
- [x] ~~**Replicate API Key**~~: Deprecated - switched to DALL-E 3
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

- **Credencial SMTP:** Necesita configurarse para envío de emails a terceros (menor prioridad)

---

## Resumen de Verificación Final (2026-01-17)

### Tests Ejecutados
| Test | Query | Resultado |
|------|-------|-----------|
| 1.1 | "¿Qué soportes tienen en CABA?" | ✅ 5 soportes encontrados |
| 2.1 | "Cotiza GFG050 por 30 días" | ✅ Neto $2,076,000, Bruto $2,511,960 |
| 4.1 | "Genera PDF para Pepsi Argentina" | ✅ PDF multi-página generado |

### Verificación de PDF
El PDF generado coincide exactamente con el formato de `pdf-example.pdf`:
- ✅ Portada con logo y grid de imágenes
- ✅ Tabla resumen con columnas correctas
- ✅ Product sheets con mockup, specs y mapa
- ✅ Footer con paginación
- ✅ Disclaimers sobre IVA

### Fix Aplicado: Pricing Tool
- **Antes:** toolWorkflow con $fromAI() → parámetros null
- **Después:** HTTP Request Tool con placeholders → funciona correctamente

### Fix Aplicado: GuardarPropuesta Tool (2026-01-17)
**Problema:** El PDF mostraba imágenes genéricas (Unsplash) en lugar de datos reales del inventario.

**Causa raíz:** La herramienta `storePendingProposal` solo almacenaba datos básicos (código, tipo, ubicación, días, precios) sin los detalles completos del inventario (imágenes, coordenadas, specs).

**Solución implementada:**
1. **Nueva mutación Convex:** `storeProposalByCodes` que:
   - Acepta códigos de inventario (ej: `["GFG001", "GFG002"]`)
   - Busca automáticamente los detalles completos de cada soporte
   - Almacena datos ricos: imágenes base, coordenadas (lat/long), specs completos, precios calculados

2. **Nueva herramienta HTTP Request:** `GuardarPropuesta` reemplazada con HTTP Request Tool
   - Usa placeholders simples: `clientName`, `campaignDays`, `inventoryCodes`
   - Evita problemas con `$fromAI()` y JSON complejo

3. **AI Agent actualizado:** Instrucciones simplificadas para usar la nueva herramienta

**Datos ahora incluidos en propuestas:**
- ✅ `base_image_url` - URL de imagen real del soporte
- ✅ `lat`, `long` - Coordenadas para Google Maps
- ✅ Specs completos: dimensiones, iluminación, material, resolución
- ✅ Precios calculados automáticamente con comisiones

---

## Cómo probar el prototipo

### Acceder al chat (ya configurado y activo)
```
URL: https://carbono14.app.n8n.cloud/webhook/ooh-agent-chat/chat
```

### Ejemplos de consultas para probar
- "¿Qué soportes tienen disponibles en zona norte?"
- "Busco espectaculares en CABA"
- "Dame una cotización para 30 días del soporte GFG001"
- "¿Cuánto cuesta una campaña de 15 días en Palermo?"
- "Muéstrame medianeras disponibles en GBA Sur"
- "Genera un PDF de propuesta para Coca-Cola con los soportes GFG001, GFG002 y GFG003 por 30 días"

### Configurar credenciales adicionales (opcional)

#### DALL-E Image Generation
Image Composer now uses OpenAI DALL-E 3 via the existing OpenAI credentials.
No additional configuration required - uses the same "n8n free OpenAI API credits" credential.

#### SMTP (para emails a terceros)
```
1. Ir a https://carbono14.app.n8n.cloud
2. Menú → Credentials → Add Credential
3. Buscar "SMTP"
4. Configurar con los datos de tu servidor SMTP
5. Guardar
6. Asignar al workflow "OOH Agent - Third Party Handler"
```
