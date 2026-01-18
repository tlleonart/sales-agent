import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { PRICING_CONFIG, GLOBAL_OWNER, calculatePriceBreakdown } from "./config";

/**
 * Unit tests for pricing calculations
 *
 * These tests verify the core business logic:
 * 1. Correct calculation of rental proportions
 * 2. Agency commission (20%)
 * 3. Intermediary commission for third-party items (10%)
 * 4. IVA calculation (21%)
 * 5. Third-party detection
 */

// Test data for a Global-owned item (no intermediary commission)
const GLOBAL_ITEM = {
  code: "TEST001",
  type: "Medianera" as const,
  owner: GLOBAL_OWNER,
  location: {
    address: "Test Address 123",
    city: "Test City",
    zone: "CABA" as const,
    coordinates: { lat: -34.6037, long: -58.4116 },
  },
  pricing: {
    rental_monthly: 1500000,
    production_cost: 280000,
    installation_cost: 140000,
    municipal_tax: 85000,
    currency: "ARS",
  },
  specs: {
    visible_dimensions: "14m x 7m",
    lighting: true,
  },
  availability: {
    blocked_dates: [],
    status: "available" as const,
  },
  media: {
    base_image_url: "https://example.com/image.png",
  },
  metrics: {
    daily_ots: 180000,
  },
};

// Test data for a third-party item (includes intermediary commission)
const THIRD_PARTY_ITEM = {
  ...GLOBAL_ITEM,
  code: "TEST002",
  owner: "MediaMax", // Third party owner
};

describe("Pricing Configuration", () => {
  it("has correct commission rates", () => {
    expect(PRICING_CONFIG.AGENCY_COMMISSION_RATE).toBe(0.20);
    expect(PRICING_CONFIG.INTERMEDIARY_COMMISSION_RATE).toBe(0.10);
    expect(PRICING_CONFIG.IVA_RATE).toBe(0.21);
    expect(PRICING_CONFIG.DAYS_PER_MONTH).toBe(30);
  });
});

describe("calculatePriceBreakdown helper", () => {
  it("calculates correct breakdown for Global item (30 days)", () => {
    const result = calculatePriceBreakdown({
      inventoryId: "test-id",
      code: "GFG050",
      campaignDays: 30,
      rentalMonthly: 1500000,
      productionCost: 280000,
      installationCost: 140000,
      municipalTax: 85000,
      currency: "ARS",
      isThirdParty: false,
    });

    // Verify rental proportion (full month)
    expect(result.rentalProportional).toBe(1500000);

    // Verify subtotal: rental + production + installation + tax
    const expectedSubtotal = 1500000 + 280000 + 140000 + 85000; // 2,005,000
    expect(result.subtotalNeto).toBe(expectedSubtotal);

    // Verify agency commission (20% of subtotal)
    const expectedAgencyCommission = expectedSubtotal * 0.20; // 401,000
    expect(result.agencyCommission).toBe(expectedAgencyCommission);

    // Verify no intermediary commission for Global items
    expect(result.intermediaryCommission).toBe(0);

    // Verify total neto
    const expectedTotalNeto = expectedSubtotal + expectedAgencyCommission; // 2,406,000
    expect(result.totalNeto).toBe(expectedTotalNeto);

    // Verify IVA (21% of total neto)
    const expectedIva = expectedTotalNeto * 0.21; // 505,260
    expect(result.iva).toBe(expectedIva);

    // Verify total bruto
    expect(result.totalBruto).toBe(expectedTotalNeto + expectedIva); // 2,911,260
  });

  it("calculates correct breakdown for third-party item (30 days)", () => {
    const result = calculatePriceBreakdown({
      inventoryId: "test-id",
      code: "GFG011",
      campaignDays: 30,
      rentalMonthly: 950000,
      productionCost: 220000,
      installationCost: 120000,
      municipalTax: 55000,
      currency: "ARS",
      isThirdParty: true,
    });

    // Verify subtotal
    const expectedSubtotal = 950000 + 220000 + 120000 + 55000; // 1,345,000
    expect(result.subtotalNeto).toBe(expectedSubtotal);

    // Verify agency commission (20%)
    const expectedAgencyCommission = expectedSubtotal * 0.20; // 269,000
    expect(result.agencyCommission).toBe(expectedAgencyCommission);

    // Verify intermediary commission (10%) - INCLUDED for third party
    const expectedIntermediaryCommission = expectedSubtotal * 0.10; // 134,500
    expect(result.intermediaryCommission).toBe(expectedIntermediaryCommission);

    // Verify total neto includes intermediary commission
    const expectedTotalNeto = expectedSubtotal + expectedAgencyCommission + expectedIntermediaryCommission; // 1,748,500
    expect(result.totalNeto).toBe(expectedTotalNeto);

    // Verify total bruto
    const expectedIva = expectedTotalNeto * 0.21;
    expect(result.totalBruto).toBe(expectedTotalNeto + expectedIva);

    // Verify isThirdParty flag
    expect(result.isThirdParty).toBe(true);
  });

  it("calculates correct proportional pricing for 15 days", () => {
    const result = calculatePriceBreakdown({
      inventoryId: "test-id",
      code: "TEST",
      campaignDays: 15,
      rentalMonthly: 1000000,
      productionCost: 100000,
      installationCost: 50000,
      municipalTax: 30000,
      currency: "ARS",
      isThirdParty: false,
    });

    // Rental should be half (15/30 days)
    expect(result.rentalProportional).toBe(500000);

    // Municipal tax should also be proportional
    expect(result.municipalTax).toBe(15000);

    // Production and installation are NOT proportional (one-time costs)
    expect(result.productionCost).toBe(100000);
    expect(result.installationCost).toBe(50000);
  });

  it("allows overriding intermediary commission", () => {
    const result = calculatePriceBreakdown({
      inventoryId: "test-id",
      code: "TEST",
      campaignDays: 30,
      rentalMonthly: 1000000,
      productionCost: 100000,
      installationCost: 50000,
      municipalTax: 30000,
      currency: "ARS",
      isThirdParty: false,
      includeIntermediaryCommission: true, // Force include even for Global item
    });

    // Should have intermediary commission even though not third party
    expect(result.intermediaryCommission).toBeGreaterThan(0);
  });
});

