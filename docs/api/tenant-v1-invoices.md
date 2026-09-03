# Tenant API v1 — Invoices

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:invoices`, plus permission middleware / policies.

> **Naming:** the model is `CustomerInvoice` — a tenant's invoices to *its own* customers. Central's own platform-billing `Invoice`/`tenant-v1-...` endpoints for subscription invoices are unrelated.

Assignee scoping: without `invoices.assign` (and not superadmin), list/stats/view/update/**send**/**void**/**email** only include invoices where `assigned_to` is the current user.

## Stats

### GET `/invoices/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_invoices": 0,
  "my_invoices": 0,
  "draft": 0,
  "unpaid": 0,
  "paid": 0,
  "cancelled": 0,
  "overdue": 0,
  "outstanding_balance": 0,
  "scope": "org | mine"
}
```

`overdue` / `outstanding_balance` only consider invoices with `status` = `unpaid` and (for `overdue`) `due_date` in the past with `balance_due > 0`.

## Invoices CRUD

### GET `/invoices`

Query: `search` (matches `title` or `number`), `status`, `contact_id`, `company_id`, `assigned_to` (`unassigned` or user id), `my_invoices`, `overdue` (`true`), `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `currency`, `subtotal`/`discount_total`/`tax_total`/`total`/`amount_paid`/`amount_credited`/`balance_due`, `issue_date`/`due_date`, recurrence fields (`is_recurring`, `recurrence_frequency`, `recurrence_status`, `recurrence_next_issue_on`, `recurrence_ends_on`, `recurring_source_invoice_id` / `recurring_source`), `contact`/`company`/`quotation`/`estimate`/`contract` refs, assignee/creator refs, and `latest_note`. Query also accepts `recurring=true` (series roots only).

The SPA may show a **Partial** label when `status` is `unpaid`, `amount_paid > 0`, and `balance_due > 0`. This is UI-only — the API still returns `status: unpaid`; there is no `partial` enum value.

### POST `/invoices`

Body: `title` (required), `notes` (HTML memo, sanitized server-side), `terms_and_conditions` (HTML, sanitized server-side), `currency` (3-letter, default `USD`), `issue_date`, `due_date` (dates), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `quotation_id` (optional, tenant-scoped existence check only), `reseller_id` (optional; requires Resellers entitled — `LinkableReseller`), `assigned_to`, `is_recurring` (boolean), `recurrence_frequency` (`weekly`\|`monthly`\|`quarterly`\|`semi_annually`\|`yearly`, required when recurring), `recurrence_next_issue_on` (date, required when recurring; must be after `issue_date` or today if issue date is empty; the SPA auto-fills one frequency period from the issue date and the client may override it), `recurrence_ends_on` (optional date; must be on or after the next invoice date), `line_discount_type` (`none`\|`percent`\|`fixed`), `lines` (array of `{ product_id?, name, body?, quantity, unit_price, tax_rate, sort_order, discount_value }`). `product_id` is optional and requires the Products module, `products.view` (or superadmin), and an active non-trashed product (`LinkableProduct`). `body` is optional HTML line details. `discount_value` is required on a line when `line_discount_type` is not `none`. The server stores client-sent `name`/`body`/`unit_price` as-is (does not re-copy from the product catalog).

`subtotal`, `discount_total`, `tax_total`, `total`, and `balance_due` are computed server-side from `lines` and document discount — do not send them. Tax is calculated after discounts. Status always starts at `draft`; `number` is auto-generated (`INV-00001`, configurable prefix).

### GET `/invoices/{id}`

Includes contact, company, quotation, estimate, contract, assignee, creator, lines (`product_id`, optional `product` `{id,sku,name}` when loaded, `name`, `body`, `discount_value`), document `line_discount_type` / `discount_total`, `notes`, `terms_and_conditions`, `payment_allocations` (when loaded: allocation `amount` + nested `customer_payment` `{id,uuid,number,status,method,reference,currency,paid_at}`), timeline activities, recurrence fields, and (for an active series root) `latest_unpaid_generated_invoice` `{ id, number, status }` when one exists. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### GET `/invoices/{id}/pdf`

Permission: `invoices.view` (assignee-scoped). Extra limiter `throttle:invoices-pdf` (`INVOICES_PDF_PER_MINUTE`, default 30/user; disabled in tests). Returns `application/pdf` attachment `{number}.pdf`. Body is cached by invoice id + `updated_at` (`INVOICES_PDF_CACHE_SECONDS`, default 300). 404 if the invoice is deleted.

