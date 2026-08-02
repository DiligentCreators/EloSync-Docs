# Payroll Module

Phase 7 HR module on the frozen platform. Manages **payroll profiles** (base salary / frequency) and **pay runs** with draft → approve → pay lifecycle. Hard-depends on **Employees**. Soft-depends on **Accounting** for optional journal posting.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [payroll.md](/user-guide/payroll) |
| Engineers | [payroll.md](/developer-guide/payroll) |
| Production / ops | [payroll.md](/deployment/payroll) |
| Tenant API | [../api/tenant-v1-payroll.md](/api/tenant-v1-payroll) |

## Capabilities

- One payroll profile per employee (base salary, currency, pay frequency)
- Pay runs for a period; auto-generate lines from **active** employees’ profiles
- Line fields: gross, adjustments, net, plus working/unpaid-leave/absent/present day breakdown
- Soft inputs from Leave Management (unpaid approved leave) and Attendance (unexcused absences)
- Lifecycle: **draft → approved → paid**
- Optional **post** to Accounting: creates a draft journal (expense debit / liability credit) when Accounting is entitled
- Soft delete / restore / force delete (draft-only delete for pay runs)
- Module licensing (`module:payroll`) + Spatie permissions — **free Marketplace opt-in**
- Hard dependency on `employees`; optional dependency on `accounting`

## Permissions

`payroll.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `approve` · `pay` · `post`

Catalog: slug `payroll`, category `hr`, `sort_order = 40`, free opt-in.

## Explicitly deferred

- Tax engines / filings / statutory deductions
- Bank file export / direct deposit
- Multi-currency payroll
- Benefits and garnishments
