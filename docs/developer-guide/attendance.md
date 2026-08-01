# Attendance — Developer Guide

Slug `attendance`, middleware `module:attendance`, permissions `attendance.*`. Hard-depends on `employees`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `AttendanceRecord` | `attendance_records` | Unique `(tenant_id, employee_id, date)`; soft deletes |

Enum: `AttendanceStatusEnum` — `present` \| `absent` \| `half_day` \| `remote`.

Service: `AttendanceRecordService` (CRUD + stats). Spatie log name `attendance`.

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
