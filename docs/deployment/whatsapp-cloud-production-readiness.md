# WhatsApp Cloud — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-22 |
| **Status** | **Go** — post-MVP polish (1.1–1.3) engineering residuals closed; complete ops pre-flight + Phase 1–3 staging smoke before production opt-in traffic |
| **Scope** | Billable Marketplace module `whatsapp-cloud` catalog **1.3.0** (CRM) + Automation catalog **1.1.0** (WA trigger/action) |
| **Branch** | `feature/whatsapp-cloud-post-mvp-polish` |
| **Companion** | [WhatsApp Cloud deployment](./whatsapp-cloud) · [Developer guide](/developer-guide/whatsapp-cloud-integration) · [User guide](/user-guide/whatsapp-cloud) · [API](/api/tenant-v1-whatsapp-cloud) · [Automation](/developer-guide/automation) |

**PRs:** Backend [#141](https://github.com/DiligentCreators/EloSync-Backend/pull/141) · Frontend [#134](https://github.com/DiligentCreators/EloSync-Frontend/pull/134) · Docs [#161](https://github.com/DiligentCreators/EloSync-Docs/pull/161)

---

## Executive summary

WhatsApp Cloud remains a **billable** CRM Marketplace SKU (`$29/mo`, `$290/yr`), **not** default-included.

| Catalog | Version | Surface |
|---------|---------|---------|
| `whatsapp-cloud` | **1.3.0** | MVP inbox + Lead Source (1.1) + Automation hooks (1.2) + media (1.3) |
| `automation` | **1.1.0** | `whatsapp.message_received` trigger + `send_whatsapp_template` action |

**Go / No-Go:** **Go** for merge after CI green. Ops must still complete migrations through media bump, Forge queues (`whatsapp-inbound`, `whatsapp-outbound`, `automations`), Meta credentials with **`META_HTTP_FAKE` unset**, and staging smoke for Phases 1–3 before customer traffic.

| Gate | Result |
|------|--------|
| Catalog migrate-only bumps to WA **1.3.0** / automation **1.1.0** | **Pass** |
| CatalogSeeder seed versions align with migrate bumps | **Pass** |
| Lead Source opt-in (`auto_create_leads` default false) | **Pass** |
| Automation via `IntegrationEventDispatcher` | **Pass** |
| Media attachments + soft Storage quota | **Pass** |
| Inbound MIME allowlist + declared-size quota check before Graph download | **Pass** |
| Attachment download scoped to conversation (IDOR denied) | **Pass** |
| Webhook verify + HMAC; CSRF exempt `webhooks/whatsapp/*` | **Pass** |
| Encrypted tenant tokens; OAuth soft-delete restore | **Pass** |
| `META_HTTP_FAKE` never active in production | **Pass** |
| Pest WhatsApp suite (module + media + automation) | **Pass** (**30+**) |
| Playwright WhatsApp shared session + Automation WA trigger | **Pass** |
| Docs hubs + this readiness page current for 1.3.0 | **Pass** |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs |
|----------|---------|----------|------|
| Packaging billable `whatsapp-cloud` | Pass | Pass | Pass |
| Soft Lead link (no hard module dep) | Pass | Pass | Pass |
| Keep `wa.me` Communication Templates fallback | Pass | Pass | Pass |
| Opt-in Lead Source auto-create (default **off**) | Pass | Pass | Pass |
| Automation WA trigger + template action | Pass | Pass | Pass |
| Media image/document/audio/video | Pass | Pass | Pass |
| Interactive buttons/lists / alternate BSPs / AI WA | Deferred | Deferred | Deferred |

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_08_16_100005` / `100006` | Register WA **1.0.0** + permissions |
| `2026_08_21_234243` | `auto_create_leads`, `default_lead_source` |
| `2026_08_21_234245` | WA **1.0.0 → 1.1.0** |
| `2026_08_21_235205` | Automation **1.0.0 → 1.1.0**, WA **1.1.0 → 1.2.0** |
| `2026_08_21_235553` | `whatsapp_message_attachments` |
| `2026_08_21_235556` | WA **1.2.0 → 1.3.0** |

Production: **migrate only**. `CatalogSeeder` now seeds WA **1.3.0** / automation **1.1.0** for local fresh seeds.

---

## Findings (2026-08-22 audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| D1 | High | Readiness/deploy docs claimed 1.0.0 + Deferred polish | Docs refreshed |
| D2 | Medium | Developer guide listed polish as deferred | Corrected |
| F12 | High | Soft-deleted connection blocked OAuth reconnect | `withTrashed` + restore; Pest |
| E1 | Low | Inbound MIME / download-before-quota | `WhatsAppMediaRules` allowlist; declared `file_size` + max 16 MiB checked **before** Graph binary download |
| E2 | Low | Thin IDOR/quota/Automation WA UI coverage | Pest IDOR + mime + quota; Playwright Automation WA trigger selectable |
| E3 | Low | CatalogSeeder WA version drift | Seeder → WA **1.3.0**, automation **1.1.0** |

### Ops (not code blockers)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| O1 | Medium | Companion CI Quality Gates on polish PRs | Eng |
| O2 | Medium | Forge: `whatsapp-inbound`, `whatsapp-outbound`, `automations` | Ops |
| O3 | Medium | Meta App Review + production URLs; `META_HTTP_FAKE` unset | Ops |

---

## Deploy order

1. **Backend** — migrate through `2026_08_21_235556`; workers include WhatsApp + `automations` queues  
2. **Frontend** — SPA with Lead Source settings + media attach  
3. **Docs** — this readiness page + deploy/user/dev/API  
4. Staging smoke (Phases 1–3) before production traffic  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `2026_08_21_235556` (attachments + catalog **1.3.0**) | Ops | ☐ |
| 2 | Catalog `whatsapp-cloud` = **1.3.0**; `automation` = **1.1.0** where WA Automation is used | Ops | ☐ |
| 3 | Queue workers: **`whatsapp-inbound`**, **`whatsapp-outbound`**, **`automations`** | Ops | ☐ |
| 4 | Meta WhatsApp product; webhook `{APP_URL}/webhooks/whatsapp/cloud`; OAuth `{APP_URL}/api/oauth/whatsapp/cloud/callback` | Ops | ☐ |
| 5 | Central/env Meta secrets; **`META_HTTP_FAKE` unset**; stable `APP_KEY`; `FRONTEND_URL` matches SPA origin | Ops | ☐ |
| 6 | Marketplace purchase → pending → payment/`activate` before inbox entitlements | Ops | ☐ |
| 7 | Pest WhatsApp directory green | Eng | ☐ |
| 8 | Playwright `test:e2e:whatsapp-cloud` + Automation WA trigger case green | QA | ☐ |
| 9 | Storage entitled for media workspaces; Leads entitled for Lead Source / soft-link | Ops | ☐ |

---

## Staging smoke (human)

### MVP baseline

1. Marketplace → install **WhatsApp Cloud**  
2. Staff with `view`+`send` sees inbox when connected  
3. Admin **Connect** → OAuth → select WABA → select phone  
4. Inbound → reply inside 24h; template outside 24h  
5. Soft-link / unlink Lead; Lead detail **Inbox** filter; `wa.me` when Comm Templates entitled  
6. needs_reauth banner + notification  
7. **Disconnect** → history retained; phone id reclaimable  

### Phase 1 — Lead Source (1.1.0)

8. Enable **Auto-create leads**; save default source label; inbound from unknown number creates/links Lead  
9. Disable auto-create → no Lead write  

### Phase 2 — Automation (1.2.0 / automation 1.1.0)

10. Workflow: trigger `whatsapp.message_received` → observe run  
11. Action `send_whatsapp_template` resolves conversation; blocked if WhatsApp not entitled  

### Phase 3 — Media (1.3.0)

12. Inbound image/document → `DownloadWhatsAppMediaJob` → downloadable in inbox  
13. Outbound attach inside 24h; outside 24h media rejected  
14. Disallowed MIME / over-quota inbound does not store attachment  
15. Storage used bytes include WhatsApp attachments  

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

- Queues: `whatsapp-inbound` (webhook + media download), `whatsapp-outbound`, `automations` — `php artisan queue:failed`
- Connection `status` / `last_error` / phone `health`
- Notification types: `whatsapp.inbound`, `whatsapp.send_failed`, `whatsapp.needs_reauth`
- Storage usage / soft quota denials on media
- Meta Graph 4xx/5xx in application logs

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — merge companions after CI green; complete staging smoke (Phases 1–3) and Forge queue/Meta setup before production opt-in traffic.
