# Accounting AP / COGS (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; headed one-session Playwright **1/1** |
| **Scope** | Purchase-order receipt journals (accounts payable) and inventory stock in/out journals (equity / cost of goods sold) |
| **Catalog** | **accounting 1.7.2 → 1.8.0** |
| **Companion** | [Accounting user guide](/user-guide/accounting) · [Accounting developer guide](/developer-guide/accounting) · [Purchase Orders API](/api/tenant-v1-purchase-orders) · [CHANGELOG](/changelog/) |

---

## Executive summary

When Accounting is installed, receiving a purchase order posts one journal for that receipt. Tracked products debit Inventory Asset `1200`. Other lines debit Operating Expenses `6000`. Both credit Accounts Payable `2000` at quantity × unit price. Manual stock in credits Owner Equity `3000`. Stock out debits Cost of Goods Sold `5000`. Transfers post nothing.

**Go / No-Go:** **Go.** Migrate-only. No new permission. No SPA deploy. Existing receipts and movements are not backfilled. Pay the vendor with a manual journal (Dr `2000`, Cr cash).

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Tracked receipt posts Dr `1200` / Cr `2000` once | **Pass** (Pest) |
| Non-tracked line posts Dr `6000` / Cr `2000` and no stock movement | **Pass** (Pest) |
| Accounting absent still receives stock and posts no journal | **Pass** (Pest) |
| Stock out posts Dr `5000` / Cr `1200`; transfer adds no journal | **Pass** (Pest) |
| Existing purchase-order expense skips the payable journal | **Pass** (Pest) |
| Convert to expense is rejected after a receipt journal | **Pass** (Pest) |
| Catalog migrate-only bump + CatalogSeeder companion **1.8.0** | **Pass** (Pest) |
| Optional soft dependencies purchase-orders and inventory → accounting | **Pass** (Pest) |
| Empty purchase-order form keeps Title, Vendor, and Description errors and stays on the form | **Pass** (headed Playwright) |
| Receive quantity above remaining shows an error and keeps the dialog open | **Pass** (headed Playwright) |
| Receipt journal peek shows memo, $20.00, Inventory `1200`, and Accounts Payable `2000` | **Pass** (headed Playwright) |
| Unbalanced journal create stays on the form | **Pass** (headed Playwright) |
| Stock adjust rejects a missing product and a negative quantity, then posts stock out | **Pass** (headed Playwright) |
| Transfer form rejects missing warehouses; a completed transfer adds no stock-movement journal | **Pass** (headed Playwright) |
| Convert to expense shows the accounts-payable validation and does not create an expense | **Pass** (headed Playwright) |

Feature Pest on 2026-10-17: **9 passed / 59 assertions** (`InventoryCostJournalTest`, `AccountingModuleVersion180BumpTest`).

Headed Playwright on 2026-10-17: **1 passed** (`test:e2e:accounting:ap-cogs:headed`, one demo login, Chrome). No product defect. The SPA was not changed for posting; the session exercises the existing receive, journal, stock, and transfer screens.

---

## Security summary

| Control | Status |
|---------|--------|
| Journal posts only inside the existing receive and stock transactions | **Pass** |
| Entitlement check is Accounting on the receipt tenant, not a new public route | **Pass** |
| Idempotent on `journal_entry_id`; purchase-order receipt movements do not post a second journal | **Pass** |
| Convert-to-expense cannot hide a receipt that is already accounts payable | **Pass** |

---

## Deploy

1. `php artisan migrate --force` (journal columns, then catalog bump). Do not `db:seed`.
2. Confirm `modules.version` for `accounting` is `1.8.0`.
3. Smoke: receive a tracked purchase order and an untracked line; issue stock; complete a transfer.

No Frontend release is required for this bump.
