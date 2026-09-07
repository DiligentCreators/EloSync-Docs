# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`. Catalog **1.4.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes; work_mode + reason FKs; check-in/out IP + lat/lng |
| `AttendanceRecordActivity` | `attendance_record_activities` | Timeline: who / why / field diffs; newest-first |
| `AttendanceReason` | `attendance_reasons` | Catalog kinds `check_in_late` / `check_out`; protected `is_other` |

Enums: `AttendanceStatusEnum`, `AttendanceWorkModeEnum`, `AttendanceReasonKindEnum`, `AttendanceActivityTypeEnum`.

Service: `AttendanceRecordService` (CRUD + stats + today + checkIn/checkOut + optional `markLoginCheckIn` + `timeline`). IP always from `request()->ip()`; coordinates best-effort from the client. Manual `store` / `update` require `change_reason` (min 5 chars) — uses existing `attendance.create` / `attendance.update` (no extra permission).

**Ownership:** Staff may only act on their linked active employee. Self check-in/out (`POST .../check-in`, `.../check-out`, `GET .../today`) requires a linked active employee and `attendance_self_check_enabled` — not `attendance.create` / `attendance.update`. Admin/manager CRUD uses `AttendanceRecordPolicy::canManageOthers` plus `attendance.*` permissions.

Tenant settings (`attendance` group): office hours, `attendance_self_check_enabled`, `attendance_auto_check_in_on_login` (default **false**), `attendance_require_late_reason`, `remote_office_start_time`, `remote_grace_minutes`, `work_week_days`, `employee_custom_schedules_enabled`, `payroll_deduct_late` + `payroll_late_deduction_rules`, `payroll_deduct_absent`, `payroll_deduct_unpaid_leave`. Workspace timezone drives “today” and late thresholds. Auto-login check-in is skipped when the user would be late and late reasons are required. When custom schedules are enabled, late thresholds prefer each employee’s on-site / remote start times. Late remote check-ins store status **Late** with work mode **Remote**.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `AttendanceRecord`, `AttendanceRecordActivity`, `AttendanceReason` |
| Services | `AttendanceRecordService`, `AttendanceReasonService` |
| Controllers | `AttendanceRecordController`, `AttendanceReasonController` |
| Tests | `tests/Feature/Tenant/Attendance/` |

## API

See [tenant-v1-attendance.md](/api/tenant-v1-attendance).

## Frontend

- `attendanceRecordService` / `attendanceReasonService` (+ `timeline`)
- List: search + check-in/out + HH:MM timer + reasons dialog (best-effort geolocation)
- Create/edit: required change reason + best-effort geolocation
- View: IP/location details + edit history timeline
- Login / 2FA / passkey: optional coordinates for auto check-in

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Attendance
```
