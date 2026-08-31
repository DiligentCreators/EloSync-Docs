# Purchase Orders — User Guide

## Who can use Purchase Orders

Your workspace must have **Vendors** installed first, then the **Purchase Orders** module (both free from Marketplace). Marketplace blocks installing Purchase Orders until Vendors is entitled. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `receive`, `cancel` as needed).

Without **assign**, you only see purchase orders assigned to you.

## List & table

Open **Purchase Orders** from the sidebar, under the **Purchasing** group (next to Vendors). Search by title or number, filter by status or assignee, toggle **My Purchase Orders**, and switch KPI cards (Total, Mine, Draft, Sent, Partially received, Received) to quick-filter the table. The table shows the vendor and the **latest note**.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted purchase order from the row menu
- **Delete permanently** requires `purchase-orders.force.delete` — granted to the workspace **owner** by default

## Create a purchase order

1. Click **New purchase order**
2. Enter a title and select a **Vendor** (required)
3. Optionally set currency, order date, expected date, and notes
4. Add line items (description, quantity, unit price, tax rate, and optional Product) — subtotal, tax, and total are calculated automatically
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the record page while the purchase order is still **Draft**. Editing replaces the full line-item list. After **Send**, content is locked; use status actions and assignment instead.

## Status workflow

A purchase order starts in **Draft**. Move it forward with:

- **Send** (`draft → sent`) — marks the order as sent to the vendor and unlocks PDF / email
- **Mark partially received** (`sent → partially_received`) — acknowledges some of the order has arrived
- **Mark received** (`sent → received` or `partially_received → received`) — acknowledges the full order has arrived
- **Cancel** (`draft → cancelled`, `sent → cancelled`, or `partially_received → cancelled`)

Invalid transitions (e.g. receiving directly from Draft) are rejected with a validation error. `Received` and `Cancelled` are terminal — no further transitions.

**Partially received** is acknowledgement-only. If both **Products** and **Inventory** are installed, marking an order **Received** posts stock-in for each line with a selected Product that has **Track stock** enabled. You may choose a warehouse when receiving; otherwise the default warehouse is used. Lines without a Product, and products that do not track stock, do not post stock.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## PDF & email vendor

After you **Send** a purchase order, use **Download PDF** on the record page for a branded PO PDF.

Users with **send** (`purchase-orders.send`) can **Email vendor** — same dialog pattern as other billing documents. The **To** field pre-fills from the vendor email when available. Delivery uses your workspace email configuration and appears in **Settings → Email logs**.

## Notes & activity

- **Notes** — free-form notes on the purchase order
- **Activity** — timeline of create, update, assignment, status change, note, emailed, and delete/restore events

## Convert to expense

If the **Expenses** module is installed on your workspace and you have the `purchase-orders.convert` permission, a **Convert to expense** button appears on **Sent**, **Partially received**, and **Received** purchase orders (not on Draft or Cancelled). Converting:

- Creates a **draft** Expense with title, amount, tax amount, currency, and vendor copied from the purchase order, using the seeded **Other** expense category
- Links the new expense back to the purchase order (visible in the expense's **Related records**)
- Is **one-way and one-time** — once converted, the button disappears and the purchase order shows a link to the created expense instead

If Expenses is not installed, the button does not appear; attempting the conversion via the API returns an error explaining that the Expenses module is required.

## What's not here yet

Per-line partial-quantity receiving (header-level **Partially received** only) is planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).
