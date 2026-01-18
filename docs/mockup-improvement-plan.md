# Plan de Mejora de Mockups - MVP

## Estado Actual (Prototipo v1.6.0)

### Cómo funciona ahora

El workflow **Image Composer** (`SDjs73CyTsOoPzKr`) usa DALL-E 3 para **generar imágenes nuevas** de carteles publicitarios con el branding del cliente.

**Prompt actual:**
```javascript
const prompt = `A large outdoor ${supportType} advertisement in an urban city setting,
featuring prominent ${clientName} branding and logo. The billboard shows a professional
marketing campaign for ${clientName} with bold colors and eye-catching design.
Photorealistic street photography style, daytime, clear visibility of the advertisement.
The ${clientName} brand name is clearly visible and readable on the billboard.`;
```

**Limitaciones del prototipo:**
- DALL-E 3 **no puede editar imágenes existentes**, solo genera nuevas
- Los mockups generados son carteles genéricos, no la foto real del soporte
- La imagen base (`image-example.png` - cartel de Harry Potter) no se usa

**Flujo actual:**
```
GenerarImagen (DALL-E 3) → Imagen NUEVA genérica
                        → GuardarPropuestaConMockups
                        → GenerarPDF
```

---

## Plan para MVP: Edición de Imagen Real

### Objetivo
Tomar la **foto real del soporte** (ej: cartel de Harry Potter en esquina de Buenos Aires) y **reemplazar únicamente el contenido del cartel** con el logo/nombre del cliente, manteniendo:
- La misma ubicación/calle
- La misma perspectiva
- La misma iluminación
- El mismo edificio/entorno

### Soluciones Técnicas

#### Opción 1: Replicate con SDXL Inpainting (Recomendada)
- **Servicio:** Replicate API
- **Modelo:** `stability-ai/sdxl-inpainting` o similar
- **Costo:** ~$0.003 por imagen
- **Cómo funciona:**
  1. Subir imagen base del soporte
  2. Crear máscara del área del cartel (rectángulo donde está Harry Potter)
  3. Enviar prompt: "Billboard advertisement for {clientName} with logo"
  4. El modelo reemplaza SOLO el área de la máscara

**Implementación n8n:**
```javascript
// Nodo HTTP Request a Replicate
{
  "version": "stability-ai/sdxl:...",
  "input": {
    "image": "https://raw.githubusercontent.com/.../image-example.png",
    "mask": "https://raw.githubusercontent.com/.../billboard-mask.png",
    "prompt": "Professional ${clientName} advertisement billboard",
    "negative_prompt": "text errors, blurry, low quality"
  }
}
```

#### Opción 2: OpenAI DALL-E 2 Edit
- **Servicio:** OpenAI API (mismas credenciales actuales)
- **Modelo:** DALL-E 2 (no DALL-E 3, que no tiene edit)
- **Costo:** ~$0.02 por imagen
- **Limitación:** Calidad inferior a DALL-E 3

**Implementación n8n:**
```javascript
// Cambiar nodo OpenAI a:
{
  "resource": "image",
  "operation": "edit",  // En lugar de "generate"
  "model": "dall-e-2",
  "image": "{base_image}",
  "mask": "{mask_image}",
  "prompt": "Billboard with ${clientName} advertising"
}
```

#### Opción 3: Stability AI
- **Servicio:** Stability AI API
- **Modelo:** Stable Diffusion Inpainting
- **Costo:** Tier gratuito disponible

#### Opción 4: Hugging Face Inference API (Gratis)
- **Servicio:** Hugging Face
- **Modelo:** `runwayml/stable-diffusion-inpainting`
- **Costo:** Gratis (tier limitado)

---

## Implementación Paso a Paso (MVP)

### Paso 1: Crear máscaras de los soportes

Para cada soporte en el inventario, crear una imagen de máscara PNG donde:
- **Blanco (255,255,255)** = Área del cartel a reemplazar
- **Negro (0,0,0)** = Área a mantener intacta

```
inventory/
├── GFG050/
│   ├── base-image.png      # Foto real del soporte
│   └── billboard-mask.png  # Máscara del área del cartel
├── GFG051/
│   ├── base-image.png
│   └── billboard-mask.png
...
```

### Paso 2: Actualizar schema de Convex

```typescript
// convex/schema.ts - agregar campo de máscara
media: v.object({
  base_image_url: v.string(),
  mask_image_url: v.optional(v.string()),  // NUEVO
}),
```

### Paso 3: Actualizar Image Composer workflow

```javascript
// Nuevo código del nodo de preparación
const input = $input.item.json;
const baseImageUrl = input.baseImageUrl;
const maskImageUrl = input.maskImageUrl;  // NUEVO
const clientName = input.clientName;

// Llamar a API de inpainting en lugar de generation
return {
  json: {
    baseImageUrl,
    maskImageUrl,
    prompt: `Professional advertisement billboard for ${clientName}`,
    negative_prompt: "blurry, text errors, low quality"
  }
};
```

### Paso 4: Crear nodo de Inpainting

Reemplazar el nodo DALL-E 3 con HTTP Request a Replicate:

```javascript
// HTTP Request node configuration
{
  "method": "POST",
  "url": "https://api.replicate.com/v1/predictions",
  "headers": {
    "Authorization": "Bearer ${REPLICATE_API_KEY}"
  },
  "body": {
    "version": "stability-ai/sdxl:...",
    "input": {
      "image": "{{ $json.baseImageUrl }}",
      "mask": "{{ $json.maskImageUrl }}",
      "prompt": "{{ $json.prompt }}",
      "num_outputs": 1
    }
  }
}
```

---

## Comparación de Costos

| Método | Costo por imagen | Calidad | Setup |
|--------|------------------|---------|-------|
| DALL-E 3 (actual) | ~$0.04 | Alta (pero genera nueva) | Ya configurado |
| DALL-E 2 Edit | ~$0.02 | Media | Cambiar nodo |
| Replicate SDXL | ~$0.003 | Alta | Crear cuenta + API key |
| Hugging Face | Gratis | Media-Alta | Crear cuenta |
| Stability AI | ~$0.002 | Alta | Crear cuenta + API key |

---

## Checklist de Migración

- [ ] Crear máscaras PNG para cada soporte del inventario
- [ ] Subir máscaras a GitHub o storage
- [ ] Actualizar schema de Convex con `mask_image_url`
- [ ] Actualizar seed.ts con URLs de máscaras
- [ ] Configurar credenciales de Replicate/Stability en n8n
- [ ] Actualizar workflow Image Composer con inpainting
- [ ] Testear con un soporte
- [ ] Migrar todos los soportes

---

## Timeline Estimado

| Fase | Tarea | Tiempo |
|------|-------|--------|
| 1 | Crear máscaras (12 soportes) | 2-3 horas |
| 2 | Configurar API de inpainting | 1 hora |
| 3 | Actualizar workflow n8n | 2 horas |
| 4 | Testing y ajustes | 2 horas |
| **Total** | | **7-8 horas** |

---

## Referencias

- [Replicate SDXL Inpainting](https://replicate.com/stability-ai/sdxl)
- [OpenAI Image Edit API](https://platform.openai.com/docs/guides/images/edits)
- [Hugging Face Inpainting](https://huggingface.co/runwayml/stable-diffusion-inpainting)
- [Stability AI API](https://platform.stability.ai/)
