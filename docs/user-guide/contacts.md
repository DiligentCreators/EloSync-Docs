# Contacts — User Guide

## Who can use Contacts

Your workspace must have the **Contacts** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see contacts assigned to you.

## List

Open **Contacts** from the sidebar.

- Search by name, email, phone, company (legacy string), or job title
- Filter by company and assignee, or toggle **My Contacts**
- When a contact is linked to a [Company](/user-guide/companies), the table shows the linked company name (falls back to the legacy company string)
- KPI cards summarize total contacts, my contacts, unassigned, with email, and created this week
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted contact from the row menu
- **Delete permanently** (force delete) requires `contacts.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New contact**
2. Enter name (required) and optional email, phone, job title, and assignee
3. Optionally pick a **Company** (when the Companies module is installed and you can view companies). Selecting a Company links `company_id` and syncs the legacy company text to that organization name. Leaving the picker empty keeps any existing free-text company value on edit; clearing a previously linked Company removes the link
4. Save

Edit from the row menu or the detail drawer.

## Assignment

Users with **assign** can set or clear the assignee from the detail drawer or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the contact
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Converting a Lead to a Contact

When your workspace has both **Leads** and **Contacts** installed, converting a Lead (from the Lead detail drawer) creates a linked Contact. After conversion, the Lead detail drawer shows a **View contact** link that opens the new Contact directly.
