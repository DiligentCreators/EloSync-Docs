# Employees Module

Phase 7 HR foundation module on the frozen platform. Provides the **employee directory** — workforce profiles that Leave Management, Attendance, and Payroll hard-depend on.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [employees.md](/user-guide/employees) |
| Engineers | [employees.md](/developer-guide/employees) |
| Production / ops | [employees.md](/deployment/employees) |
| Tenant API | [../api/tenant-v1-employees.md](/api/tenant-v1-employees) |

## Capabilities

- Employee number, name, email, phone, job title, department
- Hire / termination dates, employment type (`full_time` \| `part_time` \| `contract`)
- Status (`active` \| `inactive` \| `terminated`)
- Optional link to a workspace user (`user_id`)
- Notes, soft delete / restore / force delete
- KPIs via `GET /employees/stats` (total, active, inactive, terminated)
- Module licensing (`module:employees`) + Spatie permissions — **free Marketplace opt-in**
- Audit + activity logging (`employees` log name)

## Permissions

`employees.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Catalog: slug `employees`, category `hr` (HR, category sort `70`), `is_default_included = false`, `is_billable = false`, `sort_order = 70`.

## Downstream modules

| Module | Dependency |
|--------|------------|
| Leave Management | Hard-depends on Employees |
| Attendance | Hard-depends on Employees |
| Payroll | Hard-depends on Employees |

## Explicitly deferred

- Org chart / reporting hierarchy
- Employee self-service portal
- Document / attachment vault
- Import/export
