# Attendance month matrix + export (1.9.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-14 |
| **Status** | **Go for production** (migrate permission + catalog bump; deploy Frontend) |
| **Scope** | Month employee×day matrix UI, `GET /attendance-records/matrix`, CSV/XLSX export, `attendance.export`; catalog **attendance 1.8.0 → 1.9.0** |
| **Companion** | [Attendance deployment](./attendance) · [CHANGELOG](/changelog/) · [User guide](/user-guide/attendance#month-matrix--export) |

---

## Executive summary

Attendance gains a **Month** view (Table | Month) that shows every visible employee as a row and each calendar day as a column, plus CSV/Excel export of the same matrix. Visibility matches list/stats (`AttendanceRecordPolicy::visibleEmployeeIds`). Export requires new `attendance.export` (default Admin + Manager). Empty cells mean no record (Absent is never auto-filled).

**Go / No-Go:** **Go** after migrate through `2026_10_14_205701` and Frontend hard-refresh.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** (Attendance module page; no shell/auth redesign) |
| Migrate-only catalog **1.9.0** + `attendance.export` | **Pass** |
| Matrix/export scoped via `visibleEmployeeIds` | **Pass** |
| Month navigation calendar-safe (no TZ day shift) | **Pass** (fixed before ship) |
| Pest matrix/export/visibility + catalog bump | **Pass** (local PHP 8.5) |
| Headed Playwright attendance modules (shared session) | **Pass** (7/7; authz skipped when demo already entitled) |
| Docs/CHANGELOG | **Pass** |

---

## Audit findings (resolved)

| Severity | Finding | Resolution |
|----------|---------|------------|
| High | Month stepper used `appDayjs('YYYY-MM-01')` and shifted calendar months under non-UTC workspace TZ | Navigate/label with calendar `dayjs(..., 'YYYY-MM-DD', true)`; current month via `monthStartAppDate()` |
| Medium | Plan assumed catalog **1.7.0 → 1.8.0** but digests already shipped **1.8.0** | Shipped **1.8.0 → 1.9.0** |
| Medium | Playwright video required missing ffmpeg binary | Attendance e2e `video/screenshot/trace: 'off'` |
| Low | Validation assertion matched toast + field error (strict mode) | Assert `p.text-destructive` only |
| Low | Export filename / matrix month after prev/next | Stabilized by calendar-safe month state |

---

## Deploy checklist

1. Deploy Backend + Frontend + Docs from the attendance month-matrix branches (or `main` after merge).
2. Migrate: `php artisan migrate --force` through:
   - `2026_10_14_205700_add_attendance_export_permission`
   - `2026_10_14_205701_bump_attendance_module_version_to_1_9_0`
3. Confirm default roles: admin + manager have `attendance.export`; staff does **not**.
4. Smoke:
   - Attendance → **Month** → employee rows + day columns; today column highlighted
   - Prev/next month keeps correct month names (no Jul/Sep jump)
   - Export CSV / Excel → `attendance_MM_YYYY.*` with legend + codes
   - Department manager sees only their team; staff without export gets 403 on export API
5. Pest: `tests/Feature/Tenant/Attendance/AttendanceMatrixTest.php`, `AttendanceModuleVersion190BumpTest`
6. Frontend: `npm run test:e2e:attendance:headed` (shared-session modules suite)

---

## Residual risk

| Risk | Notes |
|------|--------|
| Large workspaces (hundreds of employees × 31 days) | Single matrix payload; monitor response size; pagination not in 1.9.0 |
| Custom roles | Must grant `attendance.export` explicitly if they need download |
| Authz e2e skips when demo already entitled | Expected; Pest covers 403 without export |

---

## Sign-off

| Role | Status |
|------|--------|
| Engineering | **Go** |
| Headed e2e (modules shared session) | **Pass** |
| Staging smoke (Month + Export) | Recommended before wide rollout |
