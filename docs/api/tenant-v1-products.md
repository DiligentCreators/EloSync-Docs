# Tenant API v1 — Products

Base path: `/api/tenant/v1`. All endpoints require authenticated, verified tenant access, `module:products`, and the stated `products.*` permission.

## Products

### GET `/products/stats`

Returns product KPI totals.

### GET `/products/next-sku`

Requires `products.create`. Returns the next suggested SKU (`{ sku }`), using tenant setting `products_sku_prefix` (default `SKU-`) plus a zero-padded sequence. Soft-deleted products count toward the sequence. The value is a preview — concurrent creates may advance it; omit `sku` on create to let the server assign safely.

### GET `/products`

Query: `search`, `category_id`, `status` (`active|inactive`), `trashed` (`true|only`), `sort`, `direction`, `page`, `per_page`.

### POST `/products`

Requires `products.create`. Body: `name` (required); `sku` optional (unique per tenant). When `sku` is omitted or blank, the server auto-generates one (`SKU-00001` style, or `products_sku_prefix`). Optional `category_id`, `description` (HTML, sanitized server-side, max 50000), `unit`, `cost`, `price`, `currency`, `track_stock`, `reorder_level`, `status`.

### GET/PUT/DELETE `/products/{product}`

View, update, or soft-delete a product. Update requires `products.update`; delete requires `products.delete`. Show embeds notes and activities **newest-first** (`created_at` DESC, then `id` DESC).

### POST `/products/{product}/restore`

Requires `products.restore`.

### DELETE `/products/{product}/force`

Requires `products.force.delete`; product must already be soft-deleted.

### POST `/products/{product}/notes`

Requires `products.update`. Body: `{ "body": "string" }`.

### GET `/products/{product}/timeline`

Returns product activity entries.

## Product categories

Categories use the same module and Products permissions.

- `GET /product-categories` — list
- `POST /product-categories` — create (`name` required; optional `description`)
- `GET|PUT|DELETE /product-categories/{productCategory}` — view, update, soft-delete
- `POST /product-categories/{productCategory}/restore` — restore
- `DELETE /product-categories/{productCategory}/force` — permanently delete a soft-deleted category

Deleting a category leaves associated products intact with `category_id = null`.
