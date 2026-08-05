# Departments — Developer Guide

Phase 7 HR module. Slug `departments`, middleware `module:departments`, permissions `departments.*`.

## Domain

| Model / table | Notes |
|---------------|-------|
| `Department` / `departments` | Soft deletes; UUID; unique `(tenant_id, slug)`; `manager_id` → users |
| `department_user` | User membership pivot (+ `tenant_id`) |
| `department_employee` | Employee membership pivot (+ `tenant_id`) |

Enum: `DepartmentStatusEnum` (`active` \| `inactive`).

Service: `DepartmentService` (CRUD, membership sync, manager assign, performance aggregates). Events → `DepartmentEventSubscriber` → `PlatformAuditService` + Spatie `LogsActivity` (log name `departments`).

**Visibility (policy + query):**

- `superadmin` / `admin` — org-wide
- Department manager (`manager_id`) — managed departments + performance
- Others with `departments.view` — memberships only

**Performance eligibility:** union of attached user IDs, linked employee `user_id`s, and `manager_id`. Unlinked employees appear on the roster with `performance_eligible: false`.

**Manager/member pickers:** `GET /users` excludes the authenticated user (Users admin list). The Departments form merges the signed-in user into picker options so a solo owner can assign themselves.

**Authz hardening:** `manager_id` on create/update and `PUT …/manager` require org-wide `assign_manager` (admin/superadmin). Membership arrays on create/update require `manage_members`. Exists rules for managers/members/`department_ids` are tenant-scoped (`tenant_id` + not soft-deleted).

Employee create/update accepts `department_ids[]` when the Departments module is installed; syncs the pivot and sets legacy `employees.department` to the primary department name.

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/Department.php` |
| Service | `app/Services/Tenant/DepartmentService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/DepartmentController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Department/*` |
| Policy | `app/Policies/DepartmentPolicy.php` |
| Tests | `tests/Feature/Tenant/Department/` |

## Permissions

```
departments.view | create | update | delete | restore | force.delete
departments.manage_members | assign_manager | view_performance
```

Default role map: admin (all), manager (view/create/update/manage_members/assign_manager/view_performance), staff (view).

## API

See [tenant-v1-departments.md](/api/tenant-v1-departments) and [tenant-v1-reports.md](/api/tenant-v1-reports) (`GET /reports/department-performance`).

## Reports & digest

| Piece | Path |
|-------|------|
| Report service | `app/Services/Tenant/DepartmentPerformanceReportService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/DepartmentPerformanceReportController.php` |
| Request | `app/Http/Requests/Tenant/Api/V1/Report/DepartmentPerformanceReportRequest.php` |
| Notification | `app/Notifications/Tenant/Report/DepartmentPerformanceDigestNotification.php` |
| Command | `app/Console/Commands/SendDepartmentPerformanceDigestCommand.php` (`reports:send-department-digest`) |
| Tests | `tests/Feature/Tenant/Report/`, `tests/Feature/Tenant/Notification/DepartmentPerformanceDigestNotificationTest.php` |

Auth: `dashboard.view` middleware + owner or `User::isDepartmentManager()` in the Form Request (no new Spatie permission). Period filter applies to `created_at` on leads/tasks assigned to `Department::performanceUserIds()`.

Digest delivery tracking reuses `DailySummaryDelivery` with `kind = department_weekly`; mail send/fail tracked by `TrackDailySummaryDelivery`.

## Frontend

- Page: `src/pages/departments/` (list, form dialog, detail sheet with Overview / Members / Performance)
- Reports page: `src/pages/reports/department-reports-page.tsx` at `/reports/departments`
- Service / keys / permissions: `departmentService`, `departmentReportService`, `QUERY_KEYS.departments*`, `QUERY_KEYS.departmentPerformanceReport`, `PERMISSIONS.dashboard.view` + owner/manager gate
- Nav group **HR**, dual-gated `module: departments` + owner/manager (`requiresDepartmentReportAccess`)

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Department
```

## Non-goals (v1)

- Expanding Lead/Task list assignee scoping for department managers
- Hard catalog dependency between `departments` and `employees`
- Dropping the free-text `employees.department` column
