# Inventory — User Guide

## Who can use Inventory

Install **Products** and then the free **Inventory** module. Your role needs `inventory.view` to inspect stock, `inventory.adjust` for changes, and `inventory.transfer` for transfers.

## Stock levels and movements

Open **Inventory** from the sidebar. Filter stock by product or warehouse, search SKU/name, and use **Low stock** to find stock-tracked products at or below their reorder level. Open a product's movement history to see the quantity, resulting balance, warehouse, source, note, and actor.

## Adjust stock

Select **Adjust stock**, choose a stock-tracked product, optionally choose a warehouse, then select:

- **In** — add the entered quantity
- **Out** — remove the entered quantity
- **Adjust** — set on-hand quantity to the entered value (not available for serial-tracked products)

For products with **Track serials**, enter one serial number per unit (one per line). Quantity must be a whole number and must match the serial count. Stock cannot go below zero. If no warehouse is selected, the default `MAIN` warehouse is used.

## Transfers

1. Create a transfer with different source and destination warehouses.
2. Add each stock-tracked product and quantity (serial-tracked products cannot be transferred yet — use stock out then stock in with serials).
3. Edit or delete it while it is **Draft**.
4. **Dispatch** it to move it to **In transit**.
5. **Complete** it to post transfer-out at the source and transfer-in at the destination.

You can cancel Draft or In-transit transfers. Completed and cancelled transfers are terminal; cancellation does not post stock.

## Purchase order receipts

Marking a Purchase Order as **Received** posts stock-in once for each line that has a `product_id` and whose product tracks stock (and does not track serials), provided both Products and Inventory are installed. Serial-tracked lines must be stocked via Inventory adjust with serial numbers. You may choose a warehouse when receiving; otherwise the default warehouse is used. **Partially received** without line quantities remains acknowledgement-only and posts no stock.

When Accounting is installed, a manual stock in posts Dr Inventory Asset (`1200`) / Cr Owner Equity (`3000`) at the product cost. A stock out posts Dr Cost of Goods Sold (`5000`) / Cr Inventory Asset. An adjust posts only the quantity change. A warehouse transfer posts no journal. Stock received from a purchase order is journaled on the receipt (Accounts Payable), not again on the stock movement.
