# Reseller Payouts — Developer Guide

Phase 1 Sales companion. Slug `reseller-payouts`, middleware `module:reseller-payouts`, permissions `reseller-payouts.*`. Hard catalog dependency on **Resellers**. Partner directory: [Resellers](/developer-guide/resellers).

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/ResellerCommissionEntry.php` |
| Enums | `ResellerCommissionPartyEnum` (`reseller` \| `owner`), `ResellerCommissionStatusEnum` (`accrued` \| `approved` \| `paid` \| `void`) |
| Service | `app/Services/Tenant/ResellerCommissionService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ResellerCommissionEntryController.php` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Reseller/*CommissionEntry*` |
| Policy | `app/Policies/ResellerCommissionEntryPolicy.php` |
| Accrue listener | `app/Listeners/AccrueResellerCommission.php` ← `CustomerInvoiceBecamePaid` |
| Void listener | `app/Listeners/VoidResellerCommission.php` ← `CustomerInvoiceLeftPaid` |
| Transition helper | `app/Support/Billing/CustomerInvoicePaidTransitions.php` |
| Tests | `tests/Feature/Tenant/Reseller/ResellerCommissionTest.php` |

Registered in `AppServiceProvider` (`Event::listen` for both Paid enter/leave events).

## Accrual rules

`ResellerCommissionService::accrueForPaidInvoice`:

1. Skip if `invoice.reseller_id` is null
2. Skip if tenant lacks `reseller-payouts` entitlement
3. Skip if reseller row missing
4. Compute cuts from **current** reseller rates and invoice `total`:

```text
resellerCut = round(total * (commission_rate / 100), 2)
ownerCut    = round((total - resellerCut) * (owner_commission_rate / 100), 2)
```

5. `ensurePartyEntry` on `(customer_invoice_id, party)` — creates accrued rows, or **revives** void rows with refreshed amounts/rates (clears approve/pay/void metadata). Existing non-void rows are left unchanged (idempotent).
6. Initial status `accrued`; currency from invoice (default `USD`)

**Fully Paid only** — listeners fire when status transitions **into** `CustomerInvoiceStatusEnum::Paid` (not Partial). Leaving Paid runs `voidForInvoice`, which bulk-voids **every** non-void row for that invoice (including `paid`). Re-paying the invoice revives those void rows. The manual `void()` API still rejects entries already in `paid`.

## Workflow guards

| Method | Rule |
|--------|------|
| `approve` | status must be `accrued` |
| `pay` | status must be `approved` |
| `void` | not already `void`; cannot void `paid` |

## Assignee / visibility scoping

List/stats/view (policy + query): without `resellers.assign` and not superadmin → `party_user_id = actor` **or** reseller’s `user_id = actor`. Approve/pay/void are permission-only (not scoped to assignee).

## Permissions

```
reseller-payouts.view | approve | pay | void
```

Default map: admin (all four); manager (view + approve); staff/reseller (view).

## API (tenant)

Base: `/api/tenant/v1` — [tenant-v1-reseller-payouts.md](/api/tenant-v1-reseller-payouts).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/reseller-commission-entries` | view |
| GET | `/reseller-commission-entries/stats` | view |
| GET | `/reseller-commission-entries/{id}` | view |
| POST | `/reseller-commission-entries/{id}/approve` | approve |
| POST | `/reseller-commission-entries/{id}/pay` | pay |
| POST | `/reseller-commission-entries/{id}/void` | void |

## Frontend

Phase 1 is backend API. SPA should follow the Leads/Vendors list + action pattern under Sales when shipped (`module: 'reseller-payouts'`, `permission: reseller-payouts.view`).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Reseller/ResellerCommissionTest.php
```

## Logging

Spatie `LogsActivity` on `ResellerCommissionEntry` (log name `reseller_commission_entries`).

## Deferred

- Cross-workspace identity for parties
- Gateway disbursement / Connect payouts
- Accrual on Partial status
- Rate change recalculation after accrue
