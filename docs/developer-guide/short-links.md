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
| Support | `app/Support/ShortLinkDeviceDetector.php` |
| Policy | `app/Policies/ShortLinkPolicy.php` |
| Events | `ShortLinkCreated`, `ShortLinkUpdated`, `ShortLinkDeleted` |
| Subscriber | `app/Listeners/ShortLinkEventSubscriber.php` |
| Tests | `tests/Feature/Tenant/ShortLink/ShortLinkTest.php` |

## Domain notes

- `uuid` is globally unique and used in public URLs: `{APP_URL}/r/{uuid}`.
- `expires_at` and `last_clicked_at` use `UtcDateTime`; compare with `UtcInstant` in scopes.
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
- `is_default_included = false`, `is_billable = false`, version **1.0.0**
- Registered via migrate-only `DefaultModuleRegistrar::ensureModule`

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-short-links.md](/api/tenant-v1-short-links).

## Public redirect

`GET /r/{uuid}` — no auth. Initializes tenancy from the link row, checks `module:short-links` entitlement, dispatches `RecordShortLinkClickJob`, returns `302` to destination (+ UTM).

## Frontend

| Piece | Path |
|-------|------|
| Pages | `src/pages/short-links/` |
| Service | `shortLinkService` in `src/api/services.ts` |
| Nav | `permission: shortLinks.view`, `module: 'short-links'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/ShortLink

# Frontend e2e
npm run test:e2e:short-links
```
