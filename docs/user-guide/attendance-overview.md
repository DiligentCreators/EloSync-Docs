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
- Optional check-in / check-out times (`HH:MM` or `HH:MM:SS`)
- Status: `present` \| `absent` \| `half_day` \| `remote` \| `late` (SPA badges: Present green, Late red, Absent slate, Half day amber, Remote blue)
- Office hours settings + login auto check-in for linked active employees
- Notes, soft delete / restore / force delete
- KPIs via `GET /attendance-records/stats` (total + counts per status)
- Module licensing (`module:attendance`) + Spatie permissions — **free Marketplace opt-in**
- Hard dependency on `employees`

## Permissions

`attendance.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Catalog: slug `attendance`, category `hr`, `sort_order = 30`, free opt-in.

## Explicitly deferred

- Biometric / device integrations
- Geofencing and GPS check-in
- Automatic leave → attendance linking
- Auto check-out on logout
- Timesheets / overtime calculation
