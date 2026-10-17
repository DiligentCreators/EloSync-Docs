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
- Optional **serial** or **lot** tracking on products (mutually exclusive): stock in/out, PO receive, and warehouse transfer complete require matching serials or a lot number; set-quantity adjust stays blocked for those products
- Transfers: `draft → in_transit → completed|cancelled` (serial/lot lines collect identifiers on complete)
- Purchase Order receipt bridge: receive posts stock-in for stock-tracked product lines (full remaining or per-line quantity deltas, including serials/lots) when Products and Inventory are entitled
- Transactional posting and protection against negative stock

## Permissions

`inventory.view` · `adjust` · `transfer` · `delete` · `restore` · `force.delete`

Enable Inventory from Marketplace (free). Catalog: `inventory`, category `inventory` (**Inventory**, sort `50`), `is_default_included = false`, `is_billable = false`, module sort `30`. Marketplace requires **Products** first.

## Warehouse integration

Inventory soft-uses Warehouses. Stock actions use the active default `MAIN` warehouse if no warehouse is selected; install Warehouses to manage location records in the UI.

## Valuation

Product cost is a **moving average**: stock in and purchase-order receive fold the inbound unit cost into `products.cost`. Stock levels show average cost and on-hand value; the stock KPI strip includes total inventory value. Soft Accounting COGS journals continue to use that average on stock out.

FIFO / layered costing is not included yet.
