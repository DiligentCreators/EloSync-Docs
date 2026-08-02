# Departments — Production Guide

## Licensing

- Catalog slug: `departments`
- Category: `hr` (sort `70`), module `sort_order = 71` (catalog seeder `15` within HR)
- Free Marketplace opt-in (`is_default_included = false`, `is_billable = false`)
- No hard module dependencies (works with Users alone; Employees tagging is optional)

## Bootstrap

1. Run migration `2026_08_02_215615_create_departments_table` (creates `departments`, `department_user`, `department_employee`)
2. Register module via `register_departments_module` (`DefaultModuleRegistrar`) — **do not** auto-install
3. Grant permissions via `add_departments_permissions` (`TenantPermissionSynchronizer`)
4. Deploy frontend HR nav (Departments)

## Deploy checklist

1. Migrate schema + catalog + permissions (migrate-only; no `db:seed` in production)
2. Confirm `module:departments` + `departments.*` on admin/manager/staff maps
3. Smoke: Marketplace enable Departments → create department with manager → attach members → open Performance tab
4. Playwright: `test:e2e:departments`

## Go-live

- Confirm Leads/Tasks modules separately if you expect performance aggregates
- Keep legacy `employees.department` string until a later cleanup migration
