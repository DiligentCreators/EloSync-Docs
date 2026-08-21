# Tenant API v1 — Projects

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:projects`, plus permission middleware / policies.

No hard `module_dependencies` — Projects installs standalone. `contact_id`, `company_id`, and `opportunity_id` are optional; supplying any requires the corresponding module to be entitled (soft link rules).

Visibility without `projects.assign` (and not superadmin): list/board/stats/view/update only include projects where the actor is **assignee**, **member**, or **creator**. With `projects.assign`, org-wide (`scope: org` on stats).

Field name is **`title`** (not `name`).

## Stats

### GET `/projects/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_projects": 0,
  "my_projects": 0,
  "planned": 0,
  "active": 0,
  "active_projects": 0,
  "on_hold": 0,
  "completed": 0,
  "cancelled": 0,
  "overdue": 0,
  "overdue_projects": 0,
  "scope": "org | mine"
}
```

`active` / `active_projects` are the same count. `overdue` / `overdue_projects` count open projects (`planned`|`active`|`on_hold`) whose `ends_on` is before workspace-local today.

## Board

### GET `/projects/board`

One column per status (`planned`, `active`, `on_hold`, `completed`, `cancelled`): `status`, `project_count`, `projects[]`. Honors the same filters as list. Optional `per_column` (1–100, default 50).

## Projects CRUD

### GET `/projects`

Query: `search` (matches `title`), `status`, `contact_id`, `company_id`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_projects`, `overdue` (open statuses with `ends_on` before workspace-local today), `trashed` (`true`|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `title`, `status`, `description`, `starts_on`, `ends_on`, soft CRM refs, assignee/creator, `members[]`, and `latest_note`.

### POST `/projects`

Body: `title` (required), `description`, `contact_id`, `company_id`, `opportunity_id`, `starts_on`, `ends_on` (`after_or_equal:starts_on`), `assigned_to`, `member_ids[]`.

Status always starts at `planned`. Without `projects.assign`, `assigned_to` / `member_ids` are ignored and the creator becomes the assignee. Assignee ids are stripped from `member_ids`.

### GET `/projects/{id}`

Includes contact, company, opportunity, assignee, creator, members, notes, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/projects/{id}`

Partial update of content fields (`title`, `description`, soft links, dates, and — with `projects.assign` — `assigned_to` / `member_ids`). Status changes use `POST /projects/{id}/status`.

### DELETE `/projects/{id}`

Soft delete. Permission: `projects.delete`.

### POST `/projects/{id}/restore`

Permission: `projects.restore`.

### DELETE `/projects/{id}/force`

Permanently delete a soft-deleted project. Permission: `projects.force.delete` (owner/superadmin only by default).

## Actions

### POST `/projects/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `projects.assign`. Detaches the new assignee from members if present.

### PUT `/projects/{id}/members`

`{ "member_ids": number[] }`

Permission: `projects.assign`. Full sync; assignee is never stored as a member.

### POST `/projects/{id}/status`

`{ "status": "planned"|"active"|"on_hold"|"completed"|"cancelled" }`

Permission: `projects.update`. Allowed transitions:

| From | To |
|------|-----|
| `planned` | `active`, `cancelled` |
| `active` | `on_hold`, `completed`, `cancelled` |
| `on_hold` | `active`, `cancelled` |
| `completed` / `cancelled` | _(none)_ |

Rejects disallowed transitions with a 422 validation error on `status`.

### POST `/projects/{id}/notes`

`{ "body": string }`

Permission: `projects.update`.

### GET `/projects/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `members_synced`, `status_changed`, `note_added`, `deleted`, `restored`).

## Related: Tasks `project_id`

### Soft link on Tasks

When creating or updating a task, optional `project_id` is validated by `LinkableProject` (Projects module entitled + project visible to the actor). Response embeds `project` (`id`, `uuid`, `title`, `status`) when loaded. Documented under [Tenant Tasks](/api/tenant-v1-tasks).

## Dashboard widgets

When Projects is entitled and the actor has `projects.view`, `GET /dashboard` may include:

| id | Notes |
|----|-------|
| `active_projects` | Active-status rows + `total_count`; visibility-scoped |
| `overdue_projects` | Open + `ends_on` before workspace today; visibility-scoped |

See [Tenant Dashboard](/api/tenant-v1-dashboard).
