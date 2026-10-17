# Inventory serial + lot tracking MVP (products 1.5.0 / inventory 1.3.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; SPA serial/lot adjust wired |
| **Scope** | Optional per-product serials or lots on stock in/out (PO receive / transfers follow in inventory **1.4.0**) |
| **Catalog** | **products → 1.5.0**, **inventory → 1.3.0** |
| **Companion** | [Inventory user guide](/user-guide/inventory) · [Products](/user-guide/products) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspaces can mark stock-tracked products with **Track serials** or **Track lots** (not both). Inventory adjust then requires matching serials or a lot number on stock in/out. Absolute set-quantity adjust rejects those products. Enabling either flag requires zero on-hand quantity. Serial/lot-aware PO receive and transfers ship in inventory **1.4.0** / purchase-orders **1.7.0**.

**Go / No-Go:** **Go.** Migrate-only. No new permissions.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Serial in/out + duplicate reject | **Pass** (Pest) |
| Lot in/out + per-lot insufficient qty | **Pass** (Pest) |
| Mutual exclusion + zero on-hand gate | **Pass** (Pest) |
| Catalog bumps + CatalogSeeder companion | **Pass** (Pest) |

---

## Deploy

1. `php artisan migrate --force` (`track_serials`, `track_lots`, `stock_serials`, `stock_lots`, catalog bumps). Do not `db:seed`.
2. Confirm `modules.version` for `products` is `1.5.0` and `inventory` is `1.3.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: create serial and lot products → stock in with serials/lot → set-quantity adjust rejects that SKU.
