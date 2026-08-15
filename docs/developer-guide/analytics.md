# Reports (Analytics) — Developer Guide

Slug `analytics` (display name **Reports**). Free Operations Marketplace module (**1.2.0**). Soft-depends on source modules — **no** hard `module_dependencies` rows.

## Services

- `AnalyticsOverviewService` — executive overview sections
- `AnalyticsDomainReportService` — CRM / Sales / Billing / Purchasing reports + shared soft gates
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
| Overview (extra) | also `help-desk`, `projects` |

## Frontend

- Hub `/analytics` (Overview → Reports) — Recharts per entitled module
- Domain pages `/analytics/crm|sales|billing|purchasing` — one chart per source module (+ value chart when amounts apply) + table + CSV
- Playwright: `npm run test:e2e:analytics` / `:modules` / `:authz` (+ `:headed`)

## Tests

Pest: `tests/Feature/Tenant/Analytics/` (overview + domain reports + CSV). Charts are SPA-only (no API change).

## Catalog

Migrate-only bumps: `1.0.0` → `1.1.0` (Reports suite) → `1.2.0` (charts). Entitlements stay on slug `analytics`.

## Related

- [Financial Reports](/developer-guide/financial-reports) — accounting statements (separate SKU)
- [Module Dependencies](/architecture/module-dependencies)
- [Workspace timezone](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)
