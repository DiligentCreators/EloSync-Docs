# Contracts — User Guide

## Who can use Contracts

Your workspace must have the **Opportunities** module installed, then the **Contracts** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `convert` as needed).

Without **assign**, you only see contracts assigned to you.

## List & table

Open **Contracts** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Contracts**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted contract from the row menu
- **Delete permanently** requires `contracts.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New contract**
2. Choose the related **Opportunity** (required) — this auto-fills **Title** (when empty), **Party name** (from the opportunity contact or company), **Value**, **Currency**, and **Assignee** when the opportunity assignee is eligible (workspace owners are not listed). You can still change the fields afterward. End date must be on or after start date.
3. Optionally link a **Quotation** (only shown when the Quotations module is installed). If the opportunity has exactly one quotation, it is selected automatically; with multiple quotations, pick one or leave none
4. Enter a start date (required), optional end date, and optional rich-text **Description** and **Notes** (headings, lists, bold/italic/underline)
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the detail drawer while the contract is still **Draft**. After **Activate**, content fields are locked; use status actions and assignment instead.

## Status workflow

A contract starts in **Draft**. Move it forward with the status action:

- **Activate** (`draft → active`)
- **Expire** (`active → expired`) or **Terminate** (`draft`/`active → terminated`)

Invalid transitions (e.g. expiring directly from Draft) are rejected with a validation error.

## Create invoice

Once a contract is **Active** and **Invoices** is installed, use **Create invoice** from the detail sheet or row menu (`contracts.convert`):

- Creates a new **draft** invoice. Line items come from the linked quotation when it has lines; otherwise a single line uses the contract **value**
- The invoice is linked via `contract_id` (and `quotation_id` when a quotation is linked)
- You can create **more than one** invoice from the same contract (progress billing). The table shows a **Billed** badge after the first invoice
- If the linked quotation already has an invoice, the confirm dialog warns you — the API still allows the extra invoice
- Without Invoices installed, the action is hidden; the API returns a validation error if called directly

## Assignment

Users with **assign** can set or clear the assignee from the detail drawer or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Description** and **Notes** — rich-text memos on the contract (shown on the overview)
- **Notes tab** — free-form comments on the contract
- **Activity** — timeline of create, update, assignment, status change, invoice creation, note, and delete/restore events
