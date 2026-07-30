# Quotations — User Guide

## Who can use Quotations

Your workspace must have the **Opportunities** module installed, then the **Quotations** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `accept` as needed).

Without **assign**, you only see quotations assigned to you.

## List & table

Open **Quotations** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Quotations**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted quotation from the row menu
- **Delete permanently** requires `quotations.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New quotation**
2. Choose the related **Opportunity** (required)
3. Enter a title, optional contact/company link, currency, valid-until date, and notes
4. Add line items (description, quantity, unit price, tax rate) — totals are calculated automatically
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the detail drawer while the quotation is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

A quotation starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the quote as sent in the CRM (does not email the customer or attach a PDF yet)
- **Accept** (`sent → accepted`) or **Reject** / **Expire** via the status action

Invalid transitions (e.g. accepting directly from Draft) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the detail drawer or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the quotation
- **Activity** — timeline of create, update, assignment, status change, note, and delete/restore events
