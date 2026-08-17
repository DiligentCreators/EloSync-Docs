# Tenant API v1 — Quotations

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:quotations`, plus permission middleware / policies.

Assignee scoping: without `quotations.assign` (and not superadmin), list/stats/view/update/**send**/**accept** only include quotations where `assigned_to` is the current user.

## Stats

### GET `/quotations/stats`

Same filters as list (minus pagination/sort).

## Quotations CRUD

### GET `/quotations`

Query: `search`, `status`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_quotations`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `status`, `opportunity`, assignee/creator refs, totals, and `latest_note`.

### POST `/quotations`

Body: `opportunity_id` (required), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated), `title` (required), `notes`, `currency` (3-letter, default `USD`), `valid_until` (date), `assigned_to`, `lines` (array of `{ description, quantity, unit_price, tax_rate, sort_order }`).

`subtotal`, `tax_total`, and `total` are computed server-side from `lines` — do not send them.

### GET `/quotations/{id}`

Includes opportunity, assignee, creator, lines, notes, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/quotations/{id}`

Partial update of **draft** quotations only. Sending `lines` replaces the full line-item set and recalculates totals. Non-draft quotations return 422 on `status` (`Only draft quotations can be edited.`). Assignment after send uses `POST /quotations/{id}/assign`.

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

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `deleted`, `restored`).
