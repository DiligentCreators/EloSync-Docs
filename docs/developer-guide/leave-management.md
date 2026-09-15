# Leave Management — Developer Guide

Slug `leave-management`, middleware `module:leave-management`, permissions `leave-management.*`. Hard-depends on `employees`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `LeaveType` | `leave_types` | Unique code per tenant; soft deletes |
| `LeaveBalance` | `leave_balances` | Unique employee+type+year; `syncRemaining()` |
| `LeaveRequest` | `leave_requests` | Status machine; soft deletes; nullable `deduct_salary` until approve |

Enum: `LeaveRequestStatusEnum` — `draft` → `pending` → `approved` \| `rejected`; draft/pending → `cancelled`.

Services: `LeaveTypeService`, `LeaveBalanceService`, `LeaveRequestService`. Approve runs under `lockForUpdate()`, sets `deduct_salary` (default `!leaveType.is_paid`), and calls `LeaveBalanceService::applyApprovedDays`.

## Authorization

`LeaveRequestPolicy`:

- `canCreateForOthers` — `superadmin` / `admin` only (not manager)
- Staff/managers create, update, submit, and cancel only for their linked active employee
- Managers (with `leave-management.approve`) can approve/reject any pending request
- Index scoped via `LeaveRequestService::query` for actors who cannot view all

Default **staff** role includes `leave-management.view|create|update` (additive migration syncs existing workspaces). Those create/update grants apply to **leave requests** only: `LeaveTypePolicy` / `LeaveBalancePolicy` require admin/owner (`canManageCatalog`) for writes. Staff leave-balance lists are scoped to the linked employee; managers with `leave-management.approve` can view all balances.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `LeaveType`, `LeaveBalance`, `LeaveRequest` |
| Controllers | `LeaveTypeController`, `LeaveBalanceController`, `LeaveRequestController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Leave{Type,Balance,Request}/*` |
| Tests | `tests/Feature/Tenant/Leave/` |

## Permissions

```
leave-management.view | create | update | delete | restore | force.delete | approve
```

## API

See [tenant-v1-leave-management.md](/api/tenant-v1-leave-management).

## Frontend

- API clients: `leaveTypeService`, `leaveBalanceService`, `leaveRequestService` in `src/api/services.ts`
- Keys / permissions: `QUERY_KEYS.leave*`, `PERMISSIONS.leaveManagement`
- Nav under **HR** (module `leave-management`)
- Dedicated request pages: `leave-request-form.tsx` + `leave-request-form-page.tsx` + `leave-request-view-page.tsx`; leave types stay in a dialog
- Form locks employee for non-admin; review dialog collects notes + deduct toggle

## Payroll integration

`PayPeriodCalculator` counts unpaid leave days from approved requests using `deduct_salary`, falling back to `!leaveType.is_paid` when `deduct_salary` is null (legacy rows).

## Ask EloSync

Leave AI tools (`get_leave_request`, `get_pending_leave_requests`, confirmed `approve_leave_request` / `reject_leave_request`) are registered in `AIToolRegistry` and confirmed via `PendingAiActionService`. Auth mirrors HTTP approve/reject via `LeaveAiSupport` + `LeaveRequestService` (policy blocks self-approve for non-admin). See [AI tools](/developer-guide/ai-tools) and [AI Leave triage production readiness](/deployment/ai-leave-triage-production-readiness).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Leave
php artisan test --compact tests/Feature/Tenant/Payroll/PayPeriodCalculatorTest.php
```
