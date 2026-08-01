# Accounting — Developer Guide

Mirrors the Leads/Expenses module layers under flat `app/` namespaces. Slug `accounting`, middleware `module:accounting`, permissions `accounting.*`.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `Account` | `accounts` | CoA; `is_system` starter rows; soft deletes |
| `JournalEntry` | `journal_entries` | `draft` \| `posted` \| `void`; `JE-` numbers |
| `JournalEntryLine` | `journal_entry_lines` | debit XOR credit; FK to accounts |

Services: `AccountService`, `JournalEntryService`, `GeneralLedgerService`, `ChartOfAccountsSeederService`.

Events → `AccountingEventSubscriber` → `PlatformAuditService` + Spatie `LogsActivity`.

## API

See [tenant-v1-accounting.md](/api/tenant-v1-accounting).

## Frontend

- Routes: `/accounts`, `/journals`, `/general-ledger`
- Nav group **Finance**, dual-gated `module: accounting` + `PERMISSIONS.accounting.view`
- Production notes: `JournalEntryService::post` / `void` use `DB::transaction` + `lockForUpdate()`; system account `code`/`type` immutable; GL inquiry paginated (100/500).
- Playwright (tenant project, one login session per suite):
  - Full module: `npm run test:e2e:accounting:modules` / `:headed` — validation, CoA CRUD, journal unbalanced/post/void, GL
  - Authz: `npm run test:e2e:accounting:authz` / `:headed` — `/403`, API 401/403, unbalanced 422
  - Smoke + all: `npm run test:e2e:accounting` / `:headed`

## Tests

Pest: `tests/Feature/Tenant/Accounting/` (CRUD, balance validation, post/void, module gate, GL exclusion of voided entries).
