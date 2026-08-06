# Tenant API v1 — Reseller Payouts

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:reseller-payouts`, plus permission middleware / policies.

Resource path prefix: `/reseller-commission-entries`.

Visibility: without `resellers.assign` (and not superadmin), list/stats/view are limited to rows where `party_user_id` is the current user, or the parent reseller’s linked `user_id` is the current user.

## Stats

### GET `/reseller-commission-entries/stats`

Same filters as list (minus pagination/sort). Payload:

`total`, `accrued`, `approved`, `paid`, `void`, `accrued_amount`, `approved_amount`, `paid_amount`, `scope` (`org`|`mine`).

## List & show

### GET `/reseller-commission-entries`

Query: `search` (reseller name/email/company_name or invoice number/title), `status` (`accrued`|`approved`|`paid`|`void`), `party` (`reseller`|`owner`), `reseller_id`, `sort`, `direction`, `page`, `per_page`.

Permission: `reseller-payouts.view`.

### GET `/reseller-commission-entries/{id}`

Includes `reseller`, `customer_invoice`, and `party_user` when loaded.

Permission: `reseller-payouts.view`.

## Actions

### POST `/reseller-commission-entries/{id}/approve`

Accrued → approved. Sets `approved_at` / `approved_by`.

Permission: `reseller-payouts.approve`. Validation error if not accrued.

### POST `/reseller-commission-entries/{id}/pay`

Approved → paid. Sets `paid_at` / `paid_by`.

Permission: `reseller-payouts.pay`. Validation error if not approved.

### POST `/reseller-commission-entries/{id}/void`

→ void (from accrued or approved). Sets `voided_at` / `voided_by`.

Permission: `reseller-payouts.void`. Rejects already void or **paid** status.

## Accrual (event-driven; no create endpoint)

There is no public create endpoint. Rows are inserted by `ResellerCommissionService::accrueForPaidInvoice` when `CustomerInvoiceBecamePaid` fires, if:

- invoice has `reseller_id`
- tenant is entitled to `reseller-payouts`
- reseller exists

Formula (per invoice total `T`):

- reseller amount = `round(T × commission_rate / 100, 2)`
- owner amount = `round((T − reseller amount) × owner_commission_rate / 100, 2)`

Idempotent unique key: `(customer_invoice_id, party)`.

Leaving Paid (`CustomerInvoiceLeftPaid`) calls `voidForInvoice`, which voids every non-void entry for that invoice. If the invoice becomes Paid again, accrual **revives** those void rows with refreshed snapshot amounts (same unique `(customer_invoice_id, party)` keys).
