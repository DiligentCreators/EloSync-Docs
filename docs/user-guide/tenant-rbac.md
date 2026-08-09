# Tenant RBAC — User Guide

Manage who can access your workspace and what they can do.

## Users

Open **Administration → Users**.

When the **Employees** module is installed, creating a user shows **Create employee record** (on by default). That creates a linked Employees directory row for attendance and payroll. For users created before Employees was installed, use the row action **Create employee record** (requires `employees.create`). Suspending a user marks the linked employee inactive (does not terminate them).

| Action | How |
|--------|-----|
| View | Search, filter by status, open a row |
| Create | **New user** → name, email, password, roles; optionally **Create employee record**, **Exclude from lead assignment**, and **Receive all-users daily summary** |
| Edit | Row menu → **Edit** → update details, roles, lead-assignment exclusion, and all-users daily summary |
| Create employee record | Row menu → **Create employee record** when Employees is installed and the user has no linked employee yet (`employees.create`) |
| Activate / Deactivate | Suspend / Unsuspend (when available) |
| Reset password | Row menu → change password |
| Login as user | Row menu → **Login as user** (requires `users.impersonate`; Owner only by default). Cannot target yourself or the workspace Owner. Reason is required; ends via the amber banner. |
| Resend verification | Row menu → **Resend verification** (unverified users; requires `users.verify`) |
| Mark email verified | Row menu → **Mark as verified** when the member never received the email (requires `users.verify`) |
| Delete | Row menu → **Delete** (if your role allows it) |

**Receive all-users daily summary** grants a workspace-wide view of open leads, tasks, and meetings in the daily team email (in addition to **Owners**, who always receive that team rollup). Prefer Admin / manager accounts for the flag. That user receives the team rollup **instead of** a personal summary.

Each person belongs only to **this** workspace. They cannot see users from other workspaces.

Roles control what the user can do. Prefer assigning roles rather than asking for one-off exceptions.

## Roles

Open **Administration → Roles**.

| Action | How |
|--------|-----|
| Create | **New role** → name |
| Edit | Row menu → **Edit** → toggle permissions |
| Clone | Row menu → **Clone** |
| Delete | Row menu → **Delete** (not allowed for Owner / system defaults) |
| Matrix | **Permissions matrix** — read-only overview by module group |

Example roles you might create: Sales Manager, Sales Agent, Finance, Support. Defaults often include Owner (`superadmin`), Administrator, Manager, and Staff.

## Permissions

Permissions are checked actions such as `users.list` or `leads.create`.

- Granted to **roles**, not directly to users (standard setup).
- Grouped by area (Users, Roles, Settings, Leads, Tasks, …) when editing a role.
- Role edit and the **Permissions matrix** only list **core** areas (Users, Roles, Settings, Dashboard, Marketplace, Email logs) plus permissions for modules your workspace currently owns.
- Change access by editing roles; the matrix itself is read-only.

## Modules and access

Two checks apply to product areas (e.g. Leads):

1. Your workspace must **own** (subscribe to) the module.
2. Your role must include the needed permission.

If the workspace does not own the module, nobody can use it—and those module permissions are hidden from role edit and the matrix so you are not asked to assign them. After you install a module from Marketplace, its permission group appears for roles.

## Owner

The person who registered the workspace is the Owner. They have full workspace access by default, can add administrators, and manage users, roles, and settings. They do **not** access the Central (platform) admin console.
