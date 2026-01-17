# OOH Agent — Especificación del Proyecto

## Resumen Ejecutivo
Agente comercial asistido por IA para Publicidad Exterior (OOH).
* **Objetivo:** Automatizar el proceso de propuestas comercial de punta a punta: desde entender la intención del cliente en lenguaje natural hasta la generación de un PDF final con precios calculados y visualizaciones de marca.
* **Fase 1 (Prototipo Funcional):** Un workflow backend totalmente operativo en n8n, utilizando el chat nativo para interactuar, conectado directamente a una base de datos **Convex** de producción.
* **Fase 2 (MVP):** Desarrollo de una Web App (Next.js) que añade interfaz de usuario, autenticación y gestión de historial sobre la infraestructura validada en la Fase 1.

---

## Fase 1: El Prototipo Funcional (Arquitectura)
**Meta:** Validar la lógica de negocio compleja (precios, disponibilidad, terceros) y la generación de entregables interactuando con una DB real desde el principio, sin invertir tiempo en Frontend UI todavía.

### 1. Interfaz de Usuario
* **Interfaz:** Chat Nativo de n8n.

### 2. Base de Datos: Convex (Dev Mode)
Implementaremos el esquema definitivo en Convex desde el inicio para garantizar tipado estricto y facilitar la migración futura.
* **Tabla `inventory`:** Contendrá el catálogo de soportes.
    * `code` (String): ID único visible (ej: "GFG072").
    * `type` (String): Tipo de soporte (Medianera, Columna, Espectacular).
    * `owner` (String): "Global" o nombre de la empresa tercera.
    * `location` (Object):
        * `address`, `city`, `zone` (Clave para filtrado, ej: "GBA Norte"), `coordinates` (lat, long).
    * `pricing` (Object):
        * `rental_monthly` (Number, Neto).
        * `production_cost` (Number, pago único).
        * `installation_cost` (Number, pago único).
        * `municipal_tax` (Number, mensual variable).
        * `currency` (String: "ARS" por defecto).
    * `specs` (Object):
        * `visible_dimensions` (String), `resolution` (String), `lighting` (Boolean).
    * `availability` (Object):
        * `blocked_dates` (Array of Strings ISO: `['2026-03-01']`).
        * `status` (String: "available", "reserved", "maintenance").
    * `media` (Object):
        * `base_image_url` (URL de la foto vacía de alta calidad para el montaje).
    * `metrics` (Object): `daily_ots` (Number).

* **Tabla `partners`:** Datos de contacto para dueños de soportes de terceros (Nombre, Email, Teléfono).

### 3. Capacidades Centrales (Prototipo)

#### A. Lógica y Precios (n8n + Convex Actions)
* **Consultas Inteligentes (NLU):** El agente convertirá lenguaje natural ("Carteles en zona norte para marzo") en filtros de base de datos (`q.eq("location.zone", "GBA Norte")`).
* **Lógica de Precios:** Cálculo matemático en tiempo real dentro de n8n:
    * `Proporcional Alquiler` = (Alquiler Mensual / 30) * Días de Campaña.
    * `Costo Neto` = Proporcional Alquiler + Tasas + (Producción + Instalación).
    * `Precio Final` = Costo Neto + (Costo Neto * %Comisión Agencia) + (Costo Neto * %Comisión Intermediario).
* **Manejo de Terceros (Feature Clave):**
    * Si la query a Convex retorna un item donde `owner != 'Global'`:
        1.  El workflow bifurca el proceso.
        2.  Dispara sub-workflow de Email automatizado al contacto en tabla `partners`.
        3.  Actualiza estado en DB a `pending_third_party`.
        4.  Informa al usuario: "Se enviaron correos de consulta a los dueños de los sitios X e Y."

#### B. Procesamiento de Imágenes con IA
* **Input:** El usuario sube el logo del cliente (URL o archivo) al chat.
* **Proceso:**
    1.  n8n recupera `base_image_url` del soporte elegido en Convex.
    2.  Envía imagen base + logo a API de Generación (Replicate/Stable Diffusion o DALL-E Edit).
    3.  Realiza "Inpainting" o composición para simular el cartel en vía pública.
* **Output:** URL temporal de la imagen generada para incrustar en el PDF.

#### C. Generación de PDF
* **Motor:** HTML-to-PDF (Gotenberg o APITemplate) orquestado por n8n.
* **Contenido:**
    * Portada con Cliente y Fechas.
    * Tabla detallada de costos (desglosando Tasas e Impuestos).
    * Renders visuales (imágenes generadas por IA).
    * Mapa y Specs técnicas.

---

## Fase 2: El MVP (Producto Web)
**Meta:** Agregar la capa de interfaz de usuario sobre la infraestructura ya construida.
* **Frontend:** Next.js (App Router) se conecta al mismo backend de Convex.
* **Auth:** BetterAuth para gestión de usuarios.
* **Persistencia:** Guardado de historial de chat y propuestas en tabla `proposals`.

---

## Lógica Técnica del Workflow (Flujo de Datos)

1.  **Parseo de Input:** LLM extrae variables clave (Zona, Fechas, Cliente, Presupuesto).
2.  **Query a Convex:**
    * Ejecutar query filtrada: `db.query("inventory").filter(...)`.
3.  **Iteración y Lógica:**
    * Recorrer resultados.
    * **IF** Tercero -> Enviar Email -> Marcar Pendiente.
    * **IF** Propio -> Calcular Precio -> Agregar a lista de propuesta.
4.  **Generación de Assets:**
    * Llamar API de IA para generar mockups de los 3 mejores sitios.
    * Generar HTML con los datos calculados.
    * Convertir HTML a PDF.
5.  **Respuesta:**
    * Devolver resumen en Markdown al chat.
    * Devolver enlace de descarga del PDF.

---

## Notas de Implementación

1.  **Seguridad:** NUNCA exponer API Keys en el código. Usar variables de entorno en n8n y Convex.
2.  **Latencia:** La generación de imágenes toma tiempo. El agente debe enviar mensajes de estado intermedios ("Generando propuesta visual...") para manejar la expectativa del usuario.
3.  **Moneda:** Todos los cálculos numéricos se realizan en la moneda base del item (ARS).
4.  **Inicialización:** Antes de correr el workflow, la base de datos debe ser poblada ejecutando el script `convex/seed_inventory.ts`.
