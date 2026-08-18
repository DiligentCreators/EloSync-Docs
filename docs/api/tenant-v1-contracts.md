# Tenant API v1 — Contracts

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:contracts`, plus permission middleware / policies.

Assignee scoping: without `contracts.assign` (and not superadmin), list/stats/view/update only include contracts where `assigned_to` is the current user.

## Stats

### GET `/contracts/stats`

Same filters as list (minus pagination/sort).

## Contracts CRUD

### GET `/contracts`

Query: `search`, `status`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_contracts`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `status`, `opportunity`, `quotation` (when linked), assignee/creator refs, and `latest_note`.

### POST `/contracts`

Body: `opportunity_id` (required), `quotation_id` (optional — only valid when the **Quotations** module is entitled, the quotation is not soft-deleted, the actor may access the quotation, and the quotation belongs to the same opportunity; see `LinkableQuotation`), `title` (required), `party_name`, `start_date` (required), `end_date`, `value`, `currency` (3-letter, default `USD`), `description` (HTML memo, sanitized server-side, max 50000), `notes` (HTML memo, sanitized server-side, max 50000), `assigned_to`.

### GET `/contracts/{id}`

Includes opportunity, quotation (when linked), assignee, creator, `description` / `notes` HTML memos, comments (`contract_notes`), and timeline activities. Embedded `contract_notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/contracts/{id}`

Partial update of **draft** contracts only. Non-draft contracts return 422 on `status` (`Only draft contracts can be edited.`). Assignment after activate uses `POST /contracts/{id}/assign`. Status changes use `POST /contracts/{id}/status`.

### DELETE `/contracts/{id}`

Soft delete. Permission: `contracts.delete`.

### POST `/contracts/{id}/restore`

Permission: `contracts.restore`.

### DELETE `/contracts/{id}/force`

Permanently delete a soft-deleted contract. Permission: `contracts.force.delete`.

## Actions

### POST `/contracts/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `contracts.assign`.

### POST `/contracts/{id}/status`

`{ "status": "draft"|"active"|"expired"|"terminated" }`

Permission: `contracts.update`. Rejects disallowed transitions (including re-entering the same status) with a 422 validation error on `status`. Records a `status_changed` timeline entry.

### POST `/contracts/{id}/notes`

`{ "body": string }`

Permission: `contracts.update`.

### GET `/contracts/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `deleted`, `restored`).
