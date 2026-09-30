# Tenant API v1 — Contacts

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:contacts`, plus permission middleware / policies.

Assignee scoping: without `contacts.assign` (and not superadmin), list/stats/view/update only include contacts where `assigned_to` is the current user.

## Stats

### GET `/contacts/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_contacts`, `my_contacts`, `unassigned`, `with_email`, `created_this_week`, `on_boarded`, `off_boarded`, `todays_follow_ups`, `overdue_follow_ups`, `scope` (`org`|`mine`).

## Contacts CRUD

### GET `/contacts`

Query: `search`, `company`, `company_id`, `lifecycle_status` (`on_boarded` | `off_boarded`), `assigned_to` (`unassigned` or user id), `my_contacts`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `lifecycle_status`, `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`, `next_follow_up_at` (denormalized due timestamp for the earliest **pending** follow-up), and `next_follow_up` (the full follow-up object, or `null`). May include `company_id` and `linked_company` when the relationship is loaded.

### POST `/contacts`

Body: `name` (required), `email`, `phone`, `company` (legacy free-text), `company_id` (optional FK to Companies), `job_title`, `source`, `lifecycle_status` (default `on_boarded`), `assigned_to`.

When `company_id` is set and the company exists, the legacy `company` string is synced to that Company’s name.

### GET `/contacts/{id}`

Includes assignee, creator, notes, activities, follow-ups. May include `company_id` and `linked_company` (`id`, `uuid`, `name`) when the relationship is loaded. Embedded `notes` and `activities` are **newest-first** (`created_at` DESC, then `id` DESC). Embedded `follow_ups` keep product scheduling order (not reversed as a chat feed).

### PUT `/contacts/{id}`

Partial update of contact fields (including `assigned_to`, `company`, `company_id`).

### DELETE `/contacts/{id}`

Soft delete. Permission: `contacts.delete`.

### POST `/contacts/{id}/restore`

Restore a soft-deleted contact. Permission: `contacts.restore`.

### DELETE `/contacts/{id}/force`

Permanently delete a soft-deleted contact (must already be trashed). Permission: `contacts.force.delete` (owner by default).

## Actions

### POST `/contacts/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/contacts/{id}/notes`

`{ "body": string }`

### GET `/contacts/{id}/timeline`

Contact activity timeline entries.

## Follow-ups (1.7.0)

Permission: `contacts.update` for all follow-up routes.

### POST `/contacts/{id}/follow-ups`

`{ "title", "due_at", "notes"?, "assigned_to"? }`. `assigned_to` defaults to the contact's assignee when omitted. Creating a follow-up sets `contacts.next_follow_up_at` to the earliest **pending** follow-up's `due_at` and (when Calendar is entitled) upserts a `contact` calendar projection.

### PUT `/contacts/{id}/follow-ups/{followUpId}`

Partial update (`title`, `due_at`, `notes`, `assigned_to`). Changing `due_at` recomputes `next_follow_up_at` and is treated as a reschedule in the activity timeline.

### POST `/contacts/{id}/follow-ups/{followUpId}/complete`

Marks the follow-up **completed**, recomputes `next_follow_up_at` from remaining pending follow-ups, and clears the calendar projection when none remain.

Due/overdue reminders (workspace-local "today") are sent by the daily `crm:send-due-notifications` job — one notification per follow-up per day, to the follow-up's `assigned_to` (falling back to the contact's assignee).

## Import / Export (1.7.0)

Permission for export: `contacts.export`. Permission for all import routes: `contacts.import` (+ `module:contacts`). Duplicate mode `update` also requires `contacts.update`.

### GET `/contacts/export`

Query: same filters as list, plus `format` = `csv` (default) or `xlsx`. Streams a download of the filtered set (id, name, email, phone, company, job title, source, lifecycle status, assignee, creator, next follow-up, created at).

### GET `/contacts/import/template`

Query: `format` = `csv` (default) or `xlsx`. Downloads a sample template with all mappable columns and one sample row.

### GET `/contacts/imports`

Paginated import history (status, user, file name, row counts, timestamps).

### POST `/contacts/imports`

Multipart: `file` (CSV/XLSX). Stores the upload, returns import record + `context` (headers, sample rows, suggested mapping, fields). Status: `uploaded`.

### PUT `/contacts/imports/{uuid}`

Body: `{ "mapping": { "name": "Name", "email": "Email", ... } }`. Status → `mapped`. Mappable fields: `name` (required), `email`, `phone`, `company`, `job_title`, `source`, `lifecycle_status`, `assigned_to`.

### PUT `/contacts/imports/{uuid}/options`

Body: `{ "unique_fields": ["email","phone"], "duplicate_mode": "skip"|"update"|"keep" }`. `duplicate_mode=update` requires `contacts.update`.

Unlike Leads, Contact import has **no `assignment_mode`** — there is no equal-distribute option. An `assigned_to` column value (resolved by user email) sets the assignee directly; rows without one are unassigned unless the importer's business rules apply (`ContactService::create` mirrors manual create).

### POST `/contacts/imports/{uuid}/preview`

Validates rows without writing contacts. Returns preview counts + sample validation errors.

### POST `/contacts/imports/{uuid}/run`

Queues `ProcessContactImportJob` on the `imports` queue. Status → `queued` → `processing` → `completed`|`failed`. Poll `GET /contacts/imports/{uuid}`.

### GET `/contacts/imports/{uuid}`

Status + statistics for polling (`processed_rows` / `total_rows`, imported/updated/skipped/duplicate/failed counts).

### GET `/contacts/imports/{uuid}/file`

Download the original uploaded file.

### GET `/contacts/imports/{uuid}/failed-records`

Download `failed_records.csv` (original row + reason + validation errors).

### GET `/contacts/imports/{uuid}/error-report`

Download `error_report.csv` (technical/processing exceptions).

## Billing summary & statement

Requires Contacts **view**. Invoice/payment/credit-note lines appear only when those modules are entitled.

### GET `/contacts/{id}/billing-summary`

Returns `{ currencies: [{ currency, invoice_count, total_invoiced, total_paid, balance_due }] }` for non-draft, non-cancelled invoices. Empty `currencies` when Invoices is not entitled or there is no data.

### GET `/contacts/{id}/statement`

Query: `from`, `to` (optional `YYYY-MM-DD`; defaults cover a sensible workspace range). Chronological lines (`invoice` | `payment` | `credit_note`) with `date`, `number`, `description`, `amount`, `currency`, plus period `totals`, `opening_balance` (outstanding before `from`), and `balance_due` (closing as of `to`) per currency. Credit notes appear only when **applied** (draft/issued/refunded/void excluded), matching aged receivables treatment.

### GET `/contacts/{id}/statement.pdf`

Same query as statement; returns a branded PDF download.

## Lead conversion

`POST /leads/{lead}/convert` (see [tenant-v1-leads.md](/api/tenant-v1-leads)) creates a Contact and sets `contact_id` / `contact` on the returned lead when the `contacts` module is entitled for the workspace. `conversion_meta.stub` is `false` in that case; it is `true` when Contacts is not installed (status-only conversion).
