# Tasks Module

Second product module on the frozen platform. Mirrors the [Leads](/user-guide/leads-overview) reference architecture—functional differences only (status/priority/complete vs stages/follow-ups).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [tasks-user.md](/user-guide/tasks) |
| Engineers | [tasks-developer.md](/developer-guide/tasks) |
| Production / ops | [tasks-production.md](/deployment/tasks) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [leads.md](/user-guide/leads-overview) |
| Tenant API | [../api/tenant-v1-tasks.md](/api/tenant-v1-tasks) |

## Capabilities (Sprint 2 CRM UX)

- Title, description, status, priority, due date
- Status includes **`waiting`**; UI label for `open` is **To Do**
- **Colored tags** — per-workspace Tasks catalog; create/assign inline; filter by `tag_id`
- Optional soft **`project_id`** when [Projects](/user-guide/projects-overview) is entitled; optional **`milestone_id`** (same project) and **`depends_on_task_ids`** (same-project blockers; cycle rejected) — Tasks catalog **1.5.0**
- **Calendar overlay** — open tasks with a due date project onto Calendar (assignee/creator as organizer) when Calendar is entitled
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `tasks.assign`
- **`tasks.change_due_date`** — required to change `due_at` after create (initial due date allowed on create)
- Complete / reopen (`tasks.complete`)
- Comments (notes) + History (timeline) tabs
- **Board (default)** + List view; drag-and-drop auto-saves status
- KPIs via `GET /tasks/stats`; board via `GET /tasks/board`
- Module licensing (`module:tasks`) + Spatie permissions
- Audit + activity logging; assignment notifications (mail + database); due/overdue **in-app** alerts plus one daily consolidated **email** digest per assignee

## Permissions

`tasks.view` · `create` · `update` · `delete` · `assign` · `complete` · `change_due_date`

## Explicitly deferred

- Subtasks, recurring tasks
- Import / export
- Real-time board sync (Reverb / Echo)
