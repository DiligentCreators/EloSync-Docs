# Accounting — Developer Guide

Mirrors the Leads/Expenses module layers under flat `app/` namespaces. Slug `accounting`, middleware `module:accounting`, permissions `accounting.*`. Catalog version **1.2.0**.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `Account` | `accounts` | CoA; `is_system` starter rows; `is_cash_bank` (asset only); list/show include `balance` |
| `JournalEntry` | `journal_entries` | `draft` \| `posted` \| `void`; `JE-` numbers |
| `JournalEntryLine` | `journal_entry_lines` | debit XOR credit; FK to accounts |
| `AccountTransfer` | `account_transfers` | `posted` \| `void`; `TRF-` numbers; linked `journal_entry_id` |
| `AccountBalanceAdjustment` | `account_balance_adjustments` | `posted` \| `void`; `ADJ-` numbers; previous/target/delta + linked JE |

Services: `AccountService`, `JournalEntryService`, `GeneralLedgerService`, `ChartOfAccountsSeederService`, `CashMovementJournalService`, `AccountTransferService`, `AccountBalanceAdjustmentService`.

`CashMovementJournalService` creates+posts two-line journals and voids linked entries. Used by Payments post/void, Expenses pay, Account Transfers, and balance adjustments.

`AccountBalanceAdjustmentService::create` reads current balance via `FinancialReportService::currentBalancesFor`, posts the delta, and stores an `ADJ-` row (default offset Equity `3000`).

Events → `AccountingEventSubscriber` → `PlatformAuditService` + Spatie `LogsActivity`.

## Soft dependents

Optional catalog deps (`is_optional=true`): **payments → accounting**, **expenses → accounting** (same pattern as payroll → accounting).

When Accounting is entitled:

- Payment **post**: allocations must sum to amount; Dr `deposit_account_id` (or Cash `1000`) / Cr AR `1100`; void voids the JE.
- Expense **pay**: require `paid_from_account_id`; default expense account `6000`; Dr expense / Cr paid-from for amount+tax.

## API

See [tenant-v1-accounting.md](/api/tenant-v1-accounting). Payments/expenses account fields: [tenant-v1-payments](/api/tenant-v1-payments), [tenant-v1-expenses](/api/tenant-v1-expenses).

## Frontend

- Routes: `/accounts`, `/journals`, `/account-transfers`, `/general-ledger`
- Account view: **Set balance** dialog + **Balance adjustments** list/void for cash/bank
- Nav group **Finance**, dual-gated `module: accounting` + `PERMISSIONS.accounting.view`
- Production notes: `JournalEntryService::post` / `void` use `DB::transaction` + `lockForUpdate()`; system account `code`/`type` immutable; GL inquiry paginated (100/500); cash movements auto-post (not draft-only like Payroll).
- Playwright (tenant project, one login session per suite):
  - Full module: `npm run test:e2e:accounting:modules` / `:headed` — validation, CoA CRUD, journal unbalanced/post/void, transfers smoke, GL
  - Authz: `npm run test:e2e:accounting:authz` / `:headed` — `/403`, API 401/403, unbalanced 422
  - Smoke + all: `npm run test:e2e:accounting` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/Accounting/` (CRUD, cash/bank + balances, transfers, balance adjustments, journal post/void, GL), plus `CustomerPaymentAccountingTest`, `ExpenseAccountingTest`.
