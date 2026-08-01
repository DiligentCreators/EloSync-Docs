# Employees — Production Guide

## Licensing

- Catalog slug: `employees`
- Category: `hr` (sort `70`), module `sort_order = 70`
- Free Marketplace opt-in (`is_default_included = false`, `is_billable = false`)
- No hard module dependencies (foundation for Leave, Attendance, Payroll)

## Bootstrap

1. Run migration `2026_08_01_170000_create_employees_table`
2. Register module via `register_employees_module` (`DefaultModuleRegistrar`)
3. Grant permissions via `add_employees_permissions` (`TenantPermissionSynchronizer`)
4. Deploy frontend HR nav (Employees)

## Deploy checklist

1. Migrate schema + catalog + permissions
2. Confirm `module:employees` + `employees.*` on admin/manager/staff maps
3. Smoke: enable Employees → create/edit employee → soft delete/restore
4. Playwright: `test:e2e:employees`

## Phase 7 roadmap context

Employees is the required base for Leave Management, Attendance, and Payroll. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
