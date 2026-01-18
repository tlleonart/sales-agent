/**
 * Shared configuration constants for OOH Agent
 *
 * This file centralizes all pricing and business configuration
 * to ensure consistency across modules.
 */

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

/**
 * Pricing configuration constants
 * These values define the commission structure and tax rates.
 */
export const PRICING_CONFIG = {
  /** Agency commission rate (20%) */
  AGENCY_COMMISSION_RATE: 0.20,

  /** Intermediary commission rate for third-party items (10%) */
  INTERMEDIARY_COMMISSION_RATE: 0.10,

  /** IVA (VAT) rate in Argentina (21%) */
  IVA_RATE: 0.21,

  /** Standard days per month for proportional calculations */
  DAYS_PER_MONTH: 30,
} as const;

// =============================================================================
// OWNER CONSTANTS
// =============================================================================

/**
 * Owner identifier for Global-owned (own) inventory
 */
export const GLOBAL_OWNER = "Global";

// =============================================================================
// CURRENCY
// =============================================================================

/**
 * Default currency code
 */
export const DEFAULT_CURRENCY = "ARS";

// =============================================================================
// PRICING HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate proportional rental cost based on campaign days
 */
export function calculateProportionalRental(
  monthlyRental: number,
  campaignDays: number
): number {
  return (monthlyRental / PRICING_CONFIG.DAYS_PER_MONTH) * campaignDays;
}

/**
 * Calculate proportional municipal tax based on campaign days
 */
export function calculateProportionalTax(
  monthlyTax: number,
  campaignDays: number
): number {
  return (monthlyTax / PRICING_CONFIG.DAYS_PER_MONTH) * campaignDays;
}

/**
 * Round a number to 2 decimal places
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Round to nearest integer (for display in ARS without decimals)
 */
export function roundToInteger(value: number): number {
  return Math.round(value);
}

// =============================================================================
// PRICING BREAKDOWN INTERFACE
// =============================================================================

/**
 * Complete price breakdown for a single inventory item
 */
export interface PriceBreakdown {
  // Item info
  inventoryId: string;
  code: string;

  // Days of campaign
  campaignDays: number;

  // Cost breakdown
  rentalProportional: number;
  productionCost: number;
  installationCost: number;
  municipalTax: number;

  // Subtotals
  subtotalNeto: number;
  agencyCommission: number;
  intermediaryCommission: number;

  // Totals
  totalNeto: number;
  iva: number;
  totalBruto: number;

  // Metadata
  currency: string;
  isThirdParty: boolean;
}

/**
 * Calculate complete price breakdown for an item
 */
export function calculatePriceBreakdown(params: {
  inventoryId: string;
  code: string;
  campaignDays: number;
  rentalMonthly: number;
  productionCost: number;
  installationCost: number;
  municipalTax: number;
  currency: string;
  isThirdParty: boolean;
  includeIntermediaryCommission?: boolean;
}): PriceBreakdown {
  const {
    inventoryId,
    code,
    campaignDays,
    rentalMonthly,
    productionCost,
    installationCost,
    municipalTax,
    currency,
    isThirdParty,
  } = params;

  // Use includeIntermediaryCommission if provided, otherwise default to isThirdParty
  const includeIntermediary = params.includeIntermediaryCommission ?? isThirdParty;

  // Calculate proportional costs
  const rentalProportional = calculateProportionalRental(rentalMonthly, campaignDays);
  const municipalTaxProportional = calculateProportionalTax(municipalTax, campaignDays);

  // Calculate subtotal
  const subtotalNeto =
    rentalProportional +
    productionCost +
    installationCost +
    municipalTaxProportional;

  // Calculate commissions
  const agencyCommission = subtotalNeto * PRICING_CONFIG.AGENCY_COMMISSION_RATE;
  const intermediaryCommission = includeIntermediary
    ? subtotalNeto * PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE
    : 0;

  // Calculate totals
  const totalNeto = subtotalNeto + agencyCommission + intermediaryCommission;
  const iva = totalNeto * PRICING_CONFIG.IVA_RATE;
  const totalBruto = totalNeto + iva;

  return {
    inventoryId,
    code,
    campaignDays,
    rentalProportional: roundCurrency(rentalProportional),
    productionCost,
    installationCost,
    municipalTax: roundCurrency(municipalTaxProportional),
    subtotalNeto: roundCurrency(subtotalNeto),
    agencyCommission: roundCurrency(agencyCommission),
    intermediaryCommission: roundCurrency(intermediaryCommission),
    totalNeto: roundCurrency(totalNeto),
    iva: roundCurrency(iva),
    totalBruto: roundCurrency(totalBruto),
    currency,
    isThirdParty,
  };
}
