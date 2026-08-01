# Tenant API v1 — Marketplace

Base path: `/api/tenant/v1/marketplace`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `marketplace.enabled`, plus permission middleware.

Permissions: `marketplace.view` (browse), `marketplace.purchase` (install / subscribe / remove).

## Modules

| Method | Path | Permission | Behavior |
|--------|------|------------|----------|
| GET | `/modules` | `marketplace.view` | Paginated published catalog (`search`, `category_id`) + per-row install flags |
| GET | `/modules/{module}` | `marketplace.view` | Detail + install state for the current workspace |
| POST | `/modules/{module}/purchase` | `marketplace.purchase` | Install free module or start paid checkout |
| POST | `/modules/{module}/confirm-checkout` | `marketplace.purchase` | Confirm return from payment gateway |
| POST | `/modules/{module}/cancel` | `marketplace.purchase` | Remove / cancel a non-core installed module |

### List row extras

| Field | Meaning |
|-------|---------|
| `already_installed` | Active or trial subscription for this workspace |
| `purchase_pending` | Pending checkout not yet activated |
| `version` | Catalog display version (semver metadata) |
| `is_billable` | Paid module (SPA badge **Billable** when not installed) |

SPA badge priority: **Installed** → **Pending** → **Billable** → **Available** (free, not installed). Do not label free opt-in modules as “Included”.

### Display currency conversion

Catalog prices are stored in `modules.currency` (typically **USD**). Tenant list/detail responses convert `monthly_price`, `yearly_price`, and `setup_fee` into the **workspace currency** (`tenants.currency`) for display only.

| Field | Meaning |
|-------|---------|
| `monthly_price` / `yearly_price` / `setup_fee` | Amount in `currency` (tenant currency when conversion succeeds) |
| `currency` | Display currency for the amounts above |
| `base_*_price` / `base_currency` | Original catalog amounts / currency |
| `billed_currency` | Currency charged at checkout (catalog / Stripe Price — usually USD) |
| `exchange_rate` / `exchange_rate_at` | Mid-market rate used for the conversion |
| `price_converted` | `true` when amounts were converted from the catalog currency |

If the FX provider is unavailable, amounts stay in the catalog currency (`price_converted: false`). **Checkout still charges the mapped Stripe (or gateway) Price in `billed_currency`** — conversion is display-only.

Rates: `CurrencyConversionService` → `open.er-api.com` (configurable via `CURRENCY_FX_*` env), cached (~12h).

### Detail payload extras

| Field | Meaning |
|-------|---------|
| `already_installed` | Active or trial subscription for this workspace |
| `purchase_pending` | Pending checkout not yet activated |
| `subscription_status` / `subscription_source` | Current row when present |
| `can_cancel` | Tenant may remove it now (not core-included, no blocking dependents) |
| `required_modules` / `optional_modules` / `missing_required_modules` | **Dependencies** — modules this one needs (upstream) |
| `blocking_dependents` | **Dependents** — installed modules that hard-depend on this one (downstream; blocks remove) |

Dependency summaries (`required_modules`, `optional_modules`, `missing_required_modules`) include pricing and install flags so the SPA can offer **Install** / **Subscribe** on a missing required module without an extra detail round-trip:

| Field | Meaning |
|-------|---------|
| `id` / `name` / `slug` | Catalog identity |
| `is_billable` / `is_default_included` | Commercial / core flags |
| `already_installed` / `purchase_pending` | Workspace install state |
| `monthly_price` / `yearly_price` / `currency` | Display amounts (workspace currency when FX succeeds) |
| `base_*` / `billed_currency` / `price_converted` | Same display-FX shape as list rows |

`blocking_dependents` remains `{ id, name, slug }` only.

UI copy must keep these directions distinct: “no dependencies” means nothing upstream is required; dependents (e.g. Meetings → Calendar) still block remove until those modules are removed first.

### Cancel rules

- Default-included core modules (today: Leads, Tasks) cannot be cancelled by tenants.
- Hard dependents must be removed first (e.g. remove Meetings before Calendar).
- Cancel sets status `cancelled`, clears entitlements immediately, and cancels any live provider subscription.
- Response includes refreshed `modules` entitlement slugs for the workspace.

See [Entitlements](/developer-guide/entitlements) for install / cancel policy.
