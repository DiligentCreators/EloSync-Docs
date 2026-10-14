# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`. Catalog **1.10.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes; work_mode + reason FKs; check-in/out IP + lat/lng |
| `AttendanceRecordActivity` | `attendance_record_activities` | Timeline: who / why / field diffs; newest-first |
| `AttendanceReason` | `attendance_reasons` | Catalog kinds `check_in_late` / `check_out`; protected `is_other` |
| `AttendanceHoliday` | `attendance_holidays` | Unique `(tenant_id, date)`; optional name; admin/owner catalog |

Enums: `AttendanceStatusEnum`, `AttendanceWorkModeEnum`, `AttendanceReasonKindEnum`, `AttendanceActivityTypeEnum`.

Service: `AttendanceRecordService` (CRUD + stats + today + checkIn/checkOut + optional `markLoginCheckIn` + `timeline`). `AttendanceMatrixService` builds the month employee×day matrix and CSV/XLSX export (`AttendanceMatrixExport`). `AttendanceWorkCalendar` shares work-week / holiday / infer-absent helpers with `PayPeriodCalculator`. `AttendanceHolidayService` CRUD. IP always from `request()->ip()`; coordinates best-effort from the client. Manual `store` / `update` require `change_reason` (min 5 chars) — uses existing `attendance.create` / `attendance.update` (no extra permission for same-day).

**Month matrix / export:** `GET /attendance-records/matrix` (`attendance.view`) and `GET /attendance-records/export` (`attendance.export`). Rows are visible employees (default Active). Cells: real records (`source=record`), inferred Absent for past/today work days with no record (`source=inferred`), or holiday (`source=holiday`, `status=holiday`). Blank = off day / future. Export codes: `P`/`A`/`L`/`R`/`HD`/`H`. Default admin + manager receive `attendance.export`.

**Holidays:** `GET/POST/PUT/DELETE /attendance-holidays` — view with `attendance.view`; writes require `attendance.update` **and** owner/admin (`AttendanceHolidayPolicy::canManageCatalog`). Holidays skip matrix inference and payroll absent deduction.

**Payroll:** When `payroll_deduct_absent` is on, `PayPeriodCalculator` counts explicit Absent plus inferred missing past/today work days; holidays and approved leave coverage are not deducted as Absent.

**Backdating:** Manual create (or changing `date` on update) for any day other than workspace **today** requires `attendance.backdate`, except the workspace owner (`superadmin`) who may always backdate. Enforced in `StoreAttendanceRecordRequest` / `UpdateAttendanceRecordRequest` and `AttendanceRecordService::constrainDateForActor` via `AttendanceRecordPolicy::canBackdate`. Default admin + manager roles receive `attendance.backdate`; staff does not. Self check-in/out stay today-only.

**Ownership:** Staff may only act on their linked active employee. Self check-in/out (`POST .../check-in`, `.../check-out`, `GET .../today`) requires a linked active employee and `attendance_self_check_enabled` — not `attendance.create` / `attendance.update`. Owner/Admin are org-wide. Department managers (`departments.manager_id`) are scoped to employees in their managed departments (`department_employee` ∪ employees linked via `department_user`, plus own linked employee). Spatie `manager` without a department assignment is self-scoped. List/KPIs/CRUD use `AttendanceRecordPolicy::visibleEmployeeIds` / `canAccessEmployee`.

Tenant settings (`attendance` group): office hours, `attendance_self_check_enabled`, `attendance_auto_check_in_on_login` (default **false**), `attendance_require_late_reason`, `attendance_late_report_enabled` (default **false**) + `attendance_late_report_time` (default `09:30`), `attendance_daily_report_enabled` (default **false**) + `attendance_daily_report_time` (default `08:00`), `remote_office_start_time`, `remote_grace_minutes`, `work_week_days`, `employee_custom_schedules_enabled`, `payroll_deduct_late` + `payroll_late_deduction_rules`, `payroll_deduct_absent`, `payroll_deduct_unpaid_leave`. Workspace timezone drives “today”, late thresholds, and digest send clocks. Auto-login check-in is skipped when the user would be late and late reasons are required. When custom schedules are enabled, late thresholds prefer each employee’s on-site / remote start times. Late remote check-ins store status **Late** with work mode **Remote**.

### Daily email digests

Scheduled command `attendance:send-daily-reports` (every 5 minutes, `onOneServer`) walks entitled tenants:

| Digest | Setting toggle | Send time key | Contents | Recipients |
|--------|----------------|---------------|----------|------------|
| Late today | `attendance_late_report_enabled` | `attendance_late_report_time` | Today’s `status=late` check-ins + active employees past on-site start+grace with no check-in (excludes approved leave when Leave entitled; skips non-work days for the not-arrived bucket) | Department **report recipients** only (`department_report_user`); scoped to department employees (+ employees linked to department users); manager not auto-included; no owner fallback; multi-dept → one combined email |
| Yesterday | `attendance_daily_report_enabled` | `attendance_daily_report_time` | Yesterday counts + late rows + missing check-out (`check_in` set, `check_out` null) | Same |

Idempotency via `daily_summary_deliveries` kinds `attendance_late_daily` / `attendance_yesterday_daily` / `department_task_daily`. Notifications: `AttendanceLateDigestNotification` / `AttendanceYesterdayDigestNotification` / `DepartmentTaskDigestNotification` (database + mail). Empty late digest skips send; yesterday skips when there are no records for that date. Department task summary sends at `task_reminder_time` to the same report recipients.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `AttendanceRecord`, `AttendanceRecordActivity`, `AttendanceReason`, `AttendanceHoliday` |
| Services | `AttendanceRecordService`, `AttendanceRecordReadService`, `AttendanceMatrixService`, `AttendanceWorkCalendar`, `AttendanceHolidayService`, `AttendanceReasonService`, `AttendanceDailyReportService` |
| Exports | `AttendanceMatrixExport` |
| Controllers | `AttendanceRecordController`, `AttendanceReasonController`, `AttendanceHolidayController` |
| Commands | `attendance:send-daily-reports` |
| Tests | `tests/Feature/Tenant/Attendance/` |

## API

See [tenant-v1-attendance.md](/api/tenant-v1-attendance).

## Frontend

- `attendanceRecordService` / `attendanceReasonService` / `attendanceHolidayService` (+ `timeline`)
- List: search + check-in/out + HH:MM timer + reasons dialog (best-effort geolocation)
- Month: matrix with Holiday / inferred Absent; Holidays dialog + day-header quick-mark (admin/owner)
- Create/edit: required change reason + best-effort geolocation
- View: IP/location details + edit history timeline
- Login / 2FA / passkey: optional coordinates for auto check-in
- Settings → Attendance: late / yesterday digest toggles + send times (workspace timezone) + Manage holidays

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Attendance
```
