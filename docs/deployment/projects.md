# Projects — Production Guide

## Licensing

- Catalog slug: `projects`
- Category: `operations` (**Operations**), `category_sort_order = 40`, `sort_order = 10`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, version **1.0.0**
- **No hard module dependency** — Projects installs standalone; Contact / Company / Opportunity are optional soft links
- Soft reverse link: Tasks may set `project_id` when Projects is entitled (Tasks catalog **1.2.0**)
- New workspaces receive only **Leads** + **Tasks** (+ ToDos) by default; enable Projects from Marketplace at any time
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules only (Projects is never auto-installed)
2. Operators enable **Projects** from Marketplace whenever needed — no prerequisite modules
3. Tenant permissions include `projects.*` via `config/tenant-permissions.php` / default role maps

No stage seeder — status defaults to `planned` at creation and advances via the state machine.

## Permissions rollout

New Projects permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Monitoring

- Platform audit events: `project_created`, `project_updated`, `project_deleted`, `project_assigned`, `project_members_synced`, `project_status_changed`, `project_note_added`, `project_restored`
- Notifications: assignment (`ProjectAssignedNotification`) and new member (`ProjectMemberAddedNotification`) — mail + database
- Tenant mail settings with Central SMTP fallback
- Dashboard widgets gated by `module:projects` + `projects.view`

## Deploy checklist

1. Migrate project tables (`projects`, `project_members`, `project_notes`, `project_activities`)
2. Register the `projects` catalog module (migration, not seeder) as free opt-in under `operations` — **no** `module_dependencies` row
3. Migrate `projects.*` permissions and grant missing defaults to existing roles
4. Migrate `tasks.project_id` (nullable FK, null on project delete) and bump Tasks catalog **1.1.2 → 1.2.0**
5. Confirm `module:projects` + `projects.*` on target roles
6. Deploy frontend (Projects nav under **Operations** — board/list/form/detail; optional project picker on Tasks)
7. Smoke: create a **new** workspace → enable Projects alone → create/edit/assign/members/note → planned → active → on_hold → active → completed → soft delete/restore
8. Smoke (soft Task link): with Tasks + Projects → create a task with `project_id` → confirm embed; without Projects entitled → `project_id` validation fails
9. Smoke (overdue): set workspace timezone, open project with `ends_on` before local today → stats/dashboard `overdue_projects` increments; due today does not

## Roadmap context

Projects ships as lean **v1.0.0** under Future Expansion / Operations. Gantt, milestones, task dependencies, workload heatmaps, Calendar projection, Automation `create_project`, tags, and `PRJ-` numbers remain deferred. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