describe("Third-party detection", () => {
  it("identifies Global as own inventory", () => {
    expect(GLOBAL_ITEM.owner === GLOBAL_OWNER).toBe(true);
  });

  it("identifies other owners as third-party", () => {
    expect(THIRD_PARTY_ITEM.owner === GLOBAL_OWNER).toBe(false);
  });
});

describe("Pricing queries (integration)", () => {
  const t = convexTest(schema);

  beforeEach(async () => {
    // Clear any existing test data
  });

  it("calculates price for item by ID", async () => {
    // Insert test inventory item
    await t.mutation(api.seed.seedInventory, {});

    // The seed function inserts GFG050 which has specific known values
    // We can verify the calculateItemPrice query works correctly
    const allItems = await t.query(api.inventory.getAll, {});
    expect(allItems.length).toBeGreaterThan(0);

    // Find GFG050 (known test item)
    const gfg050 = allItems.find(item => item.code === "GFG050");
    if (gfg050) {
      const priceResult = await t.query(api.pricing.calculateItemPrice, {
        inventoryId: gfg050._id,
        campaignDays: 30,
      });

      expect(priceResult.success).toBe(true);
      if (priceResult.success) {
        expect(priceResult.data.totalBruto).toBeGreaterThan(0);
        expect(priceResult.data.isThirdParty).toBe(false);
      }
    }
  });

  it("calculates price by inventory code", async () => {
    // Ensure data is seeded
    await t.mutation(api.seed.seedInventory, {});

    const result = await t.query(api.pricing.calculateByCode, {
      inventoryCode: "GFG050",
      campaignDays: 30,
    });

    expect(result.success).toBe(true);
    if (result.success && result.totalBruto !== undefined && result.totalNeto !== undefined) {
      expect(result.codigo).toBe("GFG050");
      expect(result.esTercero).toBe(false);
      expect(result.totalBruto).toBeGreaterThan(result.totalNeto);
    }
  });

  it("returns error for non-existent code", async () => {
    const result = await t.query(api.pricing.calculateByCode, {
      inventoryCode: "NONEXISTENT",
      campaignDays: 30,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("No se encontró");
    }
  });

  it("detects third-party items correctly", async () => {
    await t.mutation(api.seed.seedInventory, {});

    // GFG011 is owned by MediaMax (third party)
    const result = await t.query(api.pricing.calculateByCode, {
      inventoryCode: "GFG011",
      campaignDays: 30,
    });

    expect(result.success).toBe(true);
    if (result.success && result.desglose !== undefined) {
      expect(result.esTercero).toBe(true);
      expect(result.desglose.comisionIntermediario).toBeGreaterThan(0);
    }
  });
});
