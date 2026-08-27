# Phase 7 HR — Full Security Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-02 |
| **Re-verified** | 2026-08-02 (post-CI green + residual harden) |
| **Scope** | Employees · Leave Management · Attendance · Payroll (API + tenant SPA + docs) |
| **Branch** | `feature/phase-7-hr-9630` |
| **Status** | Remediation applied — **production-ready** for opt-in Marketplace enablement |
| **Companion** | [Production Readiness](/deployment/hr-phase7-production-readiness) |
| **Architecture** | Platform freeze respected — thin modules on existing foundation |

---

## Executive verdict

Phase 7 HR is **cleared for production** as four free Marketplace SKUs under category `hr`, after security audit, remediation, CI green on companion PRs, and a second verification pass.

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Security (authz / tenancy / IDOR) | **Pass** | `module:*` + `can:*` + `BelongsToTenant`; isolation tests green |
| Data integrity (leave / payroll) | **Pass** | Days/range, balance locks, pay-run locks, journal account types, force-delete retention |
| Compensation privacy | **Pass** | Default `staff` no longer has `payroll.view` |
| Frontend gates & XSS | **Pass** | `RequireAccess` / `PermissionGate`; notes as React text |
| Automated tests | **Pass** | Pest HR suites + headed Playwright per module |
| CI (companion PRs) | **Pass** | Backend #72 · Frontend #66 · Docs #75 Quality Gates green; Website #12 mergeable |
| Docs / ops | **Pass** | User · developer · deployment · API · this report + readiness pack |
| Residual risk | **Low / accepted** | Soft-delete uniques, SoD, sort whitelist, existing-tenant staff re-sync — non-blocking |

**Go / no-go:** **GO** for merge and migrate-only rollout. Complete the [production readiness checklist](/deployment/hr-phase7-production-readiness) on staging before production traffic.

---

## Delivery matrix

| SKU | Slug | Hard dep | Billable | UI | Pest | Playwright |
|-----|------|----------|----------|----|------|------------|
| Employees | `employees` | — | Free opt-in | HR nav | Yes | `test:e2e:employees` (6/6 headed) |
| Leave Management | `leave-management` | `employees` | Free opt-in | HR nav | Yes | `test:e2e:leave-management` (6/6 headed) |
| Attendance | `attendance` | `employees` | Free opt-in | HR nav | Yes | `test:e2e:attendance` (6/6 headed) |
| Payroll | `payroll` | `employees` (+ optional Accounting) | Free opt-in | HR nav | Yes | `test:e2e:payroll` (6/6 headed) |

Companion packs: [Employees](/deployment/employees) · [Leave](/deployment/leave-management) · [Attendance](/deployment/attendance) · [Payroll](/deployment/payroll).

---

## What was audited

### Backend

- Routes: `auth:tenant-api` + `module:{slug}` + `can:{permission}` (including approve / pay / post / force.delete)
- Policies + `Gate::authorize` in controllers
- Default role map (`config/tenant-default-role-permissions.php`)
- Form requests — no client write of `status`, `reviewed_by`, `tenant_id`, `journal_entry_id`
- Services: leave lifecycle, balances, attendance uniqueness, pay-run lines, soft journal post
- Soft-delete / restore / force-delete authorization (approved leave retained on soft **and** force paths)
- Tenant isolation (`BelongsToTenant` / `TenantScope`) and cross-workspace Pest cases

### Frontend

- HR nav gated by module entitlement + permission
- Route `RequireAccess` and action `PermissionGate` (approve / pay / post / delete)
- Leave / attendance / payroll free-text fields rendered as React children (no `dangerouslySetInnerHTML`)
- Headed Playwright: validation errors, CRUD, leave submit→approve, payroll approve→paid

### Ops / docs

- Migrate-only catalog registration (`DefaultModuleRegistrar`)
- Module dependency rows (Leave/Attendance/Payroll → Employees; Payroll soft → Accounting)
- User / developer / deployment / API guides for all four SKUs

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
| HR-08 | Low | Employee `user_id` could link one user to many employees | **Fixed** (app validation) |
| HR-09 | Low | Attendance allowed `check_out` before `check_in` | **Fixed** |
| HR-10 | Low | Client-supplied leave `remaining` trusted on upsert / update | **Fixed** (always derived) |
| HR-11 | Info | No segregation-of-duties on approve (same actor can create + approve) | **Accepted** (SMB default) |
| HR-12 | Info | Unvalidated list `sort`/`direction` (platform-wide pattern) | **Accepted** / follow-up |
| HR-13 | Info | Soft-delete unique indexes include trashed rows | **Follow-up** |
| HR-14 | Info | Privileged attrs remain `$fillable` but not request-writable | **Accepted** (defense-in-depth follow-up) |
| HR-15 | Medium | `forceDelete` on leave requests skipped status retention guard | **Fixed** (re-audit) |
| HR-16 | Medium | Existing tenants may retain staff `payroll.view` (additive sync) | **Ops residual** |
| HR-17 | Low | Employee `user_id` uniqueness is validation-only (no DB unique) | **Follow-up** |

No Critical or High open findings remain on intended new-tenant / soft-delete paths.

---

## Remediation details

### Leave Management

- Upsert authorizes `update` when a balance already exists; create path keeps `create`.
- Upsert **and** update always derive `remaining = entitled - used` (client `remaining` ignored).
- Leave `days` capped to inclusive calendar span (FormRequest + service).
- Approve runs in a transaction, locks the request, locks the balance, and rejects insufficient remaining.
- Reject / submit / cancel also lock the request row.
- Soft-delete and force-delete allowed only for `draft`, `rejected`, or `cancelled` (approved retained for audit).
- Optional null `days` from the UI auto-calculates inclusive calendar days.

