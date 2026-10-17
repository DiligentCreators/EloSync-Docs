# Inventory moving-average valuation (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; SPA value columns + KPI wired |
| **Scope** | Product-level moving average cost on stock in / PO receive; stock value APIs and UI |
| **Catalog** | **inventory 1.4.0 → 1.5.0** |
| **Companion** | [Inventory user guide](/user-guide/inventory) · [CHANGELOG](/changelog/) |

---

## Executive summary

Inbound stock (manual adjust or purchase-order receive) updates `products.cost` as a weighted moving average. Stock movements store `unit_cost`. Stock levels expose average cost and on-hand value; stats expose `total_inventory_value`. Soft Accounting stock-out journals use the current average. Transfers do not change product cost.

**Go / No-Go:** **Go.** Migrate-only. No new permissions.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Moving average on stock in with unit_cost | **Pass** (Pest) |
| PO receive folds unit_price into average | **Pass** (Pest) |
| Stock levels + stats expose value | **Pass** (Pest) |
| Catalog bump + CatalogSeeder companion | **Pass** (Pest) |

---

## Deploy

1. `php artisan migrate --force` (`stock_movements.unit_cost`, inventory **1.5.0** catalog bump). Do not `db:seed`.
2. Confirm `modules.version` for `inventory` is `1.5.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: stock in with unit cost → Avg cost / Value / Inventory value KPI; receive PO → product cost updates.
