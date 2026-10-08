# Payroll — Developer Guide

Slug `payroll`, middleware `module:payroll`, permissions `payroll.*`. Hard-depends on `employees`. Optional soft dependency on `accounting` for journal post and Mark paid cash movement.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `PayrollProfile` | `payroll_profiles` | One per employee; soft deletes |
| `PayRun` | `pay_runs` | Period + status; `journal_entry_id` (accrual), `payment_journal_entry_id`, `paid_from_account_id`, `expense_account_id`, `liability_account_id`; journal columns FK → `journal_entries` `nullOnDelete` |
| `PayRunLine` | `pay_run_lines` | Unique per pay run + employee; no soft deletes; includes `daily_rate`, `days_counted` |

Enums: `PayFrequencyEnum` (`monthly` \| `biweekly` \| `weekly`), `PayRunStatusEnum` (`draft` → `approved` → `paid`), `PayrollWorkingDaysBasisEnum` (`work_week` \| `calendar_month`).

Services: `PayrollProfileService`, `PayRunService`, `PayPeriodCalculator`, `MyPaySlipService` (branded Dompdf via `BrandedDocumentPdfContext` + `resources/views/payroll/payslip.blade.php`).

Tenant setting `payroll_working_days_basis` (Attendance group, default `work_week`):

- `work_week` — weekday count in period; gross = base; adjustments = −daily × (unpaid leave + absent + late days)
- `calendar_month` — days in month when the period is 1→last of one month; gross = daily × (working − unpaid − absent); adjustments = −daily × late days only. `PayRunService` rejects partial/cross-month periods with 422. Calculator defense: non-full same-month ranges use inclusive day count as divisor (not `daysInMonth`).

Changing `payroll_working_days_basis` does not rebuild existing draft lines — recreate drafts after switching.

`PayRunService::create` builds lines from active employees’ profiles via `PayPeriodCalculator`. Unpaid leave days use each approved request’s `deduct_salary` flag (defaulted on approve from `!leaveType.is_paid`; null legacy rows fall back to `!is_paid`). Paid leave never enters unpaid leave. Migration `2026_10_01_213611_*` backfills pre-1.5.0 zero `daily_rate`/`days_counted` from `gross`/`working_days`.

`GET pay-runs/{payRun}/export` streams CSV register (`PayRunRegisterExport`) for `payroll.view`.

`postToJournal` requires Accounting entitlement and creates a **draft** accrual via `JournalEntryService` (`Dr` expense / `Cr` liability; defaults Salary Expense `6400` / Salaries Payable `2200`).

`markPaid` without Accounting is status-only. With Accounting: requires `paid_from_account_id` (active cash/bank), ensures accrual is posted (create+post if missing; post if draft), then `CashMovementJournalService::createAndPost` payment (`Dr` liability / `Cr` paid-from).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `PayrollProfile`, `PayRun`, `PayRunLine` |
| Controllers | `PayrollProfileController`, `PayRunController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/PayrollProfile/*`, `PayRun/*` (incl. `PayPayRunRequest`) |
| Tests | `tests/Feature/Tenant/Payroll/` |

## Permissions

```
payroll.view | create | update | delete | restore | force.delete | approve | pay | post
```

## API

See [tenant-v1-payroll.md](/api/tenant-v1-payroll).

## Frontend

- API clients: `payrollProfileService`, `payRunService` in `src/api/services.ts` (incl. `exportRegister`)
- Keys / permissions: `QUERY_KEYS.payroll*`, `QUERY_KEYS.payRuns*`, `PERMISSIONS.payroll`
- Nav under **HR** (module `payroll`)
- Settings → Attendance: working-day basis radios
- List / peek / view: **Approve**, **Mark paid**, **Export CSV**; Accounting entitled → Paid-from dialog (`PayRunMarkPaidDialog`)
- Full page: **Post to journal** for optional early accrual
- Catalog version **1.5.1**

## Pay slip PDF

`MyPaySlipService::render` builds Layout A (matching invoice/receipt chrome):

- Seller header from `BrandedDocumentPdfContext::companyProfile` + `logoDataUri` / `primaryColor`
- Right meta: **PAY SLIP**, status, period dates, slip # zero-padded to 4 digits (`str_pad` on `pay_run_lines.id`, e.g. `0001`)
- Parties: **Employee** | **Period details** (working days, days counted, present/leave/absent/late — daily rate omitted from the employee PDF; still on pay-run line admin/API)
- Amounts table: Salary for days counted + Deduction amount; totals + **PAYABLE SALARY** bar
- Money uses workspace `currency` from Settings → General
- Catalog version **1.5.1**

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Payroll
```
