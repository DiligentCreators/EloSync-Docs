# Short Links — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-24 |
| **Status** | **Go for production** after migrate + DNS/env + staging smoke |
| **Scope** | Free Marketplace opt-in `short-links` **1.2.0** (branded public 404, vanity slugs, copy UX) |
| **Branch** | `feature/short-links-branded-404-vanity-slugs` |
| **Companion** | [Short Links ops](./short-links) · [Developer](/developer-guide/short-links) · [User](/user-guide/short-links) · [API](/api/tenant-v1-short-links) |

---

## Executive summary

Short Links lets workspaces create tracked public URLs on `{SHORT_LINK_BASE_URL}/r/{code}` with click analytics. **1.2.0** adds:

- EloSync-branded public **404** for missing, paused, expired, or deleted links
- Optional **vanity slugs** on create (3–64 chars; immutable after create)
- Inline **copy-to-clipboard** on list and record pages

**Go / No-Go:** **Go** — engineering and automated tests complete; ops completes migrate-only rollout, short-domain DNS, env vars, queue workers, and staging smoke.

| Gate | Result |
|------|--------|
| Catalog: `short-links` / operations / **1.2.0** / free / not default | **Pass** |
| Permissions + default role maps | **Pass** |
| Public redirect throttle (120/min per IP) | **Pass** |
| Branded 404 Blade + config CTAs | **Pass** |
| Vanity slug validation (format, reserved, global unique) | **Pass** |
| Legacy UUID redirect compatibility | **Pass** |
| Soft-delete / pause / expiry stop redirects | **Pass** |
| Pest `ShortLinkTest` | **Pass** (16 tests) |
| Playwright workflow + public redirect | **Pass** |
| Docs (user / dev / API / changelog / upgrade) | **Pass** |

---

## Security summary

| Control | Status |
|---------|--------|
| Tenant isolation | Pass |
| Module gate + Spatie permissions + policies | Pass |
| Destination URL `url` validation (no open redirect to `javascript:`) | Pass |
| Branded 404 — server-controlled copy, no user HTML | Pass |
| Globally unique vanity slugs + reserved list | Pass |
| Click IP stored as SHA-256 hash only | Pass |
| Bot user agents skip click recording | Pass |

**Accepted:** Vanity slugs are globally unique across all tenants (first workspace to claim a slug owns it).

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/ShortLink` | **16 passed** | CRUD, branded 404 HTML, vanity slugs, redirects, authz, soft-delete |
| `npm run test:e2e:short-links` | **2 passed** | Full tenant workflow + public branded 404 / redirect |

---

## Deploy order

1. Deploy **Backend** (through `2026_08_23_231224_widen_short_link_codes_and_bump_version`)
2. `php artisan migrate --force`
3. Set production env (see [Short Links ops](./short-links))
4. Confirm queue workers process `RecordShortLinkClickJob`
5. Deploy **Frontend**
6. Deploy **Docs**
7. Staging smoke → production

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migration `2026_08_23_231224` applied | Ops | ☐ |
| 2 | Catalog `short-links` version **1.2.0** | Ops | ☐ |
| 3 | `SHORT_LINK_BASE_URL` points at API host (e.g. `https://go.elosync.com`) | Ops | ☐ |
| 4 | `SHORT_LINK_MARKETING_URL` / `SHORT_LINK_BETA_URL` set | Ops | ☐ |
| 5 | DNS for short domain → Laravel app | Ops | ☐ |
| 6 | Queue workers running (click recording) | Ops | ☐ |
| 7 | Pest Short Link suite green | Eng | ☑ |
| 8 | Playwright short-links on staging | QA | ☐ |

---

## Staging smoke (human)

1. Install **Short Links** from Marketplace on a test workspace
2. Create link with vanity slug `staging-test` → copy from list icon → open in incognito → **302** to destination
3. Pause link → revisit short URL → **branded 404** (“Link unavailable”, EloSync CTAs)
4. Visit `/r/does-not-exist-xyz` → **branded 404** (“Link not found”)
5. Soft-delete link → revisit → branded unavailable page
6. Restore → active redirect works again

---

## Rollback

- Forward-fix only — **do not** `migrate:rollback` on `code` column widen
- Feature rollback = revert SPA/API deploys; existing short URLs keep working on prior backend if redirect controller unchanged

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | ☐ Prod Go |
| Ops (migrate + DNS + env + queues) | | | ☐ |
| Product | | | ☐ |

**Current decision (2026-08-24):** **Go** — ship after migrate-only rollout, short-domain DNS/env confirmation, and staging smoke.
