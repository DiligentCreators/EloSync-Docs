# Tenant API v1 — Warehouses

Base path: `/api/tenant/v1`. Routes require authenticated, verified tenant access, `module:warehouses`, and the applicable `warehouses.*` permission.

### GET `/warehouses/stats`

Returns warehouse KPI totals.

### GET `/warehouses`

Creates the tenant's default `MAIN` warehouse when needed, then returns paginated records. Query: `search`, `is_active`, `trashed` (`true|only`), `sort`, `direction`, `page`, `per_page`.

### POST `/warehouses`

Requires `warehouses.create`. Body: `code`, `name` (required); optional `address`, `is_default`, `is_active`.

### GET/PUT/DELETE `/warehouses/{warehouse}`

View, update, or soft-delete. The sole default warehouse cannot be deleted. Updates require `warehouses.update`; deletion requires `warehouses.delete`.

### POST `/warehouses/{warehouse}/restore`

Requires `warehouses.restore`.

### DELETE `/warehouses/{warehouse}/force`

Requires `warehouses.force.delete`; warehouse must already be soft-deleted.

### POST `/warehouses/{warehouse}/notes`

Requires `warehouses.update`. Body: `{ "body": "string" }`.

### GET `/warehouses/{warehouse}/timeline`

Returns warehouse activity entries.
