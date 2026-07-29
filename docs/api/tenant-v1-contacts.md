# Tenant API v1 — Contacts

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:contacts`, plus permission middleware / policies.

Assignee scoping: without `contacts.assign` (and not superadmin), list/stats/view/update only include contacts where `assigned_to` is the current user.

## Stats

### GET `/contacts/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_contacts`, `my_contacts`, `unassigned`, `with_email`, `created_this_week`, `scope` (`org`|`mine`).

## Contacts CRUD

### GET `/contacts`

Query: `search`, `company`, `assigned_to` (`unassigned` or user id), `my_contacts`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`.

### POST `/contacts`

Body: `name` (required), `email`, `phone`, `company`, `job_title`, `source`, `assigned_to`.

### GET `/contacts/{id}`

Includes assignee, creator, notes, activities.

### PUT `/contacts/{id}`

Partial update of contact fields (including `assigned_to`).

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

## Lead conversion

`POST /leads/{lead}/convert` (see [tenant-v1-leads.md](/api/tenant-v1-leads)) creates a Contact and sets `contact_id` / `contact` on the returned lead when the `contacts` module is entitled for the workspace. `conversion_meta.stub` is `false` in that case; it is `true` when Contacts is not installed (status-only conversion).
