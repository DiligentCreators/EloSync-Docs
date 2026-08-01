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
- Transfers: `draft → in_transit → completed|cancelled`
- Purchase Order receipt bridge: received orders post stock-in for stock-tracked product lines when Products and Inventory are entitled
- Transactional posting and protection against negative stock

## Permissions

`inventory.view` · `adjust` · `transfer` · `delete` · `restore` · `force.delete`

Enable Inventory from Marketplace (free). Catalog: `inventory`, category `inventory` (**Inventory**, sort `50`), `is_default_included = false`, `is_billable = false`, module sort `30`. Marketplace requires **Products** first.

## Warehouse integration

Inventory soft-uses Warehouses. Stock actions use the active default `MAIN` warehouse if no warehouse is selected; install Warehouses to manage location records in the UI.

## Not included

Phase 5 does not include serial or lot tracking, inventory valuation, or COGS.
