# Payroll — User Guide

Enable **Employees** first, then install **Payroll** from Marketplace (free). For journal posting and bank deduction on Mark paid, also install **Accounting**. Nav appears under **HR**.

## Payroll profiles

1. Open **Payroll profiles** (or Payroll → Profiles).
2. Create one profile per employee: base salary, currency (defaults to workspace currency from Settings → General; editable), pay frequency (monthly / biweekly / weekly), optional effective-from date and notes.
3. Only **active** employees with a profile are included when you create a pay run.

## Pay runs

1. Create a pay run with period start and end dates.
2. The system generates a line per active employee profile:
   - **Gross** = profile base salary
   - **Daily rate** = gross ÷ working days in the period (from Settings → Attendance work week, default Mon–Fri)
   - **Adjustments** = −daily rate × (unpaid leave days + unexcused absent days + late ladder days), each gated by Settings → Attendance toggles
   - Unpaid leave comes from approved Leave Management requests whose leave type is unpaid (when that module is installed and the unpaid-leave deduction toggle is on)
   - Unexcused absences come from Attendance `absent` / uncovered `half_day` records that do not overlap approved leave (when Attendance is installed and the absent deduction toggle is on)
   - Late check-ins stay present for attendance; when the late-deduction toggle is on, a ladder (e.g. 3 lates → 1 day, 6 → 2 days) adds day-salary penalties. One late day never deducts. Payslips show late count and late deduction days.
   - Net is never negative; draft lines stay editable
3. While **draft**, edit period notes and line gross/adjustments (net recalculates). Breakdown columns (work days, unpaid leave, absent, lates, late days) are shown for audit.
4. **Approve** from the pay runs list row menu, the quick peek, or the full record page (requires at least one line).
5. **Mark paid** the same way. When **Accounting** is installed, choose **Paid from** (cash/bank). EloSync posts (or creates and posts) the salary accrual journal, then posts a **payment** journal that credits the paid-from account so that bank’s balance decreases. Without Accounting, Mark paid is status-only.
6. Optionally **Post to journal** from the full record page (approved, before payment) to create a **draft** accrual early (`Dr` Salary Expense `6400` / `Cr` Salaries Payable `2200`). Mark paid posts that draft if it still exists, then posts the payment.

## My salary slips (employees)

Linked employees with `payroll.view_own` (staff by default) can open **My salary slips** and download PDF copies of their **paid** pay-run lines for personal records. Managers with `payroll.view` can also download line PDFs from a paid pay run’s lines table (**Download**).

Pay slip PDFs use the same company branding as invoices and quotations: logo and button color (when **Branded** is entitled), company name/tagline/address/phone/website from **Settings → Branding**, and tax registration ID from **Settings → General** when set. Each slip shows employee details, period attendance breakdown, gross/adjustments, and net pay.

## Workflow

```text
draft → approved → paid
```

Only drafts are editable or soft-deletable. Accounting integration requires active cash/bank (for Mark paid) and Salary Expense / Salaries Payable accounts (starter codes `6400` / `2200`, or overrides on Post).