PDF includes sanitized memo HTML, line items, subtotal/discount/tax/total, balance due, and — when posted payments exist — a **Payments received** table (date, payment number, method, reference, amount). Shows a **Partial** chip when unpaid with partial payments. Discount rows appear when `discount_total > 0`.

### PUT `/invoices/{id}`

Partial update of **draft** invoices only. Sending `lines` replaces the full line-item set and recalculates totals (including `line_discount_type` and per-line `discount_value`). Non-draft invoices return 422 on `status` (`Only draft invoices can be edited.`). Assignment after send uses `POST /invoices/{id}/assign`.

### DELETE `/invoices/{id}`

Soft delete. Permission: `invoices.delete`.

### POST `/invoices/{id}/restore`

Permission: `invoices.restore`.

### DELETE `/invoices/{id}/force`

Permanently delete a soft-deleted invoice. Permission: `invoices.force.delete` (owner/superadmin only by default).

## Actions

### POST `/invoices/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `invoices.assign`.

### POST `/invoices/{id}/send`

Transitions `draft → unpaid`. Backfills `issue_date` to today if unset. Permission: `invoices.send` (assignee-scoped unless the actor has `invoices.assign` or is superadmin). **Status-only** — does not email the customer. Recurring drafts become an **active** series. `recurrence_next_issue_on` stays the date chosen on the draft when it is after the issue date; otherwise it becomes one frequency period after the issue date.

### POST `/invoices/{id}/email`

`{ "to"?: string[], "cc"?: string[], "bcc"?: string[], "subject": string, "message": string, "attach_pdf"?: boolean }`

Permission: `invoices.send` (assignee-scoped unless the actor has `invoices.assign` or is superadmin). Throttle: `billing-document-email` (10/min per user).

Requires the invoice to already be sent — allowed statuses: `unpaid`, `partial` (display-only; stored as `unpaid`), `paid`. Draft and `cancelled` return 422 on `status` (`Send the document before emailing.`).

When `to` is omitted, resolves the recipient from the linked contact email, then company email. If no address is found, returns 422 on `to`.

Queues a branded email via the tenant mailer (optional PDF attachment from `CustomerInvoicePdfService`). Records an `emailed` timeline entry and a tenant email log row (`notification_type`: `customer_invoice.emailed`).

### POST `/invoices/{id}/recurrence/stop`

`{ "void_latest_unpaid": boolean }` (optional, default false)

Permission: `invoices.update`. Only valid on the **series root** while `recurrence_status=active`. Sets status to `ended`. When `void_latest_unpaid` is true, also cancels the latest generated draft/unpaid occurrence with zero paid/credited (requires `invoices.void` on that occurrence). Does not cancel the original invoice or paid history.

### POST `/invoices/{id}/void`

Transitions `draft|unpaid → cancelled`. **Ledger guard:** rejected with a 422 on `status` (naming the invoice number) if `amount_paid > 0` (void the posted payments first) or `amount_credited > 0` (refund applied credit notes first). Permission: `invoices.void` (assignee-scoped unless the actor has `invoices.assign` or is superadmin).

### POST `/invoices/{id}/status`

`{ "status": "draft"|"unpaid"|"paid"|"cancelled" }`

Authorization depends on the target status:
- `unpaid` → `invoices.send`
- `cancelled` → `invoices.void`
- other allowed transitions → `invoices.update`

Rejects disallowed transitions with a 422 validation error on `status`. `paid` transitions are allowed here for completeness, but in practice are driven by [Payments](/api/tenant-v1-payments) posting/voiding rather than direct user action. Applying a [Credit Note](/api/tenant-v1-credit-notes) credits `amount_credited`/`balance_due` and keeps or clears status via balance helpers. A `cancelled` target is routed through the same ledger guard as `POST /invoices/{id}/void` (see above) — it is not a bare enum transition. Records a `status_changed` timeline entry (plus a `voided` activity entry when cancelling).

### POST `/invoices/{id}/notes`

`{ "body": string }`

Permission: `invoices.update`.

### GET `/invoices/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `voided`, `deleted`, `restored`, `recurrence_started`, `recurrence_stopped`, `recurrence_generated`, `emailed`).
