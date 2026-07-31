# Estimates Module

Tenant customer-billing module on the frozen platform — the fourth Phase 3 (Billing) module, shipped alongside [Invoices](/user-guide/invoices-overview), [Payments](/user-guide/payments-overview), and [Credit Notes](/user-guide/credit-notes-overview). Lets a tenant issue pre-sale cost estimates to a contact/company, optionally tied to an Opportunity or Quotation, and **convert** an accepted estimate straight into a draft [Invoice](/user-guide/invoices-overview).

**Hard dependency on Invoices.** Like Payments and Credit Notes, Estimates declares a **required** `module_dependencies` row on Invoices — a workspace must have Invoices installed before Estimates can be enabled from Marketplace (the conversion action always needs a place to create the resulting invoice).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [estimates.md](/user-guide/estimates) |
| Engineers | [estimates.md](/developer-guide/estimates) |
| Production / ops | [estimates.md](/deployment/estimates) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [quotations-overview.md](/user-guide/quotations-overview), [invoices-overview.md](/user-guide/invoices-overview) |
| Tenant API | [../api/tenant-v1-estimates.md](/api/tenant-v1-estimates) |

## Capabilities

- Estimate fields: title, optional contact/company link, optional opportunity/quotation link, currency, valid-until date, notes
- Auto-numbered (`EST-00001`; prefix backed by the `estimates_number_prefix` tenant setting, default `EST-` — not yet exposed in the Tenant Settings UI)
- Line items (description, quantity, unit price, tax rate) — subtotal / tax total / total computed server-side, same pattern as Invoices/Quotations
- Status workflow: `draft → sent → accepted | rejected | expired` (`POST /estimates/{id}/send`, `.../accept`, `.../status`)
- **Convert to invoice** (`POST /estimates/{id}/convert`) — creates a draft `CustomerInvoice` with the estimate's lines, links it back via `estimate_id`, and marks the estimate **Accepted** if it wasn't already. One-way and one-time per estimate.
- Assignment with assignee scoping via `estimates.assign`
- Notes + domain activity timeline (mirrors Invoices/Quotations)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:estimates`) + Spatie permissions — **free Marketplace opt-in** (Billing category), **requires Invoices**
- Audit + activity logging; assignment notification

## Permissions

`estimates.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `send` · `accept` · `convert`

Enable Estimates from Marketplace (free) — **Invoices must already be installed**; Marketplace blocks the install otherwise. Catalog: slug `estimates`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 40`.

## Related modules

**Required:** [Invoices](/user-guide/invoices-overview) — Estimates cannot be installed, or converted, without it. **Optional:** Contacts, Companies, Opportunities, and Quotations (pickers only appear/validate when entitled). See [Module Dependencies](/architecture/module-dependencies).

## Explicitly deferred

- Estimate PDF export / e-mail delivery to the customer
- Re-converting or reversing a converted estimate (conversion is one-way, one-time)
- Multi-currency conversion
- Approval workflow beyond the status enum
