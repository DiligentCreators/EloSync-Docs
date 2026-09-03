# Activities — User Guide

## Who can use Activities

Your workspace must have the **Activities** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `complete` as needed).

Without **assign**, you only see activities assigned to you.

## List

Open **Activities** from the sidebar under **CRM** (after Meetings).

- Search by subject or body
- Filter by type, status (open / completed), assignee, or toggle **My Activities**
- KPI cards summarize total, my activities, open, completed, and due soon
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted activity from the row menu
- **Delete permanently** requires `activities.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New activity**
2. Choose a type (call, email, note, follow-up, other)
3. Enter subject (required) and optional body / due date / assignee
4. Link at least one **Contact**, **Company**, or **Lead** (pickers appear when those modules are installed — use **New** beside a picker to create and select inline when you have create permission)
5. Save

Edit from the row menu or the record page.

## Complete

From the record page (or row menu when available), **Complete** sets the completed timestamp. Open activities have no `completed_at`.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the engagement
- **Activity** — timeline of create, update, assignment, note, complete, and delete/restore events

When you log or complete an activity linked to a Contact, Company, or Lead, a matching entry appears on that record’s Activity tab.
