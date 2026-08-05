# Departments — User Guide

## Who can use Departments

Your workspace must have the **Departments** module installed from Marketplace. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `manage_members`, `assign_manager`, `view_performance`, and so on).

## List

Open **Departments** from the sidebar, under the **HR** group.

- Search by name, slug, or description
- Filter by status (Active / Inactive)
- KPI cards summarize total, active, inactive, and departments with a manager
- Workspace owners and admins see all departments
- Department managers see departments they manage
- Staff see departments they belong to

## Create & edit

1. Click **New department**
2. Enter a name (required); optionally description, status, manager, users, and employees
3. Save

The **manager** must be a user with a login. Workspace admins assign managers (you can assign yourself). One user can manage multiple departments. Department managers can update their department and members, but cannot reassign the manager role.

## Members

- **Users** — workspace logins tagged to the department
- **Employees** — HR directory records tagged to the department (requires the Employees module)

Employees without a linked login still appear on the roster for HR, but are excluded from Lead/Task performance until linked.

## Performance

Managers and admins can open the **Performance** tab on a department:

- Headcount (users, employees, performance-eligible, unlinked)
- Lead totals (open / won / lost) when Leads is installed
- Task totals (open / completed / overdue) when Tasks is installed
- Per-member breakdown for linked users; unlinked employees marked as not performance-eligible

Lead and Task list pages are unchanged in this release — managers track team work from the Departments performance view.

## Department reports

Workspace owners and department managers can open **Department reports** from the HR sidebar.

- Choose a **from / to** date range and run the report
- See leads (open / won / lost) and tasks (open / completed) per department
- Owners see all active departments; managers see only departments they manage
- Requires the Departments module and dashboard access

You receive a **weekly email and in-app notification** with the prior week’s department summary when you are an owner or department manager.

## Related modules

- Install **Employees** to tag HR directory members into departments
- Performance aggregates use **Leads** and **Tasks** when those modules are installed
