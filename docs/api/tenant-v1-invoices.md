# Tenant API v1 — Invoices

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:invoices`, plus permission middleware / policies.

> **Naming:** the model is `CustomerInvoice` — a tenant's invoices to *its own* customers. Central's own platform-billing `Invoice`/`tenant-v1-...` endpoints for subscription invoices are unrelated.

Assignee scoping: without `invoices.assign` (and not superadmin), list/stats/view/update/**send**/**void** only include invoices where `assigned_to` is the current user.

## Stats

### GET `/invoices/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_invoices": 0,
  "my_invoices": 0,
  "draft": 0,
  "sent": 0,
  "partial": 0,
  "paid": 0,
  "void": 0,
  "overdue": 0,
  "outstanding_balance": 0,
  "scope": "org | mine"
}
```

`overdue` / `outstanding_balance` only consider invoices with `status` in `sent`/`partial` and (for `overdue`) `due_date` in the past with `balance_due > 0`.

## Invoices CRUD

### GET `/invoices`

Query: `search` (matches `title` or `number`), `status`, `contact_id`, `company_id`, `assigned_to` (`unassigned` or user id), `my_invoices`, `overdue` (`true`), `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `currency`, `subtotal`/`tax_total`/`total`/`amount_paid`/`amount_credited`/`balance_due`, `issue_date`/`due_date`, `contact`/`company`/`quotation` refs, assignee/creator refs, and `latest_note`.

### POST `/invoices`

Body: `title` (required), `notes`, `currency` (3-letter, default `USD`), `issue_date`, `due_date` (dates), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `quotation_id` (optional, tenant-scoped existence check only), `assigned_to`, `lines` (array of `{ description, quantity, unit_price, tax_rate, sort_order }`).

`subtotal`, `tax_total`, `total`, and `balance_due` are computed server-side from `lines` — do not send them. Status always starts at `draft`; `number` is auto-generated (`INV-00001`, configurable prefix).

### GET `/invoices/{id}`

Includes contact, company, quotation, assignee, creator, lines, notes, and timeline activities.

### PUT `/invoices/{id}`

Partial update of **draft** invoices only. Sending `lines` replaces the full line-item set and recalculates totals. Non-draft invoices return 422 on `status` (`Only draft invoices can be edited.`). Assignment after send uses `POST /invoices/{id}/assign`.

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

Transitions `draft → sent`. Backfills `issue_date` to today if unset. Permission: `invoices.send` (assignee-scoped unless the actor has `invoices.assign` or is superadmin). **Status-only** — does not email or generate a PDF.

### POST `/invoices/{id}/void`

Transitions `draft|sent → void`. **Ledger guard:** rejected with a 422 on `status` (naming the invoice number) if `amount_paid > 0` (void the posted payments first) or `amount_credited > 0` (applied credit notes cannot be reversed, so a credited invoice can never be voided). Since an invoice only reaches `partial` once one of those is non-zero, `Partial → Void` is not an allowed transition at all. Permission: `invoices.void` (assignee-scoped unless the actor has `invoices.assign` or is superadmin).

### POST `/invoices/{id}/status`

`{ "status": "draft"|"sent"|"partial"|"paid"|"void" }`

Authorization depends on the target status:
- `sent` → `invoices.send`
- `void` → `invoices.void`
- other allowed transitions → `invoices.update`

Rejects disallowed transitions with a 422 validation error on `status`. `partial`/`paid` transitions are allowed here for completeness, but in practice are driven by [Payments](/api/tenant-v1-payments) posting/voiding rather than direct user action. Applying a [Credit Note](/api/tenant-v1-credit-notes) credits `amount_credited`/`balance_due` directly and does not go through this endpoint. A `void` target is routed through the same ledger guard as `POST /invoices/{id}/void` (see above) — it is not a bare enum transition. Records a `status_changed` timeline entry (plus a `voided` entry when the target is `void`).

### POST `/invoices/{id}/notes`

`{ "body": string }`

Permission: `invoices.update`.

### GET `/invoices/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `voided`, `deleted`, `restored`).
