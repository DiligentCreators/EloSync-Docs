# Leave Management Module

Phase 7 HR module on the frozen platform. Manages **leave types**, **balances**, and **leave requests** with submit → approve/reject/cancel workflows. Hard-depends on **Employees**.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [leave-management.md](/user-guide/leave-management) |
| Engineers | [leave-management.md](/developer-guide/leave-management) |
| Production / ops | [leave-management.md](/deployment/leave-management) |
| Tenant API | [../api/tenant-v1-leave-management.md](/api/tenant-v1-leave-management) |

## Capabilities

- Leave types with code, paid flag, annual allowance, active flag
- Per-employee / per-type / per-year balances (`entitled`, `used`, `remaining`)
- Leave requests with date range, days, reason, and review notes
- Lifecycle: **draft → pending → approved \| rejected**; draft/pending → **cancelled**
- Approving a request applies days to the balance for that year
- Soft delete / restore / force delete on types, balances, and requests
- Module licensing (`module:leave-management`) + Spatie permissions — **free Marketplace opt-in**
- Hard dependency on `employees`

## Permissions

`leave-management.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `approve`

Default **staff** role: `view` + `create` + `update` (self-service). Managers keep `approve` for others while creating only for self.

Catalog: slug `leave-management`, category `hr`, `sort_order = 20`, free opt-in.

## Explicitly deferred

- Accrual engines / carry-over policies
- Calendar blocking / attendance auto-sync
- Multi-level approval chains
- Public holiday calendars
