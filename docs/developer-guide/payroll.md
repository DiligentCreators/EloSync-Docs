# Payroll — Developer Guide

Slug `payroll`, middleware `module:payroll`, permissions `payroll.*`. Hard-depends on `employees`. Optional soft dependency on `accounting` for journal post.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `PayrollProfile` | `payroll_profiles` | One per employee; soft deletes |
| `PayRun` | `pay_runs` | Period + status; nullable `journal_entry_id` |
| `PayRunLine` | `pay_run_lines` | Unique per pay run + employee; no soft deletes |

Enums: `PayFrequencyEnum` (`monthly` \| `biweekly` \| `weekly`), `PayRunStatusEnum` (`draft` → `approved` → `paid`).

Services: `PayrollProfileService`, `PayRunService`, `PayPeriodCalculator`.

`PayRunService::create` builds lines from active employees’ profiles via `PayPeriodCalculator` (gross from base salary; adjustments for unpaid leave + unexcused absences when sibling modules are installed). Unpaid leave days use each approved request’s `deduct_salary` flag (defaulted on approve from `!leaveType.is_paid`; null legacy rows fall back to `!is_paid`). Line columns include `working_days`, `unpaid_leave_days`, `absent_days`, `days_present`. `postToJournal` requires Accounting entitlement and creates a draft journal via `JournalEntryService` (expense debit / liability credit).

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
- List / peek: **Approve** and **Mark paid** on the pay runs row menu and quick peek (`renderViewActions`); full page still has Post to journal
- Catalog version **1.2.1**

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Payroll
```
