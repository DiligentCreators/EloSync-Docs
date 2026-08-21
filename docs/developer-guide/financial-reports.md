# Financial Reports — Developer Guide

Slug `financial-reports`. Hard dependency on `accounting` via `module_dependencies`. Service: `FinancialReportService` (trial balance, P&L, balance sheet, aged receivables). Catalog version **1.1.0**.

## Permissions

`financial-reports.view` only for MVP.

## API

JSON reports plus streamed CSV export (same query params; permission `financial-reports.view`):

| Method | Path |
|--------|------|
| GET | `/financial-reports/trial-balance` |
| GET | `/financial-reports/profit-and-loss` |
| GET | `/financial-reports/balance-sheet` |
| GET | `/financial-reports/aged-receivables` |
| GET | `/financial-reports/trial-balance/export` |
| GET | `/financial-reports/profit-and-loss/export` |
| GET | `/financial-reports/balance-sheet/export` |

See [tenant-v1-financial-reports.md](/api/tenant-v1-financial-reports).

## Frontend

- Route `/financial-reports`
- Report kinds: TB / P&amp;L / BS / **Aged Receivables**
- Currency formatting, classic two-pane Balance Sheet (Assets = L+E check; Net Income = fiscal YTD), report chrome, **Export CSV** for TB / P&amp;L / BS
- Playwright (tenant project, dedicated login session — separate from Accounting):
  - Full module: `npm run test:e2e:financial-reports:modules` / `:headed` — seed posted journals, TB / P&L / Balance Sheet
  - Authz: `npm run test:e2e:financial-reports:authz` / `:headed` — `/403`, hard-dep install block, API gate
  - Smoke + all: `npm run test:e2e:financial-reports` / `:headed`
  - Combined Finance: `npm run test:e2e:finance` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/FinancialReports/FinancialReportTest.php` (report math, CSV export cases, install blocked without Accounting).
