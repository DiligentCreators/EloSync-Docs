# Short Links — Production Guide

Full go-live audit / checklist: [Short Links production readiness](./short-links-production-readiness).

## Licensing

- Catalog slug: `short-links`
- Category: `operations` (**Operations**), `sort_order = 90`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, version **1.2.0**

## Environment

| Variable | Purpose |
|----------|---------|
| `SHORT_LINK_BASE_URL` | Public short domain served by this Laravel app (e.g. `https://go.elosync.com`). Defaults to `APP_URL`. |
| `SHORT_LINK_MARKETING_URL` | “Learn about EloSync” CTA on branded 404 (default `https://elosync.com`) |
| `SHORT_LINK_BETA_URL` | “Join the Founding Beta” CTA on branded 404 (default `https://elosync.com/beta`) |

Point the short domain DNS at the **same** Laravel deployment as the API (`routes/web.php` → `GET /r/{identifier}`).

## Upgrade to 1.2.0

See [Upgrade guide — Short Links 1.1.0 → 1.2.0](./upgrade#short-links-1-1-0-1-2-0).

## Operations

- **Queues:** `RecordShortLinkClickJob` runs on the default queue — workers must be running for click analytics.
- **Rate limit:** `short-link-redirects` — 120 requests/minute per IP (disabled in `testing`).
- **Public 404:** Missing or inactive links return HTTP 404 with branded HTML (not JSON).

## Permissions rollout

Short Links permissions ship via `config/tenant-permissions.php` and additive data migrations. Do **not** re-seed roles in production upgrades.
