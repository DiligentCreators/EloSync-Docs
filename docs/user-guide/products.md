# Products — User Guide

## Who can use Products

Your workspace needs the free **Products** module. Access is controlled by `products.view`, `create`, `update`, `delete`, `restore`, and `force.delete`.

## Products list

Open **Products** from the **Inventory** sidebar group. Search by SKU or name, filter by category and status, and use the KPI cards to focus the list. Users with restore permission can include deleted products or show deleted products only.

## Create and edit a product

1. Select **New product**.
2. Enter a unique SKU and a name.
3. Optionally choose a category and add description, unit, cost, price, currency, and reorder level.
4. Keep **Track stock** enabled for products whose quantities should be managed by Inventory.
5. Save.

Products can be Active or Inactive. Inactive products remain in the catalog but should not be used for new operational work.

## Categories

Manage categories from the product category action. A category has a name and optional description. Categories use the same Products permissions; removing a category does not remove its products.

## Notes, activity, and deletion

The detail sheet contains:

- **Notes** for free-form product context
- **Activity** for create, update, note, delete, and restore events

Delete is a soft delete. Restore requires `products.restore`; permanent deletion requires `products.force.delete` and the product must already be deleted.

## Inventory and purchasing

Only products with **Track stock** enabled can receive stock adjustments, Purchase Order receipts, or transfers. Product selection on Purchase Order lines is optional; ordinary description-only lines still work.
