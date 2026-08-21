# Accounting Module

Phase 6 Finance module on the frozen platform. Provides the financial backbone: **chart of accounts**, **manual journal entries** (draft → post → void), **account transfers**, and **general ledger inquiry**. Single-currency. Soft auto-post from **Payments** (deposit) and **Expenses** (paid from) when those modules are entitled alongside Accounting.

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
- **Cash / bank** flag (`is_cash_bank`) on asset accounts; starter Cash `1000` is cash/bank; add multiple banks as custom asset + cash/bank
- **Current balance** on account list/show (from posted journal lines)
- Starter system accounts seeded on first Accounts list (Cash, AR, AP, Equity, Revenue, common expenses)
- Journal entries with balanced debit/credit lines (`JE-` numbers)
- Lifecycle: **draft → post → void** (voided entries excluded from GL and reports)
- **Account transfers** (`TRF-` numbers): move money between cash/bank accounts (auto-posted journal; void reverses)
- Soft cash movements from [Payments](/user-guide/payments-overview) (Deposit to) and [Expenses](/user-guide/expenses-overview) (Paid from) when Accounting is installed
- General ledger inquiry over posted lines with optional account and date filters
- Module licensing (`module:accounting`) + Spatie permissions — **free Marketplace opt-in**
- Soft dependency optional later: Inventory COGS / valuations (not in this MVP)

## Permissions

`accounting.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `post` · `void`

Catalog: slug `accounting`, category `finance`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`. Version **1.1.0**.

## Explicitly deferred

- Auto-posting from Invoices / Credit Notes / Purchase Orders / Inventory (AR still moves on payment post; AP/COGS not yet)
- Multi-currency accounting / FX on transfers
- Fiscal year close / period locks
- Bank reconciliation and budgets
- Split a single payment across multiple deposit accounts
- Expense unpay / reverse paid journal from the expense record
