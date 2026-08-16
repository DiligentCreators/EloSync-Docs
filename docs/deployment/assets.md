# Assets — Production Guide

## Licensing

- Catalog slug: `assets`
- Category: `operations` (**Operations**), `category_sort_order = 40`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 80`, version **1.0.0**
- **No** hard `module_dependencies` rows
- New workspaces receive only **Leads** + **Tasks** by default; enable Assets from Marketplace
- Soft optional links to Vendors / Employees are validated only when those modules are entitled

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable Assets from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `assets.*` via `config/tenant-permissions.php` / default role maps

No stage seeder — status and category are enums on the asset row. Numbering uses `assets_number_prefix` (default `AST-`).

## Permissions rollout

New Assets permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

On large tenant fleets, run migrate in a maintenance window (or raise PHP `max_execution_time`). The synchronizer grants missing links only and swallows concurrent `role_has_permissions` unique races.

## Monitoring

- Platform audit events: `asset_created`, `asset_updated`, `asset_deleted`, `asset_assigned`, `asset_note_added`
- Notifications: assignment (mail + database) via `AssetAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate asset tables (`assets`, `asset_notes`, `asset_activities`)
2. Register the `assets` catalog module (migration, not seeder) as free opt-in under `operations`
3. Confirm `module:assets` + `assets.*` permissions on target roles
4. Deploy frontend (Assets nav item, list/form/detail)
5. Smoke: create a **new** workspace → enable Assets from Marketplace → create/edit/assign/note an asset → soft delete/restore; optionally entitle Vendors/Employees and verify soft links

## Roadmap context

Assets ships as free Operations Marketplace opt-in **v1.0.0** (shipped). Near-term Future Expansion focus is **Documents** — see [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
