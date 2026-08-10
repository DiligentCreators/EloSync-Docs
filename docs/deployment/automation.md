# Automation — Production Guide

## Licensing

- Catalog slug: `automation`
- Billable marketplace add-on (`is_default_included: false`, `is_billable: true`)
- Catalog version: **1.0.0**
- Initial price: **$29 / month**, **$290 / year** (same tier as Branded)
- Workspaces must install from Marketplace; migrate does **not** auto-install

## Bootstrap

Data migrations (production-safe):

1. `register_automation_module` — `DefaultModuleRegistrar::ensureModule`
2. `add_automation_permissions` — `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions`
3. Schema: `automation_workflows`, `automation_triggers`, `automation_conditions`, `automation_actions`, `automation_runs`, `automation_logs`

Keep `CatalogSeeder` in sync for local/CI fresh DBs only.

## Queue & scheduler

| Worker / command | Purpose |
|------------------|---------|
| `php artisan queue:work --queue=automations,default,emails,...` | Execute workflow actions |
| `automation:dispatch-schedules` | Every minute, `withoutOverlapping(5)`, `onOneServer` — due schedule triggers |

Shared cache driver required for `onOneServer()` locks.

## Monitoring

- Run status: `pending` / `running` / `completed` / `failed` / `skipped` / `cancelled`
- Step detail in `automation_logs`
- Platform audit on workflow CRUD (via `PlatformAuditService`)
- Spatie activity log on `AutomationWorkflow`

## Deploy checklist

1. Migrate Automation schema + catalog + permission grants
2. Deploy Backend + Frontend
3. Start / update queue workers to include `automations`
4. Confirm scheduler runs `automation:dispatch-schedules`
5. Optional: set `services.automation.webhook_secret` for default webhook HMAC when actions omit a secret
6. Smoke: Marketplace install → create from template → activate → manual run → Runs page shows completed/failed with logs
