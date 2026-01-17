# Changelog

Todos los cambios notables al proyecto "OOH Agent" se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

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
