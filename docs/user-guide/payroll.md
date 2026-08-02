# Payroll — User Guide

Enable **Employees** first, then install **Payroll** from Marketplace (free). For journal posting, also install **Accounting**. Nav appears under **HR**.

## Payroll profiles

1. Open **Payroll profiles** (or Payroll → Profiles).
2. Create one profile per employee: base salary, currency (default USD), pay frequency (monthly / biweekly / weekly), optional effective-from date and notes.
3. Only **active** employees with a profile are included when you create a pay run.

## Pay runs

1. Create a pay run with period start and end dates.
2. The system generates a line per active employee profile (gross = base salary, adjustments = 0, net = gross).
3. While **draft**, edit period notes and line gross/adjustments (net recalculates).
4. **Approve** (requires at least one line) → **Pay** to mark paid.
5. Optionally **Post** to Accounting (approved or paid) to create a draft journal for the net total.

## Workflow

```text
draft → approved → paid
```

Only drafts are editable or soft-deletable. Posting requires the Accounting module and active expense + liability accounts (or explicit account ids).
