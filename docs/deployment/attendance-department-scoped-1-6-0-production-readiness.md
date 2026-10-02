# Attendance department-scoped digests and list (1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-03 |
| **Status** | **Go for production** (migrate catalog bump + smoke department manager scope) |
| **Scope** | Department-scoped attendance digests, list, KPIs, create/update; catalog **attendance 1.5.0 → 1.6.0** |
| **Companion** | [Attendance deployment](./attendance) · [CHANGELOG](/changelog/) |

---

## Executive summary

Attendance visibility and daily digests no longer treat every Spatie `manager` as org-wide. **Owners / Admins** remain company-wide. Users assigned as `departments.manager_id` see and receive digests only for employees in their managed departments (`department_employee` ∪ employees linked via `department_user`, plus their own linked employee). Spatie `manager` without a department assignment is self-scoped and does not receive digests.

**Go / No-Go:** **Go** after migrate `2026_10_03_003500` and staging smoke with two department managers.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Migrate-only catalog **1.6.0** | **Pass** |
| Policy/list/stats/CRUD/delete scoped | **Pass** |
| Digests per-recipient scoped (claim after payload) | **Pass** |
| Analytics People attendance uses `visibleEmployeeIds` | **Pass** |
| Pest attendance + analytics department scope | **Pass** (local PHP 8.5) |
| Settings copy + Docs/CHANGELOG | **Pass** |
| Breaking: Spatie `manager` alone loses org-wide attendance | **Accepted** (documented) |

---

## Audit findings (resolved)

| Severity | Finding | Resolution |
|----------|---------|------------|
| High | Spatie `manager` org-wide break | Intentional; ops: assign dept manager or Admin |
| Medium | Own linked employee omitted from list | `managedTeamEmployeeIds` unions own employee |
| Medium | delete/restore/forceDelete unscoped | Policy now requires `canAccessEmployee` |
| Medium | Digest recipient N+1 `isDepartmentManager` | Prefetch active `manager_id`s |
| Medium | Update request no employee gate | `UpdateAttendanceRecordRequest` uses `canAccessEmployee` |
| Medium | Analytics rule still said `canManageOthers` | `.ai/rules/tenant.md` updated |
| High (coverage) | Missing dept-user / analytics / cross-dept tests | Added and green |
| Low | Yesterday user-guide wording | Aligned with late-report recipient rules |

---

## Deploy checklist

1. Deploy Backend + Frontend + Docs from `feature/attendance-department-scoped-reports`.
2. Migrate: `php artisan migrate --force` through `2026_10_03_003500` (**attendance → 1.6.0**).
3. Confirm `attendance:send-daily-reports` schedule + `emails` queue workers.
4. Smoke:
   - Two departments, each with a manager and late employees → manager A only sees/receives A; Owner sees all
   - Spatie `manager` without `manager_id` → self list only; no digest
   - Department manager with `department_user` membership (linked employee) included in scope
5. Pest: `AttendanceDailyReportDigestTest`, `AttendanceTest` department cases, people analytics department scope, `AttendanceModuleVersion160BumpTest`.

---

## Residual risk

| Risk | Notes |
|------|--------|
| Orgs relying on role-only managers for company attendance | Must assign Admin or department `manager_id` |
| Empty-team department managers | Digests skip when scoped payload empty; list may show only self |

---

## Sign-off

| Role | Status |
|------|--------|
| Engineering | **Go** |
| Staging smoke (two dept managers) | Recommended before wide rollout |
