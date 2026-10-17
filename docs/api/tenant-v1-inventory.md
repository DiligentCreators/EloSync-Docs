# Tenant API v1 — Inventory

Base path: `/api/tenant/v1`. Routes require authenticated, verified tenant access, `module:inventory`, and the applicable `inventory.*` permission. Inventory requires Products.

## Stock

### GET `/inventory/stock`

Query: `product_id`, `warehouse_id`, `search` (SKU/name), `low_stock`, `sort`, `direction`, `page`, `per_page`.

### GET `/inventory/stock/stats`

Returns `total_skus_with_stock`, `low_stock_count`, and `total_on_hand`.

### GET `/inventory/stock/movements`

Requires `product_id`; optional `warehouse_id`, pagination controls. Returns newest movements first.

### POST `/inventory/stock/adjust`

Requires `inventory.adjust`.

```json
{
  "product_id": 1,
  "warehouse_id": 2,
  "type": "in",
  "quantity": 10,
  "notes": "Initial count",
  "serials": ["SN-001", "SN-002"],
  "lot": "BATCH-001",
  "lot_expires_at": "2027-01-15"
}
```

`type` is `in`, `out`, or `adjust`; the last sets the on-hand quantity. The product must track stock; stock cannot become negative. Omitting `warehouse_id` uses the default warehouse. When the product has `track_serials`, only `in` and `out` are allowed, `quantity` must be a whole number, and `serials` must list exactly that many unique serials. When the product has `track_lots`, only `in` and `out` are allowed and `lot` is required (`lot_expires_at` optional on stock in).

## Transfers

### GET `/inventory/transfers`

Query: `status` (`draft|in_transit|completed|cancelled`), `warehouse_id`, `search`, `trashed`, `sort`, `direction`, `page`, `per_page`.

### POST `/inventory/transfers`

Requires `inventory.transfer`.

```json
{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "notes": "Rebalance",
  "lines": [{ "product_id": 1, "quantity": 5 }]
}
```

Warehouses must differ. Creates a Draft transfer (`TRF-` number).

### GET/PUT/DELETE `/inventory/transfers/{transfer}`

View, update, or soft-delete a transfer. Only Draft transfers can be updated or deleted. Update/creation requires `inventory.transfer`; delete requires `inventory.delete`.

### POST `/inventory/transfers/{transfer}/dispatch`

Requires `inventory.transfer`; transitions `draft → in_transit`.

### POST `/inventory/transfers/{transfer}/complete`

Requires `inventory.transfer`; transitions `in_transit → completed`, posting paired `transfer_out` and `transfer_in` movements.

Optional body when lines are serial/lot tracked:

```json
{
  "lines": [
    { "id": 12, "serials": ["SN-001"] },
    { "id": 13, "lot": "BATCH-A" }
  ]
}
```

`id` is the transfer line id. Serial-tracked lines need exactly one serial per unit quantity; lot-tracked lines need `lot`. Serials move to the destination warehouse; lot quantities decrement at the source and increment at the destination.

### POST `/inventory/transfers/{transfer}/cancel`

Requires `inventory.transfer`; transitions Draft or In transit to Cancelled without posting stock.

### POST `/inventory/transfers/{transfer}/restore`

Requires `inventory.restore`.

### DELETE `/inventory/transfers/{transfer}/force`

Requires `inventory.force.delete`; permanently deletes a soft-deleted transfer.
