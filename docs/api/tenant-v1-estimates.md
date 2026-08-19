# Tenant API v1 — Estimates

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:estimates`, plus permission middleware / policies.

Requires the **Invoices** module (hard `module_dependencies` row) — Marketplace blocks installing Estimates on a workspace that doesn't already have Invoices, since converting an estimate always creates a `CustomerInvoice`.

Assignee scoping: without `estimates.assign` (and not superadmin), list/stats/view/update/**send**/**accept**/**convert** only include estimates where `assigned_to` is the current user.

## Stats

### GET `/estimates/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_estimates": 0,
  "my_estimates": 0,
  "draft": 0,
  "sent": 0,
  "accepted": 0,
  "rejected": 0,
  "expired": 0,
  "accepted_value": 0,
  "converted": 0,
  "scope": "org | mine"
}
```

`accepted_value` sums `total` across estimates with `status = accepted`. `converted` counts estimates that already have a linked `CustomerInvoice`.

## Estimates CRUD

### GET `/estimates`

Query: `search` (matches `title` or `number`), `status` (`draft`\|`sent`\|`accepted`\|`rejected`\|`expired`), `contact_id`, `company_id`, `quotation_id`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_estimates`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `currency`, `subtotal`/`discount_total`/`tax_total`/`total`, `issue_date`, `valid_until`, `contact`/`company`/`opportunity`/`quotation` refs, `converted_invoice` ref (`number`/`status`) when present, assignee/creator refs, and `latest_note`.

### POST `/estimates`

Body: `title` (required), `notes` (HTML memo, sanitized server-side), `terms_and_conditions` (HTML, sanitized server-side), `currency` (3-letter, default `USD`), `valid_until` (date), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `quotation_id`, `opportunity_id` (optional, tenant-scoped existence checks), `assigned_to`, `line_discount_type` (`none`\|`percent`\|`fixed`), `lines` (array of `{ product_id?, name, body?, quantity, unit_price, tax_rate, sort_order, discount_value }`). `product_id` is optional and requires the Products module, `products.view` (or superadmin), and an active non-trashed product (`LinkableProduct`). `body` is optional HTML line details. `discount_value` is required on a line when `line_discount_type` is not `none`. The server stores client-sent `name`/`body`/`unit_price` as-is (does not re-copy from the product catalog).

`subtotal`, `discount_total`, `tax_total`, and `total` are computed server-side from `lines` and document discount — do not send them. Tax is calculated after discounts. Status always starts at `draft`; `number` is auto-generated (`EST-00001`, configurable via the `estimates_number_prefix` tenant setting).

### GET `/estimates/{id}`

Includes contact, company, opportunity, quotation, converted invoice, assignee, creator, lines (`product_id`, optional `product` `{id,sku,name}` when loaded, `name`, `body`, `discount_value`), document `line_discount_type` / `discount_total`, `notes`, `terms_and_conditions`, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### GET `/estimates/{id}/pdf`

Permission: `estimates.view` (assignee-scoped). Extra limiter `throttle:estimates-pdf`. Returns `application/pdf` attachment. Branded layout matches invoices (logo, button color, company profile). Includes sanitized memo HTML, line items, and discount/tax/total breakdown.

### PUT `/estimates/{id}`

Partial update of **draft** estimates only — including replacing the full `lines` set (recalculates totals from `line_discount_type` and per-line `discount_value`). Non-draft estimates return 422 on `status` (`Only draft estimates can be edited.`). Assignment after send uses `POST /estimates/{id}/assign`.

### DELETE `/estimates/{id}`

Soft delete. Permission: `estimates.delete`.

### POST `/estimates/{id}/restore`

Permission: `estimates.restore`.

### DELETE `/estimates/{id}/force`

Permanently delete a soft-deleted estimate. Permission: `estimates.force.delete` (owner/superadmin only by default).

## Actions

### POST `/estimates/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `estimates.assign`.

### POST `/estimates/{id}/send`

Transitions `draft → sent`. Backfills `issue_date` to today if unset. Permission: `estimates.send` (assignee-scoped unless the actor has `estimates.assign` or is superadmin). **Status-only** — does not email or generate a PDF.

### POST `/estimates/{id}/accept`

Transitions `sent → accepted`. Permission: `estimates.accept` (assignee-scoped unless the actor has `estimates.assign` or is superadmin).

### POST `/estimates/{id}/status`

`{ "status": "draft"|"sent"|"accepted"|"rejected"|"expired" }`

Authorization depends on the target status:
- `sent` → `estimates.send`
- `accepted` → `estimates.accept`
- other allowed transitions (e.g. `rejected`, `expired`) → `estimates.update`

Rejects disallowed transitions (including re-sending an already-`sent` estimate) with a 422 validation error on `status`. Records a `status_changed` timeline entry.

### POST `/estimates/{id}/convert`

Converts a **sent** or **accepted** estimate into a **draft** `CustomerInvoice`:

- Requires the **Invoices** module to be entitled (soft, call-time check in addition to the hard Marketplace dependency). Returns 422 if Invoices is not installed.
- Creates the invoice with the estimate's `title`, `notes`, `terms_and_conditions`, `currency`, `line_discount_type`, `contact_id`, `company_id`, `quotation_id`, `assigned_to`, and a copy of every line item (`name`, `body`, `discount_value`, quantities/prices/tax)
- Sets `customer_invoices.estimate_id` on create (unique nullable column — one-shot at the database)
- Transitions the estimate to `accepted` if it wasn't already
- Records a `converted` activity on the estimate
- Serializes with `lockForUpdate` on the estimate (and linked quotation when present)

Permission: `estimates.convert` (assignee-scoped unless the actor has `estimates.assign` or is superadmin). Rejects with a 422 on `status` if the estimate is `draft`/`rejected`/`expired`, if it has already been converted (including soft-deleted invoices — restore or force-delete to recover), or if the estimate’s linked quotation already has any invoice (`QuotationInvoiceGuard`). Returns the created **invoice** (`CustomerInvoiceResource`), not an estimate, with HTTP 201.

### POST `/estimates/{id}/notes`

`{ "body": string }`

Permission: `estimates.update`.

### GET `/estimates/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `converted`, `note_added`, `deleted`, `restored`).
