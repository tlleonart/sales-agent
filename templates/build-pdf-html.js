/**
 * PDF HTML Builder for n8n
 *
 * This script builds the complete multi-page HTML document
 * from the proposal data. Use this in an n8n Code node.
 *
 * Input (from previous node):
 * - $json.proposal: The proposal data from Convex
 * - $json.logoBase64: Base64 encoded logo image
 * - $json.portfolioImageUrl: URL for portfolio images (used in cover grid)
 * - $json.googleMapsApiKey: Google Maps Static API key (from n8n credentials)
 *
 * Output:
 * - html: Complete HTML document ready for Gotenberg
 */

// Get input data
const proposal = $json.proposal;
const logoBase64 = $json.logoBase64 || '';
const portfolioImageUrl = $json.portfolioImageUrl || '';
const googleMapsApiKey = $json.googleMapsApiKey || $env.GOOGLE_MAPS_API_KEY || '';

// Helper function to format numbers with thousand separators
function formatNumber(num) {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('es-AR');
}

// CSS Styles (embedded)
const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
  background: #fff;
}

@page {
  size: A4 portrait;
  margin: 15mm 15mm 20mm 15mm;
}

.page {
  width: 100%;
  min-height: 100vh;
  page-break-after: always;
  position: relative;
  padding-bottom: 40px;
}

.page:last-child {
  page-break-after: avoid;
}

.logo { height: 50px; width: auto; }
.logo-small { height: 35px; width: auto; }

/* Cover Page */
.cover-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: calc(100vh - 80px);
}

.cover-logo {
  margin-bottom: 60px;
}

.cover-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a365d;
  text-align: center;
  margin-bottom: 10px;
}

.cover-subtitle {
  font-size: 18px;
  color: #666;
  text-align: center;
}

/* Summary Page */
.summary-page { padding: 0; }

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a365d;
  margin-top: 10px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  margin-bottom: 20px;
}

.summary-table thead {
  background: #1a365d;
  color: white;
}

.summary-table th {
  padding: 8px 6px;
  text-align: left;
  font-weight: 600;
  border: 1px solid #1a365d;
}

.summary-table td {
  padding: 6px;
  border: 1px solid #ddd;
  vertical-align: top;
}

.summary-table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.summary-table .price-col {
  text-align: right;
  white-space: nowrap;
}

.disclaimers {
  font-size: 9px;
  color: #666;
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-left: 3px solid #1a365d;
}

.disclaimers p { margin-bottom: 4px; }

/* Product Sheet */
.product-sheet { padding: 0; }

.product-header {
  background: #2563eb;
  color: white;
  padding: 12px 15px;
  margin: 0 0 15px 0;
}

