# Guía de Testing Manual - OOH Agent

## Información de Acceso

**URL del Chat**: https://carbono14.app.n8n.cloud/webhook/ooh-agent-chat/chat

**n8n Dashboard**: https://carbono14.app.n8n.cloud

---

## Flujo de Testing Completo

### Paso 1: Búsqueda de Inventario

**Objetivo**: Verificar que el agente puede buscar y filtrar soportes publicitarios.

#### Test 1.1 - Búsqueda por zona
```
Consulta: "¿Qué soportes tienen disponibles en CABA?"
```

**Resultado esperado**:
- Lista de 4-5 soportes en CABA
- Incluye: GFG050, GFG051, GFG052, GFG053, GFG054
- Muestra código, tipo, dirección, propietario, precios
- Identifica terceros (UrbanMedia, OutdoorPlus)

#### Test 1.2 - Búsqueda por tipo
```
Consulta: "Busco espectaculares disponibles"
```

**Resultado esperado**:
- Lista de espectaculares (GFG002, GFG011, GFG051, GFG054)
- Filtrado correcto por tipo

#### Test 1.3 - Búsqueda combinada
```
Consulta: "Muéstrame medianeras en GBA Norte"
```

**Resultado esperado**:
- Soporte GFG001 (Vicente López)
- Filtrado por zona Y tipo

---

### Paso 2: Cotización de Precios

**Objetivo**: Verificar el cálculo correcto de precios con todos los componentes.

#### Test 2.1 - Cotización simple (soporte propio)
```
Consulta: "Dame una cotización para 30 días del soporte GFG050 para el cliente Coca-Cola"
```

**Resultado esperado**:
- Desglose de costos:
  - Alquiler: $1,500,000
  - Producción: $280,000
  - Instalación: $140,000
  - Tasa Municipal: $85,000
- Comisión Agencia (20%): $401,000
- Total NETO: $2,406,000
- IVA (21%): $505,260
- Total BRUTO: $2,911,260

#### Test 2.2 - Cotización de tercero
```
Consulta: "Cotiza el soporte GFG052 en Palermo por 30 días para Nike"
```

**Resultado esperado**:
- Incluye Comisión Intermediario (10%) adicional
- Menciona que es de UrbanMedia (tercero)
- Indica "precio sujeto a confirmación"

#### Test 2.3 - Cotización proporcional (15 días)
```
Consulta: "¿Cuánto cuesta una campaña de 15 días del soporte GFG050?"
```

**Resultado esperado**:
- Alquiler proporcional (15/30 del mensual)
- Producción e instalación completos (son únicos)
- Tasa municipal proporcional

---

### Paso 3: Gestión de Terceros

**Objetivo**: Verificar la identificación y manejo de soportes de terceros.

#### Test 3.1 - Identificación de terceros
```
Consulta: "¿Qué soportes hay disponibles en GBA Sur?"
```

**Resultado esperado**:
- GFG010 (Global - propio)
- GFG011 (MediaMax - tercero)
- Identificación clara de propietarios

#### Test 3.2 - Solicitud de contacto a terceros
```
Consulta: "Necesito consultar disponibilidad del soporte GFG011 para el cliente Adidas, del 2026-02-01 al 2026-03-01"
```

**Resultado esperado**:
- Prepara email de consulta
- Muestra partner: MediaMax
- Indica que se contactará al proveedor

---

### Paso 4: Generación de PDF

**Objetivo**: Verificar la generación de propuestas en PDF.

#### Test 4.1 - Generar PDF completo
```
Consulta: "Genera un PDF de propuesta para Pepsi Argentina con el soporte GFG050. Total NETO: 2406000, Total BRUTO: 2911260. Campaña del 2026-02-01 al 2026-03-02."
```

**Resultado esperado**:
- Confirmación de PDF generado
- Incluye datos del cliente
- Formato corporativo Global Publicidad

---

### Paso 5: Conversación Continua

**Objetivo**: Verificar que el agente mantiene contexto entre mensajes.

#### Test 5.1 - Flujo conversacional
```
Mensaje 1: "Busca soportes en CABA"
Mensaje 2: "Dame cotización del GFG050 por 30 días"
Mensaje 3: "Genera el PDF para Coca-Cola"
```

