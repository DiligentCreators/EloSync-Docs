# Tenant API v1 — Departments

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:departments`, plus `can:departments.*`.

## Stats

### GET `/departments/stats`

Same filters as list (minus pagination/sort). Payload:

`total`, `active`, `inactive`, `with_manager`.

## Departments CRUD

| Method | Path | Permission |
|--------|------|------------|
| GET | `/departments` | `departments.view` |
| GET | `/departments/stats` | `departments.view` |
| POST | `/departments` | `departments.create` |
| GET | `/departments/{department}` | `departments.view` |
| PUT | `/departments/{department}` | `departments.update` |
| DELETE | `/departments/{department}` | `departments.delete` |
| POST | `/departments/{department}/restore` | `departments.restore` |
| DELETE | `/departments/{department}/force` | `departments.force.delete` |

### GET `/departments`

Query: `search`, `status` (`active`\|`inactive`), `manager_id`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List visibility is scoped: admins see all; managers see managed departments; others see memberships.

### POST `/departments`

Body: `name` (required), optional `slug`, `description`, `status`, `manager_id` (user id), `user_ids[]`, `employee_ids[]`.

Defaults: `status=active`. Slug is auto-generated from name when omitted.

### PUT `/departments/{department}`

Partial update of the same fields. Sending `user_ids` / `employee_ids` replaces memberships.

## Manager & members

| Method | Path | Permission |
|--------|------|------------|
| PUT | `/departments/{department}/manager` | `departments.assign_manager` |
| POST | `/departments/{department}/users` | `departments.manage_members` |
| DELETE | `/departments/{department}/users` | `departments.manage_members` |
| POST | `/departments/{department}/employees` | `departments.manage_members` |
| DELETE | `/departments/{department}/employees` | `departments.manage_members` |

Manager body: `{ "manager_id": number|null }` — must reference a User.

Member bodies: `{ "user_ids": number[] }` or `{ "employee_ids": number[] }`.

## Performance

### GET `/departments/{department}/performance`

Permission: `departments.view_performance` (and policy: admin or department manager).

Returns member counts, Lead/Task aggregates when those modules are installed, and `members_breakdown` (linked users with counts; unlinked employees with `performance_eligible: false`).

## Employees integration

When Departments is installed, Employee create/update accepts optional `department_ids[]` and returns `departments[]` on resources. Legacy string `department` remains for backward compatibility.
