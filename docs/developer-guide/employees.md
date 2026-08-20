# Employees — Developer Guide

Phase 7 HR foundation. Slug `employees`, middleware `module:employees`, permissions `employees.*`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `Employee` | `employees` | Soft deletes; UUID; unique `(tenant_id, employee_number)`; race-safe active user link via `active_user_id` |

Enums: `EmployeeStatusEnum` (`active` \| `inactive` \| `terminated`), `EmploymentTypeEnum` (`full_time` \| `part_time` \| `contract`).

Service: `EmployeeService` (includes `nextEmployeeNumber` / `splitFullName`). Events → subscriber → `PlatformAuditService` + Spatie `LogsActivity` (log name `employees`).

`TenantUserService::create` may provision a linked employee when `employees` is installed and `create_employee` is true (default). Retrofit path: `POST /api/tenant/v1/users/{user}/create-employee` (`module:employees` + `can:employees.create`) calls `TenantUserService::createEmployeeForUser` inside a user-row lock. Tenant user list/show/update resources include nullable `employee_id`. Suspend marks the linked employee inactive; create-employee for a suspended user starts as `inactive`. Soft delete clears `active_user_id` (historical `user_id` kept) so re-provision is allowed; restore unlinks `user_id` if another active employee already owns the login.

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/Employee.php` |
| Service | `app/Services/Tenant/EmployeeService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/EmployeeController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Employee/*` |
| Policy | `app/Policies/EmployeePolicy.php` |
| Tests | `tests/Feature/Tenant/Employee/` |

## Permissions

```
employees.view | create | update | delete | restore | force.delete
```

## API

See [tenant-v1-employees.md](/api/tenant-v1-employees).

## Frontend

- Page: `src/pages/employees/` (list, dedicated create/edit form pages, record view page)
- Service / keys / permissions: `employeeService`, `QUERY_KEYS.employees*`, `PERMISSIONS.employees`
- Nav group **HR**, dual-gated `module: employees` + `PERMISSIONS.employees.view`
- Playwright: `e2e/tests/employees/`, `npm run test:e2e:employees`

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Employee
```
