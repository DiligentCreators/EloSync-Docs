# Estimates — User Guide

## Who can use Estimates

Your workspace must have **Invoices** installed first, then the **Estimates** module (both free from Marketplace). Marketplace blocks installing Estimates until Invoices is entitled. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `accept`, `convert` as needed).

Without **assign**, you only see estimates assigned to you.

## List & table

Open **Estimates** from the sidebar (**Billing**, after Credit Notes). Search by title or number, filter by status or assignee, toggle **My estimates**, and switch KPI cards (Total, Mine, Draft, Sent, Accepted, Accepted value) to quick-filter the table. The table shows the **latest note** and a **Converted** badge once an estimate has produced an invoice.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted estimate from the row menu
- **Delete permanently** requires `estimates.force.delete` — granted to the workspace **owner** by default

## Create an estimate

1. Click **New estimate**
2. Enter a title, currency (defaults to your workspace currency; full shared currency list), valid-until date, and notes
3. Optionally link a **Contact** or **Company** (when Contacts/Companies is installed)
4. Optionally link an **Opportunity**, and a **Quotation** for that opportunity, for traceability back to the sales pipeline
5. Add line items (description, quantity, unit price, tax rate) — subtotal, tax, and total are calculated automatically
6. Optionally set an assignee (requires **assign**)
7. Save

Edit from the row menu or the detail sheet while the estimate is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

An estimate starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the estimate as sent to the customer (does not email the customer or attach a PDF yet)
- **Accept** (`sent → accepted`) or **Reject** / **Expire** via the status action

Invalid transitions (e.g. accepting directly from Draft) are rejected with a validation error.

## Convert to invoice

Once an estimate is **Sent** or **Accepted**, use **Convert to invoice** from the detail sheet or row menu:

- Creates a new **draft** invoice with the same title, notes, currency, contact/company, quotation link, assignee, and a copy of every line item
- Marks the estimate **Accepted** automatically if it wasn't already
- The estimate detail sheet then shows a link to the **converted invoice**
- An estimate can only be converted **once** — the action is hidden once a converted invoice already exists

## Assignment

Users with **assign** can set or clear the assignee from the detail sheet or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the estimate
- **Activity** — timeline of create, update, assignment, status change, conversion, note, and delete/restore events

## Related records

Every estimate detail sheet shows its linked **Contact**, **Company**, **Opportunity**, **Quotation**, and — once converted — the resulting **Invoice**, each with a link to jump straight to that record's detail view.

## What's not here yet

Estimate PDFs/e-mail delivery, reversing a conversion, and standalone estimates that don't require Invoices are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
