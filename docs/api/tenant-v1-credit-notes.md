# Tenant API v1 — Credit Notes

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:credit-notes`, plus permission middleware / policies.

> **Naming:** the model is `CustomerCreditNote` — a credit note a tenant issues against *its own* customer's `CustomerInvoice`. Central's own platform-billing `credit_notes` ledger table (credits the platform issues *to* a tenant against its own subscription invoices) is unrelated.

Requires the **Invoices** module (hard `module_dependencies` row) — a credit note always references a `CustomerInvoice` and cannot be created without it.

Assignee scoping: without `credit-notes.assign` (and not superadmin), list/stats/view/update/**issue**/**apply**/**void** only include credit notes where `assigned_to` is the current user.

## Stats

### GET `/credit-notes/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_credit_notes": 0,
  "my_credit_notes": 0,
  "draft": 0,
  "issued": 0,
  "applied": 0,
  "void": 0,
  "applied_total": 0,
  "scope": "org | mine"
}
```

`applied_total` sums `total` across credit notes with `status = applied`.

## Credit Notes CRUD

### GET `/credit-notes`

Query: `search` (matches `title` or `number`), `status` (`draft`\|`issued`\|`applied`\|`void`), `customer_invoice_id`, `contact_id`, `company_id`, `assigned_to` (`unassigned` or user id), `my_credit_notes`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `currency`, `subtotal`/`tax_total`/`total`, `issue_date`, `customer_invoice` ref (`number`/`total`/`balance_due`/`status`), `contact`/`company` refs, assignee/creator refs, and `latest_note`.

### POST `/credit-notes`

Body: `customer_invoice_id` (required, tenant-scoped existence check), `title` (required), `notes`, `currency` (3-letter, optional — defaults to the linked invoice's currency when omitted), `issue_date` (optional date), `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany` — default to the invoice's `contact_id`/`company_id` when omitted), `assigned_to`, `lines` (array of `{ description, quantity, unit_price, tax_rate, sort_order }`).

`subtotal`, `tax_total`, and `total` are computed server-side from `lines` — do not send them. Status always starts at `draft`; `number` is auto-generated (`CN-00001`, configurable via the `credit_notes_number_prefix` tenant setting). `number` is unique per tenant at the database level; on the rare concurrent-create collision, the service retries with a freshly generated number (up to 3 attempts).

### GET `/credit-notes/{id}`

Includes contact, company, the linked customer invoice, assignee, creator, lines, notes, and timeline activities.

### PUT `/credit-notes/{id}`

Partial update of **draft** credit notes only — including replacing the full `lines` set (recalculates totals). Non-draft credit notes return 422 on `status` (`Only draft credit notes can be edited.`). Assignment after issuing uses `POST /credit-notes/{id}/assign`.

### DELETE `/credit-notes/{id}`

Soft delete. Permission: `credit-notes.delete`.

### POST `/credit-notes/{id}/restore`

Permission: `credit-notes.restore`.

### DELETE `/credit-notes/{id}/force`

Permanently delete a soft-deleted credit note. Permission: `credit-notes.force.delete` (owner/superadmin only by default).

## Actions

### POST `/credit-notes/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `credit-notes.assign`.

### POST `/credit-notes/{id}/issue`

Transitions `draft → issued`. Backfills `issue_date` to today if unset. Permission: `credit-notes.issue`. Rejects with 422 on `status` if the credit note isn't currently `draft`.

### POST `/credit-notes/{id}/apply`

Transitions `issued → applied`. The linked invoice is locked (`SELECT ... FOR UPDATE`) — deliberately **not** `withTrashed()`, so a soft-deleted invoice can never receive a credit — and validated before anything is written: rejected with a 422 on `status` if the invoice can't be found, its status is not `sent`/`partial`, or the credit note's `total` exceeds the invoice's current `balance_due` (0.01 tolerance). Once valid, adds the credit note's `total` to the invoice's `amount_credited` and calls `CustomerInvoice::recalculateBalanceFromAmounts()`, which recomputes `balance_due` **and can advance the invoice `status`** (`sent → partial` or `sent → paid`, same as a Payment post — this is not status-neutral). Records a `credited` activity on the invoice. Permission: `credit-notes.apply`. Rejects with 422 on `status` if the credit note isn't currently `issued`.

### POST `/credit-notes/{id}/void`

Transitions `draft|issued → void`. Does **not** reverse any invoice balance — void is only valid before a credit note has been applied. Permission: `credit-notes.void`. Rejects with 422 on `status` if the credit note is already `applied` or `void`.

### POST `/credit-notes/{id}/notes`

`{ "body": string }`

Permission: `credit-notes.update`.

### GET `/credit-notes/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `issued`, `applied`, `voided`, `note_added`, `deleted`, `restored`).
