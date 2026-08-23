# Help Desk — User Guide

## Who can use Help Desk

Enable the **Help Desk** module from Marketplace (free) — no other modules are required first. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `close`, `reopen` as needed).

Without **assign**, you only see tickets assigned to you.

> Help Desk is for **internal workspace support**. To report bugs or request platform features, use [Give Feedback](/user-guide/feedback) — that flow is triaged in Central, not in Help Desk.

## List & table

Open **Help Desk** from the sidebar, under the **Operations** group. Search by subject, number, or description; filter by status, priority, or category; toggle **My Tickets** or **Overdue**; and switch KPI cards (Total, Mine, Open, In Progress, Waiting, Resolved, Closed, Overdue) to quick-filter the table. The table shows category, status, priority, assignee, due date, and the **latest note**.

Use **Manage categories** (visible with `help-desk.create`, `help-desk.update`, or `help-desk.delete`) to add, rename, activate/deactivate, or delete workspace ticket categories. New workspaces start with General, Technical, Billing, Account, and Other. You cannot delete **Other** (default for new tickets). You also cannot delete a category that still has tickets. Renaming a starter category keeps its slug.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted ticket from the row menu
- **Delete permanently** requires `help-desk.force.delete` — granted to the workspace **owner** by default

## Dashboard widget

When Help Desk is installed and you have `help-desk.view`, the dashboard may show **My open tickets** (`help_desk_my_open`) — open tickets assigned to you, with a link to the full list.

## Create a ticket

1. Click **New ticket**
2. Enter a subject and optional description
3. Choose category (from your workspace list) and priority
4. Optionally set a due date (interpreted in your workspace timezone)
5. If **Contacts** or **Companies** are installed, optionally link a contact and/or company
6. If **Knowledge Base** is installed, optionally link one or more articles (published articles for view-only users; editors with `knowledge-base.update` can also link drafts)
7. Optionally set an assignee (requires **assign**); otherwise the ticket defaults to you
8. Save

Edit from the row menu or the ticket page while the ticket is not **Closed**. Closed tickets must be **Reopened** before content edits.

## Status workflow

A ticket starts **Open**. Move it forward with status actions or the status picker:

- **In progress** (`open → in_progress`)
- **Waiting** (`open | in_progress → waiting`) — e.g. blocked on customer reply
- **Resolved** (`open | in_progress | waiting → resolved`)
- **Close** (`open | in_progress | waiting | resolved → closed`) — requires `help-desk.close`
- **Reopen** (`resolved → open` or `closed → open`) — requires `help-desk.reopen`

Invalid transitions are rejected with a validation error. Use **Close** for a terminal closed state; **Resolved** can still move to **Closed** or back to **Open**.

## Optional contact / company links

Both links are **soft** — they only appear in the create/edit form when the corresponding module (**Contacts** / **Companies**) is installed on your workspace, and they're always optional even when installed. A ticket without either link works the same; the links are for cross-referencing to CRM records.

## Optional Knowledge Base links

When **Knowledge Base** is installed, the create/edit form shows a **Knowledge base articles** multi-select. Linked articles appear under **Related articles** on the ticket view (links open the article record). On the article view, **Linked tickets** lists tickets that reference that article when Help Desk is also installed. No hard module dependency — either module can be installed without the other; links are simply unavailable until both are entitled.

## Assignment

Users with **assign** can set or clear the assignee from the ticket page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & timeline

- **Notes** — free-form internal notes on the ticket
- **Timeline** — history of create, update, assignment, status change, note, and delete/restore events

## Due dates & overdue

Set an optional **due date** on create or edit. Overdue filtering and KPIs compare `due_at` against the current instant using the workspace timezone convention (same as Tasks and Leads follow-ups). Tickets in **Resolved** or **Closed** are excluded from the overdue count.

## What's not here yet

SLAs, email/multi-channel intake, customer portal, attachments, `@mentions`, Automation triggers, Communication Template handoff, and Kanban are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
