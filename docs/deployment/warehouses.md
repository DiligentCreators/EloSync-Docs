# Warehouses — Production Guide

## Licensing and rollout

- Catalog: `warehouses`, category `inventory` (**Inventory**, category sort `50`)
- Free Marketplace opt-in; not default-included; module sort `20`
- Permissions: `warehouses.view|create|update|delete|restore|force.delete`
- Use additive migrations for catalog and role permission rollout.

## Deploy checklist

1. Migrate `warehouses`, `warehouse_notes`, and `warehouse_activities`.
2. Register Warehouses and grant missing default-role permissions.
3. Deploy the tenant UI.
4. Smoke: enable Warehouses, create a location, verify the default `MAIN` warehouse is created when needed, and confirm that the sole default warehouse cannot be deleted.

## Operational notes

`ensureDefaultWarehouse()` keeps stock posting operational for Inventory and Purchase Order receipt when a warehouse is omitted. Do not remove active default warehouse data outside application services; stock level and movement foreign keys restrict destructive removal.
