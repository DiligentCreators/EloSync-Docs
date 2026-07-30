# Contracts — User Guide

## Who can use Contracts

Your workspace must have the **Opportunities** module installed, then the **Contracts** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see contracts assigned to you.

## List & table

Open **Contracts** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Contracts**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted contract from the row menu
- **Delete permanently** requires `contracts.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New contract**
2. Choose the related **Opportunity** (required)
3. Optionally link a **Quotation** (only shown when the Quotations module is installed)
4. Enter a title, party name, start date (required), optional end date, value, currency, and notes
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the detail drawer while the contract is still **Draft**. After **Activate**, content fields are locked; use status actions and assignment instead.

## Status workflow

A contract starts in **Draft**. Move it forward with the status action:

- **Activate** (`draft → active`)
- **Expire** (`active → expired`) or **Terminate** (`draft`/`active → terminated`)

Invalid transitions (e.g. expiring directly from Draft) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the detail drawer or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the contract
- **Activity** — timeline of create, update, assignment, status change, note, and delete/restore events
