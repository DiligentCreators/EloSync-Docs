# Short Links — Developer Guide

Mirror the **Assets** / **Announcements** module pattern. Public redirects live on `routes/web.php` (not tenant API).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/ShortLink.php`, `ShortLinkClick.php` |
| Enum | `app/Enums/Tenant/ShortLinkStatusEnum` |
| Service | `app/Services/Tenant/ShortLinkService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ShortLinkController.php` |
| Public redirect | `app/Http/Controllers/Central/ShortLinkRedirectController.php` |
| Job | `app/Jobs/Tenant/RecordShortLinkClickJob.php` |
| Support | `app/Support/ShortLinkDeviceDetector.php`, `ShortLinkCodeGenerator.php` |
| Policy | `app/Policies/ShortLinkPolicy.php` |
| Events | `ShortLinkCreated`, `ShortLinkUpdated`, `ShortLinkDeleted` |
| Subscriber | `app/Listeners/ShortLinkEventSubscriber.php` |
| Branded 404 view | `resources/views/short-links/unavailable.blade.php` |
| Tests | `tests/Feature/Tenant/ShortLink/ShortLinkTest.php` |

## Domain notes

- `uuid` is globally unique for internal/API use; public URLs use `code` on `{SHORT_LINK_BASE_URL}/r/{code}` (default production: `https://go.elosync.com/r/{code}`). Auto-generated codes are 7 characters; optional custom vanity slugs are 3–64 characters (lowercase, numbers, hyphens). Legacy `{APP_URL}/r/{uuid}` redirects still work (UUID lookup takes precedence over slug format).
- `expires_at` and `last_clicked_at` use `UtcDateTime`; compare with `UtcInstant` in scopes.
- `isRedirectable()` returns false for trashed, paused, or expired links.
- Click rows store `ip_hash` (SHA-256) — not raw IPs.
- Bot user agents still redirect but skip click recording (`ShortLinkDeviceDetector`).
- Redirect route throttle: `short-link-redirects` (120/min per IP; disabled in testing).

## Permissions

`config/tenant-permissions.php`:

```
short-links.view | create | update | delete | restore | force.delete | view_analytics
```

## Catalog

- Slug `short-links`, category `operations`, `sort_order` 90
- `is_default_included = false`, `is_billable = false`, version **1.2.0**
- Registered via migrate-only `DefaultModuleRegistrar::ensureModule`

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-short-links.md](/api/tenant-v1-short-links).

## Public redirect

`GET /r/{identifier}` — no auth. Lookup order: UUID (legacy) → `code` (auto or custom slug). Checks `module:short-links` entitlement, dispatches `RecordShortLinkClickJob`, returns `302` to destination (+ UTM).

Missing, paused, expired, or soft-deleted links return HTTP **404** with the branded `short-links.unavailable` Blade view (EloSync marketing CTAs).

## Configuration

| Env | Purpose |
|-----|---------|
| `SHORT_LINK_BASE_URL` | Public short domain (e.g. `https://go.elosync.com`). Defaults to `APP_URL`. |
| `SHORT_LINK_MARKETING_URL` | CTA link on branded 404 (default `https://elosync.com`). |
| `SHORT_LINK_BETA_URL` | Beta CTA on branded 404 (default `https://elosync.com/beta`). |

`config/short-links.php` also defines `custom_slug_min_length`, `custom_slug_max_length`, and `reserved_slugs`.

Point `go.elosync.com` DNS at the same Laravel app as the API. Local dev: add `go.elosync.test` in Herd and set `SHORT_LINK_BASE_URL=http://go.elosync.test`.

## Frontend

| Piece | Path |
|-------|------|
| Pages | `src/pages/short-links/` |
| Copy component | `src/components/common/copyable-text.tsx` |
| Service | `shortLinkService` in `src/api/services.ts` |
| Nav | `permission: shortLinks.view`, `module: 'short-links'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/ShortLink

# Frontend e2e
npm run test:e2e:short-links
```
