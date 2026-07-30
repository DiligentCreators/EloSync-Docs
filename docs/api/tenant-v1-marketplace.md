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
