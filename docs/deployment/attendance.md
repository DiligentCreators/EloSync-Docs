# Attendance — Production Guide

## Licensing

- Catalog slug: `attendance`
- Category: `hr`, `sort_order = 30`
- Free Marketplace opt-in
- **Hard dependency** on `employees` (`add_attendance_employees_dependency`)

## Bootstrap

1. Ensure Employees schema + catalog exist
2. Migrate `attendance_records`
3. Register module + permissions + dependency row
4. Deploy Attendance UI under HR

## Timezone

Login check-in “today”, check-in clock, and late classification use **Settings → General → Timezone** (same convention as Daily Reminder Time, meetings, and task/follow-up dues). Office start/end are workspace-local `H:i` values — not server UTC. See [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes).

## Deploy checklist

1. Migrate schema + catalog + permissions + dependency
2. Confirm Marketplace blocks install when Employees is missing
3. Smoke: enable Employees + Attendance → create daily record → stats reflect status counts → soft delete/restore
4. Confirm workspace Timezone is set before validating late vs present against office hours
5. Pest: `tests/Feature/Tenant/Attendance`
6. [Production Readiness](/deployment/hr-phase7-production-readiness) · [Security Audit](/deployment/hr-phase7-security-audit)
