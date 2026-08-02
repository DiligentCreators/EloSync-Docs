# Tenant API v1 — Payroll

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:payroll`, plus `can:payroll.*`.

## Payroll profiles

| Method | Path | Permission |
|--------|------|------------|
| GET | `/payroll-profiles` | `payroll.view` |
| POST | `/payroll-profiles` | `payroll.create` |
| GET | `/payroll-profiles/{payrollProfile}` | `payroll.view` |
| PUT | `/payroll-profiles/{payrollProfile}` | `payroll.update` |
| DELETE | `/payroll-profiles/{payrollProfile}` | `payroll.delete` |
| POST | `/payroll-profiles/{payrollProfile}/restore` | `payroll.restore` |
| DELETE | `/payroll-profiles/{payrollProfile}/force` | `payroll.force.delete` |

Create body: `employee_id` (required, unique per tenant), `base_salary` (required), optional `currency` (3 chars, default `USD`), `pay_frequency` (`monthly`\|`biweekly`\|`weekly`), `effective_from`, `notes`.

## Pay runs

| Method | Path | Permission |
|--------|------|------------|
| GET | `/pay-runs` | `payroll.view` |
| POST | `/pay-runs` | `payroll.create` |
| GET | `/pay-runs/{payRun}` | `payroll.view` |
| PUT | `/pay-runs/{payRun}` | `payroll.update` |
| POST | `/pay-runs/{payRun}/approve` | `payroll.approve` |
| POST | `/pay-runs/{payRun}/pay` | `payroll.pay` |
| POST | `/pay-runs/{payRun}/post` | `payroll.post` |
| DELETE | `/pay-runs/{payRun}` | `payroll.delete` |
| POST | `/pay-runs/{payRun}/restore` | `payroll.restore` |
| DELETE | `/pay-runs/{payRun}/force` | `payroll.force.delete` |

### POST `/pay-runs`

Body: `period_start`, `period_end` (required), optional `notes`.

Creates a draft pay run and one line per **active** employee with a payroll profile. Gross starts as `base_salary`; adjustments deduct unpaid leave and unexcused absences when Leave Management / Attendance are installed. Line payload includes `working_days`, `unpaid_leave_days`, `absent_days`, `days_present`, `gross`, `adjustments`, `net`.

### PUT `/pay-runs/{payRun}`

Draft only. Optional `period_start`, `period_end`, `notes`, and `lines[]` with `id` plus optional `gross`, `adjustments`, `notes`. Net is recalculated as `gross + adjustments`.

### POST `/pay-runs/{payRun}/approve`

Requires at least one line. `draft → approved`.

### POST `/pay-runs/{payRun}/pay`

`approved → paid`. Sets `paid_at`.

### POST `/pay-runs/{payRun}/post`

Soft Accounting integration. Body optional: `debit_account_id`, `credit_account_id`.

Requires Accounting entitled; pay run status `approved` or `paid`; net total &gt; 0; not already posted. Creates a **draft** journal (expense debit / liability credit) and stores `journal_entry_id`. Defaults to the first active expense and liability accounts when ids are omitted.