**Resultado esperado**:
- Cada mensaje usa información de los anteriores
- No requiere repetir datos ya mencionados

---

## Verificación de Workflows en n8n

### Acceder al Dashboard
1. Ir a https://carbono14.app.n8n.cloud
2. Verificar que los siguientes workflows estén **activos** (verde):

| Workflow | ID | Estado Esperado |
|----------|-----|-----------------|
| OOH Agent - Master Chat | `cg5rOPNa2HHSmBwQ` | Activo |
| OOH Agent - Inventory Search | `3BPRHEfXWLSYF8aH` | Activo |
| OOH Agent - Pricing Engine | `OXpqBrKT4nrOpQrE` | Activo |
| OOH Agent - Third Party Handler | `FVBUo5gma5SdMjGN` | Activo |
| OOH Agent - PDF Generator | `gPFkNF3tV61AWB70` | Activo |
| OOH Agent - Image Composer | `SDjs73CyTsOoPzKr` | Activo |

### Ver Ejecuciones
1. Click en cualquier workflow
2. Ver pestaña "Executions"
3. Verificar que las ejecuciones muestren estado "Success"

---

## Datos de Inventario para Referencia

### Soportes Propios (Global)
| Código | Tipo | Zona | Ubicación |
|--------|------|------|-----------|
| GFG001 | Medianera | GBA Norte | Av. Maipú 2500, Vicente López |
| GFG002 | Espectacular | GBA Norte | Panamericana Km 28, Pilar |
| GFG003 | Columna | GBA Norte | Av. Del Libertador 15000, San Isidro |
| GFG010 | Medianera | GBA Sur | Av. Hipólito Yrigoyen 8500, Lomas |
| GFG020 | Medianera | GBA Oeste | Av. Rivadavia 22000, Morón |
| GFG050 | Medianera | CABA | Av. Corrientes 3200, Abasto |
| GFG051 | Espectacular | CABA | Av. 9 de Julio 1200, Microcentro |
| GFG053 | Medianera | CABA | Av. Cabildo 1800, Belgrano |

### Soportes de Terceros
| Código | Tipo | Zona | Propietario |
|--------|------|------|-------------|
| GFG011 | Espectacular | GBA Sur | MediaMax |
| GFG021 | Columna | GBA Oeste | VíaPublica SA |
| GFG052 | Columna | CABA | UrbanMedia |
| GFG054 | Espectacular | CABA | OutdoorPlus |

---

## Checklist de Verificación

### Funcionalidades Core
- [ ] Búsqueda de inventario por zona funciona
- [ ] Búsqueda de inventario por tipo funciona
- [ ] Cotización calcula correctamente costos
- [ ] Cotización incluye comisión de agencia (20%)
- [ ] Terceros incluyen comisión intermediario (10%)
- [ ] Se muestra NETO y BRUTO (con IVA 21%)
- [ ] PDF se genera correctamente

### Credenciales
- [ ] OpenAI configurado (Master Chat funciona)
- [ ] Replicate configurado (Image Composer)
- [ ] SMTP configurado (Third Party Handler)

### Calidad de Respuesta
- [ ] Respuestas en español
- [ ] Formato estructurado con bullets/negritas
- [ ] Identifica claramente terceros vs propios
- [ ] Precios claros y desglosados

---

## Solución de Problemas Comunes

### "No se encontraron soportes"
- Verificar ortografía de la zona
- Probar con zonas exactas: "CABA", "GBA Norte", "GBA Sur", "GBA Oeste"

### "Error en cotización"
- Asegurar que se especifiquen días de campaña
- Verificar que el código de soporte sea correcto

### "PDF no se genera"
- Incluir todos los datos: cliente, items, precios, fechas
- Verificar que Gotenberg responda (usar demo.gotenberg.dev)

### Workflow no responde
- Verificar que el workflow esté activo en n8n
- Revisar ejecuciones para ver errores
- Verificar credenciales asignadas

---

## Contacto de Soporte

Para problemas técnicos durante el testing:
- Revisar logs en n8n Dashboard
- Verificar estado de Convex: `npx convex dashboard`

---

**Versión**: 1.0
**Última actualización**: Enero 2026
