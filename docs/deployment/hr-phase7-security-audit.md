# Phase 7 HR — Security Audit & Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-02 |
| **Scope** | Employees, Leave Management, Attendance, Payroll (backend + tenant SPA) |
| **Branch** | `feature/phase-7-hr-9630` |
| **Status** | Remediation applied — ready for merge pending CI |

---

## Verdict

Phase 7 HR is **production-ready for opt-in Marketplace enablement** after the remediations in this audit. Cross-tenant isolation, route/module middleware, and policy wiring were already solid. Remaining risks were **integrity and RBAC granularity** (leave balances, payroll amounts, compensation visibility, concurrent transitions). Those are fixed and covered by Pest regressions.

---

## What was reviewed

- Tenant API routes (`module:*` + `can:*` + `auth:tenant-api`)
- Policies / default role permissions
- Form requests (mass assignment of status, reviewer, tenant_id)
- Leave / payroll services (transitions, balances, journal post)
- Soft-delete / restore / force-delete paths
- Tenant SPA permission gates and XSS surface (reason/notes)
- Headed Playwright smoke (Employees, Leave, Attendance, Payroll — all green prior to this audit)

---

## Findings summary

| ID | Severity | Area | Status |
|----|----------|------|--------|
| HR-01 | Medium | Leave balance upsert used `create` to overwrite existing rows | **Fixed** |
| HR-02 | Medium | Approved leave requests could be deleted without reversing `used` | **Fixed** |
| HR-03 | Medium | Leave `days` could exceed date range; approve ignored remaining | **Fixed** |
| HR-04 | Medium | Concurrent leave approve / reject lacked balance / request locking | **Fixed** |
| HR-05 | Medium | Pay-run line `gross` unbounded / negative; approve lacked locks | **Fixed** |
| HR-06 | Medium | Journal post accepted any account type; duplicate-post race | **Fixed** |
| HR-07 | Medium | Default `staff` role included `payroll.view` (full salary exposure) | **Fixed** |
| HR-08 | Low | Employee `user_id` could link one user to many employees | **Fixed** |
| HR-09 | Low | Attendance allowed `check_out` before `check_in` | **Fixed** |
| HR-10 | Low | Client-supplied leave `remaining` trusted on upsert | **Fixed** (derived) |
| HR-11 | Info | No segregation-of-duties on approve (same actor can create + approve) | **Accepted** (SMB default) |
| HR-12 | Info | Unvalidated list `sort`/`direction` (platform-wide pattern) | **Accepted** / follow-up |
| HR-13 | Info | Soft-delete unique indexes include trashed rows | **Follow-up** |
| HR-14 | Info | Privileged attrs remain `$fillable` but not request-writable | **Accepted** (defense-in-depth follow-up) |

---

## Remediation details

### Leave Management

- Upsert authorizes `update` when a balance already exists; create path keeps `create`.
- Upsert always derives `remaining = entitled - used`.
- Leave `days` capped to inclusive calendar span (request + service).
- Approve runs in a transaction, locks the request, locks the balance, and rejects insufficient remaining.
- Reject / submit / cancel also lock the request row.
- Delete allowed only for `draft`, `rejected`, or `cancelled` (approved retained for audit).

### Payroll

- Line `gross` validated `min:0`; adjustments bounded; net cannot go negative on update.
- Approve / mark paid / post wrapped in `lockForUpdate()` transactions.
- Approve rejects negative line amounts.
- Journal post requires active **expense** debit and **liability** credit accounts (request + service).

### RBAC

- Default **staff** role no longer includes `payroll.view`. Manager+ retains compensation access.
- **Ops note:** Existing workspaces keep previously synced role permissions until roles are re-synced / edited. New tenants get the tightened defaults.

### Employees / Attendance

- `user_id` unique per tenant among non-deleted employees.
- `check_out` must be on or after `check_in` when both are present.

---

## Production readiness checklist

| Check | Result |
|-------|--------|
| Module catalog + hard deps (Leave/Attendance/Payroll → Employees) | Pass |
| Permission middleware on mutating + sensitive routes | Pass |
| Tenant scoping / isolation tests | Pass |
| Leave lifecycle integrity (days, balance, delete) | Pass (after fix) |
| Payroll lifecycle integrity (amounts, locks, journal types) | Pass (after fix) |
| Staff cannot read salaries by default | Pass (after fix) |
| Soft-delete / restore authorization present | Pass |
| Frontend `RequireAccess` / `PermissionGate` on HR routes & actions | Pass |
| XSS: leave/attendance/payroll notes as React text nodes | Pass |
| Headed e2e (validation + CRUD + workflows) | Pass (pre-audit) |
| Pest regressions for remediations | Pass (this change) |

---

## Residual / follow-up (non-blocking)

1. **Partial unique indexes** for soft-deleted uniques (`leave_balances`, `attendance_records`, `payroll_profiles`) to avoid recreate collisions.
2. **Whitelist `sort`/`direction`** across tenant list services (platform-wide hardening).
3. **Optional SoD**: reject leave/pay approve when actor is creator (config flag).
4. **FK + index** on `pay_runs.journal_entry_id`.
5. **Remove privileged attributes** from model `$fillable` and use explicit `forceFill` in services.
6. **Overlap validation** for pending/approved leave ranges per employee.
7. Re-sync default role permissions for existing tenants that already received `payroll.view` on staff.

---

## Test evidence

```bash
# Backend (from saas-backend)
php artisan test --compact \
  tests/Feature/Tenant/Leave/LeaveManagementTest.php \
  tests/Feature/Tenant/Payroll/PayrollTest.php \
  tests/Feature/Tenant/Employee/EmployeeTest.php \
  tests/Feature/Tenant/Attendance/AttendanceTest.php
```

New / updated coverage includes: inflated leave days, insufficient balance on approve, delete of approved leave, balance upsert RBAC, negative pay-run gross, wrong journal account types, staff payroll.view denial, unique employee `user_id`, attendance check-out ordering.

---

## Related PRs

- Backend: Phase 7 HR (`feature/phase-7-hr-9630`)
- Frontend: Phase 7 HR UI + e2e
- Docs: this audit + module packs
