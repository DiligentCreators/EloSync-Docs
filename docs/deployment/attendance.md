# Attendance — Production Guide

## Licensing

- Catalog slug: `attendance`
- Category: `hr`, `sort_order = 30`
- Free Marketplace opt-in
- **Hard dependency** on `employees` (`add_attendance_employees_dependency`)
- Current catalog version: **1.2.0** (self check-in/out, reasons, remote grace)

## Bootstrap

1. Ensure Employees schema + catalog exist
2. Migrate `attendance_records` + `attendance_reasons` (+ check-in reason / work_mode columns)
3. Register module + permissions + dependency row
4. Deploy Attendance UI under HR

## Timezone

Self check-in “today”, the HH:MM timer, and late classification use **Settings → General → Timezone** (same convention as Daily Reminder Time, meetings, and task/follow-up dues). Office start/end and remote start are workspace-local `H:i` values — not server UTC. See [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes).

## Deploy checklist (1.2.0)

1. Run migrations through `2026_08_28_203200` (reasons table, record columns, catalog bump) and `2026_08_29_003000` (`attendance.force.delete` grant for admin defaults)
2. Confirm Marketplace blocks install when Employees is missing
3. Confirm default roles: staff has `attendance.create` + `attendance.update`; admin has `attendance.force.delete`
4. Smoke:
   - Enable Employees + Attendance
   - Linked user: **Check in** (on-site/remote) → timer survives reload → **Check out**
   - Late path: **Other** requires free text
   - Settings: self-check toggle, auto-login (default off), remote grace
5. When **Auto check-in on login** is on and **Require late check-in reason** is on, late logins **do not** auto check-in (staff must use explicit Check in with a reason)
6. Pest: `tests/Feature/Tenant/Attendance`
7. Playwright: `npm run test:e2e:attendance` (modules suite; authz may skip on pre-entitled demo)
8. [Production Readiness](/deployment/hr-phase7-production-readiness) · [Security Audit](/deployment/hr-phase7-security-audit)

## Related Payroll 1.2.0

If shipping My salary slips in the same release: migrate `2026_08_28_204000` (`payroll.view_own` + payroll catalog **1.2.0**) and smoke **My salary slips** PDF download for a linked staff user.
