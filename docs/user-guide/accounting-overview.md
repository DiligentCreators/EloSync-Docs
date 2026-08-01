# Accounting Module

Phase 6 Finance module on the frozen platform. Provides the financial backbone: **chart of accounts**, **manual journal entries** (draft → post → void), and **general ledger inquiry**. Single-currency MVP — no auto-posting from Invoices, Payments, Credit Notes, or Expenses yet.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [accounting.md](/user-guide/accounting) |
| Engineers | [accounting.md](/developer-guide/accounting) |
| Production / ops | [accounting.md](/deployment/accounting) |
| Financial Reports | [financial-reports-overview.md](/user-guide/financial-reports-overview) |
| Tenant API | [../api/tenant-v1-accounting.md](/api/tenant-v1-accounting) |

## Capabilities

- Chart of accounts with types `asset` \| `liability` \| `equity` \| `revenue` \| `expense`
- Starter system accounts seeded on first Accounts list (Cash, AR, AP, Equity, Revenue, common expenses)
- Journal entries with balanced debit/credit lines (`JE-` numbers)
- Lifecycle: **draft → post → void** (voided entries excluded from GL and reports)
- General ledger inquiry over posted lines with optional account and date filters
- Module licensing (`module:accounting`) + Spatie permissions — **free Marketplace opt-in**
- Soft dependency optional later: Inventory COGS / valuations (not in this MVP)

## Permissions

`accounting.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `post` · `void`

Catalog: slug `accounting`, category `finance`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`.

## Explicitly deferred

- Auto-posting from Billing / Purchasing / Inventory
- Multi-currency accounting
- Fiscal year close / period locks
- Bank reconciliation and budgets
