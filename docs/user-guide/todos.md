# ToDos — User Guide

## Who can use ToDos

Your workspace must have the **ToDos** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete` as needed).

- Regular users only see **their own** to-dos (items they created).
- The **workspace owner** can open ToDos and see everyone’s items (read-only for others’ cards).
- Only the person who created a to-do can edit or delete it.

## Board & list

Open **ToDos** from the sidebar under **CRM**. The default view is the **Board** (columns by status). Switch to **List** for a table.

- Search by title or description
- Filter by status, priority, **tag**, and **Overdue** (open / in-progress items past their due date)
- **Manage tags** opens the workspace to-do tag catalog (Owner can rename/delete)
- Board cards show colored **tag** chips
- Drag a card to another column to auto-save the status change (only your own to-dos; no drawer opens)

Status labels in the UI:

| Value | Label |
|-------|-------|
| `open` | To Do |
| `in_progress` | In Progress |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Create & edit

1. Click **New to-do**
2. Enter title (required) and optional description, status, priority, and due date (workspace timezone from Settings → General). **Overdue** means that due instant has already passed — a to-do due later today is not overdue.
3. Optionally assign **tags** (colored labels). Create a new tag inline with a name and color, then tick it. Only the workspace **Owner** can untick (remove) tags already on a to-do
4. Save

Edit from the row menu or the record page — only when you are the creator. Owners viewing someone else’s to-do see a read-only detail panel.

Tags are a **ToDos-only** catalog (separate from Tasks / Leads / Opportunities). Use **Manage tags** on the list page; the workspace **Owner** can rename or delete catalog tags. The record page shows tag badges — change assignments from Edit (add for any updater; remove for Owner only).

## Delete

Soft-delete from the list row menu. Only the creator can delete. The workspace owner cannot delete another user’s to-do.
