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

## Deploy checklist

1. Migrate schema + catalog + permissions + dependency
2. Confirm Marketplace blocks install when Employees is missing
3. Smoke: enable Employees + Attendance → create daily record → stats reflect status counts → soft delete/restore
4. Pest: `tests/Feature/Tenant/Attendance`
