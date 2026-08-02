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

Body: `employee_id`, `date` (required; unique per employee), optional `check_in` / `check_out` (`HH:MM` or `HH:MM:SS`), `status` (`present`\|`absent`\|`half_day`\|`remote`\|`late`, default `present`), `notes`.

Login side-effect (not a separate route): successful `POST /auth/login` upserts today’s attendance for the user’s active linked employee when `attendance` is installed (first check-in of the day; status `present` or `late` from office hours settings). Stores `check_in_ip` from the request IP and optional `latitude` / `longitude` from the login body as `check_in_latitude` / `check_in_longitude`.

### PUT `/attendance-records/{attendanceRecord}`

Partial update of the same fields.
