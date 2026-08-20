# Invoices — User Guide

## Who can use Invoices

Your workspace must have the **Invoices** module installed (free from Marketplace — not auto-installed, and **no other module is required first**). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `void` as needed).

Without **assign**, you only see invoices assigned to you.

## List & table

Open **Invoices** from the sidebar (**Billing**). Search by title or number, filter by status or assignee, toggle **My invoices** or **Overdue only**, and switch KPI cards (Total, My Invoices, Draft, Sent, Overdue) to quick-filter the table. The table shows total, balance due, due date, and the **latest note**; hover a truncated preview to read the full note.

- A **Partial** badge appears when an invoice is **Unpaid** but has payments posted (`amount_paid > 0`) and a remaining balance (`balance_due > 0`). This is display-only — the stored status stays **Unpaid** until the balance clears.
- An **Overdue** badge appears next to the status badge for unpaid invoices past their due date
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted invoice from the row menu
- **Delete permanently** requires `invoices.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New invoice**
2. Enter a title, optional contact/company link (when Contacts/Companies is installed), optional linked quotation, currency (defaults to your workspace currency; full shared currency list), issue date, due date, notes, and optional **Terms & conditions** (rich text — headings, lists, bold/italic/underline)
3. Choose a shared **line discount type** (none, percent, or fixed), then add lines. When **Products** is installed, optionally **select a product** to auto-fill name, details (from the product description), and unit price — you can still edit those fields. Lines also include Qty, Discount value (when type is not none), Tax %, with optional rich-text **Details** under each row — subtotal, discount, tax, and total update automatically. Tax is applied after line discounts. The totals panel also shows **Paid**, **Credits**, and **Balance due** on existing invoices.
4. Optionally set an assignee (requires **assign**)
5. Save with **Create** (returns to the list) or **Create & View** (opens the record). Invoices also offer **Create & Send**.

Edit from the row menu or the record page while the invoice is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Recurring invoices

Turn on **Recurring invoice** when you create (or edit a draft). Choose a frequency (weekly, monthly, quarterly, semi-annually, or yearly). **Next invoice date** fills automatically — one week, month, quarter, six months, or year after the issue date (or after today if the issue date is empty). Month-end dates stay in range (31 January monthly → 28 February). You can still pick a different date. After that, later invoices follow the frequency from the next-invoice date. Optional end date stops generation after that date.

The first invoice is a normal invoice. After you **Send** it, EloSync creates the **next** invoice as a **Draft** on the **Next invoice date** you chose (workspace timezone), copying line items, customer, currency, and assignee. Generated invoices do not copy payments or credits.

When a customer cancels:

1. Open the original recurring invoice and click **Stop recurring**. No further invoices are created. Paid invoices stay paid.
2. Optionally check **Also cancel the latest unpaid generated invoice** if this period’s auto-created draft/unpaid invoice should not be collected. If that invoice already has a payment or credit, void the payment first or issue a [credit note](/user-guide/credit-notes) instead.

Stopping the series does **not** void history by itself.

## Download PDF

**Download PDF** is on the invoice record page and the row menu. It generates a branded PDF using your **Settings → Branding** button color, logo (when uploaded), company profile, and optional bank details — plus line items, subtotal/discount/tax/total breakdown, balance due, and the memo notes. When payments have been posted, the PDF includes a **Payments received** table (date, payment number, method, reference, amount). A **Partial** chip appears when the invoice is unpaid with partial payments. Configure missing company/payment fields under Branding. Sending still does not email the customer.

## Status workflow

An invoice starts in **Draft**. Move it forward with:

- **Send** (`draft → unpaid`) — marks the invoice as unpaid in the CRM (does not e-mail the customer); sets the issue date to today if it wasn't set. If the invoice is recurring, this also starts the series.
- **Cancel** — available from Draft or Unpaid only; permanently cancels the invoice (`cancelled`). Blocked once any payment has been posted or any credit note applied — void the payments first (an applied credit note can't be undone at all). Partial payments keep the invoice **Unpaid** until the balance clears.

**Paid** is set automatically when Payments (or credits) bring the balance to zero.

Invalid transitions (e.g. sending an already-cancelled invoice) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Overview** — shows the invoice memo from the create/edit **Notes** field (also printed on the PDF)
- **Notes** tab — internal activity notes the team adds after the invoice exists (not the same as the memo)
- **Timeline** — create, update, assignment, status change, note, void, delete/restore, and recurring start/stop/generate events

## Related payments and credit notes

If the [Payments](/user-guide/payments) module is installed and you have `payments.view`, the invoice record page shows a **Related payments** link to jump to the Payments module and record or review payments against this invoice. If [Credit Notes](/user-guide/credit-notes) is installed and you have `credit-notes.view`, a **Credit notes** link does the same for credit notes issued against this invoice.

Converted invoices also show the source **Quotation**, **Estimate**, and/or **Contract** when those links are set.

## What's not here yet

E-mailing invoices to customers (with or without the PDF attached) is still planned — see the [Product Roadmap](/getting-started/product-roadmap).
