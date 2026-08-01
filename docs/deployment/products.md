# Products — Production Guide

## Licensing and rollout

- Catalog: `products`, category `inventory` (**Inventory**, category sort `50`)
- Free Marketplace opt-in: `is_default_included=false`, `is_billable=false`, price `0`, sort `10`
- Permissions: `products.view|create|update|delete|restore|force.delete`
- Deploy catalog, permissions, and default-role grants through additive migrations; do not rely on seeders to repair existing workspaces.

## Deploy checklist

1. Run migrations for product categories, products, notes, and activities.
2. Register the Inventory category and Products catalog SKU.
3. Synchronize missing Products permissions to target roles.
4. Deploy the tenant frontend and confirm its module- and permission-gated nav.
5. Smoke: enable Products, create category/product, add note, delete and restore.

## Monitoring

Review product audit events and activity records for create, update, note, delete, and restore. Products has no stock mutation responsibility; investigate stock changes through Inventory movement records.
