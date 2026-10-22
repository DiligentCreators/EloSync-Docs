# Website module catalog sync — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-23 |
| **Status** | **Go for production** — headed Playwright **1/1**; `next build` **87** static routes including **48** `/modules/[slug]` pages |
| **Scope** | EloSync-Website marketing catalog mirrors Central product modules; light `/marketplace/` live grid; headed e2e coverage |
| **Catalog** | No Backend bump (marketing-only); capacity packs remain in-app only |
| **Companion** | [CHANGELOG](/changelog/) · Website `/marketplace/` · `/modules/[slug]/ · `/pricing/` · `/beta/` |

---

## Executive summary

The public website static `MODULES` fallback was missing eleven Central product modules (Resellers, Reseller Payouts, Email, Announcements, Live Chat, Team Chat, Departments, Storage, Customer Portal, Assets, Short Links). `/marketplace/` was copy-only while `ModuleMarketplace` (dark-theme orphan) was never mounted. This release syncs the static catalog, adds `storage` / `collaboration` categories, mounts a light-theme filterable catalog on `/marketplace/`, and adds a one-session headed Playwright workflow.

**Go / No-Go:** **Go.** Deploy Website static export after production build. No Backend/Frontend migrate.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel shells/auth) | **Pass** |
| Static `MODULES` includes all product modules (not capacity packs) | **Pass** |
| `/modules/[slug]/` SSG for new slugs | **Pass** (`next build` 48 module paths) |
| `/marketplace/` shows filterable catalog | **Pass** |
| Category filters (`storage`, `collaboration`) | **Pass** (headed) |
| Pricing free-install list includes new free modules | **Pass** (headed) |
| Beta form empty / invalid email / missing company validation | **Pass** (headed HTML5) |
| Beta module chips include new modules; chip toggle | **Pass** (headed) |
| Resend invite empty + unknown email status | **Pass** (headed) |
| Capacity packs excluded from marketing cards | **Pass** (by design) |

---

## Security summary

| Control | Status |
|---------|--------|
| Public catalog only — no auth cookies required | Pass |
| Beta application submit not exercised against Central in e2e (validation-only) | Pass |
| Resend invite uses existing public API; no PII logged by Website | Pass |
| `allowedDevOrigins` limited to localhost / 127.0.0.1 for Next dev | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | High | Eleven Central product modules missing from Website `MODULES` / detail SSG | **Fixed** — catalog + `generateStaticParams` |
| **F2** | High | `ModuleMarketplace` unused; `/marketplace/` copy-only | **Fixed** — mounted light-theme catalog under marketplace page |
| **F3** | Medium | Dark-theme marketplace cards unreadable on light `SectionWrapper` | **Fixed** — restyled to site card-surface / slate tone |
| **F4** | Medium | Missing `storage` / `collaboration` categories → API merge remapped to `platform` | **Fixed** — categories + icon maps |
| **F5** | Low | Sticky header intercepted Playwright filter clicks | **Fixed** — `scroll-mt-24`, `aria-pressed`, e2e `force: true` |
| **I1** | Info | Stale `.next` cache can 404 new module SSG paths in local e2e | **Accepted** — clear `.next` or set `reuseExistingServer: false` |
| **I2** | Info | Capacity packs (storage tiers / AI credits) intentionally omitted from marketing cards | **Accepted** — in-app Marketplace billing |

---

## Headed browser coverage

`npm run test:e2e:modules:headed` on 2026-10-23. Result: **1 passed** (one Chromium session, ~48s).

Serial path in one browser context:

1. Homepage → **Browse all modules** → `/marketplace/`
2. Assert all 11 newly synced module cards in `#module-catalog-grid`
3. Filter **Storage** / **Collaboration** (`aria-pressed`) — Leads hidden
4. Visit each `/modules/{slug}/` detail page — Available badge
5. `/pricing/` **Free to install** paragraph contains Short Links, Assets, Customer Portal, Team Chat, Email
6. `/beta/` empty submit → name required; invalid email; missing company; toggle Short Links chip
7. Resend invite empty → required; unknown email → status message

---

## Upgrade

1. Deploy EloSync-Website static export (`npm run build` → `out/`) to Forge/CDN.
2. Hard-refresh marketing site; smoke `/marketplace/`, `/modules/short-links/`, `/modules/team-chat/`, `/pricing/`, `/beta/`.
3. No Backend or Frontend deploy required for this change.
