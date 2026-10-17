# Inventory — Production Guide

## Licensing and dependencies

- Catalog: `inventory`, category `inventory` (**Inventory**, category sort `50`)
- Free Marketplace opt-in; not default-included; module sort `30`
- **Required dependency:** Products — Marketplace blocks Inventory until Products is entitled
- Soft Warehouse integration provides managed locations; the `MAIN` default is created on demand
- Permissions: `inventory.view|adjust|transfer|delete|restore|force.delete`

## Deploy checklist

1. Migrate stock levels, movements, transfers, and transfer lines after Products and Warehouses schema migrations.
2. Register the Inventory catalog module, hard dependency, and additive role permissions.
3. Deploy backend and frontend together; Purchase Order receipt behavior changes when Inventory and Products are entitled.
4. Smoke: adjust stock in/out, verify movement balances, dispatch and complete a transfer, and receive a product-linked Purchase Order.
5. For serial/lot (products **1.5.0** / inventory **1.4.0** / purchase-orders **1.7.0**): enable **Track serials** or **Track lots** on a product (zero on-hand), stock in with serials/lot, receive a PO with serials/lot, and complete a transfer with serials/lot.

## Safety and monitoring

Stock posting is transactional and uses row locks. Never alter `stock_levels` as an operational shortcut: post through `StockService` so movement history and balances remain aligned. Monitor failed stock adjustments, incomplete transfers, and Purchase Order receipt references; receipt posting is idempotent per purchase order.

Soft Accounting inventory journals remain optional when Accounting is entitled. Moving-average product cost and on-hand value ship in inventory **1.5.0**. FIFO cost layers remain deferred.
