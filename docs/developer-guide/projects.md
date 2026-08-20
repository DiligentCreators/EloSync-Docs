# Projects — Developer Guide

Lean Operations module mirroring Tasks / Opportunities patterns (board, stats, assignee, notes, domain timeline) with **members**, date-only schedule fields, and soft CRM / Task links. Prefer copying those patterns over inventing new ones. Field is **`title`** (not `name`).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Project.php`, `ProjectMember`, `ProjectNote`, `ProjectActivity` |
| Enums | `ProjectStatusEnum`, `ProjectActivityTypeEnum` |
| Service | `app/Services/Tenant/ProjectService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ProjectController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Project/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Project/*` |
| Policy | `app/Policies/ProjectPolicy.php` |
| Events | `app/Events/Project*.php` |
| Subscriber | `app/Listeners/ProjectEventSubscriber.php` (audit + assignee / member notifications) |
| Notifications | `ProjectAssignedNotification`, `ProjectMemberAddedNotification` |
| Link rules | `LinkableContact`, `LinkableCompanyForOpportunity`, `LinkableOpportunityForProject`, `EligibleProjectAssignee`; Tasks uses `LinkableProject` |
| Dashboard | `DashboardWidgetService` — `active_projects`, `overdue_projects` |
| Factories | `ProjectFactory`, `ProjectNoteFactory`, `ProjectActivityFactory` |
| Tests | `tests/Feature/Tenant/Project/ProjectTest.php` |
| Migrations | `2026_08_14_100000`…`100007` — projects tables, permissions, catalog register **1.0.0**, `tasks.project_id`, Tasks bump **1.1.2 → 1.2.0** |

## Domain notes

- **No hard module dependency**: Projects has no `module_dependencies` row — installable standalone. `contact_id` / `company_id` / `opportunity_id` are nullable soft links.
- Status machine on `ProjectStatusEnum::allowedTransitions()`: `planned → active|cancelled`, `active → on_hold|completed|cancelled`, `on_hold → active|cancelled`, `completed`/`cancelled` terminal. `changeStatus()` throws `ValidationException` (422, `status`) for disallowed transitions.
- New projects always start as `planned`. Default assignee is the creator when `assigned_to` is omitted (or when the actor lacks `projects.assign`).
- **Visibility** without `projects.assign` (and not superadmin): `assigned_to` OR `created_by` OR `project_members` (`Project::isVisibleTo()` / `ProjectService::applyVisibilityScope()`). With `projects.assign`, org-wide.
- Assignee is **not** stored as a member — `normalizeMemberIds()` strips the assignee id from `member_ids`.
- `PUT /projects/{project}/members` accepts `member_ids: []` (`present|array`) to clear all members.
- **Assignee/member pickers:** `GET /users` excludes the authenticated user (Users admin list). The Projects form and record page merge the signed-in user into picker options (same pattern as Departments) so a solo owner can assign themselves.
- `starts_on` / `ends_on` are `date` casts. Overdue = open status + non-null `ends_on` + `ends_on` **before** workspace “today” (`TenantSettingService::applyRuntimeConfig` so `now()->toDateString()` is workspace TZ).
- Soft Task link: nullable `tasks.project_id` FK → `projects` (`nullOnDelete`). Validated by `LinkableProject` (Projects entitled + project visible to actor). Catalog bump Tasks **1.2.0**.
- `projects.force.delete` is not granted to any default role — owner/superadmin only.

## Permissions

```
projects.view | create | update | delete | restore | force.delete | assign
```

Routes use `module:projects` then `can:projects.*` / policies.

Catalog: slug `projects`, category `operations`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.0.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only) — **no** `module_dependencies` row.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-projects.md](/api/tenant-v1-projects).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/projects` | view |
| GET | `/projects/stats` | view |
| GET | `/projects/board` | view |
| POST | `/projects` | create |
| GET | `/projects/{project}` | view |
| PUT | `/projects/{project}` | update |
| DELETE | `/projects/{project}` | delete |
| POST | `/projects/{project}/restore` | restore |
| DELETE | `/projects/{project}/force` | force.delete |
| POST | `/projects/{project}/assign` | assign |
| PUT | `/projects/{project}/members` | assign |
| POST | `/projects/{project}/status` | update |
| POST | `/projects/{project}/notes` | update |
| GET | `/projects/{project}/timeline` | view |

## Frontend

SPA should mirror **Tasks** (board default + list, create/edit page, record page) under AppLayout — do not invent a parallel shell. Nav: **Workspace** after Tasks.

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/projects/` (board + list) |
| Form / detail | create/edit page + record page (overview, members, notes, timeline) |
| Service | `projectService` in `src/api/services.ts` |
| Types | `Project*` in `src/types/api.ts`; Task gains optional `project_id` / `project` |
| Query keys | `QUERY_KEYS.projects` / `project(id)` / `projectTimeline(id)` / `projectStats` / `projectBoard` |
| Permissions | `PERMISSIONS.projects.*` |
| Nav | `permission: projects.view`, `module: 'projects'` — Workspace group after Tasks |
| Route | `tenantRoutes.projects = '/projects'`, `RequireAccess module="projects"` |
| Notifications | `project.assigned`, `project.member_added` → `/projects?project={id}` |
| Playwright | `e2e/pages/projects.page.ts`, `e2e/tests/projects/`, `npm run test:e2e:projects` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Project/ProjectTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:projects
```

## Logging

- Spatie `LogsActivity` on `Project` (log name `projects`)
- Domain `project_activities` timeline (`created`, `updated`, `assigned`, `members_synced`, `status_changed`, `note_added`, `deleted`, `restored`)
- `PlatformAuditService` via `ProjectEventSubscriber`

## Deferred

- Gantt, milestones, task dependencies, workload heatmaps
- Calendar projection
- Automation `create_project`
- Project tags, `PRJ-` numbers
