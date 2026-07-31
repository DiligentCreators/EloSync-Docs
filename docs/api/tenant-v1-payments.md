# Tenant API v1 — Payments

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:payments`, plus permission middleware / policies.

> **Naming:** the model is `CustomerPayment` — a payment a tenant *receives from its own customer*, allocated against that customer's `CustomerInvoice`(s). Central's own platform-billing Payments ledger (subscription payments tenants make to the platform) is unrelated.

Requires the **Invoices** module (hard `module_dependencies` row) — allocations reference `CustomerInvoice` rows and cannot be created without it.

## Stats

### GET `/payments/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_payments": 0,
  "my_payments": 0,
  "draft": 0,
  "posted": 0,
  "void": 0,
  "posted_amount": 0,
  "scope": "org | mine"
}
```

`posted_amount` sums `amount` across payments with `status = posted`.

## Payments CRUD

### GET `/payments`

Query: `search` (matches `number` or `reference`), `status` (`draft`\|`posted`\|`void`), `method`, `assigned_to` (`unassigned` or user id), `my_payments`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `amount`, `currency`, `method`, `paid_at`, `reference`, `notes`, `contact`/`company` refs, assignee/creator refs, and `latest_note`.

### POST `/payments`

Body: `amount` (required, numeric, min `0.01`), `currency` (3-letter, optional), `method` (required — `cash`\|`bank_transfer`\|`cheque`\|`card_manual`\|`other`), `paid_at` (optional date), `reference`, `notes`, `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `assigned_to`, `allocations` (optional array of `{ customer_invoice_id, amount }`).

Status always starts at `draft`; `number` is auto-generated (`PAY-00001`, configurable via the `payments_number_prefix` tenant setting). Allocations are stored on the draft but **not** applied to any invoice balance until the payment is posted.

### GET `/payments/{id}`

Includes contact, company, assignee, creator, allocations (each with its `customer_invoice` ref: `number`/`total`/`balance_due`/`status`), notes, and timeline activities.

### PUT `/payments/{id}`

Partial update of **draft** payments only — including replacing the full `allocations` set. Non-draft payments return 422 on `status` (`Only draft payments can be edited.`). Assignment after posting uses `POST /payments/{id}/assign`.

### DELETE `/payments/{id}`

Soft delete. **Draft only** — same 422 guard as update. Permission: `payments.delete`.

### POST `/payments/{id}/restore`

Permission: `payments.restore`.

### DELETE `/payments/{id}/force`

Permanently delete a soft-deleted payment. Permission: `payments.force.delete` (owner/superadmin only by default).

## Actions

### POST `/payments/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `payments.assign`.

### POST `/payments/{id}/post`

Transitions `draft → posted`. For each allocation, adds `amount` to the linked invoice's `amount_paid` and calls `CustomerInvoice::recalculateBalanceFromAmounts()`, which recomputes `balance_due` and advances the invoice status (`sent → partial` or `sent → paid`; draft/void invoices are left untouched). Permission: `payments.post`. Rejects with 422 on `status` if the payment isn't currently `draft`.

### POST `/payments/{id}/void`

Transitions `posted → void`. Reverses each allocation's amount from its invoice's `amount_paid` and recalculates the invoice balance/status. Permission: `payments.void`. Rejects with 422 on `status` if the payment isn't currently `posted`.

### POST `/payments/{id}/notes`

`{ "body": string }`

Permission: `payments.update`.

### GET `/payments/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `posted`, `voided`, `note_added`, `deleted`, `restored`).
