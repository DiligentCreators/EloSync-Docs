# Tenant Users API

Workspace user administration under `/api/tenant/v1/users` (Sanctum `tenant-api`, tenancy middleware, permission gates).

## Employee link field

Returned on list/show:

| Field | Type | Notes |
|-------|------|-------|
| `employee_id` | integer \| null | Id of the linked Employees directory row when one exists; otherwise `null`. |

## Create employee from user

### `POST /users/{user}/create-employee`

Creates a linked Employees directory record for a user that does not already have one (retrofit after installing the Employees module).

| Middleware | Value |
|------------|-------|
| Module | `module:employees` |
| Permission | `can:employees.create` |
| Policy | Actor must be able to `view` the user |

Defaults: next `EMP-####` number, name split from `user.name`, `email` from the user, hire date = today in the workspace timezone, `employment_type = full_time`, `status = active`.

| Status | When |
|--------|------|
| `201` | Employee created (body uses Employee resource) |
| `404` | User soft-deleted |
| `403` | Module not installed or missing `employees.create` |
| `422` | User already has a linked employee |

Also: create user accepts optional `create_employee` (boolean, default `true` when Employees is installed).

## CRM preference fields

Returned on list/show and accepted on create/update:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `exclude_from_lead_auto_assign` | boolean | `false` | When `true`, user is omitted from lead assignee pickers and equal-distribution import/bulk. Workspace owners are typically `true`. |
| `receive_all_users_daily_summary` | boolean | `false` | When `true`, at **Daily Reminder Time** the user receives the **team** (user-wise) CRM summary email and **not** a personal summary. Grants visibility into other members’ open leads/tasks/meetings counts. Prefer Owner/Admin. |

Example create payload fragment:

```json
{
  "name": "Sales Manager",
  "email": "manager@example.com",
  "password": "Password1!",
  "role": ["manager"],
  "exclude_from_lead_auto_assign": false,
  "receive_all_users_daily_summary": true
}
```

These columns are not mass-assignable on the `User` model; `TenantUserService` applies them via `forceFill` after validation.

## Related

- [Tenant Employees API](/api/tenant-v1-employees)
- [Tenant notifications — daily CRM summary](/api/tenant-v1-notifications#scheduled-due-digests)
- [Daily CRM summary production](/deployment/daily-crm-summary)
- [Tenant RBAC user guide](/user-guide/tenant-rbac)
