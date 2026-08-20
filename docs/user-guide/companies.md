# Companies — User Guide

## Who can use Companies

Your workspace must have the **Companies** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see companies assigned to you.

## List

Open **Companies** from the sidebar (between Leads and Contacts).

- Search by name, email, phone, website, or industry
- Filter by industry and assignee, or toggle **My Companies**
- KPI cards summarize total companies, my companies, unassigned, with email, and created this week
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted company from the row menu
- **Delete permanently** (force delete) requires `companies.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New company**
2. Enter name (required) and optional email, phone, website, industry, address, source, and assignee
3. Save

Edit from the row menu or the record page.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the company
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Linking Contacts

On a Contact create/edit form, when Companies is installed and you have `companies.view`, pick a **Company** from the picker. The contact’s legacy company text field is kept in sync with the linked Company’s name. The company record page lists linked contacts.
