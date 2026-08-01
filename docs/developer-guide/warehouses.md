# Warehouses — Developer Guide

Warehouses is the Phase 5 location module, implemented with the same tenant-scoped CRUD, policy, resources, notes, events, and timeline pattern as Products.

## Backend

| Piece | Path |
|-------|------|
| Models | `Warehouse`, `WarehouseNote`, `WarehouseActivity` |
| Service | `app/Services/Tenant/WarehouseService.php` |
| HTTP | `WarehouseController`, `app/Http/Requests/Tenant/Api/V1/Warehouse/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Warehouse/*` |
| Authorization | `WarehousePolicy` |
| Tests | `tests/Feature/Tenant/Warehouse/` |

Routes require `module:warehouses` and `warehouses.view|create|update|delete|restore|force.delete`.

## Domain rules

- `code` is unique per tenant; `is_active` controls whether it can receive stock.
- `WarehouseService::ensureDefaultWarehouse()` creates/reuses active default code `MAIN`; Inventory calls it when a stock operation omits `warehouse_id`.
- The service prevents deleting the sole default warehouse.
- Notes, `warehouse_activities`, and Spatie activity logging capture the operational timeline.

## Frontend and verification

Pages are in `src/pages/warehouses/` and follow the existing AppLayout, entitlement-gated nav, and shared DataTable/form/detail-sheet patterns.

```bash
php artisan test --compact tests/Feature/Tenant/Warehouse
npm run test:e2e:warehouses
```
