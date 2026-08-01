# Financial Reports — Production Guide

## Licensing

- Catalog slug: `financial-reports`
- Category: `finance`, `sort_order = 20`
- Free Marketplace opt-in
- **Hard dependency** on `accounting` (`add_financial_reports_accounting_dependency` migration)

## Deploy checklist

1. Ensure Accounting is registered first
2. Register Financial Reports + permissions + dependency row
3. Deploy frontend `/financial-reports`
4. Smoke: install Accounting then Financial Reports → run Trial Balance / P&L / Balance Sheet
5. Confirm Marketplace blocks Financial Reports install when Accounting is missing
6. Playwright: `test:e2e:financial-reports`
