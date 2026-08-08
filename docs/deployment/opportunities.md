# Opportunities — Production Guide

## Licensing

- Catalog slug: `opportunities`
- Category: **Sales** (`sales`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 40`
- New workspaces receive only **Leads** + **Tasks** by default; enable Opportunities from Marketplace
- **Sales Pipeline** is not a separate catalog row — stages and board ship inside this module
- Existing workspaces that already have Opportunities keep their subscription (policy change does not uninstall)

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable Opportunities from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `opportunities.*` via `config/tenant-permissions.php` / default role maps
4. First API use seeds default `opportunity_stages` via `OpportunityStageSeeder` (idempotent)

## Permissions rollout

New Opportunities permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles.

## Monitoring

- Platform audit events: `opportunity_created`, `opportunity_updated`, `opportunity_deleted`, `opportunity_assigned`, `opportunity_stage_changed`, `opportunity_note_added`, `opportunity_tag_created`, `opportunity_tags_synced`
- Notifications: assignment via `OpportunityAssignedNotification`

## Deploy checklist

1. Migrate tables (`opportunity_stages`, `opportunities`, `opportunity_tags`, `opportunity_opportunity_tag`, `opportunity_notes`, `opportunity_activities`); catalog bump **opportunities → 1.1.1** (colored tags)
2. Register the `opportunities` catalog module via migration (`DefaultModuleRegistrar`) as free Sales opt-in — **not** `db:seed`
3. Run opportunities permissions migration so default roles receive missing `opportunities.*` grants
4. Confirm `module:opportunities` + `opportunities.*` permissions on target roles
5. Deploy Frontend SPA with Opportunities nav/pages (mirror Leads board + table, inline tags) when the SPA ships
