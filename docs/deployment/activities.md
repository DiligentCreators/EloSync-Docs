# Activities — Production Guide

## Licensing

- Catalog slug: `activities`
- **Free Marketplace opt-in** CRM module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 28`
- New workspaces receive only **Leads** + **Tasks** by default; enable Activities from Marketplace
- Existing workspaces that already have Activities keep their subscription (policy change does not uninstall)

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable Activities from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `activities.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Activities permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles.

## Monitoring

- Platform audit events: `activity_created`, `activity_updated`, `activity_deleted`, `activity_assigned`, `activity_completed`, `activity_note_added`
- Notifications: assignment via `ActivityAssignedNotification`

## Deploy checklist

1. Migrate tables (`activities`, `activity_notes`, `activity_activities`)
2. Register the `activities` catalog module (migration, not seeder) as free opt-in
3. Run `2026_07_30_070000_mark_optional_crm_modules_not_default_included` so catalog flags match policy
4. Confirm `module:activities` + `activities.*` permissions on target roles
5. Deploy Frontend SPA with Activities nav/pages
