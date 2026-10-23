# Live Chat 2.0.0 — Proactive, CSAT, Transcript, IP Ban, Visitor Notes Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-23 |
| **Status** | **Go** — migrate catalog through **2.0.0**; deploy Backend (widget JS + new tables/columns) + Frontend; ensure scheduler runs `live-chat:scan-proactive` |
| **Scope** | Free Communication module `live-chat` **1.7.0 → 1.8.0 → 1.9.0 → 2.0.0** (visitor intel, public identify, proactive rules scan, CSAT, transcript email, IP ban list, visitor notes; embed `?v=2.0.0`) |
| **Companion** | [Live Chat deployment](./live-chat) · [1.5.0 / 1.5.1 readiness](./live-chat-1-5-0-production-readiness) · [1.0.1 baseline](./live-chat-production-readiness) · [Developer](/developer-guide/live-chat) · [User](/user-guide/live-chat) · [Overview](/user-guide/live-chat-overview) · [API](/api/tenant-v1-live-chat) · [CHANGELOG](/changelog/) |

Additive **MINOR/PATCH** chain culminating in catalog **2.0.0**. No new Spatie permissions. New scheduler command **`live-chat:scan-proactive`** (every minute, onOneServer). Prior [1.0.1](./live-chat-production-readiness) and [1.5.x](./live-chat-1-5-0-production-readiness) audits remain the baseline for CORS, send soft-fail, and typing.

---

## Executive summary

**2.0.0** completes the Live Chat milestone: richer visitor intel on heartbeat, public **identify**, **proactive rules** that auto-open chats and send invite messages, post-close **CSAT**, optional **transcript email**, **IP ban** hashes, and persistent **visitor notes**. Agent-initiated invites from **1.7.0** share the same `LiveChatInvite` public channel delivery.

| Gate | Result |
|------|--------|
| Migrate **1.6.0 → 1.7.0** (`2026_10_23_125323_…`) | **Pass** |
| Migrate **1.7.0 → 1.8.0** visitor intel (`2026_10_23_125658_…`) | **Pass** |
| Migrate **1.8.0 → 1.9.0** identify columns (`2026_10_23_130000_…`) | **Pass** |
| Migrate **1.9.0 → 2.0.0** phase four (`2026_10_23_130100_…`) | **Pass** |
| Tables: proactive rules, banned IPs, visitor notes; CSAT + widget flags | **Pass** |
| Public `identify`, expanded heartbeat/session intel | **Pass** |
| `live-chat:scan-proactive` scheduled every minute | **Pass** |
| Public CSAT + widget `csat_enabled` / `email_transcript_on_close` | **Pass** |
| Ban visitor + optional `ban_ip`; IP blocks session create | **Pass** |
| Automation trigger `live_chat.proactive_invite_sent` wired | **Pass** |
| Embed snippet `widgets/live-chat.js?v=2.0.0` (`WidgetScriptVersion`) | **Pass** |
| Prior CORS / entitlement / PII / session TTL / send soft-fail gates | **Pass** (unchanged) |
| Pest `LiveChatModuleTest` (intel, identify, proactive, CSAT, IP ban, notes, transcript, reactivate) | **Pass locally** (2026-10-23; confirm CI on merge) |
| Playwright `npm run test:e2e:live-chat:headed` (one shared session, 11 tests) | **Pass locally** 11/11 (2026-10-23; confirm CI on merge) |
| Docs hubs + [2.0.0 deployment](./live-chat) + this page | **Pass** |

**Go / No-Go:** **Go** after companion CI green and:

1. `php artisan migrate --force` (catalog through **2.0.0**)
2. Backend deploy serving updated `public/widgets/live-chat.js`
3. Frontend SPA deploy (proactive rules UI, CSAT/transcript toggles, visitor notes, ban IP checkbox)
4. Confirm platform scheduler runs **`live-chat:scan-proactive`** alongside `live-chat:scan-idle` and `live-chat:purge-visitors`
5. Staging smoke below; re-copy Settings embed snippet with **`?v=2.0.0`** (or purge CDN)

Reverb remaining down does **not** block send, proactive open, or close; it degrades typing and live inbox updates (poll fallback remains). Transcript mail requires queue workers.

---

## Incident → remediation map

| Risk | Mitigation |
|------|------------|
| Proactive spam | Rule `cooldown_minutes` + per-visitor `proactive_cooldowns`; tune `min_dwell_seconds` / `path_contains` |
| CSAT on open chats | API rejects CSAT unless conversation **closed** |
| Transcript mail failure blocks close | Close path soft-fails mail (`LiveChatTranscriptMail`) |
| IP ban false positive | Ban is optional checkbox; hashes stored per tenant — unban visitor does not auto-remove IP row (manage via support/runbook) |
| Stale embed after deploy | Snippet `?v=2.0.0` + redeploy |

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| LC20-01 | Medium | **Fixed** | No automated proactive outreach | Rules + `live-chat:scan-proactive` + `LiveChatInvite` |
| LC20-02 | Medium | **Fixed** | No post-close satisfaction signal | Public CSAT endpoint + embed prompt |
| LC20-03 | Low | **Fixed** | Visitors lose context after close | Optional transcript email on close |
| LC20-04 | Medium | **Fixed** | Repeat abusers rotate visitor row | Optional `ban_ip` + `live_chat_banned_ips` |
| LC20-05 | Low | **Fixed** | No cross-thread visitor context | Visitor notes CRUD |
| LC20-06 | Low | **Fixed** | Logged-in sites anonymous in desk | Public identify + custom attributes |
| LC20-07 | High | **Fixed** | Re-entitle after cancel left widgets `is_active=false` → public 404 | `reactivateForTenant` on activate/install |
| LC20-08 | High | **Fixed** | Bulk session revoke wrote one hash for all visitors (unique constraint) | Per-visitor unique revoke hashes |
| LC20-09 | Medium | **Fixed** | Headed e2e invite dialog overlay blocked later clicks | Close invite dialog; Escape before inbox |

