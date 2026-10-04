# Tenant API v1 — Projects

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:projects`, plus permission middleware / policies.

No hard `module_dependencies` — Projects installs standalone. `contact_id`, `company_id`, and `opportunity_id` are optional; supplying any requires the corresponding module to be entitled (soft link rules).

Visibility without `projects.assign` (and not superadmin): list/board/stats/gantt/heatmap/view/update only include projects where the actor is **assignee**, **member**, or **creator**. With `projects.assign`, org-wide (`scope: org` on stats).

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

Real-time (catalog **1.8.0**): private Echo channel `tenant.{tenantId}.projects.board` (auth: same tenant + `projects.view`). Broadcast names `.ProjectCreated` / `.ProjectUpdated` / `.ProjectStatusChanged` / `.ProjectAssigned` / `.ProjectDeleted`. SPA invalidates this board + stats while Kanban is open (Gantt/Heatmap are not subscribed).

## Gantt

### GET `/projects/gantt`

Portfolio timeline rows for the SPA Gantt view. Honors the same filters and visibility as list. Optional `limit` (1–200, default 100).

Response shape:

```json
{
  "includes_tasks": true,
  "range": { "from": "2026-09-01", "to": "2026-09-30" },
  "rows": [
    {
      "id": 1,
      "uuid": "…",
      "title": "Launch",
      "status": "active",
      "starts_on": "2026-09-01",
      "ends_on": "2026-09-30",
      "assigned_to": 1,
      "assignee": { "id": 1, "name": "…", "email": "…" },
      "milestones": [
        { "id": 1, "title": "Beta", "due_on": "2026-09-15", "status": "open", "sort_order": 0 }
      ],
      "tasks": [
        {
          "id": 10,
          "title": "Ship",
          "status": "open",
          "due_on": "2026-09-20",
          "milestone_id": 1,
          "depends_on_task_ids": [9]
        }
      ]
    }
  ]
}
```

- `includes_tasks` is `true` only when Tasks is entitled and the actor has `tasks.view`. Otherwise `tasks` arrays are empty.
- Embedded tasks are further filtered by Task policy visibility.
- `depends_on_task_ids` only includes dependency task ids that are also visible to the actor (no leakage of hidden blockers).
- `range.from` / `range.to` are the min/max of project `starts_on`/`ends_on`, milestone `due_on`, and included task due dates (date portion of `due_at`). Null when no dated rows exist.

## Heatmap

### GET `/projects/heatmap`

Assignee × week workload matrix for the SPA Heatmap view. Honors the same filters and visibility as list. Optional `weeks` (1–16, default 8) starting at the workspace-local start of the current week.

Response shape:

```json
{
  "includes_tasks": true,
  "range": { "from": "2026-09-29", "to": "2026-11-22" },
  "buckets": [
    { "key": "2026-W40", "from": "2026-09-28", "to": "2026-10-04", "label": "Sep 28" }
  ],
  "rows": [
    {
      "user_id": 1,
      "user_name": "Ada",
      "user_email": "ada@example.com",
      "open_projects": 2,
      "overdue_projects": 1,
      "open_tasks": 3,
      "overdue_tasks": 0,
      "pressure_score": 48,
      "pressure_band": "watch",
      "cells": [
        { "bucket_key": "2026-W40", "projects": 1, "tasks": 2, "load": 3 }
      ]
    }
  ]
}
```

- Rows are assignees of visible **open** projects (`planned`|`active`|`on_hold`). Soft Tasks (when entitled + `tasks.view`) add project-linked open task counts; without `tasks.assign`, only the actor’s own tasks are included, and each task must pass Task policy `view`.
- Cell `projects` = open projects whose schedule overlaps the week; `tasks` = open project tasks due that week; `load` = sum.
- `pressure_score` 0–100 with bands `healthy` (&lt;40), `watch` (40–69), `overloaded` (70+), weighted from open/overdue projects and (when included) tasks — same idea as CRM Analytics staff pressure.
- Unassigned open projects are omitted (no person row).

## Projects CRUD

### GET `/projects`

Query: `search` (matches `title`), `status`, `contact_id`, `company_id`, `opportunity_id`, `assigned_to` (`unassigned` or user id), `my_projects`, `overdue` (open statuses with `ends_on` before workspace-local today), `trashed` (`true`|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `title`, `status`, `description`, `starts_on`, `ends_on`, soft CRM refs, assignee/creator, `members[]`, and `latest_note`.

### POST `/projects`

Body: `title` (required), `description` (optional HTML subset from the workspace editor), `contact_id`, `company_id`, `opportunity_id`, `starts_on`, `ends_on` (`after_or_equal:starts_on`), `assigned_to`, `member_ids[]`.

Status always starts at `planned`. Without `projects.assign`, `assigned_to` / `member_ids` are ignored and the creator becomes the assignee. Assignee ids are stripped from `member_ids`.

### GET `/projects/{id}`

Includes contact, company, opportunity, assignee, creator, members, notes, milestones (when loaded), and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/projects/{id}`

Partial update of content fields (`title`, `description`, soft links, dates, and — with `projects.assign` — `assigned_to` / `member_ids`). Status changes use `POST /projects/{id}/status`.

### DELETE `/projects/{id}`

Soft delete. Permission: `projects.delete`.

### POST `/projects/{id}/restore`

Permission: `projects.restore`.

### DELETE `/projects/{id}/force`

Permanently delete a soft-deleted project. Permission: `projects.force.delete` (owner/superadmin only by default).

## Milestones

Nested under a project. Permission: `projects.view` for list; `projects.update` for write/complete/delete (same visibility as the parent project).

### GET `/projects/{id}/milestones`

### POST `/projects/{id}/milestones`

Body: `title` (required), `description`, `due_on` (date), `sort_order`.

### PUT `/projects/{id}/milestones/{milestone}`

Partial update of milestone fields (not status — use complete).

### POST `/projects/{id}/milestones/{milestone}/complete`

Sets status `completed` and `completed_at`.

### DELETE `/projects/{id}/milestones/{milestone}`

Soft delete.

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

Domain timeline entries (`created`, `updated`, `assigned`, `members_synced`, `status_changed`, `note_added`, `milestone_created`, `milestone_updated`, `milestone_completed`, `milestone_deleted`, `deleted`, `restored`).

## Related: Tasks `project_id` / `milestone_id` / dependencies

### Soft link on Tasks

When creating or updating a task, optional `project_id` is validated by `LinkableProject` (Projects module entitled + project visible to the actor). Optional `milestone_id` must belong to that project (`LinkableProjectMilestone`). Optional `depends_on_task_ids[]` must be other tasks on the same project (cycle rejected). Response embeds `project`, `milestone`, and `depends_on_task_ids` when loaded. Documented under [Tenant Tasks](/api/tenant-v1-tasks).

## Dashboard widgets

When Projects is entitled and the actor has `projects.view`, `GET /dashboard` may include:

| id | Notes |
|----|-------|
| `active_projects` | Active-status rows + `total_count`; visibility-scoped |
| `overdue_projects` | Open + `ends_on` before workspace today; visibility-scoped |

See [Tenant Dashboard](/api/tenant-v1-dashboard).
