# Payroll — Production Guide

## Licensing

- Catalog slug: `payroll`
- Category: `hr`, `sort_order = 40`
- Free Marketplace opt-in
- Version **1.4.0**
- **Hard dependency** on `employees`
- **Optional dependency** on `accounting` (Post to journal + Mark paid Paid-from) — both rows from `add_payroll_employees_dependency`

## Bootstrap

1. Ensure Employees schema + catalog exist
2. Migrate `payroll_profiles`, `pay_runs`, `pay_run_lines` (+ paid-from / payment JE columns on `pay_runs`)
3. Register module + permissions + dependency rows
4. Deploy Payroll UI under HR
5. (Optional) Install Accounting for accrual Post and Mark paid cash/bank deduction

## Deploy checklist

1. Migrate schema + catalog + permissions + dependencies through **1.4.0** (incl. journal entry FKs on `pay_runs`)
2. Confirm Marketplace blocks Payroll without Employees; Accounting remains optional
3. Smoke: profile → pay run (lines from active profiles) → approve → pay
4. With Accounting: Mark paid with **Paid from** → posted accrual + payment journals; cash/bank balance decreases by net. Optional **Post to journal** creates draft accrual first. Locked periods and zero-net runs are rejected.
5. Confirm default **staff** role does **not** include `payroll.view` (compensation restricted to manager+)
6. Pest: `tests/Feature/Tenant/Payroll` (19)
7. [Payroll 1.4.0 paid-from production readiness](/deployment/payroll-1-4-0-paid-from-production-readiness) — **Go** · [Phase 7 HR Production Readiness](/deployment/hr-phase7-production-readiness) · [Security Audit](/deployment/hr-phase7-security-audit)
