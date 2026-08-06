# Reseller Payouts Module

Phase 1 Sales companion to [Resellers](/user-guide/resellers-overview). Maintains a **commission ledger** (`reseller_commission_entries`) with two parties per paid invoice — reseller and owner — and an accrued → approved → paid (or void) workflow.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [reseller-payouts.md](/user-guide/reseller-payouts) |
| Engineers | [reseller-payouts.md](/developer-guide/reseller-payouts) |
| Production / ops | [reseller-payouts.md](/deployment/reseller-payouts) |
| Related module | [Resellers](/user-guide/resellers-overview) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [../api/tenant-v1-reseller-payouts.md](/api/tenant-v1-reseller-payouts) |

## Capabilities

- Accrues **two** ledger rows when a customer invoice with `reseller_id` becomes fully **Paid**
- Parties: `reseller` (rate = reseller `commission_rate`) and `owner` (rate = reseller `owner_commission_rate`)
- Status workflow: `accrued` → `approved` → `paid`; `void` from accrued/approved (not from paid)
- Auto-void non-paid entries when an invoice **leaves** Paid status
- List/stats with search, status, party, and reseller filters
- Module licensing (`module:reseller-payouts`) + Spatie permissions — **free Marketplace opt-in**

## Permissions

`reseller-payouts.view` · `approve` · `pay` · `void`

Catalog: slug `reseller-payouts`, category `sales` (Sales), `is_default_included = false`, `is_billable = false`, `sort_order = 80`. Hard dependency: **Resellers**.

## Commission formula

For invoice total `T`, reseller rate `R%`, owner rate `O%`:

- Reseller amount = `round(T × R / 100, 2)`
- Owner amount = `round((T − reseller amount) × O / 100, 2)`

Accrual is idempotent via unique `(customer_invoice_id, party)`.

## Required dependency

Reseller Payouts **requires Resellers**. Install Resellers (and therefore Payments) first.

## Explicitly deferred

- Cross-workspace identity for payout parties
- Automated bank / Stripe Connect disbursement
- Partial payment commission (accural is **fully Paid only**, not Partial)
- Recalculation when commission rates change after accrual
