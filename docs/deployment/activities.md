# Activities — Production Guide

## Licensing

- Catalog slug: `activities`
- **Free and default-included** CRM module
- Catalog flags: `is_default_included = true`, `is_billable = false`, price `0`, `sort_order = 28`
- New workspaces receive `module:activities` automatically via `ModuleSubscriptionService::installDefaultModules()`
- Existing workspaces missing the entitlement are backfilled by the Activities registration / ensure migrations

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs every published `is_default_included` module, including **Activities**
2. Entitlement is non-billable (`price = 0`, `source = included`)
3. Tenant permissions include `activities.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Activities permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles.

## Monitoring

- Platform audit events: `activity_created`, `activity_updated`, `activity_deleted`, `activity_assigned`, `activity_completed`, `activity_note_added`
- Notifications: assignment via `ActivityAssignedNotification`

## Deploy checklist

1. Migrate tables (`activities`, `activity_notes`, `activity_activities`)
2. Register the `activities` catalog module (migration, not seeder) with `is_default_included` / ensure backfill
3. Confirm `module:activities` + `activities.*` permissions on target roles
4. Deploy Frontend SPA with Activities nav/pages
