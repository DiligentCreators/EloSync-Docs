# Accounting — Developer Guide

Mirrors the Leads/Expenses module layers under flat `app/` namespaces. Slug `accounting`, middleware `module:accounting`, permissions `accounting.*`. Catalog version **1.6.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `Account` | `accounts` | CoA; `is_system` starter rows; `is_cash_bank` (asset only); `is_header` (non-postable); optional parent; list/show include `balance` |
| `JournalEntry` | `journal_entries` | `draft` \| `posted` \| `void`; `JE-` numbers |
| `JournalEntryLine` | `journal_entry_lines` | debit XOR credit; FK to postable (non-header) accounts |
| `AccountTransfer` | `account_transfers` | `posted` \| `void`; `TRF-` numbers; linked `journal_entry_id` |
| `AccountBalanceAdjustment` | `account_balance_adjustments` | `posted` \| `void`; `ADJ-` numbers; previous/target/delta + linked JE |
| `AccountingPeriod` | `accounting_periods` | fiscal periods; lock/unlock; year-end close |
| `BankReconciliation` | `bank_reconciliations` | start against cash/bank; clear lines; complete |

Services: `AccountService`, `JournalEntryService`, `GeneralLedgerService`, `ChartOfAccountsSeederService`, `OpeningBalanceService`, `CashMovementJournalService`, `AccountTransferService`, `AccountBalanceAdjustmentService`, `AccountingPeriodService`, `YearEndCloseService`.

Periods: setting `fiscal_year_start_month` (1–12); journal post/void blocked in locked periods; year-end close posts net income into Retained Earnings `3100` and locks the FY period. Balance Sheet Net Income uses fiscal YTD. Bank rec: start / clear lines / complete against cash/bank accounts.

`ChartOfAccountsSeederService` seeds starter CoA (incl. Tax Payable `2100`, Retained Earnings `3100`) and `ensureMissingSystemAccounts` backfills missing system codes for existing workspaces.

`OpeningBalanceService` posts a balanced multi-line opening journal (`POST /accounts/opening-balances`). Header accounts are rejected on journal lines.

`CashMovementJournalService` creates+posts two-line journals and voids linked entries. Used by Payments post/void, Expenses pay, Account Transfers, balance adjustments, and invoice/credit accrual hooks.

`AccountBalanceAdjustmentService::create` reads current balance via `FinancialReportService::currentBalancesFor`, posts the delta, and stores an `ADJ-` row (default offset Equity `3000`).

Events → `AccountingEventSubscriber` → `PlatformAuditService` + Spatie `LogsActivity`.

## Soft dependents

Optional catalog deps (`is_optional=true`): **invoices → accounting**, **credit-notes → accounting**, **payments → accounting**, **expenses → accounting** (same pattern as payroll → accounting).

When Accounting is entitled:

- Invoice **send** (`CustomerInvoiceService::send`): Dr AR `1100` / Cr Sales Revenue `4000` (`REVENUE_CODE`) for invoice total; stores `journal_entry_id`. **Cancel/void** voids the JE.
- Credit note **apply** (`CustomerCreditNoteService::apply`): Dr Revenue `4000` / Cr AR `1100` for credit total; stores `journal_entry_id` (applied remains irreversible — no JE void path).
- Payment **post**: allocations must sum to amount; Dr `deposit_account_id` (or Cash `1000`) / Cr AR `1100` (settles receivable booked on send); void voids the JE.
- Expense **pay**: require `paid_from_account_id`; default expense account `6000`; Dr expense / Cr paid-from for amount+tax.
- No historical backfill for invoices/credits issued before entitlement.

## API

See [tenant-v1-accounting.md](/api/tenant-v1-accounting). Payments/expenses account fields: [tenant-v1-payments](/api/tenant-v1-payments), [tenant-v1-expenses](/api/tenant-v1-expenses).

## Frontend

- Routes: `/accounts`, `/accounts/opening-balances`, `/journals`, `/account-transfers`, `/general-ledger`
- Accounts: parent picker + **Header** (`is_header`) on create/edit; headers excluded from journal account pickers
- Journals: classic Account / Debit / Credit / Memo grid (create/edit/view); list Amount column; currency formatting with blank zero Dr/Cr cells
- Account view: **Set balance** dialog + **Balance adjustments** list/void for cash/bank; opening TB via `/accounts/opening-balances`
- General Ledger: currency columns, journal deep links, **Export CSV** (`GET /general-ledger/export`)
- Nav group **Finance**, dual-gated `module: accounting` + `PERMISSIONS.accounting.view`
- Production notes: `JournalEntryService::post` / `void` use `DB::transaction` + `lockForUpdate()`; system account `code`/`type` immutable; GL inquiry paginated (100/500); cash movements auto-post (not draft-only like Payroll).
- Playwright (tenant project, one login session per suite):
  - Full module: `npm run test:e2e:accounting:modules` / `:headed` — validation, CoA CRUD, journal unbalanced/post/void, transfers smoke, GL
  - Authz: `npm run test:e2e:accounting:authz` / `:headed` — `/403`, API 401/403, unbalanced 422
  - Smoke + all: `npm run test:e2e:accounting` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/Accounting/` (CRUD, cash/bank + balances, transfers, balance adjustments, journal post/void, GL), plus `CustomerInvoiceAccountingTest`, `CustomerCreditNoteAccountingTest`, `CustomerPaymentAccountingTest`, `ExpenseAccountingTest`.
