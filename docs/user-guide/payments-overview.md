# Payments Module

Tenant customer-billing module on the frozen platform — the second Phase 3 (Billing) module, shipped alongside [Invoices](/user-guide/invoices-overview). Records payments a tenant receives from its own customers and allocates them against outstanding [Invoices](/user-guide/invoices-overview), driving the invoice's `amount_paid` / `balance_due` / status forward.

**Hard dependency on Invoices.** Unlike Invoices (which installs standalone), Payments declares a **required** `module_dependencies` row on Invoices — a workspace must have Invoices installed before Payments can be enabled from Marketplace.

> **Naming note:** the backend model is `CustomerPayment` (table `customer_payments`) — distinct from the platform's own **Central Billing → Payments** ledger (subscription payments the platform charges *tenants* for their module licenses). This module records payments a tenant receives *from its own customers*.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [payments.md](/user-guide/payments) |
| Engineers | [payments.md](/developer-guide/payments) |
| Production / ops | [payments.md](/deployment/payments) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [invoices-overview.md](/user-guide/invoices-overview) |
| Tenant API | [../api/tenant-v1-payments.md](/api/tenant-v1-payments) |

## Capabilities

- Payment fields: amount, currency, method (`cash`, `bank_transfer`, `cheque`, `card_manual`, `other`), paid-at date, reference, notes, optional contact/company link, optional `deposit_account_id` (Accounting soft dep)
- Auto-numbered (`PAY-00001`; prefix backed by the `payments_number_prefix` tenant setting, default `PAY-` — not yet exposed in the Tenant Settings UI)
- Allocations — split a payment's amount across one or more invoices (`customer_invoice_id` + `amount` per row); stored on draft but only applied to invoice balances once **posted**
- Status workflow: `draft → posted → void` (`POST /payments/{id}/post`, `.../void`) — posting a payment adds each allocation to its invoice's `amount_paid` and recalculates the invoice balance/status; when Accounting is installed, also posts Dr deposit / Cr AR; voiding reverses allocations and voids the linked journal
- Assignment with assignee scoping via `payments.assign`
- Notes + domain activity timeline (mirrors Invoices)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:payments`) + Spatie permissions — **free Marketplace opt-in** (Billing category), **requires Invoices**; optional soft dep on Accounting
- Audit + activity logging; assignment notification

## Permissions

`payments.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `post` · `void`

Enable Payments from Marketplace (free) — **Invoices must already be installed**; Marketplace blocks the install otherwise. Catalog: slug `payments`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 20`. Version **1.1.0**.

## Related modules

**Required:** [Invoices](/user-guide/invoices-overview) — Payments cannot be installed or record allocations without it. **Optional:** Contacts and Companies (customer pickers only appear/validate when entitled); [Accounting](/user-guide/accounting-overview) for deposit accounts + auto-journals. See [Module Dependencies](/architecture/module-dependencies).

## Explicitly deferred

- Partial refunds of a posted payment (today, voiding reverses the full allocation set)
- Payment receipt PDF export / e-mail delivery to the customer
- Payment gateway capture (online card/bank payments) — this module only records payments received through other channels
- Multi-currency conversion
