# Reports Module (Analytics)

Business Intelligence **Reports** suite. Free Operations Marketplace module (catalog slug **`analytics`**, version **1.4.0**).

- Executive dashboard with period filters and per-module charts (pie, donut, bar, area, line by context)
- Domain report pages: CRM, Sales, Billing, Purchasing, **People** (KPI + per-module charts + table + CSV)
- Soft-gated by source module entitlement + `{module}.view`
- People leave/attendance metrics follow the same self-scope as Leave / Attendance list APIs
- People soft sources: `employees`, `leave-management`, `attendance`, `payroll` (`payroll.view` required — no staff self-scope)
- No report builder or saved reports in 1.4.x
- Keep [Department reports](/user-guide/departments) and [Financial Reports](/user-guide/financial-reports-overview) separate

| Audience | Doc |
|----------|-----|
| Operators | [analytics.md](/user-guide/analytics) |
| Developers | [developer-guide/analytics](/developer-guide/analytics) |
| API | [tenant-v1-analytics](/api/tenant-v1-analytics) |
| Deploy | [deployment/analytics](/deployment/analytics) |

Accounting TB / P&L / BS remain in [Financial Reports](/user-guide/financial-reports-overview). Department performance stays on [Department reports](/user-guide/departments).
