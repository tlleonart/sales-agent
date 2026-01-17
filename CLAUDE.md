# CLAUDE.md

## Metas del proyecto
**Milestone actual:** Fase 1 - Prototipo Funcional.
**Objetivo principal:** Validar la lógica de negocio, precios y generación de entregables (PDF/Imágenes) usando n8n y Convex, sin desarrollo de Frontend UI todavía.

## Herramientas MCP disponibles

Claude tiene acceso a servidores MCP que permiten interactuar directamente con la infraestructura del proyecto:

### n8n MCP Server

**Propósito:** Crear, leer, actualizar y ejecutar workflows directamente en la instancia de n8n.
**Cobertura:** 1,084 nodos (537 core, 547 community), 2,709 templates, 265 variantes AI-capable.

#### Herramientas de Documentación (7 tools)

| Tool | Descripción | Uso típico |
|------|-------------|------------|
| `tools_documentation` | Guía de referencia de todas las funciones MCP | Consultar capacidades disponibles |
| `search_nodes` | Búsqueda full-text en nodos con ejemplos opcionales (`includeExamples: true`) | Encontrar nodos por funcionalidad |
| `get_node` | Obtener info de nodo (modos: minimal/standard/full, documentation, property search) | Configurar nodos específicos |
| `validate_node` | Validar configuración con perfiles (minimal, runtime, ai-friendly, strict) | Verificar antes de deploy |
| `validate_workflow` | Validación completa de workflows incluyendo AI Agent workflows | QA de workflows |
| `search_templates` | Descubrir templates (modos: keyword, by_nodes, by_task, by_metadata) | Encontrar ejemplos y patrones |
| `get_template` | Obtener JSON completo de workflow template | Usar como base para nuevos workflows |

#### Herramientas de Gestión n8n (13 tools - requieren API configurada)

**Gestión de Workflows:**
| Tool | Descripción |
|------|-------------|
| `n8n_create_workflow` | Crear nuevo workflow |
| `n8n_get_workflow` | Obtener workflow existente |
| `n8n_update_full_workflow` | Actualizar workflow completo |
| `n8n_update_partial_workflow` | Actualizar partes específicas |
| `n8n_delete_workflow` | Eliminar workflow |
| `n8n_list_workflows` | Listar todos los workflows |
| `n8n_validate_workflow` | Validar workflow en instancia |
| `n8n_autofix_workflow` | Auto-corregir errores comunes |
| `n8n_workflow_versions` | Ver historial de versiones |
| `n8n_deploy_template` | Desplegar desde template |

**Gestión de Ejecuciones:**
| Tool | Descripción |
|------|-------------|
| `n8n_test_workflow` | Ejecutar workflow (auto-detecta tipo de trigger) |
| `n8n_executions` | Listar/obtener/eliminar ejecuciones |
| `n8n_health_check` | Verificar estado de la instancia |

### Convex MCP Server
- **Propósito:** Interactuar con la base de datos Convex (queries, mutations, schema).
- **Uso:** Para poblar datos de inventario, probar queries, y validar el schema.
- **Operaciones típicas:** Ejecutar queries/mutations, inspeccionar tablas, seed de datos.

### n8n Skills (7 skills complementarios)

Skills que se activan automáticamente según el contexto de la consulta:

| Skill | Propósito | Cuándo se activa |
|-------|-----------|------------------|
| **n8n-expression-syntax** | Sintaxis correcta de expresiones `{{}}`, variables `$json`, `$node`, `$now`, `$env` | Escribir expresiones en nodos |
| **n8n-mcp-tools-expert** | Guía de uso efectivo de herramientas MCP, formato nodeType, perfiles de validación | Usar tools de n8n-mcp |
| **n8n-workflow-patterns** | 5 patrones arquitectónicos: webhook, HTTP API, database, AI, scheduled | Diseñar nuevos workflows |
| **n8n-validation-expert** | Interpretar errores de validación, troubleshooting, falsos positivos | Debuggear workflows |
| **n8n-node-configuration** | Configuración dependiente de operación, tipos de conexión AI | Configurar nodos complejos |
| **n8n-code-javascript** | JavaScript en Code nodes, patrones de acceso a datos, funciones built-in | Escribir código JS en n8n |
| **n8n-code-python** | Python en Code nodes (usar JS en 95% de casos, sin librerías externas) | Escribir código Python en n8n |

