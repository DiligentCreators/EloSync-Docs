# Quotations — User Guide

## Who can use Quotations

Your workspace must have the **Opportunities** module installed, then the **Quotations** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `accept`, `convert` as needed).

Without **assign**, you only see quotations assigned to you.

## List & table

Open **Quotations** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Quotations**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted quotation from the row menu
- **Delete permanently** requires `quotations.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New quotation** (or open **New quotation** from a [Contact](/user-guide/contacts) record — contact/company are prefilled from the URL)
2. Choose the related **Opportunity** (required) — use **New** to create one inline when Opportunities is installed and you have create permission; selecting an opportunity auto-fills **Contact**, **Company**, and **Assignee** when those are set on the opportunity (you can still change them). Contact and Company pickers also offer **New** when those modules are entitled.
3. Enter a title, optional contact/company link, currency, valid-until date, notes, and optional **Terms & conditions** (rich text — headings, lists, bold/italic/underline)
4. Choose a shared **line discount type** (none, percent, or fixed) for the document, then add lines. When **Products** is installed, optionally **select a product** to auto-fill name, details (from the product description), and unit price — you can still edit those fields. Lines also include Qty, Discount value (when type is not none), Tax %, with optional rich-text **Details** under each row — subtotal, discount, tax, and total update automatically. Tax is applied after line discounts.
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the record page while the quotation is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

A quotation starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the quote as sent in the CRM (does not email the customer by itself). Also issues a customer **accept link** (regenerated when you copy the link or email the customer).
- **Accept** (`sent → accepted`) from the CRM, or let the customer accept via the public link
- **Reject** / **Expire** via the status action (invalidates any outstanding accept link)

Invalid transitions (e.g. accepting directly from Draft) are rejected with a validation error.

## Customer acceptance (e-signature v1)

When a quotation is **Sent**, staff with `quotations.send` can **Copy accept link**. Emailing a Sent quotation also appends the link to the message.

Customers open `/#/accept/quotations/{token}` (no login), review totals and lines, enter their name and email, and confirm. That marks the quotation **Accepted**, records signer name/email/IP on the record, and invalidates the link. Regenerating or re-emailing creates a new link and invalidates the previous one. Links expire at the earlier of **valid until** (end of day) or 30 days.

This is a lightweight accept page — not a full customer portal. Multi-signer and third-party e-sign providers remain deferred.

## Convert to invoice

Once a quotation is **Sent** or **Accepted** and **Invoices** is installed, use **Convert to invoice** from the record page or row menu (`quotations.convert`):

- Creates a new **draft** invoice with the same title, notes, terms & conditions, currency, line discounts, contact/company, assignee, and a copy of every line item
- Marks the quotation **Accepted** automatically if it wasn't already
- The quotation record page then shows a link to the **converted invoice**
- A quotation can only be converted **once** — the action is hidden once any invoice already has this quotation linked (including invoices created from a linked estimate or contract)
- Without Invoices installed, the action is hidden; the API returns a validation error if called directly

## Download PDF

**Download PDF** is on the quotation record page and the row menu. It generates a branded PDF using your **Settings → Branding** button color, logo (when uploaded), and company profile — plus line items (with HTML details), discount/tax/total breakdown, memo notes, and terms & conditions. Long notes and terms continue across as many pages as needed.

## Email customer

After you **Send** the quotation (status is **Sent**, **Accepted**, **Rejected**, or **Expired**), use **Email customer** on the record page (`quotations.send`). The dialog pre-fills the linked contact or company email when available; you can add CC recipients, edit the subject and message, and choose whether to attach the PDF. When the quotation is still **Sent**, the message also includes a customer accept link. Delivery uses your workspace email configuration and appears in **Settings → Email logs**.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Overview** — shows the quotation memo from the create/edit **Notes** field (also printed on the PDF)
- **Notes** tab — internal activity notes the team adds after the quotation exists (not the same as the memo)
- **Activity** — timeline of create, update, assignment, status change, conversion, note, email, signature request, signed, and delete/restore events

## Ask EloSync

With the **AI Assistant** module installed, Ask EloSync can fetch a quotation and propose status changes, assignments, or timeline notes. Nothing is saved until you **confirm** the suggestion. Moving to **Sent** still needs **send**; accepting needs **accept**. See [AI Assistant](/user-guide/ai-assistant).
