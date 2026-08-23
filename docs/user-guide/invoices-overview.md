# Invoices Module

Tenant customer-billing module on the frozen platform — the first Phase 3 (Billing) module. Mirrors the [Quotations](/user-guide/quotations-overview) / [Contracts](/user-guide/contracts-overview) notes/timeline/assignment pattern, extended with a status-driven balance (`amount_paid`, `amount_credited`, `balance_due`) that the [Payments](/user-guide/payments-overview) and [Credit Notes](/user-guide/credit-notes-overview) modules now drive.

**No hard dependency.** Unlike Quotations/Contracts (which require Opportunities), Invoices has **no required `module_dependencies` row** — it can be installed on its own. Contact, Company, and Quotation links are all optional and only validated when their module is entitled.

> **Naming note:** the backend model is `CustomerInvoice` (table `customer_invoices`) — distinct from the platform's own Central billing `Invoice` model (subscription invoices the platform sends *to* tenants). This module lets a tenant bill *its own* customers.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [invoices.md](/user-guide/invoices) |
| Engineers | [invoices.md](/developer-guide/invoices) |
| Production / ops | [invoices.md](/deployment/invoices) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [quotations.md](/user-guide/quotations-overview) |
| Tenant API | [../api/tenant-v1-invoices.md](/api/tenant-v1-invoices) |

## Capabilities

- Invoice fields: title, optional contact/company link, optional quotation / estimate / contract links, currency, issue date, due date, notes
- Recurring series (weekly / monthly / quarterly / semi-annually / yearly). **Next invoice date** auto-fills from the issue date plus frequency and can be overridden; later drafts follow the frequency from that date. **Stop recurring** ends the series without voiding history
- Download invoice PDF (workspace-branded from Settings → Branding: color, logo, company profile, bank details)
- **Email customer** after Send (`POST /invoices/{id}/email`, `invoices.send`) — optional PDF attachment; default recipient from linked contact/company; records `emailed` timeline + tenant email log
- Auto-numbered (`INV-00001`; prefix backed by the `invoices_number_prefix` tenant setting, default `INV-` — editable under **Settings → General → Document number prefixes**)
- Line items (description, quantity, unit price, tax rate) — subtotal / tax total / total computed server-side
- Balance tracking: `amount_paid`, `amount_credited`, `balance_due` (read-only via this API — `amount_paid`/`balance_due` are populated by [Payments](/user-guide/payments-overview); `amount_credited`/`balance_due` are populated by [Credit Notes](/user-guide/credit-notes-overview))
- Status workflow: `draft → unpaid → paid | cancelled` (`POST /invoices/{id}/send`, `.../void` cancels, `.../status`) — `paid` is set automatically as Payments clear the balance; partial payments stay `unpaid`
- Assignment with assignee scoping via `invoices.assign`
- Notes + domain activity timeline (mirrors Quotations)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:invoices`) + Spatie permissions — **free Marketplace opt-in** (Billing category)
- Audit + activity logging; assignment notification

## Permissions

`invoices.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `send` · `void`

Enable Invoices from Marketplace (free) — no other module is required first. Catalog: slug `invoices`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.8.0**.

## Related modules

**No hard dependency.** **Optional:** Contacts and Companies (customer pickers only appear/validate when entitled), Quotations (an invoice may optionally reference the quotation it was generated from), [Accounting](/user-guide/accounting-overview) (soft: **Send** posts Dr AR / Cr Revenue). [Payments](/user-guide/payments-overview) and [Credit Notes](/user-guide/credit-notes-overview) both hard-depend on Invoices (not the other way around). See [Module Dependencies](/architecture/module-dependencies).

## Explicitly deferred

- Multi-currency conversion
