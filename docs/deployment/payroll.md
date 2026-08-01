# Payroll — Production Guide

## Licensing

- Catalog slug: `payroll`
- Category: `hr`, `sort_order = 40`
- Free Marketplace opt-in
- **Hard dependency** on `employees`
- **Optional dependency** on `accounting` (journal post) — both rows from `add_payroll_employees_dependency`

## Bootstrap

1. Ensure Employees schema + catalog exist
2. Migrate `payroll_profiles`, `pay_runs`, `pay_run_lines`
3. Register module + permissions + dependency rows
4. Deploy Payroll UI under HR
5. (Optional) Install Accounting for `POST /pay-runs/{id}/post`

## Deploy checklist

1. Migrate schema + catalog + permissions + dependencies
2. Confirm Marketplace blocks Payroll without Employees; Accounting remains optional
3. Smoke: profile → pay run (lines from active profiles) → approve → pay
4. With Accounting: post pay run → draft journal linked via `journal_entry_id`
5. Pest: `tests/Feature/Tenant/Payroll`
