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

Defaults: next `EMP-####` number, name split from `user.name`, `email` from the user, hire date = today in the workspace timezone, `employment_type = full_time`, `status = active` (or `inactive` if the user is suspended). Concurrent calls are serialized with a user-row lock. Soft-deleted employees keep historical `user_id` but clear `active_user_id`, so re-provision is allowed.

| Status | When |
|--------|------|
| `201` | Employee created (body uses Employee resource) |
| `404` | User soft-deleted |
| `403` | Module not installed or missing `employees.create` |
| `422` | User already has an active linked employee |

Also: create user accepts optional `create_employee` (boolean, default `true` when Employees is installed).

## CRM preference fields

Returned on list/show and accepted on create/update:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `exclude_from_lead_auto_assign` | boolean | `false` | When `true`, user is omitted from lead assignee pickers and equal-distribution import/bulk. Workspace owners are typically `true`. |
| `receive_website_leads` | boolean | `false` | When `true`, user may receive custom webhook leads when an endpoint has `assign_to_website_recipients` enabled. Must also pass `eligibleLeadAssignees`. |
| `receive_all_users_daily_summary` | boolean | `false` | When `true`, at **Daily Reminder Time** the user receives the **team** (user-wise) CRM summary email and **not** a personal summary. Grants visibility into other members’ open leads/tasks/meetings counts. Prefer Owner/Admin. |
| `lead_commission_rate` | number \| null | `null` | Optional default commission percentage (0–100). Snapshotted onto `leads.commission_rate` when this user is assigned via the assign endpoint. Reporting/display only — not used for payouts. |

Example create payload fragment:

```json
{
  "name": "Sales Manager",
  "email": "manager@example.com",
  "password": "Password1!",
  "role": ["manager"],
  "exclude_from_lead_auto_assign": false,
  "receive_all_users_daily_summary": true,
  "lead_commission_rate": 12.5
}
```

These columns are not mass-assignable on the `User` model; `TenantUserService` applies them via `forceFill` after validation.

## User impersonation (login as user)

Same-workspace support handoff. Not a marketplace module; gated by Spatie permission only.

### `POST /users/{user}/impersonate`

| Middleware | Value |
|------------|-------|
| Permission | `can:users.impersonate` |
| Policy | `TenantUserPolicy::impersonate` — denies self and workspace Owner (`superadmin`) |

Body:

| Field | Rules |
|-------|-------|
| `reason` | required, string, 5–1000 chars |

Behavior:

- Mints a Sanctum token named `user-impersonation` for the target (TTL 1 hour)
- Creates a `user_impersonation_sessions` row (actor, target, reason, IP, user agent, PAT id)
- Audits `user_impersonation_started`
- Rejects nested impersonation when the current bearer token is named `impersonation` (Central) or `user-impersonation`
- Rejects suspended targets (`422` on `user`)

Response `201` includes session fields plus `target_token` and `expires_at`.

### `POST /user-impersonation/{userImpersonation}/end`

Authorizes when the current Sanctum PAT matches the session’s `personal_access_token_id`, or the actor still holds `users.impersonate` and owns the session. Ends the session, revokes the target PAT, audits `user_impersonation_ended`.

Central platform impersonation (`POST /api/central/v1/tenants/{tenant}/impersonate`) remains a separate product surface.

## Related

- [Tenant Employees API](/api/tenant-v1-employees)
- [Tenant notifications — daily CRM summary](/api/tenant-v1-notifications#scheduled-due-digests)
- [Daily CRM summary production](/deployment/daily-crm-summary)
- [Tenant RBAC user guide](/user-guide/tenant-rbac)
- [Authentication (developer)](/developer-guide/authentication#impersonation-compatibility)
