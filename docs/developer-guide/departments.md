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

See [tenant-v1-departments.md](/api/tenant-v1-departments).

## Frontend

- Page: `src/pages/departments/` (list, form dialog, detail sheet with Overview / Members / Performance)
- Service / keys / permissions: `departmentService`, `QUERY_KEYS.departments*`, `PERMISSIONS.departments`
- Nav group **HR**, dual-gated `module: departments` + `PERMISSIONS.departments.view`
- Playwright: `e2e/tests/departments/`, `npm run test:e2e:departments`

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Department
```

## Non-goals (v1)

- Expanding Lead/Task list assignee scoping for department managers
- Hard catalog dependency between `departments` and `employees`
- Dropping the free-text `employees.department` column
