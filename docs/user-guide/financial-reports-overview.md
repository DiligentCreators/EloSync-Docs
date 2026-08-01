# Financial Reports Module

Phase 6 Finance reporting SKU. Hard-depends on **Accounting**. Read-only Trial Balance, Profit & Loss, and Balance Sheet built from **posted** journal lines (voided entries excluded).

## Guides

| Audience | Document |
|----------|----------|
| Operators | [financial-reports.md](/user-guide/financial-reports) |
| Engineers | [financial-reports.md](/developer-guide/financial-reports) |
| Production | [financial-reports.md](/deployment/financial-reports) |
| Tenant API | [../api/tenant-v1-financial-reports.md](/api/tenant-v1-financial-reports) |

## Permissions

`financial-reports.view`

Catalog: slug `financial-reports`, category `finance`, hard dependency on `accounting`, free opt-in, `sort_order = 20`.
