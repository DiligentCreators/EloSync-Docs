# Tenant API v1 — Quotations

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:quotations`, plus permission middleware / policies.

Assignee scoping: without `quotations.assign` (and not superadmin), list/stats/view/update/**send**/**accept**/**convert** only include quotations where `assigned_to` is the current user.

## Stats

### GET `/quotations/stats`

Same filters as list (minus pagination/sort).

## Quotations CRUD

### GET `/quotations`

Query: `search`, `status`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_quotations`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `status`, `opportunity`, assignee/creator refs, `subtotal`/`discount_total`/`tax_total`/`total`, `converted_invoice` ref (`number`/`status`) when present, and `latest_note`.

### POST `/quotations`

Body: `opportunity_id` (required), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated), `title` (required), `notes` (HTML memo, sanitized server-side), `terms_and_conditions` (HTML, sanitized server-side), `currency` (3-letter, default `USD`), `valid_until` (date), `assigned_to`, `line_discount_type` (`none`\|`percent`\|`fixed`), `lines` (array of `{ product_id?, name, body?, quantity, unit_price, tax_rate, sort_order, discount_value }`). `product_id` is optional and requires the Products module, `products.view` (or superadmin), and an active non-trashed product (`LinkableProduct`). `body` is optional HTML line details. `discount_value` is required on a line when `line_discount_type` is not `none`. The server stores client-sent `name`/`body`/`unit_price` as-is (does not re-copy from the product catalog).

`subtotal`, `discount_total`, `tax_total`, and `total` are computed server-side from `lines` and `line_discount_type` — do not send them. Tax is calculated after line discounts. `discount_total` is the sum of line discounts only.

### GET `/quotations/{id}`

Includes opportunity, assignee, creator, lines (`product_id`, optional `product` `{id,sku,name}` when loaded, `name`, `body`, `discount_value`), document `line_discount_type` / `discount_total`, `notes`, `terms_and_conditions`, `converted_invoice` when present, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### GET `/quotations/{id}/pdf`

Permission: `quotations.view` (assignee-scoped). Extra limiter `throttle:quotations-pdf`. Returns `application/pdf` attachment. Branded layout matches invoices (logo, button color, company profile). Includes sanitized memo HTML, line items, and discount/tax/total breakdown.

### PUT `/quotations/{id}`

Partial update of **draft** quotations only. Sending `lines` replaces the full line-item set and recalculates totals (including `line_discount_type` and per-line `discount_value`). Non-draft quotations return 422 on `status` (`Only draft quotations can be edited.`). Assignment after send uses `POST /quotations/{id}/assign`.

### DELETE `/quotations/{id}`

Soft delete. Permission: `quotations.delete`.

### POST `/quotations/{id}/restore`

Permission: `quotations.restore`.

### DELETE `/quotations/{id}/force`

Permanently delete a soft-deleted quotation. Permission: `quotations.force.delete`.

## Actions

### POST `/quotations/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `quotations.assign`.

### POST `/quotations/{id}/send`

Transitions `draft → sent`. Permission: `quotations.send` (assignee-scoped unless the actor has `quotations.assign` or is superadmin). **Status-only** — does not email or generate a PDF.

### POST `/quotations/{id}/accept`

Transitions `sent → accepted`. Permission: `quotations.accept` (assignee-scoped unless the actor has `quotations.assign` or is superadmin).

### POST `/quotations/{id}/convert`

Converts a **sent** or **accepted** quotation into a **draft** `CustomerInvoice`:

- Requires the **Invoices** module to be entitled (soft, call-time check — no `module_dependencies` row). Returns 422 if Invoices is not installed.
- Creates the invoice with the quotation's `title`, `notes`, `terms_and_conditions`, `currency`, `line_discount_type`, `contact_id`, `company_id`, `assigned_to`, and a copy of every line item
- Sets `customer_invoices.quotation_id` on the new invoice
- Transitions the quotation to `accepted` if it wasn't already
- Records a `converted` activity on the quotation

Permission: `quotations.convert` (assignee-scoped unless the actor has `quotations.assign` or is superadmin). Rejects with a 422 if the quotation is not sent/accepted, or if any invoice (including soft-deleted) already has this `quotation_id` — one-shot, including invoices created from a linked estimate or contract. Soft-deleted invoices still block convert; the error message tells operators to restore or permanently delete the invoice. Concurrent converts are serialized with `lockForUpdate` on the quotation row. Returns the created **invoice** (`CustomerInvoiceResource`), not a quotation, with HTTP 201.

### POST `/quotations/{id}/status`

`{ "status": "draft"|"sent"|"accepted"|"rejected"|"expired" }`

Authorization depends on the target status:
- `sent` → `quotations.send`
- `accepted` → `quotations.accept`
- other allowed transitions (e.g. `rejected`, `expired`) → `quotations.update`

Rejects disallowed transitions (including re-sending an already-`sent` quotation) with a 422 validation error on `status`. Records a `status_changed` timeline entry.

### POST `/quotations/{id}/notes`

`{ "body": string }`

Permission: `quotations.update`.

### GET `/quotations/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `converted`, `note_added`, `deleted`, `restored`).
