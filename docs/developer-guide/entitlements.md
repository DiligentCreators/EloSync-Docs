# Entitlements model

How to **build** a licensed module end-to-end: [Module Development Standard](/developer-guide/module-development). Platform freeze: [platform-freeze.md](/getting-started/platform-freeze). Long-term licensing convention: [Module Licensing](/architecture/module-licensing).

## Philosophy

The platform does **not** sell plans or features. Licensing is based entirely on **workspace module subscriptions**.

**Licensing and authorization are separate concerns.**

| Layer | Concern | Meaning | Example |
|-------|---------|---------|---------|
| Core Platform | Always-on | Platform capabilities (not modules, not billed) | Auth, users, roles, dashboard, billing, marketplace shell |
| Module | Licensing | Independently installable business domain | Leads, Tasks, Communication Templates |
| Spatie Permission | Authorization | User access within an installed module | `leads.view`, `tasks.create` |
| Workspace module subscription | License row | Links a workspace to a module | Acme → Leads (`source=included`) |

There are **no** plan tiers, plan modules, plan features, feature catalogs, or module usage limits (e.g. “100 leads”).

A purchased or included module makes a business domain **available** to the workspace. It does **not** grant every user access. Admins assign Spatie roles and permissions to control who can use that domain. Tenant role edit and the permissions matrix only list core permission groups plus groups for **installed** modules (see [Tenant RBAC](/developer-guide/tenant-rbac#role-assignment-ui-filter-entitlement)).

## Core Platform vs modules

Core Platform capabilities live in `config/core-platform.php` and are always available.

Business modules live in the `modules` catalog. **Commercial flags** (`is_default_included`, `is_billable`, `monthly_price`, `yearly_price`) are the source of truth for Marketplace pricing — keep marketing/docs in sync with `CatalogSeeder` and register_* migrations.

**Marketing availability** (`availability`: `available` \| `in_progress` \| `planned`) is separate from commercial `status` (`draft` \| `published` \| `deprecated`). The EloSync website reads both via unauthenticated `GET /api/central/v1/public/modules` (paid tags use each module’s catalog `currency`, e.g. USD — not the workspace default in system settings).

### Published catalog (current)

| Slug | Name | Default included | Billable | Monthly | Yearly |
|------|------|------------------|----------|---------|--------|
| `leads` | Leads | Yes | No | $0 | $0 |
| `tasks` | Tasks | Yes | No | $0 | $0 |
| `contacts` | Contacts | No (free opt-in) | No | $0 | $0 |
| `companies` | Companies | No (free opt-in) | No | $0 | $0 |
| `calendar` | Calendar | No (free opt-in) | No | $0 | $0 |
| `meetings` | Meetings | No (free opt-in) | No | $0 | $0 |
| `activities` | Activities | No (free opt-in) | No | $0 | $0 |
| `opportunities` | Opportunities | No (free opt-in) | No | $0 | $0 |
| `quotations` | Quotations | No (free opt-in) | No | $0 | $0 |
| `contracts` | Contracts | No (free opt-in) | No | $0 | $0 |
| `communication-templates` | Communication Templates | No (free opt-in) | No | $0 | $0 |
| `branded` | Branded | No | **Yes** | **$29** | **$290** |

**Default-included** modules (`is_default_included = true`, `is_billable = false`):

| Slug | Notes |
|------|-------|
| `leads` | CRM pipeline — auto-installed (`source=included`) |
| `tasks` | Work items — auto-installed (`source=included`) |
| `todos` | Personal checklists — auto-installed (`source=included`) |

They are not cancellable by workspace owners (platform admin may **deactivate**).

**Free Marketplace opt-in** (`is_default_included = false`, `is_billable = false`, price `$0`): Contacts, Companies, Calendar, Meetings, Activities, Opportunities, Quotations, Contracts (Sales category), Communication Templates. Tenants install from Marketplace; owners can remove them. Quotations and Contracts require Opportunities first (hard `module_dependencies`).

**Paid Marketplace** (`is_billable = true`): Branded at USD **$29/month** or **$290/year** (custom domain + white-label notifications).

New default-included modules for **existing** production workspaces are registered via idempotent **data migrations** (`DefaultModuleRegistrar`), not `db:seed`. See [module-development production](/deployment/module-development).

Schema remains flexible so free modules can become paid for *new* customers later without redesign (`is_billable`, pricing columns, `source`).

## Resolution

```
active_modules(workspace) =
  workspace_module_subscriptions
    WHERE status IN (trial, active)
    AND (ends_at IS NULL OR ends_at > now)

has_module(workspace, slug) =
  module with that slug is in active_modules AND module.is_active

core = config('core-platform.capabilities')
```

Cached as `workspace:{id}:entitlements` (1 hour). Invalidated on install/cancel/deactivate/status change.

API: `GET /api/central/v1/tenants/{tenant}/entitlements`

Returns `{ core, modules }` for the tenant application to register licensed domains. User permissions come from Spatie Roles & Permissions, not from this payload.

## Routing (licensing + authorization)

Tenant routes should pair middleware:

```
Route::middleware(['auth:tenant-api', 'module:leads', 'can:leads.view'])->group(...)
```

1. `module:{slug}` — workspace owns/has the licensed module (`EnsureModule`)
2. `can:{permission}` — authenticated user has the Spatie permission

Only then allow access.

## Marketplace install rules

Published catalog: tenant `GET /marketplace/modules` / `POST …/purchase`, or central install via `POST /tenants/{tenant}/modules`.

Tenant Marketplace responses convert catalog amounts into the workspace currency for **display only** (`base_*` / `billed_currency` preserve the catalog/Stripe charge currency). See [Tenant Marketplace API](/api/tenant-v1-marketplace#display-currency-conversion).

| Rule | Behavior |
|------|----------|
| Module must be `published` and `is_active` | Validation error otherwise |
| Duplicate active/pending/trial install | Rejected |
| Reinstall after cancel/suspend | Same `tenant_id`+`module_id` row is reactivated (`updateOrCreate`) |
| Required dependencies (`module_dependencies`, `is_optional=false`) | Must already be installed; marketplace detail returns `missing_required_modules` |
| Non-billable module | `status=active` immediately, `source=included` if `is_default_included` else `purchased` |
| Billable module (`is_billable` + price > 0) | `status=pending` until Billing Engine settles payment |

Install body: `{ "module_id": int, "billing_cycle?": "monthly" | "yearly" }` (central) or `POST /marketplace/modules/{module}/purchase` with optional `billing_cycle` (tenant).

## Cancel / deactivate rules

| Action | Who | Included modules | Purchased / opt-in modules |
|--------|-----|------------------|----------------------------|
| **Cancel** (`POST /module-subscriptions/{id}/cancel`) | Central `module-subscriptions.update` | **Blocked** — use deactivate | Sets `cancelled`, `ends_at=now` |
| **Cancel** (`POST /marketplace/modules/{module}/cancel`) | Tenant `marketplace.purchase` | **Blocked** | Same cancel semantics for the current workspace |
| **Deactivate** (`POST /module-subscriptions/{id}/deactivate`) | Central `module-subscriptions.deactivate` | Allowed (platform admin) | Sets `suspended` |

Cancel eligibility is based on catalog `is_default_included` (not subscription `source`). Cancel removes entitlements immediately. Hard dependents must be removed first (`blocking_dependents` on marketplace detail). Deactivate is the platform-admin override for included core modules.

## Dependencies

`module_dependencies` supports hard/optional deps for marketplace modules. Leads and Tasks have none today. `MarketplaceService::detailForTenant` exposes `required_modules`, `optional_modules`, `missing_required_modules`, `already_installed`, `can_cancel`, and `blocking_dependents`. Dependency summaries are enriched via `summarizeModulesForTenant` with pricing and install flags so the tenant SPA can enable a missing required module (and show its subscription fee) from the detail drawer.

## Billing

Each workspace has a consolidated billing profile (`billing_anchor_day`, `billing_cycle`, `proration_mode`, `next_billing_at`). One invoice per cycle for all **billable active** modules via `billing:run-consolidated`. Mid-cycle installs use proration modes: `prorated` | `free_until_next` | `none`. See [billing/billing-engine.md](/developer-guide/billing-engine).
