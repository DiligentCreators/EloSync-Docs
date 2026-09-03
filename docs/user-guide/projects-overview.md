# Projects Module

Lean Operations module on the frozen platform. Plan and track workspace projects with a primary assignee, optional members, status board, notes/timeline, and **soft, optional** Contact / Company / Opportunity links. Tasks may optionally set `project_id` when Projects is entitled (Tasks catalog **1.2.0**).

Projects is **standalone**: it installs with no hard `module_dependencies`, and works fully on its own.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [projects.md](/user-guide/projects) |
| Engineers | [projects.md](/developer-guide/projects) |
| Production / ops | [projects.md](/deployment/projects) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Related | [Tasks](/user-guide/tasks-overview) · [Opportunities](/user-guide/opportunities-overview) |
| Tenant API | [../api/tenant-v1-projects.md](/api/tenant-v1-projects) |

## Capabilities

- Fields: **`title`** (required — not `name`), optional description, `starts_on` / `ends_on` (date), status, assignee, members
- Status workflow: `planned → active|cancelled`; `active → on_hold|completed|cancelled`; `on_hold → active|cancelled` (`completed` / `cancelled` terminal)
- Members + assignee; visibility without `projects.assign` = assignee **OR** member **OR** creator
- Soft optional Contact / Company / Opportunity links (validated only when that module is entitled)
- Soft Task `project_id` (Tasks → Projects optional; Tasks catalog **1.1.2 → 1.2.0**)
- Board + stats + notes/timeline
- **Calendar projection** — all-day events on `starts_on` / `ends_on` (assignee as organizer); cancelled projects cancel/remove projection
- Dashboard widgets: `active_projects`, `overdue_projects`
- Overdue uses workspace **Timezone** calendar “today” vs `ends_on` (open statuses only)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:projects`) + Spatie permissions — **free Marketplace opt-in**, no hard dependencies
- Audit + activity logging; assignee and new-member notifications

## Permissions

`projects.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Projects from Marketplace (free). Catalog: slug `projects`, category `operations` (Operations), version **1.2.0**, `is_default_included = false`, `is_billable = false`, `sort_order = 10`. Nav: **Workspace** group, after Tasks.

## Why standalone (soft dependencies)

Contact, Company, and Opportunity links are optional cross-references — a project can be pure internal work with no CRM deal behind it. Tasks may link to a project only when Projects is entitled (`LinkableProject`); uninstalling Projects nulls the FK rather than blocking Tasks.

## Explicitly deferred

- Gantt charts
- Milestones
- Task dependencies
- Workload heatmaps
- Automation `create_project` action
- Project tags
- Human-readable `PRJ-` numbers