.product-address {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.product-code {
  font-size: 11px;
  opacity: 0.9;
}

.product-content {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 20px;
}

.product-image-section {
  display: flex;
  flex-direction: column;
}

.product-mockup {
  width: 100%;
  height: auto;
  max-height: 350px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.product-additional-info {
  margin-top: 15px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.product-additional-info h4 {
  font-size: 11px;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 6px;
}

.product-additional-info p {
  font-size: 10px;
  color: #666;
}

.product-details-section {
  display: flex;
  flex-direction: column;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin-bottom: 15px;
}

.specs-table th {
  text-align: right;
  padding: 6px 10px 6px 0;
  font-weight: 600;
  color: #1a365d;
  width: 45%;
  border-bottom: 1px solid #e2e8f0;
}

.specs-table td {
  padding: 6px 0;
  border-bottom: 1px solid #e2e8f0;
}

.product-map { margin-top: auto; }

.product-map img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.map-link {
  display: block;
  text-align: center;
  font-size: 10px;
  color: #2563eb;
  margin-top: 8px;
  text-decoration: none;
}

/* Footer */
.page-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
  font-size: 9px;
  color: #666;
}

@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { page-break-inside: avoid; }
  .product-header {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

// Calculate total pages: Cover + Summary + (1 per item)
const totalPages = 2 + (proposal.items?.length || 0);

// Build Cover Page
function buildCoverPage() {
  // Get current month and year in Spanish
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const now = new Date();
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear();

  const clientName = proposal.clientName || 'Cliente';

  return `
  <div class="page cover-page">
    <div class="cover-logo">
      <img src="${logoBase64}" alt="Global Vía Pública" class="logo" style="height: 80px;">
    </div>
    <div class="cover-title">Propuesta ${clientName}</div>
    <div class="cover-subtitle">${currentMonth} ${currentYear}</div>
    <div class="page-footer">
      <div class="footer-contact">Global Argentina | +54 11 9 38902707 |</div>
      <div class="footer-page">Página 1 de ${totalPages}</div>
    </div>
  </div>`;
}

// Build Summary Page
function buildSummaryPage() {
  const rows = (proposal.items || []).map(item => `
    <tr>
      <td>${item.type}</td>
      <td>${item.address}</td>
      <td>${item.availabilityDisplay || 'Disponible'}</td>
      <td>${item.city}</td>
      <td class="price-col">$ ${formatNumber(item.rental_monthly)}</td>
      <td class="price-col">$ ${formatNumber(item.municipal_tax)}</td>
      <td class="price-col">$ ${formatNumber(item.installation_cost)}</td>
      <td class="price-col">$ ${formatNumber(item.production_cost)}</td>
    </tr>
  `).join('');

  return `
  <div class="page summary-page">
    <div class="summary-header">
      <img src="${logoBase64}" alt="Global Vía Pública" class="logo-small">
    </div>
    <h1 class="summary-title">Propuesta comercial</h1>
    <table class="summary-table">
      <thead>
        <tr>
          <th style="width: 10%;">Soporte</th>
          <th style="width: 30%;">Ubicación</th>
          <th style="width: 15%;">Disponibilidad</th>
          <th style="width: 10%;">Localidad</th>
          <th style="width: 12%;" class="price-col">Valor Exhibición Mensual 1Q</th>
          <th style="width: 8%;" class="price-col">Tasas Mensuales</th>
          <th style="width: 8%;" class="price-col">Instalación</th>
          <th style="width: 7%;" class="price-col">Producción</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="disclaimers">
      <p>Los valores detallados en este documento NO incluyen IVA.</p>
      <p>Los valores de producción e instalación deben revalidarse al momento de realizarse.</p>
      <p>Las tasas municipales de publicidad pueden sufrir aumentos a partir de las disposiciones tomadas por las autoridades municipales.</p>
    </div>
    <div class="page-footer">
      <div class="footer-contact">Global Argentina | +54 11 9 38902707 |</div>
      <div class="footer-page">Página 2 de ${totalPages}</div>
    </div>
  </div>`;
}

// Build Product Sheet Page
function buildProductSheet(item, pageNumber) {
  return `
  <div class="page product-sheet">
    <div class="product-header">
      <div class="product-address">${item.address}</div>
      <div class="product-code">Código: ${item.code} // ${item.type}</div>
    </div>
    <div class="product-content">
      <div class="product-image-section">
        <img src="${item.mockup_image_url || item.base_image_url}" alt="${item.address}" class="product-mockup">
        <div class="product-additional-info">
          <h4>Información adicional soporte</h4>
          <p>Servicios adicionales: 0</p>
          <p>${item.additional_info || 'Sin información adicional'}</p>
        </div>
      </div>
      <div class="product-details-section">
        <table class="specs-table">
          <tr><th>Localidad/Barrio</th><td>${item.neighborhood}</td></tr>
          <tr><th>Sub-formato</th><td>${item.sub_format}</td></tr>
          <tr><th>Dimensiones (visible)</th><td>${item.visible_dimensions}</td></tr>
          <tr><th>Dimensiones (total)</th><td>${item.total_dimensions}</td></tr>
          <tr><th>Iluminación</th><td>${item.lighting ? 'Sí' : 'No'}</td></tr>
          <tr><th>Resolución</th><td>${item.resolution}</td></tr>
          <tr><th>Especificación material</th><td>${item.material_spec}</td></tr>
          <tr><th>Formato de envío</th><td>${item.send_format}</td></tr>
          <tr><th>Fecha envío original</th><td>${item.send_deadline}</td></tr>
          <tr><th>OTS diario</th><td>${formatNumber(item.daily_ots)}</td></tr>
        </table>
        <div class="product-map">
          <img src="${item.map_image_url || (googleMapsApiKey ? `https://maps.googleapis.com/maps/api/staticmap?center=${item.lat},${item.long}&zoom=15&size=300x200&markers=color:red|${item.lat},${item.long}&key=${googleMapsApiKey}` : '')}" alt="Ubicación en mapa">
          <a href="https://www.google.com/maps?q=${item.lat},${item.long}" class="map-link" target="_blank">
            » Ver más detalles y mapa «
          </a>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div class="footer-contact">Global Argentina | +54 11 9 38902707 |</div>
      <div class="footer-page">Página ${pageNumber} de ${totalPages}</div>
    </div>
  </div>`;
}

// Build complete HTML document
function buildFullHtml() {
  const coverPage = buildCoverPage();
  const summaryPage = buildSummaryPage();
  const productSheets = (proposal.items || [])
    .map((item, index) => buildProductSheet(item, index + 3))
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propuesta Comercial - ${proposal.clientName || 'Cliente'}</title>
  <style>${styles}</style>
</head>
<body>
  ${coverPage}
  ${summaryPage}
  ${productSheets}
</body>
</html>`;
}

// Generate the HTML
const html = buildFullHtml();

// Return the result
return [{
  json: {
    html,
    totalPages,
    clientName: proposal.clientName,
    itemCount: proposal.items?.length || 0,
  }
}];
