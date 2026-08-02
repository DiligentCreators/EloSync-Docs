# Leave Management — Developer Guide

Slug `leave-management`, middleware `module:leave-management`, permissions `leave-management.*`. Hard-depends on `employees`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `LeaveType` | `leave_types` | Unique code per tenant; soft deletes |
| `LeaveBalance` | `leave_balances` | Unique employee+type+year; `syncRemaining()` |
| `LeaveRequest` | `leave_requests` | Status machine; soft deletes |

Enum: `LeaveRequestStatusEnum` — `draft` → `pending` → `approved` \| `rejected`; draft/pending → `cancelled`.

Services: `LeaveTypeService`, `LeaveBalanceService`, `LeaveRequestService`. Approve runs under `lockForUpdate()` and calls `LeaveBalanceService::applyApprovedDays`.

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

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Leave
```
