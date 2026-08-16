# WhatsApp Cloud — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-16 |
| **Status** | **Conditional Go** — ship after CI green + staging smoke; residual UX items below are accepted for MVP 1.0.0 |
| **Scope** | Billable Marketplace module `whatsapp-cloud` catalog **1.0.0** (CRM) |
| **Branch** | `feature/whatsapp-cloud-api-8f44` |
| **Companion** | [WhatsApp Cloud deployment](./whatsapp-cloud) · [Developer guide](/developer-guide/whatsapp-cloud-integration) · [User guide](/user-guide/whatsapp-cloud) · [API](/api/tenant-v1-whatsapp-cloud) |

**PRs:** Backend [#114](https://github.com/DiligentCreators/SaaS-Backend/pull/114) · Frontend [#110](https://github.com/DiligentCreators/SaaS-Frontend/pull/110) · Docs [#135](https://github.com/DiligentCreators/SaaS-Docs/pull/135)

---

## Executive summary

WhatsApp Cloud is a **billable** CRM Marketplace SKU (`$29/mo`, `$290/yr`), **not** default-included. MVP 1A covers Meta WABA/phone connect, text send/receive, webhooks/status, shared inbox, soft Lead link (API + Lead detail shortcut), Meta Cloud template sync with outside-24h enforcement. Communication Templates `wa.me` remains as fallback.

**Go / No-Go:** **Conditional Go** — engineering blockers found in audit were remediated (staff connection status, needs_reauth notify, outbound idempotent skip, OAuth HashRouter callback, headed e2e). Remaining items are ops pre-flight + accepted MVP residuals.

| Gate | Result |
|------|--------|
| Catalog billable CRM `whatsapp-cloud` 1.0.0 / $29 / $290 / not default-included | **Pass** |
| Migrate-only register + permissions (`2026_08_16_100000`–`100006`) | **Pass** |
| Webhook verify + HMAC signature; CSRF exempt `webhooks/whatsapp/*` | **Pass** |
| Encrypted tenant tokens; OAuth state nonce + `FrontendUrl::spa` callback | **Pass** |
| Outside-24h template enforcement | **Pass** (Pest) |
| Soft Lead (no hard `module_dependencies`; timeline via `LeadService`) | **Pass** |
| Staff with `view`/`send` can load connection status (inbox) | **Pass** (remediated) |
| `WhatsAppNeedsReauthNotification` wired from `markNeedsReauth()` | **Pass** (remediated) |
| Outbound job skips non-`Queued` messages | **Pass** (remediated) |
| Pest `WhatsAppCloudModuleTest` | **Pass** (9/9 post-remediation; confirm CI) |
| Playwright `test:e2e:whatsapp-cloud:headed` (shared session) | **Pass** (6/6 local Xvfb) |
| Docs hubs + this readiness page | **Pass** (this audit) |
| Conversation Lead link/unlink UI | **Accepted residual** (API + `?lead=` filter + Lead Inbox shortcut) |
| Phone reclaim after disconnect (global unique) | **Accepted residual** (history retained; reclaim requires ops) |
| Staging human smoke | ☐ Ops |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs |
|----------|---------|----------|------|
| Packaging 2A billable `whatsapp-cloud` | Pass | Pass | Pass |
| Scope 1A connect + text + inbox + templates | Pass | Pass | Pass |
| Soft Lead (no hard dependency) | Pass | Pass (Inbox shortcut) | Pass |
| Keep `wa.me` Communication Templates fallback | Pass | Pass | Pass |
| No auto Lead from unknown numbers | Pass | n/a | Pass |
| No media / Automation WA triggers / alternate BSPs | Deferred | Deferred | Deferred |

---

## Findings

### Remediated this audit

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F1 | **Critical** | `GET /whatsapp/integrations` required `manage_integrations` — staff (`view`+`send`) always saw empty Connect state | Moved **show** under `can:whatsapp-cloud.view` |
| F2 | **High** | `WhatsAppNeedsReauthNotification` never sent | Wired in `WhatsAppConnectionService::markNeedsReauth()` (deduped) |
| F3 | **High** | OAuth success redirected to non-hash `/whatsapp?oauth=` | `FrontendUrl::spa('/whatsapp', …)` |
| F4 | **Medium** | Outbound retry could re-call Meta after Sent | `deliverOutbound` returns early unless status is `Queued` |
| F5 | **Medium** | Inbox cached empty list for 30s after seed/connect | FE `staleTime: 0` + `refetchOnMount: 'always'` |
| F6 | **Medium** | No `needs_reauth` / platform-not-configured UX | Banner + configured hint on inbox page |
| F7 | **Medium** | Docs claimed “link Lead from conversation details” without UI | Softened user guide; API `PATCH lead_id` remains |

### Open / ops

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| O1 | Medium | Companion CI (Laravel Tests / Frontend / Docs Quality Gates) must pass on PRs | Eng |
| O2 | Medium | Forge daemons must include `whatsapp-inbound,whatsapp-outbound` | Ops |
| O3 | Medium | Meta App Review + production webhook/OAuth URLs | Ops |
| O4 | Low | Expand Pest: OAuth replay, RBAC deny matrix, template sync Graph path | Eng (post-MVP) |

### Accepted residual risk

| Item | Notes |
|------|-------|
| Central WhatsApp settings authz | Same pattern as Meta Lead Ads settings (auth-gated central API; no extra Gate); prefer locking behind `system-settings.update` in a platform follow-up |
| Phone unique after disconnect | Disconnect clears tokens and keeps history; `phone_number_id` unique row still blocks other tenants until ops releases |
| Lead link UI | Soft-link via API + Lead detail **Inbox** `?lead=` filter; full link/unlink composer deferred |
| Phone picker / template picker polish | First WABA phone auto-select; template name+language inputs with datalist |
| `META_HTTP_FAKE` | Local/e2e only; blocked when `APP_ENV=production` or `testing` |

---

## Deploy order

1. **Backend** — `php artisan migrate --force` through WhatsApp migrations; deploy workers with WhatsApp queues
2. **Frontend** — SPA with WhatsApp nav + inbox
3. **Docs** — including this readiness page
4. Staging smoke (below) before production traffic

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
| 7 | Pest WhatsApp suite green in CI | Eng | ☐ |
| 8 | Playwright `npm run test:e2e:whatsapp-cloud` / `:headed` green | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **WhatsApp Cloud** (paid / entitled test gateway)
2. Staff user with `view`+`send` sees inbox when connected (not forced empty Connect)
3. Admin **Connect WhatsApp** → OAuth → select WABA/phone
4. Inbound test message → conversation appears; reply text inside 24h
5. Outside 24h → free-form rejected; approved template sends
6. Lead detail **Inbox** opens filtered conversations (`?lead=`); `wa.me` still available when Comm Templates entitled
7. Force Meta auth failure / mark needs_reauth → banner + notification to managers
8. **Disconnect** → tokens cleared; history retained

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA; WhatsApp nav disappears |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall / cancel (history rows retained) |
| Schema | Do **not** roll back WhatsApp migrations in production without a data plan |

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

**Release decision:** **Conditional Go** — merge companions after CI green; complete staging smoke and Forge queue/Meta setup before production opt-in traffic.
