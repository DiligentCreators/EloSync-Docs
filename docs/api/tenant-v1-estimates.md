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

List items include `status`, `currency`, `subtotal`/`tax_total`/`total`, `issue_date`, `valid_until`, `contact`/`company`/`opportunity`/`quotation` refs, `converted_invoice` ref (`number`/`status`) when present, assignee/creator refs, and `latest_note`.

### POST `/estimates`

Body: `title` (required), `notes`, `currency` (3-letter, default `USD`), `valid_until` (date), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `quotation_id`, `opportunity_id` (optional, tenant-scoped existence checks), `assigned_to`, `lines` (array of `{ description, quantity, unit_price, tax_rate, sort_order }`).

`subtotal`, `tax_total`, and `total` are computed server-side from `lines` — do not send them. Status always starts at `draft`; `number` is auto-generated (`EST-00001`, configurable via the `estimates_number_prefix` tenant setting).

### GET `/estimates/{id}`

Includes contact, company, opportunity, quotation, converted invoice, assignee, creator, lines, notes, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/estimates/{id}`

Partial update of **draft** estimates only — including replacing the full `lines` set (recalculates totals). Non-draft estimates return 422 on `status` (`Only draft estimates can be edited.`). Assignment after send uses `POST /estimates/{id}/assign`.

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

- Creates the invoice with the estimate's `title`, `notes`, `currency`, `contact_id`, `company_id`, `quotation_id`, `assigned_to`, and a copy of every line item
- Sets `customer_invoices.estimate_id` on the new invoice
- Transitions the estimate to `accepted` if it wasn't already
- Records a `converted` activity on the estimate

Permission: `estimates.convert` (assignee-scoped unless the actor has `estimates.assign` or is superadmin). Rejects with a 422 on `status` if the estimate is `draft`/`rejected`/`expired`, or if it has already been converted (an estimate converts at most once). Returns the created **invoice** (`CustomerInvoiceResource`), not an estimate, with HTTP 201.

### POST `/estimates/{id}/notes`

`{ "body": string }`

Permission: `estimates.update`.

### GET `/estimates/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `converted`, `note_added`, `deleted`, `restored`).
