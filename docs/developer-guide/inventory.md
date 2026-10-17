# Inventory — Developer Guide

Inventory is the Phase 5 stock module. It hard-depends on Products and soft-uses Warehouses for its default warehouse and UI integration.

## Backend

| Piece | Path |
|-------|------|
| Models | `StockLevel`, `StockMovement`, `StockTransfer`, `StockTransferLine`, `StockSerial`, `StockLot` |
| Services | `StockService`, `StockTransferService` |
| HTTP | `InventoryController`, `app/Http/Requests/Tenant/Api/V1/Inventory/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Inventory/*` |
| Authorization | `StockLevelPolicy`, `StockTransferPolicy` |
| Tests | `tests/Feature/Tenant/Inventory/` |

Routes use `module:inventory`; permissions are `inventory.view|adjust|transfer|delete|restore|force.delete`. The `inventory → products` hard dependency is registered in `module_dependencies`.

## Posting invariant

`StockService` is the only stock mutation boundary. It creates/retrieves the product/warehouse `StockLevel`, locks it with `lockForUpdate()` inside a database transaction, rejects negative balances, updates `quantity_on_hand`, and writes the immutable `StockMovement`. Direct callers may use only `in`, `out`, and `adjust`; transfers use internal `transfer_in`/`transfer_out`.

When `products.track_serials` is true, adjust `in`/`out` require `serials[]` (exactly one unique serial per whole-number unit). Absolute `adjust` is rejected. Stock-in creates `stock_serials` rows (`in_stock`); stock-out marks matching in-stock serials `out`. Duplicate or missing serials validate with 422.

When `products.track_lots` is true, adjust `in`/`out` and transfer out/in require `lot` (optional `lot_expires_at` on in / transfer in). Absolute `adjust` is rejected. Quantities are tracked per lot in `stock_lots`. Serial and lot flags are mutually exclusive; enabling either requires zero on-hand.

`postPurchaseOrderReceipt()` / `postPurchaseOrderReceiptDeltas()` post stock-in for linked `track_stock` product lines, including optional per-line `serials` / `lot` / `lot_expires_at`. Full-order receipt without `lines` is rejected when any remaining line is serial/lot tracked. Delta receives use a `purchase_order_receipts` batch so concurrent partial receives cannot double-post the same qty. Callers must hold (or the method itself takes) a `lockForUpdate()` on the Purchase Order before the movement-exists check. `PurchaseOrderService::receive()` wraps status transition + receipt posting in one transaction so a failed post rolls the PO status back; `changeStatus()` routes `partially_received` / `received` through `receive()` so `POST …/status` cannot skip stock posting. Optional `lines` on receive advances `quantity_received` and posts only those deltas.

## Transfers

`StockTransferService` owns `draft → in_transit → completed|cancelled`. Draft records alone can be edited or deleted. Completion locks the transfer, posts paired movements through `StockService` (optional per-line `serials` / `lot` on `POST …/complete`), then marks it completed. Serial transfers validate units at the source warehouse then move `stock_serials.warehouse_id` on transfer in; lot transfers decrement the source lot and increment the destination lot. Cancellation is allowed only from Draft or In transit and posts no stock.

## Frontend and verification

`src/pages/inventory/` uses the existing inventory list, adjustment dialog, transfer dialog/record page, shared route guards, permissions, and query cache conventions.

```bash
php artisan test --compact tests/Feature/Tenant/Inventory
npm run test:e2e:inventory
npm run test:e2e:inventory-phase
npm run test:e2e:inventory-phase:headed
```
