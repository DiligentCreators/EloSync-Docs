# Tenant API v1 — Attendance

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:attendance`, plus `can:attendance.*`.

Catalog version: **1.2.0**.

## Stats

### GET `/attendance-records/stats`

Same filters as list (minus pagination/sort). Payload:

`total`, `present`, `absent`, `half_day`, `remote`, `late`, plus open presence counts `checked_in_open`, `on_site_open`, `remote_open` (today, checked in, not checked out).

## Today / self check-in

| Method | Path | Permission |
|--------|------|------------|
| GET | `/attendance-records/today` | Linked active employee + self-check enabled, **or** `attendance.view` |
| POST | `/attendance-records/check-in` | Linked active employee + self-check enabled (no `attendance.create`) |
| POST | `/attendance-records/check-out` | Linked active employee + self-check enabled (no `attendance.update`) |

### GET `/attendance-records/today`

Returns today’s record for the linked employee (or `null`) plus `meta`:

- `self_check_enabled`, `require_late_reason`, `timezone`, `today`
- `thresholds.on_site` / `thresholds.remote` — `{ start, grace_minutes, is_late_now }`

### POST `/attendance-records/check-in`

Body: `work_mode` (`on_site`\|`remote`), optional `reason_id` / `reason_notes`, optional `latitude` / `longitude`.

Late on-site uses office start + grace; late remote uses remote start + grace. When late and `attendance_require_late_reason` is on, `reason_id` is required; **Other** requires `reason_notes`. Status is `present`/`late` (on-site) or `remote`.

### POST `/attendance-records/check-out`

Body: optional `reason_id` / `reason_notes`, optional location. Check-out reason is optional; **Other** requires notes.

## Attendance reasons

| Method | Path | Permission |
|--------|------|------------|
| GET | `/attendance-reasons` | `attendance.view` |
| POST | `/attendance-reasons` | `attendance.update` (admin/owner catalog) |
| GET | `/attendance-reasons/{attendanceReason}` | `attendance.view` |
| PUT | `/attendance-reasons/{attendanceReason}` | `attendance.update` (admin/owner) |
| DELETE | `/attendance-reasons/{attendanceReason}` | `attendance.update` (admin/owner) |

Kinds: `check_in_late`, `check_out`. Each kind has a protected **Other** row (`is_other`).

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

Login side-effect (optional): when `attendance_auto_check_in_on_login` is **true**, successful `POST /auth/login` may upsert today’s on-site check-in for the user’s active linked employee. Default is **false** — staff must use check-in. If the login would be **late** and `attendance_require_late_reason` is **true**, auto check-in is **skipped** (no reason can be collected on login).

### PUT `/attendance-records/{attendanceRecord}`

Partial update of the same fields (plus work mode / reason fields for managers).
