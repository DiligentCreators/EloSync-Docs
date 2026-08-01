# Financial Reports — Developer Guide

Slug `financial-reports`. Hard dependency on `accounting` via `module_dependencies`. Service: `FinancialReportService` (trial balance, P&L, balance sheet).

## Permissions

`financial-reports.view` only for MVP.

## Frontend

- Route `/financial-reports`
- Playwright: `npm run test:e2e:financial-reports`

## Tests

Pest: `tests/Feature/Tenant/FinancialReports/FinancialReportTest.php` (report math + install blocked without Accounting).
