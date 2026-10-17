# Inventory Module

Phase 5 Inventory module for stock visibility, controlled adjustments, purchase receipts, and warehouse transfers. Inventory has a required dependency on [Products](/user-guide/products-overview).

## Guides

| Audience | Document |
|----------|----------|
| Workspace users | [inventory.md](/user-guide/inventory) |
| Engineers | [inventory-developer.md](/developer-guide/inventory) |
| Production / ops | [inventory-production.md](/deployment/inventory) |
| Tenant API | [tenant-v1-inventory.md](/api/tenant-v1-inventory) |

## Capabilities

- Per-product, per-warehouse stock levels, low-stock filtering, and movement history
- Controlled stock changes: **in**, **out**, and set-to-value **adjust**
- Optional **serial** or **lot** tracking on products (mutually exclusive): stock in/out requires serials or a lot number; set-quantity adjust, PO receive, and transfers are blocked for those products until serial/lot-aware UX ships
- Transfers: `draft → in_transit → completed|cancelled`
- Purchase Order receipt bridge: receive posts stock-in for stock-tracked (non-serial) product lines (full remaining or per-line quantity deltas) when Products and Inventory are entitled
- Transactional posting and protection against negative stock

## Permissions

`inventory.view` · `adjust` · `transfer` · `delete` · `restore` · `force.delete`

Enable Inventory from Marketplace (free). Catalog: `inventory`, category `inventory` (**Inventory**, sort `50`), `is_default_included = false`, `is_billable = false`, module sort `30`. Marketplace requires **Products** first.

## Warehouse integration

Inventory soft-uses Warehouses. Stock actions use the active default `MAIN` warehouse if no warehouse is selected; install Warehouses to manage location records in the UI.

## Not included

Inventory valuation methods beyond soft Accounting journals, and serial/lot-aware PO receive / warehouse transfer UX, are not included yet.
