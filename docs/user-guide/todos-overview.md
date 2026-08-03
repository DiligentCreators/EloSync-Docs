# ToDos Module

Personal checklist module on the frozen platform. Separate from [Tasks](/user-guide/tasks-overview) (workspace/assignee CRM work). Visibility is **creator-scoped**; the workspace owner can view everyone’s to-dos but cannot edit or delete them.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [todos.md](/user-guide/todos) |
| Engineers | [todos.md](/developer-guide/todos) |
| Production / ops | [todos.md](/deployment/todos) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [leads.md](/user-guide/leads-overview) · [tasks.md](/user-guide/tasks-overview) |
| Tenant API | [tenant-v1-todos.md](/api/tenant-v1-todos) |

## Capabilities

- Title, description, status, priority, due date
- Statuses: `open` (UI **To Do**), `in_progress`, `completed`, `cancelled`
- **Personal visibility** — each user only sees to-dos they created
- **Workspace owner** (`superadmin`) can view all to-dos in the workspace
- **Creator-only update and delete** — even the owner cannot change or delete someone else’s to-do
- **Board (default)** + List (table) view; drag-and-drop auto-saves status
- Module licensing (`module:todos`) + Spatie permissions
- Audit via `PlatformAuditService` + Spatie activity log

## Permissions

`todos.view` · `create` · `update` · `delete`

Visibility and delete rules are enforced in policy/service (`created_by` / owner role), not by omitting delete from staff.

## Difference from Tasks

| Tasks | ToDos |
|-------|--------|
| Assignee-scoped (`tasks.assign` → org-wide) | Creator-scoped (owner role → org-wide view) |
| Anyone with `tasks.delete` can delete | Only the **creator** can delete |
| Assign, notes, digests, KPIs, restore/force | Slim CRUD + board/list only |

## Explicitly deferred

- Assignment, notes / timeline, due digests, restore / force-delete, KPIs
- Subtasks, recurring to-dos, dependencies
- Calendar views (see [Calendar](/user-guide/calendar-overview))
- Import / export
- Real-time board sync (Reverb / Echo)
