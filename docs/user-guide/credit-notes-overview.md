# Credit Notes Module

Tenant customer-billing module on the frozen platform — the third Phase 3 (Billing) module, shipped alongside [Invoices](/user-guide/invoices-overview) and [Payments](/user-guide/payments-overview). Issues credit notes against a tenant's own [Invoices](/user-guide/invoices-overview) and, once applied, credits the invoice's `amount_credited` / `balance_due`.

**Hard dependency on Invoices.** Like Payments, Credit Notes declares a **required** `module_dependencies` row on Invoices — a workspace must have Invoices installed before Credit Notes can be enabled from Marketplace.

> **Naming note:** the backend model is `CustomerCreditNote` (table `customer_credit_notes`) — distinct from the platform's own **Central** platform-billing `credit_notes` ledger table (credits the platform issues *to* a tenant against its own module-subscription invoices). This module lets a tenant credit its *own customers*.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [credit-notes.md](/user-guide/credit-notes) |
| Engineers | [credit-notes.md](/developer-guide/credit-notes) |
| Production / ops | [credit-notes.md](/deployment/credit-notes) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [payments-overview.md](/user-guide/payments-overview) |
| Tenant API | [../api/tenant-v1-credit-notes.md](/api/tenant-v1-credit-notes) |

## Capabilities

- Credit note fields: title, required invoice link, optional contact/company link (defaults to the invoice's own contact/company), currency (defaults to the invoice's currency), issue date, notes
- Auto-numbered (`CN-00001`; prefix backed by the `credit_notes_number_prefix` tenant setting, default `CN-` — not yet exposed in the Tenant Settings UI)
- Line items (description, quantity, unit price, tax rate) — subtotal / tax total / total computed server-side, same pattern as Invoices
- Status workflow: `draft → issued → applied`, with `void` available from `draft` or `issued` (`POST /credit-notes/{id}/issue`, `.../apply`, `.../void`) — **applying** a credit note adds its total to the invoice's `amount_credited` and recalculates `balance_due`
- Assignment with assignee scoping via `credit-notes.assign`
- Notes + domain activity timeline (mirrors Invoices/Payments)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:credit-notes`) + Spatie permissions — **free Marketplace opt-in** (Billing category), **requires Invoices**
- Audit + activity logging; assignment notification

## Permissions

`credit-notes.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `issue` · `apply` · `void`

Enable Credit Notes from Marketplace (free) — **Invoices must already be installed**; Marketplace blocks the install otherwise. Catalog: slug `credit-notes`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 30`.

## Related modules

**Required:** [Invoices](/user-guide/invoices-overview) — Credit Notes cannot be installed or created without it. **Optional:** Contacts and Companies (customer pickers only appear/validate when entitled). See [Module Dependencies](/architecture/module-dependencies).

## Explicitly deferred

- Refunding an already-applied credit note (once applied, a credit note is terminal — void is only available before applying)
- Credit note PDF export / e-mail delivery to the customer
- Standalone credit notes not tied to an invoice
- Multi-currency conversion
