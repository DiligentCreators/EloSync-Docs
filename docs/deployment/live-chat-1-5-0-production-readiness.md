# Live Chat 1.5.0 / 1.5.1 — Send Resilience + Typing Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-25 |
| **Status** | **Go** — migrate catalog through **1.5.1**; deploy Backend (widget JS + soft-fail hardening) + Frontend; Reverb preferred for typing/desk live updates |
| **Scope** | Free Communication module `live-chat` **1.4.2 → 1.5.0 → 1.5.1** (send soft-fail; typing; embed Retry; desk `/` canned filter; open/close soft-fail; embed send lock + hydrate-before-retry; snippet `?v=` cache-bust; structured side-effect logs) |
| **Companion** | [Live Chat deployment](./live-chat) · [1.0.1 readiness](./live-chat-production-readiness) · [Developer](/developer-guide/live-chat) · [User](/user-guide/live-chat) · [Overview](/user-guide/live-chat-overview) · [API](/api/tenant-v1-live-chat) · [CHANGELOG](/changelog/) |

Additive **MINOR** (**1.5.0**) plus **PATCH** remediations (**1.5.1**) on the existing Live Chat module. No new permissions, queues, scheduler entries, or env vars. Prior [1.0.1 production readiness](./live-chat-production-readiness) remains the baseline security/CORS/session audit; this page covers **1.5.0 / 1.5.1**.

---

## Executive summary

Production embeds (e.g. third-party marketing sites) and the agent desk could both fail message send with HTTP **500** when `ShouldBroadcastNow` / notify / automation threw after persist (commonly a down or misconfigured Reverb). **1.5.0** soft-fails those side effects after the message row commits, so visitors and agents can always send. Typing is fan-out via public + tenant `POST …/typing` → `LiveChatTyping` (private inbox/conversation + public visitor channel). The embed replaces browser `alert()` with an in-panel error + **Retry**. The desk filters canned replies when the composer starts with `/`.

**1.5.1** closes remaining audit gaps: soft-fail `LiveChatConversationOpened` / `Closed` and webhook/automation `forward()`; structured `Log::warning` for side-effect failures; embed send lock + hydrate-before-retry (avoids duplicate posts when Retry follows a soft-failed persist); embed snippet `?v=` cache-bust aligned to catalog PATCH.

| Gate | Result |
|------|--------|
| Catalog migrate-only **1.4.2 → 1.5.0** (`2026_09_25_142200_…`) | **Pass** |
| Catalog migrate-only **1.5.0 → 1.5.1** (`2026_09_25_200000_…`) | **Pass** |
| No schema / permission / env changes | **Pass** |
| Visitor + agent send soft-fail notify / broadcast / automation after persist | **Pass** |
| Conversation open / close lifecycle soft-fail | **Pass** |
| Conversation-updated + presence broadcasts soft-fail | **Pass** |
| Integration webhook/automation `forward()` soft-fail | **Pass** |
| Public `POST …/typing` (Bearer session) + tenant `POST …/typing` (`live-chat.reply`) | **Pass** |
| `LiveChatTyping` on private + public visitor channels | **Pass** |
| Embed: in-panel error + Retry; send lock; hydrate-before-retry; visitor typing; agent-is-typing | **Pass** |
| Embed snippet includes `widgets/live-chat.js?v=1.5.1` | **Pass** |
| Desk: typing API fan-out + `/` canned filter | **Pass** |
| Prior CORS / entitlement / PII / session TTL / IDOR gates (1.0.1+) | **Pass** (unchanged) |
| Pest `LiveChatModuleTest` incl. broadcast-outage send, open/close soft-fail, typing, embed snippet | **Pass** (28, verified 2026-09-25) |
| Playwright `test:e2e:live-chat` (10, shared demo session) | **Pass** (verified 2026-09-25 on 1.5.0 baseline) |
| Docs hubs + roadmap **1.5.1** + this page | **Pass** |

**Go / No-Go:** **Go** after companion CI green and:

1. `php artisan migrate --force` (catalog through **1.5.1**)
2. Backend deploy that serves updated `public/widgets/live-chat.js`
3. Frontend SPA deploy
4. Staging smoke below (third-party Origin embed + desk send); re-copy Settings embed snippet if sites still load unversioned script without CDN purge

Reverb remaining down does **not** block send or conversation open/close; it only degrades typing indicators and live inbox updates (poll fallback remains).

---

## Incident → remediation map

| Symptom (pre-1.5.0) | Root cause | Fix |
|---------------------|------------|-----|
| Website widget `POST …/messages` → 500; `alert("Server Error")` | Sync broadcast / notify / automation after persist | Soft-fail + `report()` / structured log; embed in-panel Retry |
| Agent desk send → toast / fail | Same `broadcastMessageSent` path | Soft-fail on agent send |
| Typing only agent↔agent (whisper) | Visitors not on private Echo channels | HTTP typing + `LiveChatTyping` on public visitor channel |
| Open/close could 500 on automation fan-out | Unwrapped `event(Opened/Closed)` | Soft-fail in **1.5.1** |
| Stale embed script after deploy | Long-lived CDN / browser cache | Snippet `?v=` + redeploy (**1.5.1** / O2) |

---