### Ops (not code blockers)

| ID | Severity | Status | Finding | Owner |
|----|----------|--------|---------|-------|
| O1 | Medium | Open | Scheduler must run proactive + idle scans every minute | Ops |
| O2 | Medium | Open | Queue workers for transcript mail when toggle enabled | Ops |
| O3 | Low | Open | Customer embeds: refresh snippet to `?v=2.0.0` after deploy | CS |
| O4 | Low | Open | Monitor proactive scan volume + mail failures | Ops |

### Explicitly deferred (unchanged)

- Captcha / Turnstile beyond throttle + session TTL  
- Bots / FAQ flows; invoice/record share in chat  
- Multi-widget / multi-domain brands  
- Full mobile agent desk parity  

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/LiveChat` | **Pass locally** | Incl. reactivate-on-activate, unique revoke, intel/identify/proactive/CSAT/IP ban/notes/transcript |
| `npm run test:e2e:live-chat:headed` | **Pass locally 11/11** | One shared demo login: gate → entitle → invite dialog validation → filters → widget validation/save → regen key → visitor reply → notes/typing/canned → claim/close → lead create validation/link → search |

Do **not** claim remote CI green until companion PRs’ Quality Gates pass on the merge branch. Local headed + Pest evidence above is verified 2026-10-23.

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs)  
2. **Backend** — `php artisan migrate --force` through `2026_10_23_130100_live_chat_phase_four_and_bump_to_2_0_0`; confirm catalog `live-chat` = **2.0.0** and `public/widgets/live-chat.js` matches **2.0.0**; `php artisan reverb:restart` if Reverb is used; Horizon/workers up for mail  
3. **Frontend** — SPA with proactive rules, CSAT/transcript settings, visitor notes, ban IP  
4. **Docs** — this page live  
5. Staging smoke below before production marketing embeds  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrate through `2026_10_23_130100_…`; catalog `live-chat` = **2.0.0** | Ops | ☐ |
| 2 | API serves `GET {APP_URL}/widgets/live-chat.js`; Settings snippet uses `?v=2.0.0` | Ops | ☐ |
| 3 | Scheduler: `live-chat:scan-proactive`, `live-chat:scan-idle`, `live-chat:purge-visitors` | Ops | ☐ |
| 4 | Reverb up **or** accepted degraded typing/live inbox | Ops | ☐ |
| 5 | Queue workers running when transcript toggle used | Ops | ☐ |
| 6 | Pest Live Chat suite green on CI | Eng | ☐ |
| 7 | Playwright `test:e2e:live-chat` green on CI | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace: workspace with Live Chat **2.0.0** entitled; widget Active  
2. **Intel:** foreign Origin embed → heartbeat across two paths → Live visitors / visitor panel show page trail, device, UTM when present  
3. **Identify:** `POST …/identify` with `user_id` + attributes → panel shows external id + attributes  
4. **Proactive:** Settings rule (path + dwell 0) → live visitor on matching URL → within ~1 min invite message + open chat (badge/auto-open on embed)  
5. **Agent invite:** Live visitors **Chat** with body → same invite delivery as 1.7.0  
6. **CSAT:** close thread → embed shows 1–5 survey → submit succeeds  
7. **Transcript:** enable email transcript + visitor email → close → mail queued (check worker)  
8. **Ban IP:** ban with **Also ban this IP** → new session from same IP **403**  
9. **Visitor notes:** add note on visitor → persists on reopen  
10. Confirm Settings embed snippet contains `live-chat.js?v=2.0.0`

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive catalog/schema migrations |
| Proactive | Deactivate rules or disable scheduler line temporarily (stops auto-invites) |
| Module | Marketplace cancel / deactivate widgets (existing path) |
| Schema | No schema rollback — additive migrations only |

---

## Monitoring

- `live-chat:scan-proactive` success / duration (scheduler logs)  
- Proactive invite volume vs rule count  
- Public CSAT **422/403** rate vs successful submissions  
- `LiveChatTranscriptMail` queue failures  
- Banned IP **403** on `POST …/sessions`  
- Existing: send soft-fail logs, throttle denials, Reverb health  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — ship companions after CI green; migrate to catalog **2.0.0**, enable proactive scan, and redeploy embed **v=2.0.0** before relying on production marketing sites.
