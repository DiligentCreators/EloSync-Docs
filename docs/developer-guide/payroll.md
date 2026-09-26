# Payroll — Developer Guide

Slug `payroll`, middleware `module:payroll`, permissions `payroll.*`. Hard-depends on `employees`. Optional soft dependency on `accounting` for journal post and Mark paid cash movement.

## Domain

| Model | Table | Notes |
|-------|-------|-------|
| `PayrollProfile` | `payroll_profiles` | One per employee; soft deletes |
| `PayRun` | `pay_runs` | Period + status; `journal_entry_id` (accrual), `payment_journal_entry_id`, `paid_from_account_id`, `expense_account_id`, `liability_account_id`; journal columns FK → `journal_entries` `nullOnDelete` |
| `PayRunLine` | `pay_run_lines` | Unique per pay run + employee; no soft deletes |

Enums: `PayFrequencyEnum` (`monthly` \| `biweekly` \| `weekly`), `PayRunStatusEnum` (`draft` → `approved` → `paid`).

Services: `PayrollProfileService`, `PayRunService`, `PayPeriodCalculator`, `MyPaySlipService` (branded Dompdf via `BrandedDocumentPdfContext` + `resources/views/payroll/payslip.blade.php`).

`PayRunService::create` builds lines from active employees’ profiles via `PayPeriodCalculator` (gross from base salary; adjustments for unpaid leave + unexcused absences when sibling modules are installed). Unpaid leave days use each approved request’s `deduct_salary` flag (defaulted on approve from `!leaveType.is_paid`; null legacy rows fall back to `!is_paid`). Line columns include `working_days`, `unpaid_leave_days`, `absent_days`, `days_present`, late breakdown.

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

- API clients: `payrollProfileService`, `payRunService` in `src/api/services.ts`
- Keys / permissions: `QUERY_KEYS.payroll*`, `QUERY_KEYS.payRuns*`, `PERMISSIONS.payroll`
- Nav under **HR** (module `payroll`)
- List / peek / view: **Approve** and **Mark paid**; Accounting entitled → Paid-from dialog (`PayRunMarkPaidDialog`)
- Full page: **Post to journal** for optional early accrual
- Catalog version **1.4.1**

## Pay slip PDF

`MyPaySlipService::render` builds Layout A (matching invoice/receipt chrome):

- Seller header from `BrandedDocumentPdfContext::companyProfile` + `logoDataUri` / `primaryColor`
- Right meta: **PAY SLIP**, status, period dates, slip id
- Parties: **Employee** (name, number, job title, department, email, phone) | **Period details** (working/present/leave/absent/late fields)
- Amounts table: Gross + Adjustments; totals + **NET PAY** bar; optional notes; footer contact bar
- Money uses workspace `currency` from Settings → General

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Payroll
```