## Findings (1.5.0 audit → 1.5.1 remediations)

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| LC15-01 | Critical | **Fixed** | Reverb/`ShouldBroadcastNow` outage 500’d visitor + agent send | Soft-fail side effects after message persist |
| LC15-02 | High | **Fixed** | Embed used `alert()` for API errors | In-panel banner + Retry |
| LC15-03 | Medium | **Fixed** | No visitor↔agent typing surface | Public/tenant typing routes + `LiveChatTypingBroadcast` |
| LC15-04 | Medium | **Fixed** | Desk canned chips only (no `/` filter) | Composer `/` filters shortcuts/titles |
| LC15-05 | Low | **Fixed** | E2E tinker preferred Herd PHP 8.4 on Windows | `verify-tenant-email.ts` prefers `php85` |
| LC15-06 | Low | **Fixed (1.5.1)** | Soft-fail can leave message saved if client retries | Embed send lock + hydrate-before-retry skips re-POST when visitor body already painted |
| LC15-07 | Medium | **Fixed (1.5.1)** | Conversation open/close automation could 500 the HTTP path | Soft-fail `LiveChatConversationOpened` / `Closed` |
| LC15-08 | Medium | **Fixed (1.5.1)** | Webhook/automation `forward()` unwrapped | try/catch + structured log in `IntegrationEventDispatcher` |

### Ops (not code blockers)

| ID | Severity | Status | Finding | Owner |
|----|----------|--------|---------|-------|
| O1 | Medium | Open | Keep Reverb daemon healthy for typing + live desk (send works without it) | Ops |
| O2 | Medium | **Mitigated (1.5.1)** | Redeploy API static `widgets/live-chat.js` (CDN purge if fronted); new snippets use `?v=1.5.1` | Ops / Eng |
| O3 | Low | Open | Customer site embeds: refresh snippet from Settings after **1.5.1** (or purge CDN for unversioned URLs) | Customer / CS |
| O4 | Low | **Mitigated (1.5.1)** | Monitor `live-chat.side-effect-failed` / `integrations.forward-failed` + `report()` volume | Ops / Eng |

### Explicitly deferred (unchanged)

- Captcha / Turnstile beyond throttle + session TTL  
- Bots / FAQ flows; invoice/record share in chat  
- Multi-widget / multi-domain brands  
- Mobile agent shell  

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `herd php vendor/bin/pest tests/Feature/Tenant/LiveChat/LiveChatModuleTest.php --compact` | **28 passed** (verified 2026-09-25) | Soft-fail send; open/close soft-fail; typing; embed `?v=` snippet |
| `npm run test:e2e:live-chat` (shared demo session, `E2E_SKIP_WEBSERVER=1`) | **10 passed** | Gate → entitle → validation → visitor send → reply → note hidden from public → typing → claim/close → lead → search |

Do **not** claim CI green until companion PRs’ Quality Gates pass on the merge branch.

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs)  
2. **Backend** — `php artisan migrate --force` through `2026_09_25_200000_bump_live_chat_module_version_to_1_5_1`; confirm `public/widgets/live-chat.js` is the 1.5.1 artifact; `php artisan reverb:restart` if Reverb is used  
3. **Frontend** — SPA with typing API + `/` canned filter  
4. **Docs** — this page live  
5. Staging smoke below before pointing production marketing embeds at the new API build  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrate through `2026_09_25_200000_…`; catalog `live-chat` = **1.5.1** | Ops | ☐ |
| 2 | API serves updated `GET {APP_URL}/widgets/live-chat.js` (and Settings snippet uses `?v=1.5.1`) | Ops | ☐ |
| 3 | Reverb daemon up **or** accepted degraded typing (send still works) | Ops | ☐ |
| 4 | Scheduler still runs `live-chat:purge-visitors --days=90` | Ops | ☐ |
| 5 | Pest Live Chat suite green on CI | Eng | ☐ |
| 6 | Playwright `test:e2e:live-chat` green on CI | QA | ☐ |
| 7 | Staging third-party Origin: visitor send + agent reply without 500 | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace: workspace with Live Chat **1.5.1** entitled; widget Active  
2. From a **foreign Origin** (or Diligent Creators staging): open widget → send message → expect **201**, no `"Server Error"` alert; Retry banner only on real failures; double-click send does not duplicate  
3. Stop Reverb briefly (staging only) → send still succeeds; typing may stall; restore Reverb  
4. Agent desk: reply appears; empty compose disabled; internal **Note** visible in desk, absent from public poll  
5. Type in visitor composer → agent sees typing; type in desk → visitor sees “is typing…” when realtime connected  
6. Desk composer `/` → canned filter chips; insert body  
7. Claim / close / reopen; search by visitor name  
8. Optional: require prechat → session without name/email → **422**  
9. Confirm Settings embed snippet contains `live-chat.js?v=1.5.1`

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive catalog migrations |
| Module | Marketplace cancel / deactivate widgets (existing path) |
| Schema | No schema rollback — catalog bump only |

---

## Monitoring

- Public + tenant `POST …/messages` **5xx** rate (should drop vs pre-1.5.0)  
- Structured logs: `live-chat.side-effect-failed`, `integrations.forward-failed`  
- `report()` / Nightwatch events mentioning `LiveChatMessageSentBroadcast` / Reverb connection errors  
- Throttle denials on `live-chat-widget` / `live-chat-widget-session`  
- Typing endpoint 401/403/404 vs volume  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — ship companions after CI green; migrate to catalog **1.5.1** and redeploy API widget script before relying on production embeds (diligentcreators.com and peers).
