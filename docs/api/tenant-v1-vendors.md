# Tenant API v1 — Vendors

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:vendors`, plus permission middleware / policies.

Assignee scoping: without `vendors.assign` (and not superadmin), list/stats/view/update only include vendors where `assigned_to` is the current user.

## Stats

### GET `/vendors/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_vendors`, `my_vendors`, `unassigned`, `active`, `inactive`, `scope` (`org`|`mine`).

## Vendors CRUD

### GET `/vendors`

Query: `search` (matches name, email, phone, website, address, tax_id), `status` (`active`|`inactive`), `assigned_to` (`unassigned` or user id), `my_vendors`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`.

### POST `/vendors`

Body: `name` (required), `email`, `phone`, `website`, `address`, `tax_id`, `payment_terms`, `currency` (max 3 chars), `status` (`active`|`inactive`, defaults to `active`), `assigned_to`.

### GET `/vendors/{id}`

Includes assignee, creator, notes, and activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/vendors/{id}`

Partial update of vendor fields (including `assigned_to`).

### DELETE `/vendors/{id}`

Soft delete. Permission: `vendors.delete`.

### POST `/vendors/{id}/restore`

Restore a soft-deleted vendor. Permission: `vendors.restore`.

### DELETE `/vendors/{id}/force`

Permanently delete a soft-deleted vendor (must already be trashed). Permission: `vendors.force.delete` (owner by default).

## Actions

### POST `/vendors/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/vendors/{id}/notes`

`{ "body": string }`

### GET `/vendors/{id}/timeline`

Vendor activity timeline entries.
