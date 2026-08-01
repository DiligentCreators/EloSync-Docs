# Payroll — Developer Guide

Slug `payroll`, middleware `module:payroll`, permissions `payroll.*`. Hard-depends on `employees`. Optional soft dependency on `accounting` for journal post.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `PayrollProfile` | `payroll_profiles` | One per employee; soft deletes |
| `PayRun` | `pay_runs` | Period + status; nullable `journal_entry_id` |
| `PayRunLine` | `pay_run_lines` | Unique per pay run + employee; no soft deletes |

Enums: `PayFrequencyEnum` (`monthly` \| `biweekly` \| `weekly`), `PayRunStatusEnum` (`draft` → `approved` → `paid`).

Services: `PayrollProfileService`, `PayRunService`.

`PayRunService::create` builds lines from active employees’ profiles. `postToJournal` requires Accounting entitlement and creates a draft journal via `JournalEntryService` (expense debit / liability credit).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `PayrollProfile`, `PayRun`, `PayRunLine` |
| Controllers | `PayrollProfileController`, `PayRunController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/PayrollProfile/*`, `PayRun/*` |
| Tests | `tests/Feature/Tenant/Payroll/` |

## Permissions

```
payroll.view | create | update | delete | restore | force.delete | approve | pay | post
```

## API

See [tenant-v1-payroll.md](/api/tenant-v1-payroll).

## Frontend

- API clients: `payrollProfileService`, `payRunService` in `src/api/services.ts`
- Keys / permissions: `QUERY_KEYS.payroll*`, `QUERY_KEYS.payRuns*`, `PERMISSIONS.payroll`
- Nav under **HR** (module `payroll`)

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Payroll
```
