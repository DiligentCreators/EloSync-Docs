# Tenant API v1 — Employees

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:employees`, plus `can:employees.*`.

## Stats

### GET `/employees/stats`

Same filters as list (minus pagination/sort). Payload:

`total`, `active`, `inactive`, `terminated`.

## Employees CRUD

| Method | Path | Permission |
|--------|------|------------|
| GET | `/employees` | `employees.view` |
| GET | `/employees/stats` | `employees.view` |
| POST | `/employees` | `employees.create` |
| GET | `/employees/{employee}` | `employees.view` |
| PUT | `/employees/{employee}` | `employees.update` |
| DELETE | `/employees/{employee}` | `employees.delete` |
| POST | `/employees/{employee}/restore` | `employees.restore` |
| DELETE | `/employees/{employee}/force` | `employees.force.delete` |

### GET `/employees`

Query: `search`, `status` (`active`\|`inactive`\|`terminated`), `employment_type` (`full_time`\|`part_time`\|`contract`), `trashed`, `sort`, `direction`, `page`, `per_page`.

### POST `/employees`

Body: `employee_number` (required, unique per tenant), `first_name`, `last_name` (required), optional `email`, `phone`, `job_title`, `department`, `hire_date`, `termination_date` (after or equal hire), `employment_type`, `status`, `user_id`, `notes`.

Defaults: `employment_type=full_time`, `status=active`.

### PUT `/employees/{employee}`

Partial update of the same fields.

### DELETE / restore / force

Soft delete, restore, and permanent delete (must already be trashed). Route binding includes trashed rows.
