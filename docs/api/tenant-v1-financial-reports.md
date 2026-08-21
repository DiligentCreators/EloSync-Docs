# Tenant API v1 — Financial Reports

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:financial-reports`, `can:financial-reports.view`.

Requires the Accounting module to be entitled (hard Marketplace dependency).

| Method | Path | Query |
|--------|------|-------|
| GET | `/financial-reports/trial-balance` | `as_of` |
| GET | `/financial-reports/trial-balance/export` | `as_of` |
| GET | `/financial-reports/profit-and-loss` | `from`, `to` |
| GET | `/financial-reports/profit-and-loss/export` | `from`, `to` |
| GET | `/financial-reports/balance-sheet` | `as_of` |
| GET | `/financial-reports/balance-sheet/export` | `as_of` |
| GET | `/financial-reports/aged-receivables` | `as_of` |

All reports aggregate **posted** journal lines only (status `void` excluded). Balance sheet includes a synthetic **Net Income** equity line for fiscal YTD through `as_of` (zero after a proper year-end close). Aged receivables uses historical open balances (invoice total less payments and applied credits dated on or before `as_of`).

`*/export` routes stream CSV with the same filters as the JSON report.
