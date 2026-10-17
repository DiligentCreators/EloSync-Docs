# Inventory serial/lot PO receive + transfers (inventory 1.4.0 / purchase-orders 1.7.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; SPA receive + transfer complete wired |
| **Scope** | Serial/lot metadata on PO receive and warehouse transfer complete |
| **Catalog** | **inventory 1.3.0 → 1.4.0**, **purchase-orders → 1.7.0** |
| **Companion** | [Inventory user guide](/user-guide/inventory) · [Purchase Orders](/user-guide/purchase-orders) · [CHANGELOG](/changelog/) |

---

## Executive summary

Serial- and lot-tracked products can be received on purchase orders and moved between warehouses. Receive requires per-line `serials[]` or `lot` (optional `lot_expires_at`). Transfer complete requires the same identifiers; serials move warehouses while staying in stock; lot quantities decrement at the source and increment at the destination. Full receive without `lines` is rejected when any remaining line is serial/lot tracked.

**Go / No-Go:** **Go.** Migrate-only catalog bumps. No new permissions.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Serial PO receive + omit-lines reject | **Pass** (Pest) |
| Lot PO receive | **Pass** (Pest) |
| Serial transfer complete + missing serials reject | **Pass** (Pest) |
| Lot transfer complete + missing lot reject | **Pass** (Pest) |
| Catalog bumps + CatalogSeeder companion | **Pass** (Pest) |
| Playwright inventory-phase headed | **Pass** (`10/10`) |

---

## Deploy

1. `php artisan migrate --force` (inventory **1.4.0** and purchase-orders **1.7.0** catalog bumps). Do not `db:seed`.
2. Confirm `modules.version` for `inventory` is `1.4.0` and `purchase-orders` is `1.7.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: create serial and lot products → PO receive with serials/lot → transfer complete with serials/lot.
