# Employees — User Guide

## Who can use Employees

Your workspace must have the **Employees** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete` as needed).

## List

Open **Employees** from the sidebar, under the **HR** group.

- Search by name, employee number, email, phone, job title, or department
- Filter by status (Active / Inactive / Terminated) and employment type
- KPI cards summarize total, active, inactive, and terminated headcount
- Users with **restore** can filter trash, then **Restore** or permanently delete

## Create & edit

1. Click **New employee**
2. Enter employee number and name (required); optionally email, phone, job title, department, hire/termination dates, employment type, status, linked user, and notes
3. Save

Edit from the row menu or the detail drawer.

## Convert from Users

If someone already has a workspace login but no Employees directory row (common when Users were created before you installed Employees):

1. Open **Administration → Users**
2. Row menu → **Create employee record** (requires `employees.create`)
3. Confirm — the platform creates a linked employee (name/email from the user, next `EMP-####` number)

You can also create an employee manually and pick the **Linked user** on the employee form. Salary is configured later under **Payroll → Profiles**, not on the employee record.

## Status & employment type

| Field | Values |
|-------|--------|
| Status | Active, Inactive, Terminated |
| Employment type | Full time, Part time, Contract |

Terminated employees remain in the directory for history; leave, attendance, and payroll continue to reference them by id.

## Related modules

Install **Leave Management**, **Attendance**, and **Payroll** from Marketplace (each requires Employees) for leave workflows, daily presence, and pay runs.
