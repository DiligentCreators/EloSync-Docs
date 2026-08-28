# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`. Catalog **1.2.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes; work_mode + reason FKs |
| `AttendanceReason` | `attendance_reasons` | Catalog kinds `check_in_late` / `check_out`; protected `is_other` |

Enums: `AttendanceStatusEnum`, `AttendanceWorkModeEnum`, `AttendanceReasonKindEnum`.

Service: `AttendanceRecordService` (CRUD + stats + today + checkIn/checkOut + optional `markLoginCheckIn`). `AttendanceReasonService` ensures Other defaults.

**Ownership:** Staff may only act on their linked active employee. Prefer `POST .../check-in` and `.../check-out` for self-service (late classification + reasons). Admin/manager via `AttendanceRecordPolicy::canManageOthers`.

Tenant settings (`attendance` group): office hours, `attendance_self_check_enabled`, `attendance_auto_check_in_on_login` (default **false**), `attendance_require_late_reason`, `remote_office_start_time`, `remote_grace_minutes`, `work_week_days`. Workspace timezone drives “today” and late thresholds.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `AttendanceRecord`, `AttendanceReason` |
| Services | `AttendanceRecordService`, `AttendanceReasonService` |
| Controllers | `AttendanceRecordController`, `AttendanceReasonController` |
| Tests | `tests/Feature/Tenant/Attendance/` |

## API

See [tenant-v1-attendance.md](/api/tenant-v1-attendance).

## Frontend

- `attendanceRecordService` / `attendanceReasonService`
- List: search + check-in/out + HH:MM timer + reasons dialog
- Settings → Attendance toggles

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Attendance
```
