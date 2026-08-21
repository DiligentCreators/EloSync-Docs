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

Body: `amount` (required, numeric, min `0.01`), `currency` (3-letter, optional), `method` (required — `cash`\|`bank_transfer`\|`cheque`\|`card_manual`\|`other`), `paid_at` (optional date), `reference`, `notes`, `contact_id`, `company_id` (optional, module-entitlement + assignee-scope validated via `LinkableContact`/`LinkableCompany`), `assigned_to`, `deposit_account_id` (optional — active cash/bank account when Accounting is entitled; ignored otherwise), `allocations` (optional array of `{ customer_invoice_id, amount }`).

Status always starts at `draft`; `number` is auto-generated (`PAY-00001`, configurable via the `payments_number_prefix` tenant setting). `number` is unique per tenant at the database level; on the rare concurrent-create collision, the service retries with a freshly generated number (up to 3 attempts). Allocations are stored on the draft but **not** applied to any invoice balance until the payment is posted — so allocation amounts are **not** validated against the invoice's balance due at create/update time, only at post time (see below).

### GET `/payments/{id}`

Includes contact, company, assignee, creator, allocations (each with its `customer_invoice` ref: `number`/`total`/`balance_due`/`status`), notes, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

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

Transitions `draft → posted`. Every allocation's invoice is locked (`SELECT ... FOR UPDATE`) and validated **before** any amount is applied — a payment either posts in full or rejects with no partial effect. An allocation is rejected with a 422 on `allocations` (naming the invoice number) when:

- the invoice cannot be found — deliberately **not** `withTrashed()`, so a soft-deleted invoice can never receive a payment;
- the invoice's status is not `sent` or `partial`;
- the allocation amount exceeds the invoice's current `balance_due` (0.01 tolerance for float rounding); or
- the payment and invoice both have a `currency` set and they don't match.

Once every allocation passes, each adds `amount` to its invoice's `amount_paid` and calls `CustomerInvoice::recalculateBalanceFromAmounts()`, which recomputes `balance_due` and advances the invoice status. Permission: `payments.post`. Rejects with 422 on `status` if the payment isn't currently `draft`.

When **Accounting** is entitled: allocations must sum to the payment amount (0.01 tolerance); a posted journal is created (**Dr** `deposit_account_id` or system Cash `1000` / **Cr** AR `1100`) and linked via `journal_entry_id`.

### POST `/payments/{id}/void`

Transitions `posted → void`. Reverses each allocation's amount from its invoice's `amount_paid` and recalculates the invoice balance/status. Unlike `post()`, this locks the invoice **with** `withTrashed()` and does not re-check its status — voiding a payment is a ledger correction that must succeed even if the invoice has since been fully paid, moved past open statuses, or soft-deleted, otherwise the invoice's `amount_paid` would permanently disagree with the payment record. When Accounting posted a journal for this payment, that journal is **voided**. Permission: `payments.void`. Rejects with 422 on `status` if the payment isn't currently `posted`.

### POST `/payments/{id}/notes`

`{ "body": string }`

Permission: `payments.update`.

### GET `/payments/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `posted`, `voided`, `note_added`, `deleted`, `restored`).