**Nota importante:** Los datos de Webhook están bajo `$json.body` (error común).

## Descripción general de la arquitectura

**OOH Agent** es un asistente comercial automatizado para la gestión de propuestas de publicidad en vía pública.

- **Orquestación (Backend Lógico):** n8n (Workflows para chat, lógica de negocio, conexiones API).
- **Base de Datos:** Convex (Persistencia de inventario, reglas de negocio y logging).
- **Inteligencia:** OpenAI/Anthropic (NLU y razonamiento) + Replicate/DALL-E (Manipulación de imágenes).
- **Generación de Documentos:** HTML-to-PDF (vía Gotenberg o API externa) orquestado por n8n.
- **Interfaz (Fase 1):** Chat nativo de n8n.
- **Interfaz (Fase 2 - Futura):** Next.js App Router + BetterAuth.

## Guía de estilo

**Tech Stack (Fase 1):**
- **Database/Backend:** Convex (TypeScript).
- **Logic/Scripting:** TypeScript (dentro de funciones Convex y nodos 'Code' de n8n).
- **Workflow Engine:** n8n (JSON definition).
- **Infraestructura:** Docker Compose (para n8n local) o n8n Cloud + Convex Cloud.

**Estilo Visual (Entregables PDF):**
- **Diseño:** Corporativo, limpio y estructurado.
- **Paleta:** Colores sobrios (Azul marino, Gris, Blanco).
- **Tipografía:** Sans-serif moderna y legible (ej. Roboto, Open Sans).
- **Layout:** Tablas claras para precios, imágenes grandes para los mockups.

**Principios UX (Chat):**
- **Interacción:** El agente debe guiar al usuario si faltan datos (ej: "¿Para qué fecha necesitas la campaña?").
- **Feedback:** Informar siempre estados de espera largos ("Generando visualización con el logo, dame unos segundos...").
- **Claridad:** Los montos deben diferenciar siempre Neto vs Bruto (+IVA).

**Tono del Agente:**
- **Rol:** Ejecutivo comercial senior y eficiente.
- **Lenguaje:** Profesional pero directo.
- **Formato:** Respuestas estructuradas (uso de Markdown para listas y negritas).

## Limitaciones y políticas

**Seguridad: DEBES seguir:**
- **Secretos:** NUNCA exponer API Keys (OpenAI, Replicate, Convex) en el código o nodos. Usar siempre Credenciales de n8n (`$env`) o Variables de Entorno de Convex.
- **Datos:** No hardcodear datos de clientes sensibles en el código.

**Calidad del código (Convex & TypeScript):**
- **Tipado:** Usar `schema.ts` estricto en Convex. Evitar `any`.
- **Validación:** Usar `v` de Convex para validar argumentos en queries y mutations.
- **Claridad:** Nombres de funciones descriptivos (`calculateProposalTotal`, `checkAvailability`).

**Manejo de Workflows (n8n):**
- Nombrar los nodos claramente (ej: en vez de "Code1", usar "Calcular Comision").
- Manejar errores en nodos críticos (ej: si falla la API de imagen, devolver una imagen genérica y avisar).

## Desarrollo de Workflows (n8n)

### Principios de diseño
1. **Modularidad:** Dividir lógica compleja en sub-workflows reutilizables.
2. **Nomenclatura clara:** Cada nodo debe tener un nombre descriptivo de su función.
3. **Error handling:** Configurar ramas de error en nodos críticos (APIs externas, DB).
4. **Documentación inline:** Usar notas/sticky notes para explicar lógica compleja.