### Payroll

- Line `gross` validated `min:0`; adjustments bounded; net cannot go negative on update.
- Approve / mark paid / post wrapped in `lockForUpdate()` transactions.
- Approve rejects negative line amounts.
- Journal post requires active **expense** debit and **liability** credit accounts (request + service).

### RBAC

- Default **staff** role no longer includes `payroll.view`. Manager+ retains compensation access.
- **Ops note:** Existing workspaces keep previously synced role permissions until roles are re-synced or edited. New tenants get the tightened defaults.

### Employees / Attendance

- `user_id` unique per tenant among non-deleted employees (FormRequest + Pest).
- `check_out` must be on or after `check_in` when both are present.

---

## Security checklist

| Check | Result |
|-------|--------|
| Module catalog + hard deps (Leave/Attendance/Payroll → Employees) | Pass |
| Permission middleware on mutating + sensitive routes | Pass |
| Tenant scoping / isolation tests | Pass |
| Leave lifecycle integrity (days, balance, soft + force delete) | Pass |
| Payroll lifecycle integrity (amounts, locks, journal types) | Pass |
| Staff cannot read salaries by default | Pass (new tenants) |
| Soft-delete / restore authorization present | Pass |
| Frontend `RequireAccess` / `PermissionGate` on HR routes & actions | Pass |
| XSS: leave/attendance/payroll notes as React text nodes | Pass |
| Platform freeze (no parallel auth/tenancy/billing) | Pass |
| Pest Leave / Payroll / Employee / Attendance (security regressions) | **48+ passed** (incl. approved force-delete retention) |
| Headed Playwright Employees / Leave / Attendance / Payroll | **6/6 each** (2026-08-02) |
| Companion PR CI | **Green** (Backend QG + Pest; Frontend QG; Docs QG) |

Ops deploy / smoke / rollback: see [Production Readiness](/deployment/hr-phase7-production-readiness).

---

## Default RBAC after this ship

| Role | Employees | Leave | Attendance | Payroll |
|------|-----------|-------|------------|---------|
| Owner / Admin | Full | Full | Full | Full (incl. approve / pay / post) |
| Manager | View + mutate (per map) | View + create/update + approve | View + mutate | View + create/update + approve/pay/post |
| Staff | View | View | View | **No `payroll.view`** |

Exact permission names: see [Tenant RBAC](/user-guide/tenant-rbac) and module developer guides.

---

## Residual / follow-up (non-blocking)

1. **Partial unique indexes** for soft-deleted uniques (`leave_balances`, `attendance_records`, `payroll_profiles`, `employees.user_id`) to avoid recreate / race collisions.
2. **Whitelist `sort`/`direction`** across tenant list services (platform-wide hardening).
3. **Optional SoD**: reject leave/pay approve when actor is creator (config flag).
4. **FK + index** on `pay_runs.journal_entry_id`.
5. **Remove privileged attributes** from model `$fillable` and use explicit `forceFill` in services.
6. **Overlap validation** for pending/approved leave ranges per employee.
7. **Re-sync default role permissions** for existing tenants that already received `payroll.view` on staff.

---

## Test evidence

```bash
# Backend
cd EloSync-Backend
php artisan test --compact \
  tests/Feature/Tenant/Leave/LeaveManagementTest.php \
  tests/Feature/Tenant/Payroll/PayrollTest.php \
  tests/Feature/Tenant/Employee/EmployeeTest.php \
  tests/Feature/Tenant/Attendance/AttendanceTest.php

# Frontend headed (per module)
cd EloSync-Frontend
npm run test:e2e:employees:headed
npm run test:e2e:leave-management:headed
npm run test:e2e:attendance:headed
npm run test:e2e:payroll:headed
```

Security coverage: inflated leave days, insufficient balance on approve, soft + force delete of approved leave, balance upsert RBAC, derived remaining, negative pay-run gross, wrong journal account types, staff `payroll.view` denial, unique employee `user_id`, attendance check-out ordering.

---

## Related PRs / artifacts

| Repo | PR | Branch | CI (re-check) |
|------|-----|--------|---------------|
| EloSync-Backend | [#72](https://github.com/DiligentCreators/EloSync-Backend/pull/72) | `feature/phase-7-hr-9630` | Quality Gate ✅ · Pest ✅ · CLEAN (draft) |
| EloSync-Frontend | [#66](https://github.com/DiligentCreators/EloSync-Frontend/pull/66) | `feature/phase-7-hr-9630` | Quality Gate ✅ · CLEAN (draft) |
| EloSync-Docs | [#75](https://github.com/DiligentCreators/EloSync-Docs/pull/75) | `feature/phase-7-hr-9630` | Quality Gate ✅ · CLEAN (draft) |
| elosync-website | [#12](https://github.com/DiligentCreators/EloSync-Website/pull/12) | `feature/phase-7-hr-9630` | CLEAN (draft; no required checks) |

---

## Sign-off

| Role | Decision |
|------|----------|
| Security audit | Remediation complete — no open Critical/High |
| Production readiness | Complete ops checklist in [Production Readiness](/deployment/hr-phase7-production-readiness) |
| Recommended next step | Mark draft PRs ready → merge Backend → Frontend → Docs → Website → migrate staging → smoke → production migrate |
