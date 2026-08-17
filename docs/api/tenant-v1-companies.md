# Tenant API v1 — Companies

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:companies`, plus permission middleware / policies.

Assignee scoping: without `companies.assign` (and not superadmin), list/stats/view/update only include companies where `assigned_to` is the current user.

## Stats

### GET `/companies/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_companies`, `my_companies`, `unassigned`, `with_email`, `created_this_week`, `scope` (`org`|`mine`).

## Companies CRUD

### GET `/companies`

Query: `search`, `industry`, `assigned_to` (`unassigned` or user id), `my_companies`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`. May include `contacts_count` when counted.

### POST `/companies`

Body: `name` (required), `email`, `phone`, `website`, `industry`, `address`, `source`, `source_meta`, `assigned_to`.

### GET `/companies/{id}`

Includes assignee, creator, notes, activities, and linked contacts (when loaded). Embedded `notes` and `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

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

## Contact linkage

Contact create/update (see [tenant-v1-contacts.md](/api/tenant-v1-contacts)) accept optional `company_id`. When set, the contact’s legacy `company` string is synced to the linked Company name. List/detail contact payloads may include `company_id` and `linked_company` (`id`, `uuid`, `name`).
