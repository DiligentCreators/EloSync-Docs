# Tenant API v1 — Activities

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:activities`, plus permission middleware / policies.

Assignee scoping: without `activities.assign` (and not superadmin), list/stats/view/update only include activities where `assigned_to` is the current user.

## Stats

### GET `/activities/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_activities`, `my_activities`, `open`, `completed`, `due_soon`, `scope` (`org`|`mine`).

## Activities CRUD

### GET `/activities`

Query: `search`, `type`, `status` (`open`|`completed`), `assigned_to` (`unassigned` or user id), `my_activities`, `contact_id`, `company_id`, `lead_id`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include related `contact` / `company` / `lead` refs when loaded, `is_completed`, and `latest_note`.

### POST `/activities`

Body: `type` (required: `call`|`email`|`note`|`follow_up`|`other`), `subject` (required), `body`, `due_at`, `contact_id`, `company_id`, `lead_id`, `assigned_to`.

At least one of `contact_id`, `company_id`, `lead_id` is required. Each FK requires the corresponding module to be entitled.

### GET `/activities/{id}`

Includes assignee, creator, notes, timeline activities, and related refs. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/activities/{id}`

Partial update. Clearing all related FKs is rejected.

### DELETE `/activities/{id}`

Soft delete. Permission: `activities.delete`.

### POST `/activities/{id}/restore`

Permission: `activities.restore`.

### DELETE `/activities/{id}/force`

Permanently delete a soft-deleted activity. Permission: `activities.force.delete`.

## Actions

### POST `/activities/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/activities/{id}/complete`

Sets `completed_at` (idempotent if already completed). Permission: `activities.complete`.

### POST `/activities/{id}/notes`

`{ "body": string }`

### GET `/activities/{id}/timeline`

Domain timeline entries for the engagement.
