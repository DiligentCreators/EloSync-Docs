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

Domain **notes** and **activities** relationships on show payloads default to **newest-first** (`->latest('created_at')->latest('id')`), matching dedicated `GET …/timeline` endpoints. This is a **stable API contract** — document it on the module’s Tenant v1 page; clients must not assume ASC. Detail UIs map API order as-is. Do not leave these `HasMany` relations unordered. Prefer composite indexes `(tenant_id, parent_id, created_at)` on `*_notes` (and similar) so DESC order stays cheap; do **not** put a hard `limit()` on eager-loaded `HasMany` (Laravel limits the whole query, not per parent).

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
- **Realtime conversation rooms (Team Chat):** in addition to the existing private user notification channel `tenant.{tenantId}.user.{userId}`, subscribe members to `tenant.{tenantId}.conversation.{conversationId}` (authorized by `TenantConversationChannel` — same tenant + conversation membership). Message / reaction / pin / membership broadcasts use that conversation channel; mention and DM alerts still fan out on the user notification channel.

## Settings

If the module needs settings, register keys in `SystemSettingDefinitions` / `TenantSettingDefinitions` and resolve Central → Tenant → system. Do not invent a parallel settings store.

## Date and time (required for every module)

Applies to **all current and future** tenant modules — same rule as Leads, Tasks, Meetings, Calendar, Attendance, and CRM reminders.

1. **Single timezone** — Settings → General → Timezone (e.g. `Asia/Karachi`). Never add `{module}_timezone` or assume server `APP_TIMEZONE` / UTC for user-facing clocks.
2. **Absolute datetimes** (`due_at`, `starts_at`, `ends_at`, `remind_at`, …) — cast with `App\Casts\UtcDateTime`; serialize with `App\Support\UtcIso`; SQL vs those columns via `App\Support\UtcInstant`; SPA edit/display via `src/lib/datetime.ts` (`appLocalInputToIso` / `isoToAppLocalInput`) + `useSettingsStore`.
3. **Wall-clock settings** (`H:i` office hours, digests, cutoffs) — interpret only in the workspace timezone; document that in the module’s user guide.
4. **Schedulers / “today” / late gates** — use `now($workspaceTimezone)` or `Carbon::now($timezone)` after resolving timezone from `TenantSettingService`; do not rely on bare `now()` in long-lived workers.
5. **Docs** — link [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes) from the module developer guide when the module has any date/time fields.

## Anti-patterns (date/time)

- Per-module timezone picker that diverges from Settings → General
- Default Eloquent `datetime` cast on absolute scheduling columns when `app.timezone` may be non-UTC
- Bare `now()` / `today()` in scheduled commands without an explicit workspace timezone
- Binding workspace `now()` / `today()` in SQL against `UtcDateTime` columns (compare with `UtcInstant` instead)
- Showing browser-local times or slicing UTC ISO into `datetime-local` while storing “naive” workspace wall clocks without `appLocalInputToIso`

## Catalog versioning (`modules.version`)

Marketplace detail shows the catalog **version** string (semver: `MAJOR.MINOR.PATCH`). It is **display / release metadata** for the central catalog row — not a per-workspace entitlement version, and not a per-workspace code pin.

### SemVer policy

EloSync modules ship **backward-compatible** updates. Do **not** introduce breaking changes to module APIs, permissions contracts, or tenant data semantics. Prefer additive schema, additive API fields, and migrate-forward data migrations.

| Change | Bump | Example |
|--------|------|---------|
| First ship of a new module | Start at **1.0.0** | Pass `version` => `1.0.0` into `ensureModule` |
| Bug fix, copy, polish, small non-breaking fix | **PATCH** | `1.0.0` → `1.0.1` |
| Additive feature, schema, API, or UX (backward compatible) | **MINOR** | `1.0.1` → `1.1.0` |
| Large milestone that remains backward compatible (major product surface) | **MAJOR** | `1.1.0` → `2.0.0` |
| Docs-only / no catalog-visible product change | No bump | — |

Ship every product bump as a data migration that calls `DefaultModuleRegistrar::bumpVersion('{slug}', '{new}')`.

Reserve breaking removals / incompatible contract changes — they are **out of policy**. If an exceptional break is ever approved, document it explicitly in the CHANGELOG and treat it as a **MAJOR** bump with a migration / upgrade path.

### Who receives the update?

| Layer | Behavior |
|-------|----------|
| **Code + schema** | One Backend/Frontend deploy. Every workspace runs the same app — there is no per-tenant module code version. |
| **Catalog `version` string** | One central `modules` row. Marketplace shows the same version to every workspace. |
| **Entitlement (install / enable)** | Unchanged by a version bump. Workspaces that already have the module entitled get the new behavior immediately. Workspaces that never installed (or cancelled / suspended) stay off until they install or re-enable. |

A version bump does **not** auto-install a module for workspaces that have not enabled it.

Rules agents and developers must follow:

- `ensureModule` uses `firstOrCreate` by slug — it **does not** update `version` (or commercial flags) on existing rows. Never expect a re-run of the registrar or `CatalogSeeder` to bump versions in production.
- Always bump with an explicit idempotent migration: `app(DefaultModuleRegistrar::class)->bumpVersion('calendar', '1.1.0');`
- Note user-visible bumps in the Docs CHANGELOG (include old → new catalog version).
- Do not invent a parallel versioning system outside `modules.version`.

## Billing

Paid modules: catalog `is_billable`, marketplace install, `ModuleSubscriptionService`, consolidated billing. Never implement independent payment flows.

## Frontend checklist

- Pages, forms, tables, filters, dedicated create/view/edit record pages (no overlay tabs)
- Shared design system (`PageHeader`, `RecordPage`, `RecordSection`, `FormSubmitSplit` — separate Create / Create & View buttons, no dropdown — `DataTable`, `PermissionGate`, empty/error/loading states)
- Dialogs only for secondary flows (confirm, import, tags/categories)
- On create/edit mutation `onError`, call `applyServerValidationErrors` from `src/lib/form-validation.ts` so Laravel 422 field errors toast and map onto react-hook-form. For `assigned_to` fields that use `Eligible*Assignee`, filter pickers with `filterLeadAssigneeOptions` and render `errors.assigned_to` (do not auto-fill ineligible opportunity assignees).
- Old list deep links (`?entity=`) redirect to `/{slug}/:id`; list **filters** such as `/payments?invoice=` stay on the list
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
