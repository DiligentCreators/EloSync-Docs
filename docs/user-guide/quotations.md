# Quotations — User Guide

## Who can use Quotations

Your workspace must have the **Opportunities** module installed, then the **Quotations** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `accept`, `convert` as needed).

Without **assign**, you only see quotations assigned to you.

## List & table

Open **Quotations** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Quotations**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted quotation from the row menu
- **Delete permanently** requires `quotations.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New quotation**
2. Choose the related **Opportunity** (required) — this auto-fills **Contact**, **Company**, and **Assignee** when those are set on the opportunity (you can still change them)
3. Enter a title, optional contact/company link, currency, valid-until date, notes, and optional **Terms & conditions** (rich text — headings, lists, bold/italic/underline)
4. Choose a shared **line discount type** (none, percent, or fixed) for the document, then add lines. When **Products** is installed, optionally **select a product** to auto-fill name, details (from the product description), and unit price — you can still edit those fields. Lines also include Qty, Discount value (when type is not none), Tax %, with optional rich-text **Details** under each row — subtotal, discount, tax, and total update automatically. Tax is applied after line discounts.
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the detail drawer while the quotation is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

A quotation starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the quote as sent in the CRM (does not email the customer or attach a PDF yet)
- **Accept** (`sent → accepted`) or **Reject** / **Expire** via the status action

Invalid transitions (e.g. accepting directly from Draft) are rejected with a validation error.

## Convert to invoice

Once a quotation is **Sent** or **Accepted** and **Invoices** is installed, use **Convert to invoice** from the detail sheet or row menu (`quotations.convert`):

- Creates a new **draft** invoice with the same title, notes, terms & conditions, currency, line discounts, contact/company, assignee, and a copy of every line item
- Marks the quotation **Accepted** automatically if it wasn't already
- The quotation detail sheet then shows a link to the **converted invoice**
- A quotation can only be converted **once** — the action is hidden once any invoice already has this quotation linked (including invoices created from a linked estimate or contract)
- Without Invoices installed, the action is hidden; the API returns a validation error if called directly

## Download PDF

**Download PDF** is on the quotation detail drawer and the row menu. It generates a branded PDF using your **Settings → Branding** button color, logo (when uploaded), and company profile — plus line items (with HTML details), discount/tax/total breakdown, memo notes, and terms & conditions. Sending still does not email the customer.

## Assignment

Users with **assign** can set or clear the assignee from the detail drawer or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Overview** — shows the quotation memo from the create/edit **Notes** field (also printed on the PDF)
- **Notes** tab — internal activity notes the team adds after the quotation exists (not the same as the memo)
- **Activity** — timeline of create, update, assignment, status change, conversion, note, and delete/restore events
