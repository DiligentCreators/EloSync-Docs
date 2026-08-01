# Inventory — User Guide

## Who can use Inventory

Install **Products** and then the free **Inventory** module. Your role needs `inventory.view` to inspect stock, `inventory.adjust` for changes, and `inventory.transfer` for transfers.

## Stock levels and movements

Open **Inventory** from the sidebar. Filter stock by product or warehouse, search SKU/name, and use **Low stock** to find stock-tracked products at or below their reorder level. Open a product's movement history to see the quantity, resulting balance, warehouse, source, note, and actor.

## Adjust stock

Select **Adjust stock**, choose a stock-tracked product, optionally choose a warehouse, then select:

- **In** — add the entered quantity
- **Out** — remove the entered quantity
- **Adjust** — set on-hand quantity to the entered value

Add a note when context is needed. Stock cannot go below zero. If no warehouse is selected, the default `MAIN` warehouse is used.

## Transfers

1. Create a transfer with different source and destination warehouses.
2. Add each stock-tracked product and quantity.
3. Edit or delete it while it is **Draft**.
4. **Dispatch** it to move it to **In transit**.
5. **Complete** it to post transfer-out at the source and transfer-in at the destination.

You can cancel Draft or In-transit transfers. Completed and cancelled transfers are terminal; cancellation does not post stock.

## Purchase order receipts

Marking a Purchase Order as **Received** posts stock-in once for each line that has a `product_id` and whose product tracks stock, provided both Products and Inventory are installed. You may choose a warehouse when receiving; otherwise the default warehouse is used. **Partially received** remains acknowledgement-only and posts no stock.
