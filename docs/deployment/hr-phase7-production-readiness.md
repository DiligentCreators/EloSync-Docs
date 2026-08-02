# Phase 7 HR — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-02 |
| **Status** | Ready for merge / staging go-live (opt-in Marketplace) |
| **Scope** | Employees · Leave Management · Attendance · Payroll |
| **Branch** | `feature/phase-7-hr-9630` |
| **Companion** | [Security Audit](/deployment/hr-phase7-security-audit) |

---

## Executive summary

Phase 7 delivers four free HR Marketplace SKUs on the frozen platform. After security remediation and headed browser verification, the modules are **production-ready for opt-in enablement**. They are not default-included; tenants must install from Marketplace (Leave / Attendance / Payroll require Employees first).

**Go / No-Go:** **Go** for staging → production, with the ops follow-ups below.

---

## Ship contents

| SKU | Slug | Depends on | Primary capabilities |
|-----|------|------------|----------------------|
| Employees | `employees` | — | Directory, employment type/status, optional user link, stats |
| Leave Management | `leave-management` | Employees (hard) | Types, balances, draft → submit → approve/reject/cancel |
| Attendance | `attendance` | Employees (hard) | Daily records, unique employee+date, check-in/out |
| Payroll | `payroll` | Employees (hard); Accounting (optional soft) | Profiles, pay runs draft → approve → paid, journal post |

All: `is_default_included: false`, `is_billable: false`, category `hr`.

---

## Deploy order

1. **Backend migrate** (schema + catalog + permissions + dependencies via migrate-only registrars)
2. Deploy **API** (`saas-backend`)
3. Deploy **SPA** (`saas-frontend`) with HR nav group
4. Deploy **Docs** (this pack)
5. Staging smoke (below) before production traffic

No new env vars are required for HR itself. Payroll journal post needs an entitled **Accounting** workspace with active expense + liability accounts.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied on staging/prod DB | Ops | ☐ |
| 2 | Catalog shows four `hr` modules; hard deps Leave/Attendance/Payroll → Employees | Ops | ☐ |
| 3 | Marketplace blocks Leave/Attendance/Payroll when Employees missing | QA | ☐ |
| 4 | Default **staff** role does **not** include `payroll.view` on **new** tenants | QA | ☐ |
| 5 | Existing tenants: staff roles re-synced or manually stripped of `payroll.view` if undesired | Ops | ☐ |
| 6 | Frontend HR routes gated with `RequireAccess` | QA | ☐ |
| 7 | Pest HR suites green in CI | Eng | ☐ |
| 8 | Playwright `test:e2e:employees|leave-management|attendance|payroll` green on staging | QA | ☐ |

---

## Staging smoke (human)

### Employees

1. Enable Employees from Marketplace
2. Create employee (required number + name)
3. Edit, soft-delete, restore
4. Confirm KPIs update

### Leave Management

1. Enable Leave (only after Employees)
2. Create leave type (allowance > 0)
3. Create request without optional days → days auto-calculated
4. Submit → approve → balance `used` increases
5. Confirm approved request cannot be deleted
6. Confirm inflated `days` beyond date range returns 422

### Attendance

1. Enable Attendance
2. Record present with check-in/out
3. Duplicate employee+date returns 422
4. Check-out before check-in returns 422

### Payroll

1. Enable Payroll (+ Accounting if testing journal)
2. Create profile with base salary
3. Create pay run → lines from active profiles
4. Approve → Mark paid
5. Post journal with expense debit + liability credit (or defaults)
6. Confirm staff user cannot `GET /payroll-profiles` (403)

---

## Automated verification

```bash
# Backend
cd saas-backend
php artisan test --compact \
  tests/Feature/Tenant/Employee/EmployeeTest.php \
  tests/Feature/Tenant/Leave/LeaveManagementTest.php \
  tests/Feature/Tenant/Attendance/AttendanceTest.php \
  tests/Feature/Tenant/Payroll/PayrollTest.php

# Frontend headed / CI
cd saas-frontend
npm run test:e2e:employees
npm run test:e2e:leave-management
npm run test:e2e:attendance
npm run test:e2e:payroll
```

**Evidence (2026-08-02 agent run):** Pest HR suites **48 passed** after security hardening; headed Playwright **6/6** per module (Employees, Leave, Attendance, Payroll).

---

## Security posture (summary)

Full detail: [Phase 7 HR Security Audit](/deployment/hr-phase7-security-audit).

| Control | Status |
|---------|--------|
| Tenant isolation (`BelongsToTenant` + Pest isolation) | Pass |
| Module + permission middleware | Pass |
| Leave balance / days integrity | Pass (remediated) |
| Pay-run amount + journal account controls | Pass (remediated) |
| Compensation visibility (no staff `payroll.view`) | Pass (new tenants) |
| Concurrent approve/post locking | Pass (remediated) |

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA build (HR nav disappears for entitled tenants until re-deploy — API remains) |
| Backend code | Redeploy previous release; keep migrations (migrate-only catalog is additive) |
| Module disable | Marketplace uninstall / disable subscription for affected SKUs (data retained via soft deletes) |
| Schema | Do **not** roll back HR migrations in production without a dedicated data plan |

---

## Monitoring & support

- Platform activity log events for leave approve / pay-run approve (existing subscribers)
- Laravel Nightwatch / Telescope for 422/403 spikes on `/api/tenant/v1/{employees,leave-*,attendance-*,pay-*,payroll-*}`
- Support talking points: Employees must be enabled first; staff cannot see salaries by default; approved leave is retained for audit

---

## Accepted residual risk

| Item | Severity | Notes |
|------|----------|-------|
| No SoD on approve (creator may approve) | Info | SMB default; optional flag later |
| Soft-delete uniques include trashed rows | Low | Recreate may need restore; follow-up partial indexes |
| Unvalidated list `sort`/`direction` | Low | Platform-wide pattern |
| Existing tenants may still grant staff `payroll.view` | Medium | Re-sync roles after deploy |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** Ready for production opt-in after staging smoke and staff-role re-sync where needed.
