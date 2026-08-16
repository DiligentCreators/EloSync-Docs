# WhatsApp Cloud — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-16 |
| **Status** | **Go** — engineering residuals closed; complete ops pre-flight + staging smoke before production traffic |
| **Scope** | Billable Marketplace module `whatsapp-cloud` catalog **1.0.0** (CRM) |
| **Branch** | `feature/whatsapp-cloud-api-8f44` |
| **Companion** | [WhatsApp Cloud deployment](./whatsapp-cloud) · [Developer guide](/developer-guide/whatsapp-cloud-integration) · [User guide](/user-guide/whatsapp-cloud) · [API](/api/tenant-v1-whatsapp-cloud) |

**PRs:** Backend [#114](https://github.com/DiligentCreators/SaaS-Backend/pull/114) · Frontend [#110](https://github.com/DiligentCreators/SaaS-Frontend/pull/110) · Docs [#135](https://github.com/DiligentCreators/SaaS-Docs/pull/135)

---

## Executive summary

WhatsApp Cloud is a **billable** CRM Marketplace SKU (`$29/mo`, `$290/yr`), **not** default-included. MVP 1A covers Meta WABA/phone connect, text send/receive, webhooks/status, shared inbox, soft Lead link (inbox UI + API + Lead detail shortcut), Meta Cloud template sync with outside-24h enforcement. Communication Templates `wa.me` remains as fallback.

**Go / No-Go:** **Go** for merge after CI green. Ops must still complete staging smoke, Forge queue workers, Meta credentials, and App Review before customer traffic.

| Gate | Result |
|------|--------|
| Catalog billable CRM `whatsapp-cloud` 1.0.0 / $29 / $290 / not default-included | **Pass** |
| Migrate-only register + permissions (`2026_08_16_100000`–`100006`) | **Pass** |
| Webhook verify + HMAC signature; CSRF exempt `webhooks/whatsapp/*` | **Pass** |
| Encrypted tenant tokens; OAuth state nonce + `FrontendUrl::spa` callback | **Pass** |
| Outside-24h template enforcement | **Pass** (Pest) |
| Soft Lead (no hard `module_dependencies`; inbox link/unlink UI) | **Pass** |
| Staff with `view`/`send` can load connection status (inbox) | **Pass** |
| `WhatsAppNeedsReauthNotification` wired from `markNeedsReauth()` | **Pass** |
| Outbound job skips non-`Queued` messages | **Pass** |
| Phone reclaim after disconnect (release Meta id; same-tenant restore) | **Pass** |
| Central WhatsApp settings Gate (`system-settings.list` / `update`) | **Pass** |
| Pest `WhatsAppCloudModuleTest` | **Pass** (16/16) |
| Playwright `test:e2e:whatsapp-cloud:headed` (shared session) | **Pass** (prior 6/6; phone/template picker updated) |
| Docs hubs + this readiness page | **Pass** |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs |
|----------|---------|----------|------|
| Packaging 2A billable `whatsapp-cloud` | Pass | Pass | Pass |
| Scope 1A connect + text + inbox + templates | Pass | Pass | Pass |
| Soft Lead (no hard dependency) | Pass | Pass (link/unlink UI) | Pass |
| Keep `wa.me` Communication Templates fallback | Pass | Pass | Pass |
| No auto Lead from unknown numbers | Pass | n/a | Pass |
| No media / Automation WA triggers / alternate BSPs | Deferred | Deferred | Deferred |

---

## Findings

### Remediated (initial audit + production hardening)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F1 | **Critical** | Staff integrations show required `manage_integrations` | Show under `can:whatsapp-cloud.view` |
| F2 | **High** | Needs-reauth notification never sent | Wired in `markNeedsReauth()` |
| F3 | **High** | OAuth success non-hash redirect | `FrontendUrl::spa` |
| F4 | **Medium** | Outbound retry after Sent | Queued-only delivery |
| F5 | **Medium** | Stale inbox cache | FE `staleTime: 0` |
| F6 | **Medium** | No reauth / platform UX | Banner + hint |
| F7 | **Medium** | Docs over-claimed Lead UI | Inbox link/unlink shipped |
| F8 | **High** | Phone unique blocked reclaim after disconnect | Release Meta id on disconnect; restore same row on reconnect; cross-tenant check uses `withoutGlobalScopes` |
| F9 | **Medium** | Central WhatsApp settings ungated | `Gate::authorize` via `SystemSetting` policy |
| F10 | **Low** | Thin Pest coverage | OAuth replay, RBAC deny, reclaim, lead link, template sync, central gate |
| F11 | **Low** | First-phone / datalist polish | Explicit phone picker + template `<select>` |

### Open / ops (not code blockers)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| O1 | Medium | Companion CI Quality Gates must pass on PRs | Eng |
| O2 | Medium | Forge daemons must include `whatsapp-inbound,whatsapp-outbound` | Ops |
| O3 | Medium | Meta App Review + production webhook/OAuth URLs | Ops |

---

## Deploy order

1. **Backend** — migrate through WhatsApp migrations; deploy workers with WhatsApp queues  
2. **Frontend** — SPA with WhatsApp nav + inbox  
3. **Docs** — including this readiness page  
4. Staging smoke before production traffic  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations `2026_08_16_100000`–`100006` applied (no production `db:seed` for catalog) | Ops | ☐ |
| 2 | Catalog row `whatsapp-cloud` published, billable, version **1.0.0** | Ops | ☐ |
| 3 | Queue workers include **`whatsapp-inbound`** and **`whatsapp-outbound`** | Ops | ☐ |
| 4 | Meta WhatsApp product enabled; webhook `{APP_URL}/webhooks/whatsapp/cloud`; OAuth `{APP_URL}/api/oauth/whatsapp/cloud/callback` | Ops | ☐ |
| 5 | Central / env Meta secrets set; `META_HTTP_FAKE` unset in production; stable `APP_KEY` | Ops | ☐ |
| 6 | Marketplace purchase → pending → payment/`activate` before inbox entitlements | Ops | ☐ |
| 7 | Pest WhatsApp suite green in CI (16 tests) | Eng | ☐ |
| 8 | Playwright `npm run test:e2e:whatsapp-cloud` / `:headed` green | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **WhatsApp Cloud**  
2. Staff with `view`+`send` sees inbox when connected  
3. Admin **Connect** → OAuth → select WABA → select phone  
4. Inbound → reply inside 24h; template outside 24h  
5. Soft-link / unlink Lead from conversation header  
6. Lead detail **Inbox** filter; `wa.me` when Comm Templates entitled  
7. needs_reauth banner + notification  
8. **Disconnect** → history retained; another workspace (or same) can reclaim Meta phone id  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall / cancel |
| Schema | Do **not** roll back WhatsApp migrations without a data plan |

---

## Monitoring

- Queues: `whatsapp-inbound`, `whatsapp-outbound` — `php artisan queue:failed`
- Connection `status` / `last_error` / phone `health`
- Notification types: `whatsapp.inbound`, `whatsapp.send_failed`, `whatsapp.needs_reauth`
- Meta Graph 4xx/5xx in application logs

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — merge companions after CI green; complete staging smoke and Forge queue/Meta setup before production opt-in traffic.