### Workflows del proyecto (según arquitectura)
| Workflow | Responsabilidad | Prioridad |
|----------|-----------------|-----------|
| **Master Chat** | Conversación principal, historial, ruteo de intención | Alta |
| **Inventory Search** | Consultas filtradas a Convex | Alta |
| **Pricing Engine** | Cálculos de precios (neto, bruto, comisiones) | Alta |
| **Image Composer** | Llamadas a Replicate para mockups | Media |
| **PDF Generator** | HTML-to-PDF con Gotenberg | Media |
| **Email Notifier** | Notificaciones a terceros | Baja |

### Patrones arquitectónicos (de n8n-skills)

Los 5 patrones probados para workflows production-ready:

| Patrón | Estructura | Uso en OOH Agent |
|--------|------------|------------------|
| **Webhook Processing** | Webhook → Validate → Process → Respond | Master Chat, API endpoints |
| **HTTP API** | Trigger → HTTP Request → Transform → Output | Conexión con Convex, APIs externas |
| **Database** | Trigger → Query/Mutation → Transform → Continue | Inventory Search, Pricing Engine |
| **AI Workflow** | Input → AI Agent → Tool Calls → Response | Chat con LLM, análisis de intención |
| **Scheduled** | Schedule Trigger → Fetch → Process → Notify | Reportes, limpieza de datos |

### Patrones recomendados
- **Trigger → Validate → Process → Respond:** Estructura estándar para requests.
- **IF/Switch temprano:** Validar inputs al inicio para fallar rápido.
- **Merge al final:** Consolidar ramas antes de responder.
- **Set/Code nodes:** Preferir Set para transformaciones simples, Code para lógica compleja.

### Uso de Code Nodes

**JavaScript (preferido en 95% de casos):**
```javascript
// Acceso a datos del nodo anterior
const inputData = $json;
const specificField = $json.body.fieldName;

// Variables de entorno
const apiKey = $env.MY_API_KEY;

// Datos de otros nodos
const previousData = $node["Nombre del Nodo"].json;

// Return format (IMPORTANTE: siempre array de objetos)
return [{ json: { result: "value" } }];
```

**Funciones built-in útiles:**
- `$helpers.httpRequest()` - Llamadas HTTP dentro de Code node
- `DateTime` - Manejo de fechas (luxon)
- `$now` - Timestamp actual
- `$today` - Fecha actual

**Python (solo cuando sea necesario):**
- Sin acceso a librerías externas (requests, pandas no disponibles)
- Usar solo para lógica que requiera específicamente Python

### Expresiones n8n - Errores comunes

```javascript
// ✅ CORRECTO - Datos de webhook
{{ $json.body.customerName }}

// ❌ INCORRECTO - Error común
{{ $json.customerName }}  // Los datos están en body!

// ✅ Referencia a otro nodo
{{ $node["Fetch Inventory"].json.items }}

// ✅ Variables de entorno
{{ $env.CONVEX_URL }}
```

### Validación de Workflows

Usar perfiles de validación según la etapa:

| Perfil | Cuándo usar | Qué valida |
|--------|-------------|------------|
| `minimal` | Desarrollo inicial | Estructura básica |
| `runtime` | Pre-testing | Configuración de ejecución |
| `ai-friendly` | Workflows con AI Agent | Conexiones AI, tool calls |
| `strict` | Pre-producción | Todo, incluyendo edge cases |

### Conexión con Convex
- Usar HTTP Request nodes apuntando a las funciones de Convex.
- Almacenar el Convex Deployment URL y API Key en credenciales de n8n.
- Formato de llamadas: `POST https://<deployment>.convex.cloud/api/query` o `/api/mutation`.

### Seguridad en Workflows

⚠️ **Protección de workflows en producción:**
- SIEMPRE crear copias antes de modificaciones con AI
- Testear en ambiente de desarrollo primero
- Exportar backups de workflows importantes antes de cambios
- Usar `n8n_workflow_versions` para revisar historial si algo falla

## Etiquetado de repositorios

