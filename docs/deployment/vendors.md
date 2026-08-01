# Vendors — Production Guide

## Licensing

- Catalog slug: `vendors`
- Category: `purchasing` (**Purchasing**), `category_sort_order = 40`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 10`
- New workspaces receive only **Leads** + **Tasks** by default; enable Vendors from Marketplace
- Existing workspaces that already have Vendors keep their subscription
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable Vendors from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `vendors.*` via `config/tenant-permissions.php` / default role maps

No stage or status seeder (unlike Leads) — Vendors is a flat directory record with a simple `active`/`inactive` flag.

## Permissions rollout

New Vendors permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Monitoring

- Platform audit events: `vendor_created`, `vendor_updated`, `vendor_deleted`, `vendor_assigned`, `vendor_note_added`, `vendor_restored`
- Notifications: assignment (mail + database) via `VendorAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate vendor tables (`vendors`, `vendor_notes`, `vendor_activities`)
2. Register the `vendors` catalog module (migration, not seeder) as free opt-in under the new `purchasing` category
3. Confirm `module:vendors` + `vendors.*` permissions on target roles
4. Deploy frontend (Vendors nav item under new **Purchasing** group, list/form/detail)
5. Smoke: create a **new** workspace → enable Vendors from Marketplace → create/edit/assign/note a vendor → soft delete/restore

## Phase 4 roadmap context

Vendors is Milestone 1 of **Phase 4 Purchasing**. Purchase Orders (Milestone 2) hard-depends on Vendors; Expenses (Milestone 3, final) has a soft dependency on both Vendors and Purchase Orders. Phase 4 Purchasing is now complete. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
