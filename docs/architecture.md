# Arquitectura del Sistema

Este documento describe a alto nivel la arquitectura, el flujo de datos y la relación entre componentes para la **Fase 1 (Prototipo)** del Agente OOH.

## Vista General del Sistema

**OOH Agent** es un asistente comercial automatizado que opera mediante una interfaz de chat para generar propuestas de publicidad exterior complejas, incluyendo cálculos de precios y mockups visuales.

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                           USUARIO                               │
│                   (Ejecutivo Comercial)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ 1. Chat (Texto)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORQUESTADOR (n8n)                            │
│                  (Docker / n8n Cloud)                           │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│  • Webhooks / Chat Trigger  │  • Lógica de Negocio (JS/TS)      │
│  • Gestión de Errores       │  • Control de Flujo (If/Switch)   │
│                             │                                   │
└────────────┬───────────┬────┴──────────┬────────────────────────┘
             │           │               │
             │           │ 2. Query      │ 3. Generación
             │           │    Inventario │    Assets
             ▼           ▼               ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────────┐
│   INTELIGENCIA   │  │ BASE DE DATOS│  │   SERVICIOS MEDIA    │
│      (LLM)       │  │   (Convex)   │  │      (Externos)      │
├──────────────────┤  ├──────────────┤  ├──────────────────────┤
│ • OpenAI /       │  │ • Inventory  │  │ • Replicate (Img)    │
│   Anthropic      │  │ • Audit Logs │  │ • DALL-E (Img)       │
│ • NLU & Intent   │  │ • Users (F2) │  │ • Gotenberg (PDF)    │
└──────────────────┘  └──────────────┘  └──────────────────────┘

## Data Flow (Fase 1)

### Flujo de Propuesta "Happy Path"
1. **Input:** Usuario solicita: *"Propuesta para Coca-Cola en GBA Norte, Marzo 2026"*.
2. **NLU (n8n + LLM):** Se extraen entidades: `{client: "Coca-Cola", zone: "GBA Norte", dates: ["2026-03-01", "2026-03-31"]}`.
3. **Búsqueda (n8n -> Convex):**
   * n8n ejecuta query a Convex filtrando por `location.zone` y `availability.status`.
   * Convex retorna Array de objetos JSON con el inventario disponible.
4. **Cálculo de Precios (n8n):**
   * Se itera sobre el inventario.
   * Se aplica fórmula: `(Alquiler * Días) + Costos Únicos + Tasas`.
   * Se suma el Markup de Agencia (20%).
5. **Generación Visual (n8n -> AI):**
   * Si el usuario subió logo, n8n envía `base_image_url` (de Convex) + Logo a Replicate.
   * Se obtiene URL de la imagen compuesta.
6. **Armado de Documento (n8n -> PDF Engine):**
   * Se inyectan datos y URLs de imágenes en plantilla HTML.
   * Se convierte a PDF.
7. **Respuesta:** El chat devuelve un resumen de texto y el link de descarga del PDF.

### Flujo de Terceros (Excepción)
1. **Detección:** Durante el paso 3, n8n detecta un item con `owner != "Global"`.
2. **Bifurcación:** El workflow separa estos items.
3. **Acción:**
   * n8n busca el contacto del proveedor en un diccionario interno o tabla `partners` (Convex).
   * Envía email automático: *"Solicitud de disponibilidad para [Ubicación] - Cliente: [Cliente]"*.
4. **Persistencia:** Actualiza el estado en Convex a `status: "pending_third_party"`.
5. **Feedback:** Informa al usuario: *"Incluí 2 sitios de terceros. Se enviaron correos de consulta."*

## Arquitectura de Componentes

### Backend Layer (n8n Workflows)

El "backend" lógico está compuesto por Workflows de n8n. No hay servidor de API tradicional en la Fase 1.

| Workflow | Responsabilidad |
|----------|-----------------|
| **Master Chat** | Maneja la conversación, historial y ruteo de intención. |
| **Inventory Search** | Sub-workflow. Recibe filtros, consulta Convex, retorna JSON limpio. |
| **Pricing Engine** | Sub-workflow. Recibe items + días. Retorna array con cálculos `neto` y `bruto`. |
| **Image Composer** | Sub-workflow. Maneja la API de Replicate. Incluye reintentos (retries) por latencia. |
| **PDF Generator** | Sub-workflow. Renderiza HTML y llama al servicio de conversión. |
| **Email Notifier** | Sub-workflow. Maneja plantillas y envío SMTP/API para terceros. |

### Data Layer (Convex)

Esquema estricto definido en `convex/schema.ts`.

#### Tablas Principales
* **`inventory`**: Catálogo maestro de soportes.
* **`proposals`** (Futuro MVP): Para guardar cotizaciones históricas.
* **`partners`**: Datos de contacto de dueños de soportes de terceros.

### Integraciones Externas (APIs)

* **OpenAI API / Anthropic:** Cerebro para entender el lenguaje natural.
* **Replicate / DALL-E:** Motor gráfico para insertar logos en fotos.
* **Gotenberg / APITemplate:** Motor de renderizado de documentos PDF.
* **SMTP / SendGrid:** Envío de correos transaccionales a terceros.

## Seguridad (Fase 1)

* **Autenticación:**
  * Acceso al Editor n8n: Basic Auth / User Management de n8n.
  * Acceso a Convex: Token de administración en variables de entorno de n8n.
* **Gestión de Secretos:**
  * NUNCA hardcodear API Keys.
  * Usar el gestor de credenciales de n8n.
  * Usar Dashboard de Variables de Entorno en Convex Cloud.

## Limitaciones Conocidas (Fase 1)

* **Sincronismo:** El usuario debe esperar en la ventana del chat mientras se genera el PDF (puede tardar 30-60 seg).
* **Persistencia de Chat:** Si se reinicia el workflow de n8n, se pierde el historial de memoria corta (dependiendo de la config de memoria del nodo AI).
* **Edición Manual:** Si el usuario quiere cambiar un precio "a mano", debe pedirle al agente que regenere todo o editar el PDF final externamente.
