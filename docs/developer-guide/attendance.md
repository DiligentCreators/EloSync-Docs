# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`. Catalog **1.6.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes; work_mode + reason FKs; check-in/out IP + lat/lng |
| `AttendanceRecordActivity` | `attendance_record_activities` | Timeline: who / why / field diffs; newest-first |
| `AttendanceReason` | `attendance_reasons` | Catalog kinds `check_in_late` / `check_out`; protected `is_other` |

Enums: `AttendanceStatusEnum`, `AttendanceWorkModeEnum`, `AttendanceReasonKindEnum`, `AttendanceActivityTypeEnum`.

Service: `AttendanceRecordService` (CRUD + stats + today + checkIn/checkOut + optional `markLoginCheckIn` + `timeline`). IP always from `request()->ip()`; coordinates best-effort from the client. Manual `store` / `update` require `change_reason` (min 5 chars) — uses existing `attendance.create` / `attendance.update` (no extra permission).

**Ownership:** Staff may only act on their linked active employee. Self check-in/out (`POST .../check-in`, `.../check-out`, `GET .../today`) requires a linked active employee and `attendance_self_check_enabled` — not `attendance.create` / `attendance.update`. Owner/Admin are org-wide. Department managers (`departments.manager_id`) are scoped to employees in their managed departments (`department_employee` ∪ employees linked via `department_user`, plus own linked employee). Spatie `manager` without a department assignment is self-scoped. List/KPIs/CRUD use `AttendanceRecordPolicy::visibleEmployeeIds` / `canAccessEmployee`.

Tenant settings (`attendance` group): office hours, `attendance_self_check_enabled`, `attendance_auto_check_in_on_login` (default **false**), `attendance_require_late_reason`, `attendance_late_report_enabled` (default **false**) + `attendance_late_report_time` (default `09:30`), `attendance_daily_report_enabled` (default **false**) + `attendance_daily_report_time` (default `08:00`), `remote_office_start_time`, `remote_grace_minutes`, `work_week_days`, `employee_custom_schedules_enabled`, `payroll_deduct_late` + `payroll_late_deduction_rules`, `payroll_deduct_absent`, `payroll_deduct_unpaid_leave`. Workspace timezone drives “today”, late thresholds, and digest send clocks. Auto-login check-in is skipped when the user would be late and late reasons are required. When custom schedules are enabled, late thresholds prefer each employee’s on-site / remote start times. Late remote check-ins store status **Late** with work mode **Remote**.

### Daily email digests

Scheduled command `attendance:send-daily-reports` (every 5 minutes, `onOneServer`) walks entitled tenants:

| Digest | Setting toggle | Send time key | Contents | Recipients |
|--------|----------------|---------------|----------|------------|
| Late today | `attendance_late_report_enabled` | `attendance_late_report_time` | Today’s `status=late` check-ins + active employees past on-site start+grace with no check-in (excludes approved leave when Leave entitled; skips non-work days for the not-arrived bucket) | Owners / Admins (full company); department managers (managed employees only); requires `attendance.view` |
| Yesterday | `attendance_daily_report_enabled` | `attendance_daily_report_time` | Yesterday counts + late rows + missing check-out (`check_in` set, `check_out` null) | Same |

Idempotency via `daily_summary_deliveries` kinds `attendance_late_daily` / `attendance_yesterday_daily`. Notifications: `AttendanceLateDigestNotification` / `AttendanceYesterdayDigestNotification` (database + mail). Empty late digest skips send; yesterday skips when there are no records for that date. Department managers receive a per-recipient scoped payload (skipped when their team has no attention items).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `AttendanceRecord`, `AttendanceRecordActivity`, `AttendanceReason` |
| Services | `AttendanceRecordService`, `AttendanceReasonService`, `AttendanceDailyReportService` |
| Controllers | `AttendanceRecordController`, `AttendanceReasonController` |
| Commands | `attendance:send-daily-reports` |
| Tests | `tests/Feature/Tenant/Attendance/` |

## API

See [tenant-v1-attendance.md](/api/tenant-v1-attendance).

## Frontend

- `attendanceRecordService` / `attendanceReasonService` (+ `timeline`)
- List: search + check-in/out + HH:MM timer + reasons dialog (best-effort geolocation)
- Create/edit: required change reason + best-effort geolocation
- View: IP/location details + edit history timeline
- Login / 2FA / passkey: optional coordinates for auto check-in
- Settings → Attendance: late / yesterday digest toggles + send times (workspace timezone)

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Attendance
```
