# Tenant API v1 — Marketplace

Base path: `/api/tenant/v1/marketplace`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `marketplace.enabled`, plus permission middleware.

Permissions: `marketplace.view` (browse), `marketplace.purchase` (install / subscribe / remove).

## Modules

| Method | Path | Permission | Behavior |
|--------|------|------------|----------|
| GET | `/modules` | `marketplace.view` | Paginated published catalog (`search`, `category_id`) |
| GET | `/modules/{module}` | `marketplace.view` | Detail + install state for the current workspace |
| POST | `/modules/{module}/purchase` | `marketplace.purchase` | Install free module or start paid checkout |
| POST | `/modules/{module}/confirm-checkout` | `marketplace.purchase` | Confirm return from payment gateway |
| POST | `/modules/{module}/cancel` | `marketplace.purchase` | Remove / cancel a non-core installed module |

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
| `blocking_dependents` | Active modules that hard-depend on this one |
| `required_modules` / `optional_modules` / `missing_required_modules` | Dependency hints |

### Cancel rules

- Default-included core modules (today: Leads, Tasks) cannot be cancelled by tenants.
- Hard dependents must be removed first (e.g. remove Meetings before Calendar).
- Cancel sets status `cancelled`, clears entitlements immediately, and cancels any live provider subscription.
- Response includes refreshed `modules` entitlement slugs for the workspace.

See [Entitlements](/developer-guide/entitlements) for install / cancel policy.
