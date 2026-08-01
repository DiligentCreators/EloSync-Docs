# Products Module

Phase 5 Inventory module on the frozen platform. Products is the tenant catalog used by Inventory and optionally by Purchase Order lines.

## Guides

| Audience | Document |
|----------|----------|
| Workspace users | [products.md](/user-guide/products) |
| Engineers | [products-developer.md](/developer-guide/products) |
| Production / ops | [products-production.md](/deployment/products) |
| Tenant API | [tenant-v1-products.md](/api/tenant-v1-products) |

## Capabilities

- Product SKU, name, category, description, unit, cost, price, currency, status, and stock-tracking settings
- Product categories managed in the same module
- Search, status/category filters, KPI summary, soft delete, restore, and permanent deletion
- Notes and activity timeline
- Optional `product_id` on Purchase Order lines
- Inventory uses stock-tracked products through its required Products dependency

## Permissions

`products.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Enable Products from Marketplace (free). Catalog: `products`, category `inventory` (**Inventory**, sort `50`), `is_default_included = false`, `is_billable = false`, module sort `10`.

## Boundaries

Products defines catalog information only. It does not itself mutate stock. Use the [Inventory](/user-guide/inventory-overview) module for stock levels, adjustments, receipts, and transfers.

Serial numbers, lots, and COGS are not part of Phase 5.
