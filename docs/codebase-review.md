# Codebase Review & Improvement Plan

**Date:** 2026-01-18
**Reviewer:** Claude Code
**Status:** Review Complete

---

## Executive Summary

The OOH Agent codebase is a **well-structured Phase 1 prototype** with solid foundations. TypeScript compiles without errors and Convex functions work correctly. However, there are several areas requiring attention before moving to Phase 2:

| Category | Issues Found | Priority |
|----------|--------------|----------|
| Configuration | 2 | High |
| Code Duplication | 3 | Medium |
| Type Safety | 4 | Medium |
| Missing Tests | 1 | High |
| Security | 2 | High |
| Performance | 2 | Low |

---

## 1. Critical Issues (High Priority)

### 1.1 Missing ESLint Configuration

**File:** Root directory
**Problem:** ESLint 9.x requires `eslint.config.js` but none exists. The lint command fails.

```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

**Solution:** Create `eslint.config.js` with proper TypeScript and Convex rules.

---

### 1.2 No Unit Tests

**Problem:** Zero test files in the project. All tests in `node_modules` belong to Convex.

**Impact:**
- No automated verification of business logic
- Risk of regression when modifying pricing calculations
- Manual testing is documented but not automated

**Recommendation:** Add tests for:
1. **Pricing calculations** - Critical business logic
2. **Third-party detection** - Owner !== "Global" logic
3. **Date availability checks** - Blocked dates handling
4. **Proposal storage** - Data transformation correctness

---

### 1.3 Hardcoded API Key in Template

**File:** `templates/build-pdf-html.js:397`

```javascript
key=AIzaSyAXbWpSsu306Ue8qqRSMzGkZZQ_oHJVYJM
```

**Risk:** API key exposed in code, could be misused or hit rate limits.

**Solution:** Move to n8n credentials or environment variable.

---

### 1.4 Unsafe Schema Type

**File:** `convex/schema.ts:147`

```typescript
metadata: v.optional(v.any()),
```

**Problem:** `v.any()` bypasses type checking entirely for audit log metadata.

**Solution:** Define specific metadata types for each event type.

---

## 2. Code Duplication (Medium Priority)

### 2.1 Pricing Constants Duplicated

**Locations:**
- `convex/pricing.ts:9-21` (PRICING_CONFIG)
- `convex/proposals.ts:319-323` (inline constants)
- `convex/proposals.ts:473-476` (inline constants again)

**Problem:** Same values (20% agency, 10% intermediary, 21% IVA) defined in 3 places.

**Solution:** Create shared `convex/config.ts` with exported constants.

---

### 2.2 Pricing Calculation Logic Duplicated

**Problem:** Full pricing calculation appears in 3 functions:
1. `pricing.ts:calculateItemPrice()` - lines 59-119
2. `proposals.ts:storeProposalByCodes()` - lines 342-362
3. `proposals.ts:storeProposalWithMockups()` - lines 501-521

**Solution:** Extract to shared helper function or call `calculateItemPrice` from proposals.

---

### 2.3 Item Transformation Logic Duplicated

**Problem:** `getFullDetails()` and `getMultipleFullDetails()` have nearly identical transformation code (lines 260-323 and 330-383).

**Solution:** Extract item transformation to a helper function.

---

## 3. Type Safety Issues (Medium Priority)

### 3.1 Magic Strings for Status

**Files:** Multiple
**Problem:** Status values are strings without validation:

```typescript
status: v.string(), // "available", "reserved", "maintenance", "pending_third_party"
```

**Risk:** Invalid status like "Available" (capitalized) would be accepted.

**Solution:** Use union type:
```typescript
status: v.union(
  v.literal("available"),
  v.literal("reserved"),
  v.literal("maintenance"),
  v.literal("pending_third_party")
)
```

---

### 3.2 No Input Validation on updateStatus

**File:** `convex/inventory.ts:203-224`

```typescript
export const updateStatus = mutation({
  args: {
    status: v.string(), // No validation of valid values
  },
  // ...
});
```

**Problem:** Any string is accepted, including typos or invalid statuses.

---

### 3.3 Unsafe Type Casting

**File:** `convex/proposals.ts:196-211`

```typescript
const metadata = latestLog.metadata as {
  proposalId: string;
  // ...
};
```

**Problem:** `as` casting assumes structure without validation.

**Solution:** Use type guards or Convex validators.

---

### 3.4 Inconsistent Return Types

**Problem:** Some functions return `null`, others return `{ found: false }`, others throw errors:

| Function | Not Found Behavior |
|----------|-------------------|
| `getByCode` | Returns `null` |
| `getContactForInventory` | Returns `{ found: false, reason: ... }` |
| `updateStatus` | Throws `Error("Soporte no encontrado")` |

**Recommendation:** Standardize error handling approach.

---

## 4. Performance Concerns (Low Priority)

### 4.1 No Pagination on Large Queries

**File:** `convex/inventory.ts:8-13`

```typescript
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("inventory").collect();
  },
});
```

**Problem:** Returns all items without limit. With 1000+ items, this becomes slow.

**Solution:** Add optional `limit` and `cursor` parameters.

---

### 4.2 Inefficient Search Function

**File:** `convex/inventory.ts:103-137`

```typescript
const allItems = await results.collect();
return allItems.filter((item) => { ... });
```

**Problem:** Fetches ALL items, then filters in memory. Doesn't use indexes.

**Solution:** Use Convex indexes for filtering when possible.

---

## 5. Missing Features

### 5.1 No Campaign Dates in storeProposalByCodes

**File:** `convex/proposals.ts:309-450`

The function accepts `campaignDays` but doesn't store actual `campaign_start` and `campaign_end` dates in the audit log.

### 5.2 No Date Validation

Date strings are not validated for format or logical correctness (e.g., end before start).

### 5.3 Unused Import

**File:** `convex/pricing.ts:1`

```typescript
import { query, action } from "./_generated/server";
```

The `action` import is unused.

---

## 6. Testing Strategy Recommendation

### Do We Need Unit Tests?

**Yes**, but with prioritization:

| Component | Test Priority | Reason |
|-----------|---------------|--------|
| Pricing calculations | **Critical** | Business-critical, complex math |
| Third-party detection | High | Core business rule |
| Date availability | High | Time-sensitive logic |
| Data transformations | Medium | Many edge cases |
| CRUD operations | Low | Convex handles most validation |

### Recommended Testing Setup

```json
// package.json additions
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "convex-test": "^0.0.35"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Example Test Structure

