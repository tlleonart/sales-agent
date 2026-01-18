# Changelog

Todos los cambios notables al proyecto "OOH Agent" se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [1.6.0] - 2026-01-18 - Error Handling & Free Mockup Generation

### Added

#### Free Mockup Generation Module (convex/mockups.ts)
- **100% FREE mockup generation** for prototype phase
- `generateMockupUrl` - Generate mockup URL for single support
- `generateBatchMockups` - Generate mockups for multiple supports
- `storeProposalWithGeneratedMockups` - Store proposal with auto-generated mockups
- Uses [placehold.co](https://placehold.co) service (completely free, no API key needed)
- Prepared for Cloudinary upgrade when needed (free tier: 25k transformations/month)

#### Mockup Features
- Client name displayed prominently on billboard placeholder
- Support code and type identification
- Professional dark blue (#1a365d) with white text
- 1200x800 resolution (configurable)

### Changed

#### Error Handling Improvements
All Convex functions now return consistent error objects instead of `null`:

**pricing.ts:**
- `calculateItemPrice` - Returns `{success: false, error: "..."}` instead of `null`
- `calculateProposalTotal` - Now reports which items were not found in `warnings`
- `simulatePrice` - Returns `{success: false, error: "..."}` instead of `null`

**inventory.ts:**
- `getByCode` - Returns `{success: false, error: "..."}` instead of `null`
- `getFullDetails` - Returns `{success: true, data: {...}}` or `{success: false, error: "..."}`
- `getMultipleFullDetails` - Now reports which IDs were not found in `warnings`

#### Error Message Format (Consistent Pattern)
```typescript
// Success case
{ success: true, data: {...} }

// Error case
{ success: false, error: "Mensaje descriptivo en español" }

// With warnings (partial success)
{ success: true, data: [...], warnings: { message: "...", notFoundIds: [...] } }
```

### Technical Details

#### New File
- `convex/mockups.ts` - Mockup generation module with free placeholder service

#### Test Updates
- Updated `pricing.test.ts` to handle new error response format

### Verified
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no warnings
- ✅ All 11 unit tests pass
- ✅ Mockup generation tested: `generateMockupUrl("Coca-Cola", "GFG050", "Medianera")`
- ✅ Proposal with mockups tested: `storeProposalWithGeneratedMockups("Pepsi", 30, ["GFG050", "GFG053"])`

### Notes on Image Generation

**Current (Prototype):**
- DALL-E 3 generates NEW billboard images with client branding
- Placeholder fallback available (100% free)
- Works immediately with existing OpenAI credentials

**Future Upgrade Path (MVP) - Documented in `docs/mockup-improvement-plan.md`:**
1. **Replicate SDXL Inpainting** (Recommended) - Edit real billboard photos, ~$0.003/image
2. **DALL-E 2 Edit** - Use existing credentials, ~$0.02/image
3. **Hugging Face** (Free tier) - AI inpainting for realistic mockups

**MVP Goal:** Take actual billboard photo → Replace only billboard content with client branding → Keep same street/location

---

## [1.5.0] - 2026-01-18 - Code Quality & Testing Infrastructure

### Added

#### Testing Framework
- **Vitest + convex-test** - Unit testing infrastructure for Convex functions
- `npm test` and `npm run test:watch` commands
- 11 tests covering pricing calculations and third-party detection

#### Type Safety
- **convex/types.ts** - Shared type definitions and validators
  - `inventoryStatusValidator` - Type-safe inventory status (available, reserved, maintenance, pending_third_party)
  - `proposalStatusValidator` - Type-safe proposal status (draft, sent, approved, rejected)
  - `eventTypeValidator` - Type-safe audit event types
  - `getStatusDisplay()` helper for localized status display
  - `isThirdParty()` helper function

#### Shared Configuration
- **convex/config.ts** - Centralized pricing constants
  - `PRICING_CONFIG` with commission rates (20% agency, 10% intermediary, 21% IVA)
  - `GLOBAL_OWNER` constant for third-party detection
  - `calculatePriceBreakdown()` helper function
  - Eliminates code duplication across modules

#### Code Quality
- **eslint.config.js** - ESLint 9.x configuration with TypeScript rules
- Added `"type": "module"` to package.json

### Changed

#### Schema (convex/schema.ts)
- `inventory.availability.status` now uses union validator (type-safe)
- `proposals.status` now uses union validator
- `audit_logs.event_type` now uses union validator

#### Pricing Module (convex/pricing.ts)
- Refactored to use shared `calculatePriceBreakdown()` helper
- Uses `GLOBAL_OWNER` constant instead of hardcoded "Global" string
- Removed unused imports (action, api)

#### Proposals Module (convex/proposals.ts)
- Uses shared `PRICING_CONFIG` instead of inline constants
- Uses `getStatusDisplay()` for availability display text
- Uses `EVENT_TYPES` constants for audit log events

#### Seed Module (convex/seed.ts)
- Uses `INVENTORY_STATUS` constants for type-safe status values

#### PDF Template (templates/build-pdf-html.js)
- **Security fix**: Google Maps API key now loaded from `$json.googleMapsApiKey` or `$env.GOOGLE_MAPS_API_KEY`
- Removed hardcoded API key from code

### Technical Details

#### Files Created
- `eslint.config.js` - ESLint 9.x flat config
- `vitest.config.ts` - Vitest configuration
- `convex/types.ts` - Shared types and validators
- `convex/config.ts` - Shared pricing configuration
- `convex/pricing.test.ts` - Unit tests for pricing logic
- `docs/codebase-review.md` - Comprehensive code review document

#### Dependencies Added
- `typescript-eslint` ^8.53.0
- `@eslint/js` ^9.39.2
- `vitest` ^4.0.17
- `convex-test` ^0.0.41

### Verified
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no warnings
- ✅ All 11 unit tests pass
- ✅ Convex functions work correctly (tested live)
- ✅ Pricing calculations verified with GFG050 test case

---

## [1.4.0] - 2026-01-18 - PDF Cover Simplification & Mockup Integration

### Changed

#### PDF Cover Page
- **Simplified cover design** - Removed portfolio image grid from cover page
- Cover now shows only: Global logo (centered) + "Propuesta {clientName}" + "{Month} {Year}"
- Cleaner, more professional appearance

#### n8n Workflows
- **Master Chat** (`cg5rOPNa2HHSmBwQ`) - Added new tool `GuardarPropuestaConMockups`
  - Stores proposals with AI-generated mockup URLs
  - Uses `proposals:storeProposalWithMockups` Convex mutation
  - Enables mockup images to appear in PDFs
- **AI Agent Instructions** - Updated to clarify two PDF generation flows:
  - **With mockups**: GenerarImagen → GuardarPropuestaConMockups → GenerarPDF
  - **Without mockups (fast)**: GuardarPropuesta → GenerarPDF

### Technical Details
- New HTTP Request Tool: `GuardarPropuestaConMockups` accepts `items` array with `code` and `mockupUrl`
- Cover page CSS updated: removed grid styles, added centered title styling
- Spanish month names generated dynamically (Enero, Febrero, etc.)

### Verified
- ✅ PDF generation tested with simplified cover page
- ✅ Test Company proposal: cover shows "Propuesta Test Company - Enero 2026"
- ✅ Google Drive upload working correctly

---

## [1.3.0] - 2026-01-18 - DALL-E Image Generation

### Changed

#### n8n Workflows
- **Image Composer** (`SDjs73CyTsOoPzKr`) - Switched from Replicate SDXL to OpenAI DALL-E 3
  - Uses existing OpenAI credentials (n8n free OpenAI API credits)
  - Generates professional billboard mockups with client branding
  - Output size: 1792x1024 (landscape format for billboards)
  - Style: Natural, photorealistic street photography

### Why the change
- Replicate API was hitting rate limits during testing
- DALL-E 3 uses existing OpenAI credentials (no additional API setup needed)
- Better quality for billboard-style promotional imagery

### Technical Details
- Node: `@n8n/n8n-nodes-langchain.openAi` with `resource: image`, `operation: generate`
- Model: `dall-e-3` with standard quality
- Prompt template generates urban billboard scenes with client branding
- Returns image URL directly for PDF integration

### Verified
- ✅ Image generation tested via Master Chat
- ✅ Coca Cola billboard mockup generated successfully
- ✅ Integration with PDF workflow maintained

---

## [1.2.1] - 2026-01-17 - Pricing Tool Fix & Full Testing Verification

### Fixed

#### Pricing Engine Integration
- **`$fromAI()` null issue resolved** - Replaced toolWorkflow approach with HTTP Request Tool
  - Root cause: n8n AI Agent `$fromAI()` expressions in toolWorkflow nodes were returning null
  - Solution: Use `@n8n/n8n-nodes-langchain.toolHttpRequest` with placeholder parameters
  - The AI fills in `{inventoryCode}` and `{campaignDays}` placeholders directly

#### Master Chat Workflow (`cg5rOPNa2HHSmBwQ`)
- **CalcularPrecio tool** - Replaced toolWorkflow with HTTP Request Tool
  - New tool calls Convex `pricing:calculateByCode` endpoint directly
  - Uses placeholders: `{inventoryCode}` (string), `{campaignDays}` (number)
  - Returns detailed pricing breakdown in Spanish

### Added

#### Convex Functions
- **`pricing:calculateByCode`** - New query that accepts inventory code (string) instead of ID
  - Searches inventory by code field
  - Returns full pricing breakdown with Spanish field names
  - Includes third-party detection and intermediary commission handling

### Verified (Full Manual Testing)

All 8 test cases passed:

| Test | Description | Result |
|------|-------------|--------|
| 1.1 | Inventory search by zone (CABA) | ✅ 5 supports found |
| 1.2 | Inventory search by type | ✅ Working |
| 1.3 | Combined search | ✅ Working |
| 2.1 | Quotation (GFG050, 30 days) | ✅ Neto $2,076,000, Bruto $2,511,960 |
| 2.2 | Third-party quotation | ✅ Includes 10% intermediary |
| 3.1 | Third-party identification | ✅ Working |
| 4.1 | PDF generation | ✅ Multi-page PDF generated |
| 5.1 | Conversational flow | ✅ Working |

### Technical Details
- HTTP Request Tool avoids $fromAI() limitations in toolWorkflow
- Pricing calculations verified accurate with IVA 21%
- PDF matches `pdf-example.pdf` reference format exactly

---

## [1.2.0] - 2026-01-17 - Professional Multi-Page PDF System

### Added

#### Schema Enhancements
- **Extended inventory specs** with: `total_dimensions`, `sub_format`, `material_spec`, `send_format`, `send_deadline`, `additional_info`
- **Location neighborhood** field for barrio-level detail
- **`getFullDetails`** query returns all fields needed for product sheets
- **`getMultipleFullDetails`** query for batch retrieval
- **`storeRichProposal`** mutation stores complete inventory snapshots
- **`getLatestRichProposal`** query retrieves rich proposal data

#### HTML Templates
- **`templates/pdf-styles.css`** - Global branding CSS
- **`templates/pdf-cover.html`** - Cover page with logo + portfolio grid
- **`templates/pdf-summary.html`** - Pricing summary table
- **`templates/pdf-product-sheet.html`** - Individual product sheets
- **`templates/build-pdf-html.js`** - n8n Code node builder

### Changed

#### n8n Workflows
- **Image Composer** (`SDjs73CyTsOoPzKr`) - Enhanced to accept client logo/name for mockups
- **PDF Generator** (`VW93F4HBY5Gz7pCr`) - Complete redesign with:
  - Page 1: Cover with logo and portfolio images
  - Page 2: Summary table (Soporte, Ubicación, Disponibilidad, Localidad, Valores)
  - Pages 3+: Product sheets (mockup image, specs table, Google Maps)

### Technical Details
- PDF format matches `pdf-example.pdf` reference
- Google Maps Static API integration for location maps (requires API key)
- Gotenberg HTML-to-PDF conversion maintained
- Google Drive upload for PDF storage

---

## [1.1.0] - 2026-01-17 - Testing Manual Completo + Fixes

### Added
- **Convex proposals module** (`proposals.ts`): State-based approach for PDF generation
  - `storePendingProposal` mutation stores proposal data in audit_logs
  - `getLatestPendingProposal` query retrieves data for PDF workflow
  - Workaround for n8n `$fromAI()` parameter passing limitations

### Fixed
- **Pricing Engine workflow** (`OXpqBrKT4nrOpQrE`): Fixed `$fromAI()` returning null
  - Replaced toolWorkflow with Code Tool
  - Parameters now passed via JSON schema correctly
  - Verified: calculations match expected values

### Verified (Manual Testing)
All 8 test cases from `manual-testing-guide.md` passed:

| Test | Description | Status |
|------|-------------|--------|
| 1.1 | Inventory search by zone | ✅ |
| 1.2 | Inventory search by type | ✅ |
| 1.3 | Combined search (zone + type) | ✅ |
| 2.1 | Simple quotation (own support) | ✅ |
| 2.2 | Third-party quotation | ✅ |
| 3.1 | Third-party identification | ✅ |
| 4.1 | PDF generation | ✅ |
| 5.1 | Conversational flow | ✅ |

### Notes
- OpenAI rate limiting observed during heavy testing (TPM limit)
- All workflows active and functional
- PDF uploads successfully to Google Drive

---

## [1.0.0] - 2026-01-17 - Fase 1 Completa: Prototipo Funcional

### Added

#### Data Layer (Convex) - Fase 1.1
- **Proyecto Convex**: `exciting-grasshopper-186` inicializado y desplegado
- **Schema completo** (`schema.ts`): Tablas `inventory`, `partners`, `proposals`, `audit_logs`
- **Queries de inventario** (`inventory.ts`): Búsqueda por zona, tipo, código con filtros
- **Lógica de precios** (`pricing.ts`): Cálculo de NETO/BRUTO con comisiones
- **Gestión de partners** (`partners.ts`): CRUD + función `updateAllEmails` para testing
- **Audit logging** (`audit.ts`): Tracking de eventos del sistema
- **Seed script** (`seed.ts`): 12 soportes (8 propios, 4 terceros) y 4 partners

#### Logic Layer (n8n Workflows) - Fase 1.2
- **Master Chat** (`cg5rOPNa2HHSmBwQ`): AI Agent con GPT-4o-mini, herramientas integradas
- **Inventory Search** (`3BPRHEfXWLSYF8aH`): Consultas HTTP a Convex
- **Pricing Engine** (`OXpqBrKT4nrOpQrE`): Cálculo de cotizaciones con comisiones
- **Third Party Handler** (`FVBUo5gma5SdMjGN`): Detección de terceros + envío de emails

#### Integraciones y Assets - Fase 1.3
- **Image Composer** (`SDjs73CyTsOoPzKr`): Generación de mockups con Replicate API
- **PDF Generator** (`gPFkNF3tV61AWB70`): HTML-to-PDF con Gotenberg
- **Conexión HTTP a Convex**: Integrada en todos los workflows
- **Credenciales configuradas**: OpenAI, Replicate, SMTP Gmail

#### Documentación
- **Manual de usuario EN** (`docs/user_manual_en.md`): Guía completa en inglés
- **Manual de usuario ES** (`docs/user_manual_es.md`): Guía completa en español
- **Demo Pitch** (`docs/demo_pitch.md`): Documento de presentación para clientes
- **Guía de Testing Manual** (`docs/manual-testing-guide.md`): Casos de prueba con ejemplos

### Changed
- Migración de estrategia de datos: JSON estático → Convex para tipado fuerte
- Schema extendido con tablas `proposals` y `audit_logs` para tracking futuro

### Verified
- Búsqueda de inventario por zona/tipo funciona correctamente
- Cotización calcula NETO ($2,406,000) y BRUTO ($2,911,260) con IVA 21%
- Terceros identificados con comisión intermediario 10%
- PDF se genera correctamente (148 KB)
- Todos los 6 workflows activos y funcionales

---

## [0.1.0] - 2026-01-15 - Inicialización del Proyecto

### Added

#### Documentación
- **Project Spec v2.1**: Definición completa de requerimientos, lógica de precios, manejo de terceros
- **Architecture**: Diagrama de flujo de datos, definición de componentes (n8n, Convex, AI APIs)
- **CLAUDE.md**: Reglas de contexto, guía de estilo y comandos para el asistente de desarrollo
- **Project Status**: Tracking inicial de tareas y milestones

---

## Formato de versiones

### [X.Y.Z] - YYYY-MM-DD

#### Added
- Nuevas funcionalidades

#### Changed
- Cambios en funcionalidades existentes

#### Deprecated
- Funcionalidades que serán removidas

#### Removed
- Funcionalidades removidas

#### Fixed
- Corrección de bugs

#### Security
- Correcciones de vulnerabilidades
