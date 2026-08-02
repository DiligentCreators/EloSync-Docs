# Tenant API v1 — Attendance

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:attendance`, plus `can:attendance.*`.

## Stats

### GET `/attendance-records/stats`

Same filters as list (minus pagination/sort). Payload:

`total`, `present`, `absent`, `half_day`, `remote`.

## Attendance records CRUD

| Method | Path | Permission |
|--------|------|------------|
| GET | `/attendance-records` | `attendance.view` |
| GET | `/attendance-records/stats` | `attendance.view` |
| POST | `/attendance-records` | `attendance.create` |
| GET | `/attendance-records/{attendanceRecord}` | `attendance.view` |
| PUT | `/attendance-records/{attendanceRecord}` | `attendance.update` |
| DELETE | `/attendance-records/{attendanceRecord}` | `attendance.delete` |
| POST | `/attendance-records/{attendanceRecord}/restore` | `attendance.restore` |
| DELETE | `/attendance-records/{attendanceRecord}/force` | `attendance.force.delete` |

### POST `/attendance-records`

Body: `employee_id`, `date` (required; unique per employee), optional `check_in` / `check_out` (`HH:MM` or `HH:MM:SS`), `status` (`present`\|`absent`\|`half_day`\|`remote`, default `present`), `notes`.

### PUT `/attendance-records/{attendanceRecord}`

Partial update of the same fields.
