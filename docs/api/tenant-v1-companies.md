# Tenant API v1 — Companies

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:companies`, plus permission middleware / policies.

Assignee scoping: without `companies.assign` (and not superadmin), list/stats/view/update only include companies where `assigned_to` is the current user.

## Stats

### GET `/companies/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_companies`, `my_companies`, `unassigned`, `with_email`, `created_this_week`, `todays_follow_ups`, `overdue_follow_ups`, `scope` (`org`|`mine`).

## Companies CRUD

### GET `/companies`

Query: `search`, `industry`, `assigned_to` (`unassigned` or user id), `my_companies`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`, `next_follow_up_at` (denormalized due timestamp for the earliest **pending** follow-up), and `next_follow_up` (the full follow-up object, or `null`). May include `contacts_count` when counted.

### POST `/companies`

Body: `name` (required), `email`, `phone`, `website`, `industry`, `address`, `source`, `source_meta`, `assigned_to`.

### GET `/companies/{id}`

Includes assignee, creator, notes, activities, follow-ups, and linked contacts (when loaded). Embedded `notes` and `activities` are **newest-first** (`created_at` DESC, then `id` DESC). Embedded `follow_ups` keep product scheduling order (not reversed as a chat feed).

### PUT `/companies/{id}`

Partial update of company fields (including `assigned_to`).

### DELETE `/companies/{id}`

Soft delete. Permission: `companies.delete`.

### POST `/companies/{id}/restore`

Restore a soft-deleted company. Permission: `companies.restore`.

### DELETE `/companies/{id}/force`

Permanently delete a soft-deleted company (must already be trashed). Permission: `companies.force.delete` (owner by default).

## Actions

### POST `/companies/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/companies/{id}/notes`

`{ "body": string }`

### GET `/companies/{id}/timeline`

Company activity timeline entries.

## Follow-ups (1.4.0)

Same shape as [Contacts follow-ups](/api/tenant-v1-contacts#follow-ups-1-7-0), scoped by `company_id`. Permission: `companies.update` for all follow-up routes.

- `POST /companies/{id}/follow-ups` — `{ "title", "due_at", "notes"?, "assigned_to"? }`
- `PUT /companies/{id}/follow-ups/{followUpId}` — partial update; changing `due_at` reschedules
- `POST /companies/{id}/follow-ups/{followUpId}/complete` — marks completed

Creating/updating/completing recomputes `companies.next_follow_up_at` (earliest pending `due_at`) and, when Calendar is entitled, upserts/clears a `company` calendar projection. Due/overdue reminders (workspace-local "today") are sent by the daily `crm:send-due-notifications` job to the follow-up's `assigned_to` (falling back to the company's assignee).

## Import / Export (1.4.0)

Same shape as [Contacts import/export](/api/tenant-v1-contacts#import-export-1-7-0). Permission for export: `companies.export`. Permission for all import routes: `companies.import` (+ `module:companies`). Duplicate mode `update` also requires `companies.update`.

- `GET /companies/export?format=csv|xlsx` — id, name, email, phone, website, industry, source, assignee, creator, contacts count, next follow-up, created at
- `GET /companies/import/template?format=csv|xlsx`
- `GET/POST /companies/imports`, `GET/PUT /companies/imports/{uuid}`, `PUT /companies/imports/{uuid}/options`, `POST /companies/imports/{uuid}/preview`, `POST /companies/imports/{uuid}/run`
- `GET /companies/imports/{uuid}/file`, `/failed-records`, `/error-report`

Mappable fields: `name` (required), `email`, `phone`, `website`, `industry`, `source`, `assigned_to`. Options body: `{ "unique_fields": ["email","phone"], "duplicate_mode": "skip"|"update"|"keep" }` — **no `assignment_mode`** (no equal-distribute; `assigned_to` column or manual-create default only). Queued via `ProcessCompanyImportJob` on the `imports` queue.

## Billing summary & statement

Same shape as [Contacts billing summary & statement](/api/tenant-v1-contacts#billing-summary--statement), scoped by `company_id`:

- `GET /companies/{id}/billing-summary`
- `GET /companies/{id}/statement?from=&to=` (includes `opening_balance` + `balance_due`)
- `GET /companies/{id}/statement.pdf?from=&to=`

## Contact linkage

Contact create/update (see [tenant-v1-contacts.md](/api/tenant-v1-contacts)) accept optional `company_id`. When set, the contact’s legacy `company` string is synced to the linked Company name. List/detail contact payloads may include `company_id` and `linked_company` (`id`, `uuid`, `name`).
