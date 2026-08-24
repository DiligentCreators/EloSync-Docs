# Accounting Module

Phase 6 Finance module on the frozen platform. Provides the financial backbone: **chart of accounts**, **manual journal entries** (draft → post → void), **account transfers**, **fiscal periods / year-end close**, **bank reconciliation**, and **general ledger inquiry**. Single-currency. Soft auto-post from **Invoices** (send), **Credit Notes** (apply), **Payments** (deposit), and **Expenses** (paid from) when those modules are entitled alongside Accounting. Aged receivables lives under [Financial Reports](/user-guide/financial-reports-overview).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [accounting.md](/user-guide/accounting) · [tax-types.md](/user-guide/tax-types) |
| Engineers | [accounting.md](/developer-guide/accounting) · [tax-types.md](/developer-guide/tax-types) |
| Production / ops | [accounting.md](/deployment/accounting) |
| Financial Reports | [financial-reports-overview.md](/user-guide/financial-reports-overview) |
| Tenant API | [../api/tenant-v1-accounting.md](/api/tenant-v1-accounting) · [../api/tenant-v1-tax-types.md](/api/tenant-v1-tax-types) |

## Capabilities

- Chart of accounts with types `asset` \| `liability` \| `equity` \| `revenue` \| `expense`
- **Parent / header** hierarchy: `is_header` accounts are non-postable grouping rows; parents on create/edit; headers rejected on journal lines
- **Cash / bank** flag (`is_cash_bank`) on asset accounts; starter Cash `1000` is cash/bank; add multiple banks as custom asset + cash/bank
- **Current balance** on account list/show (from posted journal lines)
- **Opening trial balance**: balanced multi-line journal via `/accounts/opening-balances` (`POST /accounts/opening-balances`)
- **Set balance** on cash/bank accounts: target amount posts a delta journal (`ADJ-`); default offset Owner Equity `3000`; voidable history on the account
- Starter system accounts seeded on first Accounts list (Cash, AR, AP, Tax Payable `2100`, **Withholding Tax Receivable `1150`**, **Withholding Tax Payable `2150`**, Equity, Retained Earnings `3100`, Revenue, common expenses); existing workspaces backfilled via `ensureMissingSystemAccounts`
- **Tax types** catalog ([tax-types](/user-guide/tax-types)): sales tax on billing lines; withholding on customer payments and expense pay
- Journal entries with balanced debit/credit lines (`JE-` numbers)
- Lifecycle: **draft → post → void** (voided entries excluded from GL and reports)
- **Account transfers** (`TRF-` numbers): move money between cash/bank accounts (auto-posted journal; void reverses)
- Soft accrual journals from [Invoices](/user-guide/invoices-overview) (**Send**: Dr AR / Cr Revenue / Cr Tax Payable when tax &gt; 0) and [Credit Notes](/user-guide/credit-notes-overview) (**Apply**: reverse split) when Accounting is installed
- Soft cash movements from [Payments](/user-guide/payments-overview) (Deposit to; optional **withholding** splits deposit vs WHT receivable) and [Expenses](/user-guide/expenses-overview) (Paid from; optional **withholding** splits cash vs WHT payable) when Accounting is installed
- **Fiscal periods**: `fiscal_year_start_month` (Settings → General); period CRUD + lock/unlock (`accounting.void` to unlock); journal post/void blocked in locked periods; year-end close zeros P&L into Retained Earnings `3100` and locks the FY
- **Bank reconciliation**: clear posted cash/bank lines against a statement; complete only when cleared balance matches the statement
- **Bank reconciliation**: start against cash/bank, clear lines, complete
- General ledger inquiry over posted lines with optional account and date filters
- Module licensing (`module:accounting`) + Spatie permissions — **free Marketplace opt-in**
- Soft dependency optional later: Inventory COGS / valuations (not in this MVP)

## Permissions

`accounting.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `post` · `void`

Catalog: slug `accounting`, category `finance`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`. Version **1.7.1** (tax types + withholding; see [tax-types](/user-guide/tax-types)).

## Explicitly deferred

- Auto-posting from Purchase Orders / Inventory (AP/COGS not yet)
- Multi-currency accounting / FX on transfers
- Budgets
- Split a single payment across multiple deposit accounts
- Expense unpay / reverse paid journal from the expense record
- Historical backfill of accrual journals for invoices/credits issued before Accounting entitlement
