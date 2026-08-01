# Financial Reports — Developer Guide

Slug `financial-reports`. Hard dependency on `accounting` via `module_dependencies`. Service: `FinancialReportService` (trial balance, P&L, balance sheet).

## Permissions

`financial-reports.view` only for MVP.

## Frontend

- Route `/financial-reports`
- Playwright (tenant project, dedicated login session — separate from Accounting):
  - Full module: `npm run test:e2e:financial-reports:modules` / `:headed` — seed posted journals, TB / P&L / Balance Sheet
  - Authz: `npm run test:e2e:financial-reports:authz` / `:headed` — `/403`, hard-dep install block, API gate
  - Smoke + all: `npm run test:e2e:financial-reports` / `:headed`
  - Combined Finance: `npm run test:e2e:finance` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/FinancialReports/FinancialReportTest.php` (report math + install blocked without Accounting).
