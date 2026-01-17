# Changelog

Todos los cambios notables al proyecto "OOH Agent" se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased] - Fase 1: Prototipo

### Added

#### Documentación (Inicialización)
- [cite_start]**Project Spec v2.1**: Definición completa de requerimientos, lógica de precios, manejo de terceros y estructura de datos en Convex[cite: 1, 14, 30].
- [cite_start]**Architecture**: Diagrama de flujo de datos (Data Flow), definición de componentes (n8n, Convex, AI APIs) y estrategia de seguridad[cite: 14].
- **CLAUDE.md**: Reglas de contexto, guía de estilo y comandos para el asistente de desarrollo.
- **Project Status**: Tracking inicial de tareas y milestones.

#### Data Layer (Convex)
- [cite_start]**Schema Definition**: Esquema estricto en TypeScript para la tabla `inventory` incluyendo objetos anidados para `pricing`, `specs`, `location` y `availability`[cite: 1, 9, 59].
- [cite_start]**Seed Script**: Script de población de base de datos (`seed_inventory.ts`) utilizando datos reales extraídos del PDF "Nutreco" (Precios, medidas, coordenadas)[cite: 59, 65, 75].

#### Orquestación (n8n Workflows - Planificado)
- **Master Chat Workflow**: Estructura base para manejo de conversación y memoria.
- [cite_start]**Inventory Engine**: Lógica de consulta a Convex con filtros geográficos y de fecha[cite: 2, 3, 4].
- [cite_start]**Pricing Calculator**: Nodos de función para cálculo de neto, bruto, tasas e impuestos[cite: 7, 60, 61].
- [cite_start]**Third-Party Handler**: Lógica de bifurcación para detectar soportes de terceros y disparar alertas de email[cite: 11, 12].

#### Integraciones & AI
- [cite_start]**Generación de Imágenes**: Configuración de inputs para API de Replicate/DALL-E (Compositing de logos sobre `base_image_url`)[cite: 10].
- [cite_start]**Generación de PDF**: Estructura de datos para renderizado HTML-to-PDF[cite: 13, 20].

### Changed
- [cite_start]Migración de estrategia de datos: Se reemplazó el uso de JSON estático/Google Sheets por una base de datos real en **Convex** para soportar tipos estrictos y queries complejas desde el día 1[cite: 8].

### Fixed
- N/A

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
