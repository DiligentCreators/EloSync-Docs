# Reports (Analytics) — Developer Guide

Slug `analytics` (display name **Reports**). Free Operations Marketplace module (**1.3.0**). Soft-depends on source modules — **no** hard `module_dependencies` rows.

## Services

- `AnalyticsOverviewService` — executive overview sections
- `AnalyticsDomainReportService` — CRM / Sales / Billing / Purchasing / People reports + shared soft gates
- CSV: `App\Exports\Analytics\AnalyticsDomainReportExport`

## Permissions

`analytics.view` (overview, domain reports, CSV export).

## Soft sources

| Area | Modules |
|------|---------|
| CRM | `leads`, `tasks` |
| Sales | `opportunities`, `quotations`, `contracts` |
| Billing | `invoices`, `payments`, `credit-notes` |
| Purchasing | `vendors`, `purchase-orders`, `expenses` |
| People | `employees`, `leave-management`, `attendance` |
| Overview (extra) | also `help-desk`, `projects` |

### Deferred soft sources

| Area | Modules | Notes |
|------|---------|--------|
| People (phase 2) | `payroll` | Higher sensitivity — stricter than plain `analytics.view` if added |

Do **not** merge [Department reports](/developer-guide/departments) or [Financial Reports](/developer-guide/financial-reports) into Analytics; keep those SKUs/surfaces separate (link from People hub if useful).

## Frontend

- Hub `/analytics` (Overview → Reports) — Recharts per entitled module
- Domain pages `/analytics/crm|sales|billing|purchasing|people` — one chart per source module (+ value chart when amounts apply) + table + CSV
- Playwright: `npm run test:e2e:analytics` / `:modules` / `:authz` (+ `:headed`)

## Tests

Pest: `tests/Feature/Tenant/Analytics/` (overview + domain reports + CSV, including People). Charts are SPA-only (no API change).

## Catalog

Migrate-only bumps: `1.0.0` → `1.1.0` (Reports suite) → `1.2.0` (charts) → `1.3.0` (People / HR domain). Entitlements stay on slug `analytics`.

## Related

- [Financial Reports](/developer-guide/financial-reports) — accounting statements (separate SKU)
- [Departments](/developer-guide/departments) — department performance reports (separate owner/manager surface)
- [Module Dependencies](/architecture/module-dependencies)
- [Workspace timezone](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)
