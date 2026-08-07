# Tasks — User Guide

## Who can use Tasks

Your workspace must have the **Tasks** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `complete`, `change_due_date` as needed).

Without **assign**, you only see tasks assigned to you.

## Board & list

Open **Tasks** from the sidebar. The default view is the **Board** (columns by status). Switch to **List** for a table.

- Search by title or description
- Filter by status, priority, assignee, and **Overdue** (open items past their due date)
- KPI cards summarize totals, due today / this week, overdue, and completion metrics for your scope — click **Overdue** to apply the same filter
- Table and board both show the **latest note**; hover a truncated preview to read the full note
- Users with **restore** (workspace **admin** by default, plus owner) can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted task from the row menu
- **Delete permanently** (force delete) requires `tasks.force.delete` — granted to the workspace **owner** by default (or any role you assign it to)

Status labels in the UI:

| Value | Label |
|-------|-------|
| `open` | To Do |
| `in_progress` | In Progress |
| `waiting` | Waiting |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Create & edit

1. Click **New task**
2. Enter title (required) and optional description, status, priority, due date, and assignee
3. Save

Edit from the row menu or the detail drawer. Dragging a card on the board auto-saves the new status (no drawer).

## Due dates

You can set a due date when creating a task. Changing the due date later requires the **change due date** permission (`tasks.change_due_date`).

Due dates use the workspace **Timezone** from Settings → General (entered and shown in that zone, not server UTC). When a task is due today or overdue, you get an **in-app** notification for that task. Once per day (at **Daily Reminder Time** in that same timezone, default 09:00), each assignee with due or overdue tasks also receives **one consolidated email** with links to those tasks.

At the same **Daily Reminder Time**, the workspace also sends a **daily CRM summary** email (leads by open stage, open tasks by status, scheduled meetings). Users without **Receive all-users daily summary** get only their own counts. Users with that flag get a user-wise summary for everyone in the workspace instead (not both). See [Workspace timezone](/user-guide/tenant-settings#workspace-timezone).

## Assignment

Users with **assign** can set or clear the assignee. The assignee always receives an in-app notification (and web push when enabled). Email for task assignment is optional and off by default — enable it under **Settings → Notifications**.

## Complete & reopen

Users with **complete** can mark a task completed (sets `completed_at`) or reopen it from the detail drawer.

## Comments & history

- **Comments** — free-form notes (stored as task notes). Type `@` to mention a teammate (the composer shows their name; the system keeps the user id for notifications). They get an in-app notification (and optional email if **Settings → Notifications → Mentioned in a task comment** is on)
- **History** — activity timeline (create, update, assignment, complete, reopen, note, etc.)
