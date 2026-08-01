# Invoices — User Guide

## Who can use Invoices

Your workspace must have the **Invoices** module installed (free from Marketplace — not auto-installed, and **no other module is required first**). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `void` as needed).

Without **assign**, you only see invoices assigned to you.

## List & table

Open **Invoices** from the sidebar (**Billing**). Search by title or number, filter by status or assignee, toggle **My invoices** or **Overdue only**, and switch KPI cards (Total, My Invoices, Draft, Sent, Overdue) to quick-filter the table. The table shows total, balance due, due date, and the **latest note**; hover a truncated preview to read the full note.

- An **Overdue** badge appears next to the status badge for unpaid, sent/partial invoices past their due date
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted invoice from the row menu
- **Delete permanently** requires `invoices.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New invoice**
2. Enter a title, optional contact/company link (when Contacts/Companies is installed), optional linked quotation, currency (defaults to your workspace currency; full shared currency list), issue date, due date, and notes
3. Add line items (description, quantity, unit price, tax rate) — subtotal, tax, and total are calculated automatically
4. Optionally set an assignee (requires **assign**)
5. Save

Edit from the row menu or the detail sheet while the invoice is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

An invoice starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the invoice as sent in the CRM (does not e-mail the customer or attach a PDF yet); sets the issue date to today if it wasn't set
- **Void** — available from Draft or Sent only; permanently cancels the invoice. Blocked once any payment has been posted or any credit note applied — void the payments first (an applied credit note can't be undone at all), since an invoice moves to **Partial** the moment either happens

**Partial** and **Paid** are not user-driven — they're set automatically as [Payments](/user-guide/payments) are posted against the invoice, or as [Credit Notes](/user-guide/credit-notes) are applied to it.

Invalid transitions (e.g. sending an already-voided invoice) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the detail sheet or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the invoice
- **Activity** — timeline of create, update, assignment, status change, note, void, and delete/restore events

## Related payments and credit notes

If the [Payments](/user-guide/payments) module is installed and you have `payments.view`, the invoice detail sheet shows a **Related payments** link to jump to the Payments module and record or review payments against this invoice. If [Credit Notes](/user-guide/credit-notes) is installed and you have `credit-notes.view`, a **Credit notes** link does the same for credit notes issued against this invoice.

## What's not here yet

Generating invoice PDFs and e-mailing invoices to customers are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
