# Module Development — Developer Guide

Canonical checklist for building a business module. Copy the **Leads** module structure; do not invent a second pattern.

## Registration recipe

1. **Catalog (production)** — Ship an idempotent **data migration** that calls `App\Support\Catalog\DefaultModuleRegistrar` (`slug`, pricing defaults, `status=published`, `is_default_included` / `is_billable`, optional `version`). Also keep `CatalogSeeder` in sync for **local/CI fresh DBs only** — never rely on `db:seed` in production. Optional: Central Modules API for non-default / commercial catalog edits.
2. **Permissions (production)** — Add `{slug} => [view, create, update, delete, …]` in `config/tenant-permissions.php` and default grants in `config/tenant-default-role-permissions.php`. Ship a data migration that calls `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` so existing workspaces receive grants additively. Modules never auto-grant permissions; roles do. Login never syncs RBAC.
3. **Routes** — Tenant API:

```php
Route::middleware(['auth:tenant-api', 'tenant.user', 'verified', 'module:{slug}', 'can:{slug}.view'])->group(function () {
    // …
});
```

4. **Domain code** — Flat under existing namespaces (no `Modules/` package):

| Layer | Location |
|-------|----------|
| Models | `app/Models/` + `BelongsToTenant` |
| Migrations | `database/migrations/` |
| Factories | `database/factories/` |
| Seeders | `database/seeders/Tenant/` for local/demo only; production catalog/permission rows use **data migrations** |
| Controllers | `app/Http/Controllers/Tenant/Api/V1/` |
| Form requests | `app/Http/Requests/Tenant/Api/V1/{Module}/` |
| Resources | `app/Http/Resources/Tenant/Api/V1/{Module}/` |
| Policies | `app/Policies/` |
| Services | `app/Services/Tenant/` |
| Events / Listeners | `app/Events/`, `app/Listeners/` |
| Notifications | `app/Notifications/Tenant/` |

5. **Frontend** — `src/pages/{slug}/`, API service, types, `PERMISSIONS` / `QUERY_KEYS`, nav item with `permission` **and** `module`, route under `TenantProtectedRoute`.
6. **Tests** — Pest feature suite + Playwright `test:e2e:{slug}`.
7. **Docs** — User / developer / production guides, API, database, CHANGELOG.

## Logging (both required)

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Audit | `PlatformAuditService` → `activity('platform')` | Actor, workspace, IP, UA, action for create/update/delete/assign/status changes |
| Activity | Spatie `LogsActivity` on primary model | Attribute-level change history |
| Timeline | Domain `*_activities` table (when UX needs it) | User-facing history (notes, stage moves, assignments) |

## Events

Dispatch domain events from the service layer. Listeners handle audit side-effects and notifications. Do **not** build per-module notification stacks outside Laravel notifications.

## Dashboard widgets

When a module contributes dashboard cards:

1. Extend `App\Services\Tenant\DashboardWidgetService` (same registry pattern as Leads/Tasks).
2. Gate each widget on `EntitlementService::hasModule` + the user’s Spatie permission.
3. Apply assignee scoping with `ScopesToAssignee` when the module uses `{slug}.assign`.
4. Return `{ id, module, permission, scope, data }` objects only — the SPA renders by `id`.
5. Do not invent a parallel dashboard API; extend `DashboardWidgetService` (Leads/Tasks/Calendar pattern).

See [tenant-v1-dashboard.md](/api/tenant-v1-dashboard).

## In-app notifications

- Use Laravel notification channels required by the contract for that event (`database` plus `broadcast` for realtime in-app delivery; add `mail` only when product behavior requires it).
- Implement `ShouldQueue` and use `App\Notifications\Concerns\QueuesOnEmails` so jobs land on the dedicated `emails` queue (`php artisan queue:work --queue=emails`).
- Persist via the standard `notifications` table; expose tenant APIs under `/notifications*` ([tenant-v1-notifications.md](/api/tenant-v1-notifications)).
- Register realtime in-app types in the SPA Notification Registry; Echo updates Query caches and polling remains a recovery path.
- Schedule due/overdue fan-out through `crm:send-due-notifications` rather than ad-hoc cron per module.

## Settings

If the module needs settings, register keys in `SystemSettingDefinitions` / `TenantSettingDefinitions` and resolve Central → Tenant → system. Do not invent a parallel settings store.

## Date and time (required for every module)

