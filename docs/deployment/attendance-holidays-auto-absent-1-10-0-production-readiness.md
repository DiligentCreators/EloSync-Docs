# Attendance holidays + auto-absent (1.10.0) — Production Readiness Audit

| Field | Value |
|-------|-------|
| **Scope** | Workspace holidays CRUD; matrix/export Holiday + inferred Absent; payroll deducts inferred absents and skips holidays; catalog **attendance 1.9.0 → 1.10.0** |
| **Companion** | [Attendance deployment](./attendance) · [CHANGELOG](/changelog/) · [User guide](/user-guide/attendance#month-matrix--export) |
| **Date** | 2026-10-14 |

## Verdict

**Ready to ship** after migrate-only catalog bump and Frontend/Docs deploy with Backend.

## Checklist

| Item | Result |
|------|--------|
| `attendance_holidays` unique `(tenant_id, date)` | **Pass** |
| Admin/owner-only holiday writes (`AttendanceHolidayPolicy`) | **Pass** |
| Infer Absent only for past/today work days; never future; never holidays | **Pass** |
| Payroll uses same calendar helpers; leave still skips absent deduction | **Pass** |
| Migrate-only catalog **1.10.0** + CatalogSeeder companion | **Pass** |
| Pest: holiday CRUD, matrix inference, payroll deduction, catalog bump | **Pass** |

## Deploy steps

1. `php artisan migrate --force` — create `attendance_holidays`, catalog → **1.10.0** (do **not** `db:seed`).
2. Deploy Frontend (Settings holidays + Month Holidays / day-header mark) and Docs.
3. Smoke: mark a holiday on a past work day → matrix H, pay run does not deduct that day; unmarked past work day without record → Absent deducted when toggle on.
