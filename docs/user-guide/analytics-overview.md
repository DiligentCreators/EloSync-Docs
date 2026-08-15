# Analytics Module

Business Intelligence & Analytics MVP. Free Operations Marketplace module for an **executive overview** of KPIs from entitled CRM, sales, billing, and operations modules. Period filters reuse the shared dashboard period helper. No report builder, saved reports, or CSV export in v1.0.0.

Accounting statements (Trial Balance / P&L / Balance Sheet) remain in [Financial Reports](/user-guide/financial-reports-overview).

## Guides

| Audience | Document |
|----------|----------|
| Operators | [analytics.md](/user-guide/analytics) |
| Engineers | [analytics.md](/developer-guide/analytics) |
| Production | [analytics.md](/deployment/analytics) |
| Tenant API | [../api/tenant-v1-analytics.md](/api/tenant-v1-analytics) |

## Permissions

`analytics.view`

Catalog: slug `analytics`, category `operations`, free opt-in, `sort_order = 70`, version **1.0.0**. **No** hard `module_dependencies` — source modules are soft entitlements.
