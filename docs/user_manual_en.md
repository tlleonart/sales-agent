# OOH Agent - User Manual

## Overview

OOH Agent is an AI-powered commercial assistant for managing outdoor advertising (Out-of-Home) proposals. It helps sales executives search inventory, calculate quotes, manage third-party suppliers, and generate professional proposals.

## Getting Started

### Accessing the Chat Interface

Open your browser and navigate to:
```
https://carbono14.app.n8n.cloud/webhook/ooh-agent-chat/chat
```

The chat interface will load with a welcome message explaining the available capabilities.

## Features

### 1. Search Inventory

Ask the agent to find available advertising spaces by zone, type, or other criteria.

**Example queries:**
- "What billboards do you have available in CABA?"
- "Show me medianeras in the northern area"
- "Find espectaculares in GBA Sur"

**Available zones:**
- **GBA Norte**: Vicente López, San Isidro, Pilar
- **GBA Sur**: Lomas de Zamora, Quilmes
- **GBA Oeste**: Morón, Ituzaingó
- **CABA**: Abasto, Microcentro, Palermo, Belgrano, Constitución

**Available types:**
- **Medianera**: Wall paintings or banners on building walls
- **Columna**: Vertical street furniture structures
- **Espectacular**: Large billboards on highways and main avenues

### 2. Get Price Quotes

Once you've identified advertising spaces, ask for pricing with campaign duration.

**Example queries:**
- "Give me a quote for 30 days of support GFG050 in Abasto"
- "How much does a 15-day campaign cost in Palermo?"
- "Calculate the price for GFG001 and GFG002 for 60 days"

**Pricing structure:**
- **Monthly Rental**: Proportional to campaign days
- **Production**: One-time printing/manufacturing cost
- **Installation**: One-time mounting cost
- **Municipal Tax**: Proportional to campaign days
- **Agency Commission**: 20% on subtotal
- **Intermediary Commission**: 10% additional for third-party spaces
- **VAT (IVA)**: 21% on net total

The agent always shows both **NET** (without VAT) and **GROSS** (with VAT) amounts.

### 3. Third-Party Management

Some advertising spaces belong to partner companies (third parties). The agent identifies these automatically and can prepare inquiry emails.

**Third-party indicators:**
- MediaMax
- VíaPublica SA
- UrbanMedia
- OutdoorPlus

When third-party spaces are involved, prices are **subject to confirmation** from the supplier.

### 4. Generate PDF Proposals

Request a formal PDF proposal document with all quote details.

**Example queries:**
- "Generate a PDF proposal for client Coca-Cola"
- "Create a formal quote document for this campaign"

### 5. Image Mockups

Request visual mockups showing how advertising would look on specific spaces.

**Example queries:**
- "Show me how my logo would look on support GFG050"
- "Generate a visualization for this billboard"

## Understanding Responses

### Inventory Results

The agent provides structured information for each space:
- **Code**: Unique identifier (e.g., GFG050)
- **Type**: Medianera, Columna, or Espectacular
- **Address**: Physical location
- **Zone**: Geographic area
- **Owner**: Global (own) or third-party name
- **Dimensions**: Visible size
- **Lighting**: Yes/No
- **Status**: Available/Reserved

### Price Quotes

Quotes include detailed breakdowns:
- Individual cost components
- Subtotals by category
- Agency commission calculation
- VAT calculation
- Final NET and GROSS totals

## Tips for Best Results

1. **Be specific about zones** - Use exact zone names (CABA, GBA Norte, etc.)
2. **Specify campaign duration** - Always mention days for accurate pricing
3. **Name your client** - Include client name for personalized proposals
4. **Ask for details** - Request breakdowns if you need more information
5. **Mention third parties** - If you need to contact suppliers, tell the agent

## Troubleshooting

### No results found
- Try broadening your search criteria
- Check zone name spelling
- Remove filters like type or price limits

### Pricing seems incorrect
- Verify campaign days specified
- Check if space is third-party (additional commission applies)
- Ask for detailed breakdown

### PDF not generating
- Ensure all required information is provided (client name, items, prices, dates)
- Try again with explicit parameters

## Support

For technical issues or feature requests, contact the Global Publicidad IT team.

---

**Version**: 1.0 - Phase 1 Prototype
**Last Updated**: January 2026
