# Reseller Payouts — Production Guide

## Licensing

- Catalog slug: `reseller-payouts`
- Category: `sales` (**Sales**), `category_sort_order = 20`, module `sort_order = 80`
- **Free Marketplace opt-in** (`is_default_included = false`, `is_billable = false`, price `0`)
- Hard dependency: **Resellers** (which itself requires **Payments**)
- Marketplace blocks install until Resellers is entitled

## Bootstrap

1. Ensure Resellers (and Payments) are entitled first
2. Enable Reseller Payouts from Marketplace
3. Permissions via `2026_08_06_100007_add_reseller_payouts_permissions`

Without Reseller Payouts entitlement, invoice Paid transitions do **not** create commission rows (listeners no-op after entitlement check).

## Schema migrations

| Migration | Purpose |
|-----------|---------|
| `2026_08_06_100002_create_reseller_commission_entries_table` | ledger + unique `(customer_invoice_id, party)` |
| `2026_08_06_100006_register_reseller_payouts_module` | catalog via `DefaultModuleRegistrar` |
| `2026_08_06_100008_add_reseller_payouts_resellers_dependency` | hard dep → resellers |

## Event wiring

`AppServiceProvider`:

- `CustomerInvoiceBecamePaid` → `AccrueResellerCommission`
- `CustomerInvoiceLeftPaid` → `VoidResellerCommission`

Transitions are dispatched from `CustomerInvoicePaidTransitions` after invoice status recalculation (Payments post/void paths included).

## Monitoring

- Spatie activity log name: `reseller_commission_entries`
- Track accrue/approve/pay/void volume via application logs / Nightwatch as needed

## Deploy checklist

1. Migrate commission table + catalog + permissions + Resellers dependency
2. Confirm `module:reseller-payouts` + `reseller-payouts.*` on admin/manager/staff/reseller maps
3. Confirm listeners registered in deployed app container
4. Smoke: Paid invoice with `reseller_id` → two accrued rows → approve → pay; void invoice payment → entries voided; re-post payment → entries revived to accrued
5. Confirm Partial invoices do **not** accrue

## Deferred

No automated disbursement gateway in Phase 1 — `pay` is ledger status only. Cross-workspace identity for parties remains deferred.
