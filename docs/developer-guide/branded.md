# Branded module — Developer Guide

Billable marketplace module (`slug: branded`, not default-included). Licensing: `module:branded`. Permissions: `branded.view`, `branded.manage`.

## Domain model

Stancl `domains` rows:

| Column | Notes |
|--------|--------|
| `type` | `platform` \| `custom` |
| `verification_token` | TXT ownership token |
| `verified_at` | Set after DNS verify |
| `ssl_provisioned_at` | Set when operator marks TLS live (Central API or artisan) |
| `is_primary` | Preferred custom host for frontend links (only when SSL provisioned) |
| `claimed_at` | Unverified claim TTL (`branded.claim_ttl_hours`) |

`PlatformDomainClassifier` treats `{label}.{suffix}` under `config('branded.platform_domain_suffixes')` as platform. Everything else (including `myai.com.pk`, `app.domain.co.uk`) is custom — no two-label TLD assumption.

## Resolution gate

`WorkspaceResolver::resolveFromHost`:

- Platform domains → always bind
- Custom domains → only when `verified_at` is set **and** `EntitlementService::hasModule($tenant, 'branded')`

Pointing DNS/IP without a verified entitled row does nothing.

## Tenant API

Prefix `/api/tenant/v1`, middleware `module:branded` + Spatie `can:`:

| Method | Path | Permission |
|--------|------|------------|
| GET | `/branded/domain` | `branded.view` |
| POST | `/branded/domain` | `branded.manage` |
| POST | `/branded/domain/verify` | `branded.manage` |
| DELETE | `/branded/domain` | `branded.manage` |

Service: `App\Services\Tenant\BrandedDomainService`. DNS via `App\Contracts\DomainDnsLookup` (`DnsGetRecordLookup` / `FakeDomainDnsLookup` in tests).

Central / public registration never accept a client `domain`. `TenantService` always derives the platform hostname as `{slug}.{primary PLATFORM_DOMAIN_SUFFIXES}` (slug from company name / explicit slug). Custom domains remain tenant self-service under Branded.

## Brand chrome

- `App\Support\BrandedMail::apply()` on tenant and central mail notifications
  - **Branded entitled:** tenant `applicationName`, `logoUrl`, `buttonColor`, frontend URL, `brandedShowPoweredBy=true`
  - **Otherwise / Central:** central `SystemSettingService` app name + logo (platform/EloSync chrome) + default button color; if central `logo_path` is empty, falls back to `FRONTEND_URL` + `config('branding.default_icon')` (press-kit `/brand/elosync-app-icon-light.png`); `brandedShowPoweredBy=false`
- Professional notification bodies: `App\Support\Mail\NotificationMailView` + Blade under `resources/views/emails/notifications/` (detail rows, plain ~200-char excerpts, action-first CTAs such as **View task**)
- Digests: `resources/views/emails/crm/` + same BrandedMail chrome/footer flags
- Published `resources/views/vendor/mail/html/message.blade.php` (+ button) for legacy markdown chrome / Powered by footer
- `EmailConfigResolver` overrides From name when branded is active
- `PlatformNotificationPayloadMapper` uses tenant logo/favicon + title prefix **only when Branded is active**; otherwise default web push icon/badge from `config('webpush.*')` (same press-kit path)
## Cancel / deactivate

`ModuleSubscriptionService::cancel` / `deactivate` clears custom-domain verification when the module slug is `branded`.

## Production hardening

- Custom domain rows are **force-deleted** on remove / stale claim expiry so the unique `domains.domain` index can be reclaimed.
- Verify **fails closed** when `BRANDED_SERVER_IPV4` / `BRANDED_SERVER_IPV6` / `BRANDED_CNAME_TARGET` are all empty.
- `BrandedCustomDomainCors` allows API CORS only for Origins whose host is a verified + entitled custom domain.
- Scheduler: `branded:expire-stale-domain-claims` hourly.

## Tests

- Pest: `tests/Feature/Tenant/Branded/BrandedDomainTest.php`, `tests/Feature/Notifications/BrandedNotificationPayloadTest.php`, `tests/Feature/Notifications/BrandedMailChromeTest.php`, `tests/Unit/DomainRuleTest.php`, `tests/Unit/PlatformDomainClassifierTest.php`
- Playwright: `npm run test:e2e:branded` (Domain tab hidden without module)
