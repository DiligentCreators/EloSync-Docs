# Analytics — Developer Guide

Slug `analytics`. Free Operations Marketplace module (**1.0.0**). Soft-depends on source modules (leads, opportunities, tasks, invoices, help-desk, projects) — **no** hard `module_dependencies` rows. Service: `AnalyticsOverviewService` (executive overview sections).

## Permissions

`analytics.view` only for MVP.

## Frontend

- Route `/analytics` (Overview nav)
- Playwright (tenant project, dedicated login session):
  - Full module: `npm run test:e2e:analytics:modules` / `:headed`
  - Authz: `npm run test:e2e:analytics:authz` / `:headed` — `/403`, API gate
  - Smoke + all: `npm run test:e2e:analytics` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/Analytics/AnalyticsOverviewTest.php` (module/permission gates, period validation, section omission).

## Related

- [Financial Reports](/developer-guide/financial-reports) — accounting statements (separate SKU)
- [Module Dependencies](/architecture/module-dependencies) — soft vs hard deps
- [Workspace timezone](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)
