# Attendance Module

Phase 7 HR module on the frozen platform. Tracks **daily attendance records** per employee (check-in/out and presence status). Hard-depends on **Employees**.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [attendance.md](/user-guide/attendance) |
| Engineers | [attendance.md](/developer-guide/attendance) |
| Production / ops | [attendance.md](/deployment/attendance) |
| Tenant API | [../api/tenant-v1-attendance.md](/api/tenant-v1-attendance) |

## Capabilities

- One record per employee per date (unique)
- Explicit self **check-in / check-out** with live HH:MM timer (server-backed check-in time)
- On-site vs remote work mode; separate remote office start/grace
- Admin-managed late / check-out reasons (**Other** requires free text)
- Optional check-in / check-out times (`HH:MM` or `HH:MM:SS`)
- Status: `present` \| `absent` \| `half_day` \| `remote` \| `late` (SPA badges: Present green, Late red, Absent slate, Half day amber, Remote blue)
- Office hours settings; login auto check-in **off by default** (opt-in setting)
- Notes, soft delete / restore / force delete
- KPIs via `GET /attendance-records/stats` (total + counts per status + open presence)
- Module licensing (`module:attendance`) + Spatie permissions — **free Marketplace opt-in**
- Hard dependency on `employees`

## Permissions

`attendance.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Catalog: slug `attendance`, category `hr`, `sort_order = 30`, free opt-in, version **1.2.0**.

## Explicitly deferred

- Biometric / device integrations
- Geofencing enforcement (coords may still be stored when provided)
- Automatic leave → attendance linking
- Auto check-out on logout
- Timesheets / overtime calculation
