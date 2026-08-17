# Tenant API v1 — Resellers

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:resellers`, plus permission middleware / policies.

Assignee scoping: without `resellers.assign` (and not superadmin), list/stats/view include resellers where `assigned_to` is the current user **or** `user_id` is the current user. Update without assign is limited to assignee.

## Stats

### GET `/resellers/stats`

Same filters as list (minus pagination/sort). Payload:

`total_resellers`, `my_resellers`, `unassigned`, `active`, `inactive`, `scope` (`org`|`mine`).

## Resellers CRUD

### GET `/resellers`

Query: `search` (name, email, phone, company_name), `status` (`active`|`inactive`), `assigned_to` (`unassigned` or user id), `my_resellers`, `trashed` (`true`|`only`), `sort`, `direction`, `page`, `per_page`.

### POST `/resellers`

Body: `name` (required), `email`, `phone`, `company_name`, `notes`, `status` (`active`|`inactive`, default `active`), `commission_rate` (0–100), `owner_commission_rate` (0–100), `assigned_to`.

Permission: `resellers.create`.

### GET `/resellers/{id}`

Includes assignee, creator, linked login `user` when present, plus nested `note_entries` (threaded notes) and `activities` (domain timeline). Scalar `notes` remains the profile field. Soft-deleted → 404 for show. Embedded `note_entries` and `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/resellers/{id}`

Partial update of reseller fields (including rates and `assigned_to` when permitted).

Permission: `resellers.update`.

### DELETE `/resellers/{id}`

Soft delete. Permission: `resellers.delete`.

### POST `/resellers/{id}/restore`

Restore. Permission: `resellers.restore`.

### DELETE `/resellers/{id}/force`

Permanently delete a soft-deleted reseller. Permission: `resellers.force.delete`.

## Actions

### POST `/resellers/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `resellers.assign`.

### POST `/resellers/{id}/invite-login`

Creates a same-workspace user with **only** the `reseller` role and sets `user_id`.

Body: `password` (required, min 8), optional `email` (defaults to reseller email), optional `name` (defaults to reseller name).

Fails if `user_id` already set, email missing after defaulting, or email already used in the tenant.

Permission: `resellers.invite`. Response `201`.

### GET `/resellers/{id}/timeline`

Paginated domain activity events (`ResellerActivity`), newest first. Permission: `resellers.view`.

### POST `/resellers/{id}/notes`

Adds a threaded note (`{ "body": string }`). Requires `resellers.update` (and update policy scope). Response `201` with the note resource; also appends a timeline `note_added` activity and platform audit `reseller_note_added`.

Serialized on show as `note_entries` (not `notes`) so the profile scalar is unambiguous.

## Invoice link

Customer invoice create/update accepts optional `reseller_id` (tenant-scoped exists + `LinkableReseller`). See [tenant-v1-invoices.md](/api/tenant-v1-invoices). Resources expose `reseller_id` and nested `reseller` when loaded.