**Branching:**
- `main`: Código de producción estable.
- `develop`: Rama de integración para el prototipo.
- `feature/nombre-feature`: Para nueva lógica (ej: `feature/logic-terceros`, `feature/pdf-generation`).

**Git workflow:**
1. Crear branch desde `main` o `develop`.
2. Desarrollar las funciones en Convex (`/convex`).
3. Exportar/Guardar el workflow de n8n (JSON) en la carpeta `/workflows` (si aplica control de versiones manual).
4. Testear localmente `npx convex dev`.
5. PR a `main` con descripción de cambios.
6. Usar el slash command `/update-docs-and-commit` para mantener documentación al día.

## Comandos

### Backend (Convex)
Desde la raíz del proyecto:
```bash
npm install            # Instalar dependencias
npx convex dev         # Iniciar servidor de desarrollo y sync de funciones
npx convex deploy      # Desplegar a producción

# Utils
npm run lint           # Verificar estilo de código TS
npm run typecheck      # Verificar tipos TS
```

### Workflows (n8n) - Vía MCP
Claude puede ejecutar estas operaciones directamente usando el n8n MCP Server:
- **Listar workflows:** Ver todos los workflows existentes en la instancia.
- **Crear workflow:** Generar un nuevo workflow con nodos y conexiones.
- **Activar/Desactivar:** Cambiar el estado de un workflow.
- **Ejecutar workflow:** Disparar un workflow manualmente para testing.
- **Exportar JSON:** Obtener la definición del workflow para versionado.

### Slash commands de Claude
```bash
/update-docs-and-commit      # Actualiza la documentación (changelog, status) y crea un commit con los cambios.
```

## Flujo de trabajo para Claude

Cuando el usuario solicite crear o modificar workflows:

1. **Entender el requerimiento:** Clarificar qué workflow se necesita y su rol en la arquitectura.
2. **Revisar contexto:** Consultar `docs/architecture.md` y `project_spec.md` para alinearse con el diseño.
3. **Buscar templates:** Usar `search_templates` para encontrar ejemplos similares antes de crear desde cero.
4. **Usar MCP tools:** Utilizar el n8n MCP Server para crear/modificar workflows directamente.
5. **Validar:** Usar `validate_workflow` con perfil apropiado, luego `n8n_test_workflow` para verificar.
6. **Documentar:** Actualizar `docs/project_status.md` con el progreso.

### Secuencia recomendada de herramientas n8n MCP

```
1. search_nodes        → Encontrar nodos necesarios
2. get_node            → Obtener configuración detallada
3. search_templates    → Buscar ejemplos similares
4. n8n_create_workflow → Crear el workflow
5. validate_workflow   → Validar configuración
6. n8n_autofix_workflow → Corregir errores automáticamente (si hay)
7. n8n_test_workflow   → Probar ejecución
8. n8n_executions      → Revisar resultado
```

### Formato de nodeType

**Importante:** El formato varía según el tipo de nodo:
- Core nodes: `n8n-nodes-base.httpRequest`
- Algunos nodos: `nodes-base.set`
- Community: `n8n-nodes-<package>.<nodeName>`

Usar `search_nodes` para obtener el formato correcto.

### Prioridad de herramientas
1. **n8n MCP Server:** Para operaciones de workflows (crear, editar, ejecutar).
2. **Convex MCP Server:** Para operaciones de datos (queries, mutations, seed).
3. **Bash:** Para operaciones de Convex CLI (`npx convex dev`, `npx convex deploy`).
4. **Edit/Write:** Para archivos de código TypeScript en `/convex`.

## Documentación

- [Project Spec](project_spec.md) - Requerimientos, API specs, detalles de tecnología.
- [Architecture](docs/architecture.md) - Diseño de sistema y data flow.
- [Changelog](docs/changelog.md) - Historial de versiones.
- [Project Status](docs/project_status.md) - Progreso actual.
- Actualiza los archivos en docs después de cada milestone y adiciones mayores en el proyecto.
- Usa el slash command /update-docs-and-commit cuando vayas a hacer commits en git.
