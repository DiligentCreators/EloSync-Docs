# Tenant API v1 — Tasks

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:tasks`, plus permission middleware / policies.

Assignee scoping: without `tasks.assign` (and not superadmin), list/board/stats only include tasks where `assigned_to` is the current user.

`assigned_to` on create/update/assign must be a tenant user id (or `null` to unassign). Unlike leads, Tasks do **not** enforce lead-assignee eligibility (`exclude_from_lead_auto_assign` / owner exclusion).

## Tags

### GET `/task-tags`

List workspace task tags (`name`, `slug`, `color`, `sort_order`). Permission: `tasks.view`.

### POST `/task-tags`

Create a tag. Body: `name` (required), optional `slug`, `color`, `sort_order`. Permission: `tasks.create`.

MVP catalogs are **create-only** (no update/delete/reorder tag endpoints). Assign tags on the task via `tag_ids`, `PUT /tasks/{id}/tags`, or the SPA list/board inline tag popover (auto-save on toggle).

## Stats & board

### GET `/tasks/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_tasks`, `my_tasks`, `due_today`, `due_this_week`, `overdue`, `completed_today`, `completion_rate`, `scope` (`org`|`mine`).

### GET `/tasks/board`

One column per status (`open`, `in_progress`, `waiting`, `completed`, `cancelled`): `status`, `task_count`, `tasks[]`. Honors the same filters as list.

## Tasks CRUD

### GET `/tasks`

Query: `search`, `status`, `priority`, `tag_id`, `assigned_to` (`unassigned` or user id), `my_tasks`, `overdue`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List/board items include `tags[]` when loaded, plus `project_id` and embedded `project` (`id`, `uuid`, `title`, `status`) when the soft Projects link is set and loaded.

Status values: `open`, `in_progress`, `waiting`, `completed`, `cancelled`.  
Priority values: `low`, `medium`, `high`, `urgent`.

`overdue=true` returns open / in-progress / waiting tasks with `due_at` in the past (matches the stats overdue definition). When `overdue` is set, `status` is ignored.

List and board task cards include `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`.

### POST `/tasks`

Body: `title` (required), `description`, `status`, `priority`, `due_at`, `assigned_to`, `tag_ids[]`, optional `project_id` (soft — requires the **Projects** module entitled and a project the actor may see; see `LinkableProject`).

Initial `due_at` on create does not require `tasks.change_due_date`.

### GET `/tasks/{id}`

Includes assignee, creator, notes, activities, `tags`, and optional `project`. Embedded `notes` and `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/tasks/{id}`

Partial update of task fields (including `status` / `priority` / `assigned_to` / `due_at` / `tag_ids[]` / `project_id`).

Changing `due_at` after create requires `tasks.change_due_date` (403 otherwise).

### PUT `/tasks/{id}/tags`

Sync tags. Body: `{ "tag_ids": number[] }`. Permission: `tasks.update`.

### DELETE `/tasks/{id}`

Soft delete. Permission: `tasks.delete`.

### POST `/tasks/{id}/restore`

Restore a soft-deleted task. Permission: `tasks.restore` (admin + owner by default).

### DELETE `/tasks/{id}/force`

Permanently delete a soft-deleted task (must already be trashed). Permission: `tasks.force.delete` (owner by default).

## Actions

### POST `/tasks/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/tasks/{id}/complete`

Marks status `completed` and sets `completed_at`.

### POST `/tasks/{id}/reopen`

Clears completion and returns the task to a non-completed status (typically open/in-progress workflow in the UI).

### POST `/tasks/{id}/notes`

`{ "body": string }` — comments in the UI.

### GET `/tasks/{id}/timeline`

Task activity timeline entries (History tab).
