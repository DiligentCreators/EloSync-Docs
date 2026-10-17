# Inventory serial tracking MVP (products 1.4.0 / inventory 1.2.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; SPA serial adjust wired |
| **Scope** | Optional per-product serial numbers on stock in/out; PO receive and transfers blocked for serial SKUs |
| **Catalog** | **products 1.3.0 → 1.4.0**, **inventory 1.1.0 → 1.2.0** |
| **Companion** | [Inventory user guide](/user-guide/inventory) · [Products](/user-guide/products) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspaces can mark stock-tracked products with **Track serials**. Inventory adjust then requires one serial per unit on stock in and stock out. Absolute set-quantity adjust, purchase-order receive, and warehouse transfer complete reject those products until serial-aware flows ship. Lot tracking is deferred.

**Go / No-Go:** **Go.** Migrate-only. No new permissions.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Serial in/out + duplicate reject | **Pass** (Pest) |
| Absolute adjust rejected for serial products | **Pass** (Pest) |
| Transfer complete rejected for serial products | **Pass** (Pest) |
| Catalog bumps + CatalogSeeder companion | **Pass** (Pest) |
| Inventory-phase Playwright (incl. serial stock in) | **Pass** (`test:e2e:inventory-phase:headed` **5/5**) |

Feature Pest on 2026-10-17: **7 passed** (`StockSerialTest`, `ProductSerialFlagTest`, catalog bumps).

---

## Deploy

1. `php artisan migrate --force` (`track_serials`, `stock_serials`, catalog bumps). Do not `db:seed`.
2. Confirm `modules.version` for `products` is `1.4.0` and `inventory` is `1.2.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: create serial product → stock in with serials → attempt transfer complete / PO receive for that SKU → expect validation error.
