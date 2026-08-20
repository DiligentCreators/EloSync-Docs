# Products — User Guide

## Who can use Products

Your workspace needs the free **Products** module. Access is controlled by `products.view`, `create`, `update`, `delete`, `restore`, and `force.delete`.

## Products list

Open **Products** from the **Inventory** sidebar group. Search by SKU or name, filter by category and status, and use the KPI cards to focus the list. Users with restore permission can include deleted products or show deleted products only.

## Create and edit a product or service

The Products catalog covers both **goods** and **services**. Use one record type for everything you sell or purchase.

1. Select **New product**.
2. SKU is **auto-filled** (for example `SKU-00001`). You can edit it or use **Generate SKU** to refresh the suggestion. Leave it unique in your workspace.
3. Enter a name.
4. Optionally choose a category and add a rich-text description (headings, lists, bold/italic/underline), unit, cost, price, and reorder level.
5. Choose a **currency** from the shared workspace currency list (defaults to your workspace currency from Settings).
6. Keep **Track stock** enabled for goods whose quantities should be managed by Inventory. Turn **Track stock** off for services and other non-stocked items.
7. Save.

Products can be Active or Inactive. Inactive products remain in the catalog but should not be used for new operational work.

## Categories

Manage categories from the product category action. A category has a name and optional description. Categories use the same Products permissions; removing a category does not remove its products.

## Notes, activity, and deletion

Open a product to see **Notes** and **Timeline** on the record page (create, update, note, delete, and restore events). Categories still open in a dialog from **Manage categories**.

Delete is a soft delete. Restore requires `products.restore`; permanent deletion requires `products.force.delete` and the product must already be deleted.

## Inventory and purchasing

Only products with **Track stock** enabled can receive stock adjustments, Purchase Order receipts, or transfers. Product selection on Purchase Order lines is optional; ordinary description-only lines still work. The picker requires the Products module and `products.view`, and only **Active** products appear.

## Billing documents (quotations, estimates, invoices)

When Products is installed and you have `products.view`, quotation / estimate / invoice line editors show an optional **Product** picker. Selecting a product fills the line **name**, rich **details** (from the product description), and **unit price**. You can edit those fields afterward. Clearing the product link does **not** clear your edited text. Inactive products cannot be linked on new lines.
