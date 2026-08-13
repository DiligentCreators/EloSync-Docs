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
| `php artisan queue:work redis --queue=automations,emails,default --sleep=1 --tries=3 --timeout=90 --max-time=3600` | Execute workflow actions (include `automations` before `default`) |
| `automation:dispatch-schedules` | Every minute, `withoutOverlapping(5)`, `onOneServer` — due schedule triggers |

Shared cache driver required for `onOneServer()` locks. Schedule matching uses a **90-second** window after the configured `H:i` (workspace timezone) and skips a workflow that already has a `schedule` run in the last **2 minutes**.

## Outbound webhooks

- Action type `webhook` posts JSON with optional HMAC (`X-EloSync-Signature`) from the action secret or `AUTOMATION_WEBHOOK_SECRET` / `services.automation.webhook_secret`.
- SSRF guard: `http`/`https` only; loopback, `.local` / `.localhost`, and private/reserved IPs are rejected. Connect timeout 5s, request timeout 15s, retry twice.
- Job `ExecuteAutomationRunJob::failed()` marks the run `failed` after retries so Runs UI does not stay on `running`.

## Monitoring

- Run status: `pending` / `running` / `completed` / `failed` / `skipped` / `cancelled`
- Step detail in `automation_logs`
- Platform audit on workflow CRUD (via `PlatformAuditService`)
- Spatie activity log on `AutomationWorkflow`

## Deploy checklist

1. `php artisan migrate --force` (Automation schema + catalog + permission grants). Do **not** `db:seed`.
2. Deploy Backend + Frontend
3. Start / update queue workers to include `automations` (Forge daemon or Cloud background process)
4. Confirm scheduler runs `automation:dispatch-schedules`
5. Optional: set `AUTOMATION_WEBHOOK_SECRET` for default webhook HMAC when actions omit a secret
6. Smoke: Marketplace install → create from template → activate → manual run → Runs page shows completed/failed with logs
