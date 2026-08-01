# Warehouses Module

Phase 5 Inventory module providing tenant warehouse locations for stock operations.

## Guides

| Audience | Document |
|----------|----------|
| Workspace users | [warehouses.md](/user-guide/warehouses) |
| Engineers | [warehouses-developer.md](/developer-guide/warehouses) |
| Production / ops | [warehouses-production.md](/deployment/warehouses) |
| Tenant API | [tenant-v1-warehouses.md](/api/tenant-v1-warehouses) |

## Capabilities

- Warehouse code, name, address, active state, and default designation
- Automatic `MAIN` default warehouse when warehouse-backed stock is first needed
- Notes, activity timeline, search, filters, soft delete, restore, and permanent deletion
- Warehouse selection for stock adjustments, Purchase Order receipt, and stock transfers

## Permissions

`warehouses.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Enable Warehouses from Marketplace (free). Catalog: `warehouses`, category `inventory` (**Inventory**, sort `50`), `is_default_included = false`, `is_billable = false`, module sort `20`.

## Default warehouse safety

Every tenant retains a default warehouse. The sole default warehouse cannot be deleted. If an action does not specify a warehouse, stock operations use the default warehouse.
