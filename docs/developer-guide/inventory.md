# Inventory — Developer Guide

Inventory is the Phase 5 stock module. It hard-depends on Products and soft-uses Warehouses for its default warehouse and UI integration.

## Backend

| Piece | Path |
|-------|------|
| Models | `StockLevel`, `StockMovement`, `StockTransfer`, `StockTransferLine` |
| Services | `StockService`, `StockTransferService` |
| HTTP | `InventoryController`, `app/Http/Requests/Tenant/Api/V1/Inventory/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Inventory/*` |
| Authorization | `StockLevelPolicy`, `StockTransferPolicy` |
| Tests | `tests/Feature/Tenant/Inventory/` |

Routes use `module:inventory`; permissions are `inventory.view|adjust|transfer|delete|restore|force.delete`. The `inventory → products` hard dependency is registered in `module_dependencies`.

## Posting invariant

`StockService` is the only stock mutation boundary. It creates/retrieves the product/warehouse `StockLevel`, locks it with `lockForUpdate()` inside a database transaction, rejects negative balances, updates `quantity_on_hand`, and writes the immutable `StockMovement`. Direct callers may use only `in`, `out`, and `adjust`; transfers use internal `transfer_in`/`transfer_out`.

`postPurchaseOrderReceipt()` is idempotent per Purchase Order reference and posts only lines with a `product_id` whose product has `track_stock=true`.

## Transfers

`StockTransferService` owns `draft → in_transit → completed|cancelled`. Draft records alone can be edited or deleted. Completion locks the transfer, posts paired movements through `StockService`, then marks it completed. Cancellation is allowed only from Draft or In transit and posts no stock.

## Frontend and verification

`src/pages/inventory/` uses the existing inventory list, adjustment dialog, transfer dialog/detail sheet, shared route guards, permissions, and query cache conventions.

```bash
php artisan test --compact tests/Feature/Tenant/Inventory
npm run test:e2e:inventory
npm run test:e2e:inventory-phase
npm run test:e2e:inventory-phase:headed
```
