# Employees — Developer Guide

Phase 7 HR foundation. Slug `employees`, middleware `module:employees`, permissions `employees.*`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `Employee` | `employees` | Soft deletes; UUID; unique `(tenant_id, employee_number)` |

Enums: `EmployeeStatusEnum` (`active` \| `inactive` \| `terminated`), `EmploymentTypeEnum` (`full_time` \| `part_time` \| `contract`).

Service: `EmployeeService`. Events → subscriber → `PlatformAuditService` + Spatie `LogsActivity` (log name `employees`).

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

- Page: `src/pages/employees/` (list, form dialog, detail sheet)
- Service / keys / permissions: `employeeService`, `QUERY_KEYS.employees*`, `PERMISSIONS.employees`
- Nav group **HR**, dual-gated `module: employees` + `PERMISSIONS.employees.view`
- Playwright: `e2e/tests/employees/`, `npm run test:e2e:employees`

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Employee
```
