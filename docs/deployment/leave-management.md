# Leave Management — Production Guide

## Licensing

- Catalog slug: `leave-management`
- Category: `hr`, `sort_order = 20`
- Free Marketplace opt-in
- **Hard dependency** on `employees` (`add_leave_management_employees_dependency`)

## Bootstrap

1. Ensure Employees schema + catalog exist
2. Migrate `leave_types`, `leave_balances`, `leave_requests`
3. Register module + permissions + dependency row
4. Deploy Leave Management UI under HR

## Deploy checklist

1. Migrate schema + catalog + permissions + dependency
2. Confirm Marketplace blocks install when Employees is missing
3. Smoke: enable Employees + Leave Management → create type → upsert balance → draft → submit → approve (balance used increases)
4. Pest: `tests/Feature/Tenant/Leave`
5. [Production Readiness](/deployment/hr-phase7-production-readiness) · [Security Audit](/deployment/hr-phase7-security-audit) (days vs range, balance lock, delete rules)