```typescript
// convex/pricing.test.ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { calculateItemPrice } from "./pricing";

describe("Pricing calculations", () => {
  it("calculates correct total for Global-owned item", async () => {
    const t = convexTest(schema);
    // Insert test inventory item
    // Call calculateItemPrice
    // Assert expected values
  });

  it("adds intermediary commission for third-party items", async () => {
    // Test third-party pricing
  });
});
```

---

## 7. Improvement Plan

### Phase 1: Critical Fixes (1-2 hours)

1. [ ] Create `eslint.config.js` for ESLint 9.x
2. [ ] Move Google Maps API key to environment variable
3. [ ] Fix unused `action` import in pricing.ts

### Phase 2: Type Safety (2-3 hours)

4. [ ] Create `convex/types.ts` with shared types
5. [ ] Add union validators for status fields
6. [ ] Replace `v.any()` with specific metadata types
7. [ ] Standardize error handling patterns

### Phase 3: Code Quality (2-3 hours)

8. [ ] Create `convex/config.ts` for shared constants
9. [ ] Extract pricing calculation helper
10. [ ] Extract item transformation helper
11. [ ] Add pagination to `getAll` and similar queries

### Phase 4: Testing (3-4 hours)

12. [ ] Set up Vitest + convex-test
13. [ ] Write pricing calculation tests
14. [ ] Write third-party detection tests
15. [ ] Write date availability tests

### Phase 5: Documentation (1 hour)

16. [ ] Update CLAUDE.md with new patterns
17. [ ] Document testing approach
18. [ ] Update changelog

---

## 8. Files to Modify

| File | Changes Needed |
|------|----------------|
| `package.json` | Add test dependencies |
| `eslint.config.js` | Create new file |
| `convex/types.ts` | Create new file with shared types |
| `convex/config.ts` | Create new file with constants |
| `convex/schema.ts` | Add union types for status |
| `convex/pricing.ts` | Remove unused import, use shared config |
| `convex/proposals.ts` | Use shared helpers, add campaign dates |
| `convex/inventory.ts` | Add pagination, use shared types |
| `templates/build-pdf-html.js` | Use env variable for API key |

---

## 9. Summary

The codebase is **production-ready for Phase 1** with the current manual testing approach. For Phase 2 (Next.js frontend), the recommended fixes will:

1. **Prevent bugs** through type safety and linting
2. **Enable confident refactoring** with unit tests
3. **Improve maintainability** by reducing duplication
4. **Enhance security** by removing hardcoded credentials

**Estimated total effort:** 9-13 hours for all improvements.

**Minimum viable improvements:** Phases 1-2 (3-5 hours) for immediate quality gains.
