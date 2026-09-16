# Live Chat — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-17 |
| **Status** | **Go** — production-readiness remediations closed (catalog **1.0.1**); complete migrate + staging smoke before production opt-in embeds |
| **Scope** | Free Communication Marketplace module `live-chat` catalog **1.0.1** (not default-included) |
| **Companion** | [Live Chat deployment](./live-chat) · [Developer guide](/developer-guide/live-chat) · [User guide](/user-guide/live-chat) · [API](/api/tenant-v1-live-chat) |

---

## Executive summary

Live Chat ships catalog, tenant inbox, public widget script (CORS-open for credential-less embeds), soft Lead link, public DTO hardening, session revoke on key regen, Pest + Playwright coverage.

| Gate | Result |
|------|--------|
| Catalog free opt-in `live-chat` **1.0.1** (not default-included) | **Pass** |
| Permissions `view` / `reply` / `assign` / `manage` + default roles | **Pass** |
| Session token SHA-256; CSRF exempt; inactive widget 404 | **Pass** |
| Entitlement check on public + tenant paths; tenant isolation | **Pass** |
| Soft Leads (no hard module dep) | **Pass** |
| Rate limits `live-chat-widget` + tighter `live-chat-widget-session` | **Pass** |
| CORS for credential-less third-party embeds (`LiveChatPublicCors`) | **Pass** |
| Public responses strip agent/Lead/IP PII | **Pass** |
| Regenerate key invalidates visitor sessions | **Pass** |
| Session TTL (7 days) + scheduled visitor purge (90 days) | **Pass** |
| Module cancel/deactivate flips widgets inactive | **Pass** |
| PlatformAudit + `LogsActivity`; `UtcDateTime` on `last_message_at` | **Pass** |
| Pest public entitlement / CORS / IDOR / regen / TTL / 413 | **Pass** |
| Playwright `test:e2e:live-chat` human workflow | **Pass** |
| Docs hubs (user / developer / API / deploy / entitlements / roadmap) | **Pass** |

**Go / No-Go:** **Go** for merge after CI green. Ops must migrate through **1.0.1** and complete staging smoke (including a third-party Origin embed) before customer traffic.

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs |
|----------|---------|----------|------|
| Free Communication opt-in (not default-included) | Pass | Pass | Pass |
| Soft Lead link (no hard module dep) | Pass | Pass | Pass |
| Agent inbox (WhatsApp-style), not Team Chat | Pass | Pass | Pass |
| Media + Help Desk escalate | Pass | Pass | Pass (invoice share / bots still deferred) |
| Visitor Echo (realtime) | Pass | Pass | Pass |
| Captcha / Turnstile (beyond throttle + TTL) | Deferred | Deferred | Deferred |
| Mobile shell | Out of scope | Out of scope | Out of scope |

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_17_003600` | Tables: widgets, visitors, conversations, messages |
| `2026_09_17_003610` | Register `live-chat` **1.0.0** (free, not default-included) |
| `2026_09_17_003620` | Permissions + default role grants |
| `2026_09_17_003630` | Catalog **1.0.0 → 1.0.1** (production-readiness remediations) |
| `2026_09_17_003700` | Expand schema + catalog **1.0.1 → 1.3.0** |

Production: **migrate only**. `CatalogSeeder` seeds `live-chat` **1.3.0** for local fresh seeds.

---

## Findings (2026-09-17 remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| LC-01 | Critical | CORS pinned to SPA — embeds failed | `LiveChatPublicCors` reflects Origin for `api/public/live-chat/*`; Pest OPTIONS + GET |
| LC-02 | High | Public APIs leaked agent/Lead/IP PII | `LiveChatPublicConversationResource` / `LiveChatPublicMessageResource`; no sender load on visitor poll |
| LC-03 | High | Key regen left sessions valid | `revokeVisitorSessions()` on regenerate + deactivate |
| LC-04 | High | No public entitlement Pest | Public bootstrap 403 after cancel + widgets inactive |
| LC-05 | Medium | Throttle-only; no session expiry | 7-day session TTL; tighter session-create limiter (10/min) |
| LC-06 | Medium | No visitor retention | `live-chat:purge-visitors --days=90` daily |
| LC-07 | Medium | No audit / activity log | `PlatformAuditService` + `LogsActivity` on widget/conversation |
| LC-08 | Medium | `last_message_at` default datetime | `UtcDateTime` cast |
| LC-09 | Medium | Cancel left widgets active | `deactivateLiveChatIfNeeded` on cancel/deactivate |
| LC-10 | Medium | Silent query failures | Frontend `ErrorState` + retry on widget / list / messages |
| LC-11 | Medium | Pest security gaps | CORS, IDOR, regen, TTL, 413, public entitlement |
| LC-12 | Low | MaxBodyBytes only on some POSTs | All public POSTs |

### Ops (not code blockers)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| O1 | Medium | Companion CI Quality Gates on Live Chat PRs | Eng |
| O2 | Low | Serve `public/widgets/live-chat.js` from API host (or CDN); APP_URL reachable | Ops |
| O3 | Low | Ensure Forge scheduler runs `live-chat:purge-visitors` | Ops |

---

## Deploy order

1. **Backend** — migrate through `2026_09_17_003630`; scheduler includes `live-chat:purge-visitors`  
2. **Frontend** — SPA with query error states  
3. **Docs** — this readiness page + [live-chat](./live-chat)  
4. Staging smoke below before production opt-in traffic  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `2026_09_17_003630` (catalog **1.0.1**) | Ops | ☐ |
| 2 | Catalog `live-chat` = **1.0.1**; Marketplace install (not default-included) | Ops | ☐ |
| 3 | APP_URL reachable; widget script served; public CORS verified from foreign Origin | Ops | ☐ |
| 4 | Rate limiters `live-chat-widget` + `live-chat-widget-session` active | Ops | ☐ |
| 5 | Scheduler: `live-chat:purge-visitors --days=90` | Ops | ☐ |
| 6 | Pest `LiveChatModuleTest` green | Eng | ☐ |
| 7 | Playwright `test:e2e:live-chat` green | QA | ☐ |
| 8 | Leads entitled only if soft-link tested | Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Live Chat** (free)  
2. Staff with `live-chat.view` sees `/live-chat`; without module → gate  
3. Widget settings: greeting, prechat required, save; copy embed snippet  
4. From a **third-party origin** (or browser DevTools Origin), bootstrap + session + message succeed (CORS)  
5. Confirm public message/conversation JSON has **no** assignee, lead, visitor IP, or sender email  
6. Agent reply / claim / close; inbound notification → deep-link  
7. Soft-link / unlink Lead when Leads entitled; hide when not  
8. Regenerate public key → old embed key fails; old visitor sessions rejected  
9. Deactivate widget / uninstall module → public API 404/403; widgets inactive after cancel  
10. Prechat validation when required; empty reply blocked; oversized body → 413  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall / cancel |
| Schema | Do **not** roll back Live Chat migrations without a data plan |

---

## Monitoring

- Throttle denials on `live-chat-widget` / `live-chat-widget-session`  
- Public 401/403/404 rates on `/api/public/live-chat/*`  
- Notification type `live-chat.inbound`  
- `live-chat:purge-visitors` daily output / failures  
- Application logs for tenancy init failures on public paths  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — merge companions after CI green; complete staging smoke and migrate to **1.0.1** before production opt-in embeds.
