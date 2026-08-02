# Tenant API v1 — Leave Management

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:leave-management`, plus `can:leave-management.*`.

## Leave types

| Method | Path | Permission |
|--------|------|------------|
| GET | `/leave-types` | `leave-management.view` |
| POST | `/leave-types` | `leave-management.create` |
| GET | `/leave-types/{leaveType}` | `leave-management.view` |
| PUT | `/leave-types/{leaveType}` | `leave-management.update` |
| DELETE | `/leave-types/{leaveType}` | `leave-management.delete` |
| POST | `/leave-types/{leaveType}/restore` | `leave-management.restore` |
| DELETE | `/leave-types/{leaveType}/force` | `leave-management.force.delete` |

Create body: `name`, `code` (required, unique per tenant), optional `is_paid`, `annual_allowance`, `description`, `is_active`.

## Leave balances

| Method | Path | Permission |
|--------|------|------------|
| GET | `/leave-balances` | `leave-management.view` |
| POST | `/leave-balances` | `leave-management.create` (upsert) |
| GET | `/leave-balances/{leaveBalance}` | `leave-management.view` |
| PUT | `/leave-balances/{leaveBalance}` | `leave-management.update` |
| DELETE | `/leave-balances/{leaveBalance}` | `leave-management.delete` |
| POST | `/leave-balances/{leaveBalance}/restore` | `leave-management.restore` |
| DELETE | `/leave-balances/{leaveBalance}/force` | `leave-management.force.delete` |

### POST `/leave-balances` (upsert)

Body: `employee_id`, `leave_type_id`, `year` (2000–2100), `entitled` (required), optional `used`, `remaining`. Remaining is synced from entitled − used when not supplied.

## Leave requests

| Method | Path | Permission |
|--------|------|------------|
| GET | `/leave-requests` | `leave-management.view` |
| POST | `/leave-requests` | `leave-management.create` |
| GET | `/leave-requests/{leaveRequest}` | `leave-management.view` |
| PUT | `/leave-requests/{leaveRequest}` | `leave-management.update` |
| POST | `/leave-requests/{leaveRequest}/submit` | `leave-management.update` |
| POST | `/leave-requests/{leaveRequest}/approve` | `leave-management.approve` |
| POST | `/leave-requests/{leaveRequest}/reject` | `leave-management.approve` |
| POST | `/leave-requests/{leaveRequest}/cancel` | `leave-management.update` |
| DELETE | `/leave-requests/{leaveRequest}` | `leave-management.delete` |
| POST | `/leave-requests/{leaveRequest}/restore` | `leave-management.restore` |
| DELETE | `/leave-requests/{leaveRequest}/force` | `leave-management.force.delete` |

Create body: `employee_id`, `leave_type_id`, `start_date`, `end_date` (required); optional `days` (min 0.5), `reason`. Status starts as `draft`.

**Self-service:** non-admin actors may only create/update/submit/cancel for their linked active employee. Admin and superadmin may create on behalf of others. Managers create for self but may approve/reject others. Index is scoped to the actor’s employee unless they can approve or create for others.

### POST `/leave-requests/{id}/approve`

Body (optional fields):

| Field | Rules |
|-------|--------|
| `deduct_salary` | boolean; default = `!leaveType.is_paid` when omitted |
| `review_notes` | string, max 5000; **required** when `deduct_salary` differs from the default |

On success, `deduct_salary` is stored on the approved request (used by Payroll period calculation).

### POST `/leave-requests/{id}/reject`

Body: `review_notes` (**required**, string, max 5000).

Workflow: `draft → pending → approved|rejected`; `draft|pending → cancelled`. Approve applies days to the leave balance for the request’s start year.

Resource includes `deduct_salary` (nullable until approved) and nested `leave_type.is_paid`.
