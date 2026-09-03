# Credit Notes — User Guide

## Who can use Credit Notes

Your workspace must have **Invoices** installed first, then the **Credit Notes** module (both free from Marketplace). Marketplace blocks installing Credit Notes until Invoices is entitled. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `issue`, `apply`, `void`, `refund` as needed).

Without **assign**, you only see credit notes assigned to you.

> **Not the same as Central Billing → credit notes.** This module credits your own customers' invoices. The platform's own Central-side credit note ledger (in the platform admin, not here) tracks credits the platform issues to your workspace against its own module-subscription invoices.

## List & table

Open **Credit Notes** from the sidebar (**Billing**, after Payments). Search by title or number, filter by status or assignee, toggle **My credit notes**, and switch KPI cards (Total, Mine, Draft, Issued, Applied, Applied total) to quick-filter the table.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted credit note from the row menu
- **Delete permanently** requires `credit-notes.force.delete` — granted to the workspace **owner** by default

## Create a credit note

1. Click **New credit note**
2. Pick the **invoice** to credit — the invoice's total and balance due are shown for reference; currency follows the selected invoice
3. Enter a title, issue date, and notes
4. Add line items (description, quantity, unit price, tax rate) — subtotal, tax, and total are calculated automatically
5. Optionally link a contact or company (when Contacts/Companies is installed — **New** creates and selects inline when you have create permission) — defaults to the invoice's own contact/company if left blank
6. Optionally set an assignee (requires **assign**)
7. Save

You can also jump to Credit Notes from an invoice's detail view — the **Credit notes** link filters the table to credit notes issued against that invoice.

Edit from the row menu or the record page while the credit note is still **Draft**. Editing replaces the full line-item list. After **Issue**, content is locked; use status actions and assignment instead.

## Status workflow

A credit note starts in **Draft**. Move it forward with:

- **Issue** (`draft → issued`) — locks the credit note's content and sets the issue date to today if it wasn't set
- **Apply** (`issued → applied`) — adds the credit note's total to the invoice's **amount credited** and reduces its **balance due**, which can also advance the invoice to **Paid** when the balance reaches zero. Blocked if the invoice is not currently unpaid/open for credit, or if the credit note's total exceeds the invoice's current balance due. When **Accounting** is installed, **Apply** also posts Dr Sales Revenue / Cr Accounts Receivable for the credit total
- **Refund** (`applied → refunded`) — reverses the credit on the linked invoice (subtracts from **amount credited**, recalculates balance / status) and voids any linked apply journal when Accounting is installed. Terminal; requires `credit-notes.refund`
- **Void** — available from **Draft** or **Issued** only; permanently cancels the credit note before it has been applied. Once **Applied**, use **Refund** instead

Invalid transitions (e.g. applying a draft credit note, voiding an applied one, or refunding an issued one) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## PDF & email

After you **Issue** a credit note, use **Download PDF** on the record page for a branded PDF (workspace branding, credit note number, lines, totals, and linked invoice).

Users with **issue** can **Email customer** — same dialog pattern as invoices/payments. The **To** field pre-fills from the linked contact or company email when available; you can add CC recipients and edit the subject/message. Issued and applied credit notes support PDF download and email. Delivery uses your workspace email configuration and appears in **Settings → Email logs**.

## Notes & activity

- **Notes** — free-form notes on the credit note
- **Activity** — timeline of create, update, assignment, issue, apply, refund, void, note, emailed, and delete/restore events

## Related invoice

Every credit note record page shows the **Invoice** it was issued against, with a link to jump straight to that invoice's detail view.

## What's not here yet

Standalone credit notes not tied to an invoice and multi-currency conversion are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
