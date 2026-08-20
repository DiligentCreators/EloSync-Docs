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
2. Optionally choose an **Opportunity** first — this auto-fills **Contact**, **Company**, and **Assignee** when those are set on the opportunity
3. **Linked quotation:** if the opportunity has exactly one quotation it is selected automatically; if there are multiple, pick one manually (or leave none)
4. Enter a title, currency (defaults to your workspace currency; full shared currency list), valid-until date, notes, and optional **Terms & conditions** (rich text — headings, lists, bold/italic/underline)
5. Adjust contact/company/assignee if needed (when those modules/permissions apply)
6. Choose a shared **line discount type** (none, percent, or fixed), then add lines. When **Products** is installed, optionally **select a product** to auto-fill name, details (from the product description), and unit price — you can still edit those fields. Lines also include Qty, Discount value (when type is not none), Tax %, with optional rich-text **Details** under each row — subtotal, discount, tax, and total update automatically. Tax is applied after line discounts.
7. Save

Edit from the row menu or the record page while the estimate is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

An estimate starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the estimate as sent to the customer (does not email the customer or attach a PDF yet)
- **Accept** (`sent → accepted`) or **Reject** / **Expire** via the status action

Invalid transitions (e.g. accepting directly from Draft) are rejected with a validation error.

## Download PDF

**Download PDF** is on the estimate record page and the row menu. It generates a branded PDF using your **Settings → Branding** button color, logo (when uploaded), and company profile — plus line items, discount/tax/total breakdown, and the memo notes. Sending still does not email the customer.

## Convert to invoice

Once an estimate is **Sent** or **Accepted**, use **Convert to invoice** from the record page or row menu:

- Creates a new **draft** invoice with the same title, notes, terms & conditions, currency, `line_discount_type`, contact/company, quotation link, assignee, and a copy of every line item (name, body, discounts)
- Marks the estimate **Accepted** automatically if it wasn't already
- The estimate record page then shows a link to the **converted invoice**
- An estimate can only be converted **once** — the action is hidden once a converted invoice already exists
- Convert is also blocked if the estimate’s linked quotation already has an invoice (from converting that quote, another estimate, or billing a contract that copied the quotation). Use a new estimate or invoice from scratch if you still need another bill

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Overview** — shows the estimate memo from the create/edit **Notes** field (also printed on the PDF)
- **Notes** tab — internal activity notes the team adds after the estimate exists (not the same as the memo)
- **Activity** — timeline of create, update, assignment, status change, conversion, note, and delete/restore events

## Related records

Every estimate record page shows its linked **Contact**, **Company**, **Opportunity**, **Quotation**, and — once converted — the resulting **Invoice**, each with a link to jump straight to that record's detail view.

## What's not here yet

E-mailing estimates to customers (with or without the PDF attached), reversing a conversion, and standalone estimates that don't require Invoices are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
