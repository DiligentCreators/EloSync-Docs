# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes |

Enum: `AttendanceStatusEnum` — `present` \| `absent` \| `half_day` \| `remote` \| `late`.

Service: `AttendanceRecordService` (CRUD + stats + `markLoginCheckIn`). Spatie log name `attendance`.

Tenant settings (`attendance` group): `office_start_time`, `office_end_time`, `attendance_grace_minutes`, `work_week_days`. Those `H:i` values are workspace-local wall clocks; “today”, check-in time, and late classification use `Settings → General → Timezone` via `Carbon::now($workspaceTimezone)` in `AttendanceRecordService::markLoginCheckIn` (same convention as reminders/meetings — see [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)). Login check-in runs from `LoginController` when the module is installed and the user has an active linked employee. Location columns: `check_in_ip`, `check_in_latitude`, `check_in_longitude` (and check-out equivalents).

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/AttendanceRecord.php` |
| Service | `app/Services/Tenant/AttendanceRecordService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/AttendanceRecordController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/AttendanceRecord/*` |
| Tests | `tests/Feature/Tenant/Attendance/` |

## Permissions

```
attendance.view | create | update | delete | restore | force.delete
```

## API

See [tenant-v1-attendance.md](/api/tenant-v1-attendance).

## Frontend

- API client: `attendanceRecordService` in `src/api/services.ts`
- Keys / permissions: `QUERY_KEYS.attendance*`, `PERMISSIONS.attendance`
- Nav under **HR** (module `attendance`)

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Attendance
```