Applies to **all current and future** tenant modules — same rule as Leads, Tasks, Meetings, Calendar, Attendance, and CRM reminders.

1. **Single timezone** — Settings → General → Timezone (e.g. `Asia/Karachi`). Never add `{module}_timezone` or assume server `APP_TIMEZONE` / UTC for user-facing clocks.
2. **Absolute datetimes** (`due_at`, `starts_at`, `ends_at`, `remind_at`, …) — cast with `App\Casts\UtcDateTime`; serialize with `App\Support\UtcIso`; SPA edit/display via `src/lib/datetime.ts` + `useSettingsStore`.
3. **Wall-clock settings** (`H:i` office hours, digests, cutoffs) — interpret only in the workspace timezone; document that in the module’s user guide.
4. **Schedulers / “today” / late gates** — use `now($workspaceTimezone)` or `Carbon::now($timezone)` after resolving timezone from `TenantSettingService`; do not rely on bare `now()` in long-lived workers.
5. **Docs** — link [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes) from the module developer guide when the module has any date/time fields.

## Anti-patterns (date/time)

- Per-module timezone picker that diverges from Settings → General
- Default Eloquent `datetime` cast on absolute scheduling columns when `app.timezone` may be non-UTC
- Bare `now()` / `today()` in scheduled commands without an explicit workspace timezone
- Showing browser-local times while storing “naive” workspace wall clocks without conversion

## Catalog versioning (`modules.version`)

Marketplace detail shows the catalog **version** string (semver). It is **display / release metadata** for the catalog row — not a per-workspace entitlement version.

| Change | Action |
|--------|--------|
| First ship of a new module | Pass `version` => `1.0.0` (default) into `ensureModule` |
| Additive feature, schema, API, or UX for that module | Ship a data migration that calls `DefaultModuleRegistrar::bumpVersion('{slug}', '{new}')` — typically **minor** (`1.1.0`, `1.2.0`, …) |
| Breaking module behavior or required data migration for that module | Bump **major** (`2.0.0`, …) the same way |
| Docs-only / no catalog-visible product change | No version bump |

Rules agents and developers must follow:

- `ensureModule` uses `firstOrCreate` by slug — it **does not** update `version` (or commercial flags) on existing rows. Never expect a re-run of the registrar or `CatalogSeeder` to bump versions in production.
- Always bump with an explicit idempotent migration: `app(DefaultModuleRegistrar::class)->bumpVersion('calendar', '1.1.0');`
- Note user-visible bumps in the Docs CHANGELOG.
- Do not invent a parallel versioning system outside `modules.version`.

## Billing

Paid modules: catalog `is_billable`, marketplace install, `ModuleSubscriptionService`, consolidated billing. Never implement independent payment flows.

## Frontend checklist

- Pages, forms, tables, filters, dialogs/drawers
- Shared design system (`PageHeader`, `DataTable`, `PermissionGate`, empty/error/loading states)
- Nav + breadcrumbs respect **installed modules** and **user permissions**
- Auth payload includes active module slugs for SPA gating
- Module list shortcuts via `useModuleShortcuts`: bare `n` (create, permission-gated; Chromium blocks `Ctrl/⌘N`) and `mod+f` (focus module `SearchInput` with `ref` + `shortcutHint`). Do **not** bind create/search on the app shell — keep them route-scoped like Leads.

## Testing checklist

**Pest:** unit where useful; feature CRUD; authorization; validation; tenant isolation; module middleware denial.

**Playwright:** dedicated suite; script `test:e2e:{slug}`; independently runnable.

**Manual QA:** Cursor browser — CRUD, search, filters, pagination, validation, authz, responsive layout, console, network.

## Anti-patterns

- Laravel Modules / nwidart / plugin discovery
- Repositories layer
- Skipping `module:` or `can:` middleware
- Static nav that ignores entitlements
- Custom audit/notification systems outside platform services
- Production `db:seed` / `CatalogSeeder` to register default modules
- Login-time or dashboard-time permission “repair”
- `syncPermissions()` on existing customized roles during deploy
- Per-module timezone or server-UTC user clocks (see Date and time above)

## Related

- [Module Architecture](/architecture/module-architecture)
- [Module Dependencies](/architecture/module-dependencies)
- [Module Licensing](/architecture/module-licensing)
- [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)
- [Production module registration](/deployment/module-development)
- [Communication Templates](/developer-guide/communication-templates) — reusable platform module pattern
- [Tenant provisioning](/developer-guide/tenant-provisioning)
