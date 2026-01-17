# CLAUDE.md

## Metas del proyecto
**Milestone actual:** Fase 1 - Prototipo Funcional.
**Objetivo principal:** Validar la lógica de negocio, precios y generación de entregables (PDF/Imágenes) usando n8n y Convex, sin desarrollo de Frontend UI todavía.

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

# Slash commands de Claude
/update-docs-and-commit      # Actualiza la documentación (changelog, status) y crea un commit con los cambios.
```

## Documentación

- [Project Spec](project_spec.md) - Requerimientos, API specs, detalles de tecnología.
- [Architecture](docs/architecture.md) - Diseño de sistema y data flow.
- [Changelog](docs/changelog.md) - Historial de versiones.
- [Project Status](docs/project_status.md) - Progreso actual.
- Actualiza los archivos en docs depués de cada milestone y adiciones mayores en el proyecto.
- Usa el slash commando /update-docs-and-commit cuando vayas a hacer commits en git.
