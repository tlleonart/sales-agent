# OOH Agent - Manual de Usuario

## Descripción General

OOH Agent es un asistente comercial impulsado por IA para la gestión de propuestas de publicidad exterior (Out-of-Home). Ayuda a los ejecutivos de ventas a buscar inventario, calcular cotizaciones, gestionar proveedores externos y generar propuestas profesionales.

## Primeros Pasos

### Acceder a la Interfaz de Chat

Abre tu navegador y navega a:
```
https://carbono14.app.n8n.cloud/webhook/ooh-agent-chat/chat
```

La interfaz de chat se cargará con un mensaje de bienvenida explicando las capacidades disponibles.

## Funcionalidades

### 1. Buscar Inventario

Pide al agente que encuentre espacios publicitarios disponibles por zona, tipo u otros criterios.

**Ejemplos de consultas:**
- "¿Qué soportes tienen disponibles en CABA?"
- "Muéstrame medianeras en zona norte"
- "Busca espectaculares en GBA Sur"

**Zonas disponibles:**
- **GBA Norte**: Vicente López, San Isidro, Pilar
- **GBA Sur**: Lomas de Zamora, Quilmes
- **GBA Oeste**: Morón, Ituzaingó
- **CABA**: Abasto, Microcentro, Palermo, Belgrano, Constitución

**Tipos disponibles:**
- **Medianera**: Pinturas o lonas en paredes de edificios
- **Columna**: Estructuras verticales en vía pública
- **Espectacular**: Carteles grandes en autopistas y avenidas principales

### 2. Obtener Cotizaciones

Una vez identificados los espacios publicitarios, solicita precios indicando la duración de la campaña.

**Ejemplos de consultas:**
- "Dame una cotización para 30 días del soporte GFG050 en Abasto"
- "¿Cuánto cuesta una campaña de 15 días en Palermo?"
- "Calcula el precio de GFG001 y GFG002 por 60 días"

**Estructura de precios:**
- **Alquiler Mensual**: Proporcional a los días de campaña
- **Producción**: Costo único de impresión/fabricación
- **Instalación**: Costo único de montaje
- **Tasa Municipal**: Proporcional a los días de campaña
- **Comisión Agencia**: 20% sobre subtotal
- **Comisión Intermediario**: 10% adicional para espacios de terceros
- **IVA**: 21% sobre el total neto

El agente siempre muestra montos **NETO** (sin IVA) y **BRUTO** (con IVA).

### 3. Gestión de Terceros

Algunos espacios publicitarios pertenecen a empresas asociadas (terceros). El agente los identifica automáticamente y puede preparar emails de consulta.

**Indicadores de terceros:**
- MediaMax
- VíaPublica SA
- UrbanMedia
- OutdoorPlus

Cuando hay espacios de terceros involucrados, los precios están **sujetos a confirmación** del proveedor.

### 4. Generar Propuestas PDF

Solicita un documento PDF formal con todos los detalles de la cotización.

**Ejemplos de consultas:**
- "Genera una propuesta en PDF para el cliente Coca-Cola"
- "Crea un documento formal de cotización para esta campaña"

### 5. Mockups de Imagen

Solicita visualizaciones mostrando cómo se vería la publicidad en espacios específicos.

**Ejemplos de consultas:**
- "Muéstrame cómo quedaría mi logo en el soporte GFG050"
- "Genera una visualización para este cartel"

## Entendiendo las Respuestas

### Resultados de Inventario

El agente proporciona información estructurada para cada espacio:
- **Código**: Identificador único (ej: GFG050)
- **Tipo**: Medianera, Columna o Espectacular
- **Dirección**: Ubicación física
- **Zona**: Área geográfica
- **Propietario**: Global (propio) o nombre del tercero
- **Dimensiones**: Tamaño visible
- **Iluminación**: Sí/No
- **Estado**: Disponible/Reservado

### Cotizaciones de Precio

Las cotizaciones incluyen desgloses detallados:
- Componentes de costo individuales
- Subtotales por categoría
- Cálculo de comisión de agencia
- Cálculo de IVA
- Totales finales NETO y BRUTO

## Consejos para Mejores Resultados

1. **Sé específico con las zonas** - Usa nombres exactos de zona (CABA, GBA Norte, etc.)
2. **Especifica la duración** - Siempre menciona los días para precios precisos
3. **Nombra a tu cliente** - Incluye el nombre del cliente para propuestas personalizadas
4. **Pide detalles** - Solicita desgloses si necesitas más información
5. **Menciona terceros** - Si necesitas contactar proveedores, díselo al agente

## Solución de Problemas

### Sin resultados
- Intenta ampliar tus criterios de búsqueda
- Verifica la ortografía del nombre de zona
- Elimina filtros como tipo o límites de precio

### El precio parece incorrecto
- Verifica los días de campaña especificados
- Comprueba si el espacio es de tercero (aplica comisión adicional)
- Pide desglose detallado

### PDF no se genera
- Asegúrate de proporcionar toda la información requerida (nombre del cliente, items, precios, fechas)
- Intenta nuevamente con parámetros explícitos

## Soporte

Para problemas técnicos o solicitudes de funcionalidades, contacta al equipo de TI de Global Publicidad.

---

**Versión**: 1.0 - Prototipo Fase 1
**Última Actualización**: Enero 2026
