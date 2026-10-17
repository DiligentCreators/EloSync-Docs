# Accounting vendor AP settle / Pay vendor (1.9.0 / 1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green |
| **Scope** | Pay vendor on purchase orders clears receipt accounts payable from cash/bank |
| **Catalog** | **accounting 1.8.0 → 1.9.0**, **purchase-orders 1.5.0 → 1.6.0** |
| **Companion** | [Accounting user guide](/user-guide/accounting) · [Purchase Orders](/user-guide/purchase-orders) · [CHANGELOG](/changelog/) |

---

## Executive summary

When Accounting is installed and a purchase-order receipt has posted accounts payable, **Pay vendor** posts Dr Accounts Payable `2000` / Cr the chosen cash or bank account for each open receipt. Convert to expense stays blocked while AP journals exist.

**Go / No-Go:** **Go.** Migrate-only. New permission `purchase-orders.pay` for admin/manager defaults.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Pay vendor posts Dr AP / Cr cash once per receipt | **Pass** (Pest) |
| Second pay is rejected | **Pass** (Pest) |
| Missing paid-from and missing Accounting validate | **Pass** (Pest) |
| `purchase-orders.pay` required | **Pass** (Pest) |
| Catalog bumps + CatalogSeeder companion | **Pass** (Pest) |

Feature Pest on 2026-10-17: **6 passed** (`PurchaseOrderVendorPaymentTest`, `AccountingModuleVersion190BumpTest`).

---

## Deploy

1. `php artisan migrate --force` (receipt payment columns, permission, catalog bumps). Do not `db:seed`.
2. Confirm `modules.version` for `accounting` is `1.9.0` and `purchase-orders` is `1.6.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: receive a tracked PO → **Pay vendor** → AP open is `$0.00`; convert stays unavailable.
