# Live Chat 2.1.0 — Pre-chat Phone + Department, Richer Intake Notify Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-24 |
| **Status** | **Go** — migrate catalog through **2.1.0**; deploy Backend (widget JS + `phone` column) + Frontend; refresh embeds to `?v=2.1.0` |
| **Scope** | Free Communication module `live-chat` **2.0.0 → 2.1.0** (required pre-chat name/email/phone + department picker; visitor `phone`; richer intake notifications; tenant-scoped default department validation; inbox search by phone; embed `?v=2.1.0`) |
| **Companion** | [Live Chat deployment](./live-chat) · [2.0.0 readiness](./live-chat-2-0-0-production-readiness) · [1.5.0 / 1.5.1 readiness](./live-chat-1-5-0-production-readiness) · [1.0.1 baseline](./live-chat-production-readiness) · [Developer](/developer-guide/live-chat) · [User](/user-guide/live-chat) · [Overview](/user-guide/live-chat-overview) · [API](/api/tenant-v1-live-chat) · [CHANGELOG](/changelog/) |

Additive **MINOR** bump on top of [2.0.0](./live-chat-2-0-0-production-readiness). No new Spatie permissions. Scheduler commands unchanged.

---

## Executive summary

**2.1.0** makes inbound visitor contact data reliable for agents: the public widget always collects **name, email, phone**, and **department** (when departments exist) before Start chat or Leave a message. Intake notifications carry visitor identity + department for in-app, FCM wake, and optional email. Desk visitor panel shows phone; conversation list search matches phone.

| Gate | Result |
|------|--------|
| Migrate **2.0.0 → 2.1.0** (`2026_10_24_190027_…`) | **Pass** |
| Column `live_chat_visitors.phone` (nullable, 40) | **Pass** |
| Public open / offline leave-a-message require identity + department when active departments exist | **Pass** |
| Bootstrap exposes `departments` + `default_department_id` | **Pass** |
| Widget default `default_department_id` exists scoped to tenant | **Pass** |
| Notification meta: `visitor_name` / `visitor_email` / `visitor_phone` / `department_name` | **Pass** |
| Conversation eager load includes visitor `phone` (desk API) | **Pass** (audit LC21-01) |
| Notification roster falls back to widget `default_department_id` | **Pass** |
| Embed snippet `widgets/live-chat.js?v=2.1.0` | **Pass** |
| Prior 2.0.0 / 1.5.x / 1.0.1 gates | **Pass** (unchanged) |
| Pest `LiveChatModuleTest` (identity + department + notify meta + show phone) | **Pass locally** (2026-10-24; confirm CI on merge) |
| Playwright `npm run test:e2e:live-chat:headed` (one shared session, 11 tests) | **Pass locally** 11/11 (2026-10-24; confirm CI on merge) |
| Docs hubs + this page | **Pass** |

**Go / No-Go:** **Go** after companion CI green and:

1. `php artisan migrate --force` (catalog through **2.1.0**)
2. Backend deploy serving updated `public/widgets/live-chat.js`
3. Frontend SPA deploy (visitor phone panel; settings copy + stale department clear)
4. Re-copy Settings embed snippet with **`?v=2.1.0`** (marketing site embed too); purge CDN for unversioned URLs
5. Ensure each widget has a **default department** and department roster agents with `live-chat.reply`
6. Staging smoke below

Queue workers still required for optional agent email notify and transcript mail. Reverb remaining down does not block send.

---

## Incident → remediation map

| Risk | Mitigation |
|------|------------|
| Stale default department id fails Settings save | Tenant-scoped `exists` rule + SPA clears invalid select value |
| Away / out of hours with offline leave disabled | Public offline path returns clear unavailable; enable offline leave or widen business hours |
| No intake notify | Conversation `department_id` (or widget default) + agents on roster with `live-chat.reply`; `emails` queue for optional mail |
| Desk shows Phone — despite DB value | Eager select must include `phone` (LC21-01) |
| Stale embed after deploy | Snippet `?v=2.1.0` + redeploy widget JS |

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| LC21-01 | **High** | **Fixed** | Conversation `with(visitor:…)` column list omitted `phone` → tenant API returned `visitor.phone: null` while DB had a value; agent desk showed **Phone —** | Added `phone` to `LiveChatConversationService::Eager`; Pest asserts show JSON path |
| LC21-02 | Medium | **Fixed** | Widget Settings rejected foreign/stale `default_department_id` | `Rule::exists(…)->where(tenant_id)`; SPA resets invalid select |
| LC21-03 | Medium | **Fixed** | Pre-chat lacked phone + department; agents saw anonymous first messages | Public identity validation + embed fields; offline path applies identity + department |
| LC21-04 | Medium | **Fixed** | Intake notify lacked name/email/phone/department | `LiveChatInboundMessageNotification` visitor meta + FCM/database payload keys |
| LC21-05 | Low | **Fixed** | Notify roster empty when conversation `department_id` null | Fallback to widget `default_department_id` |
| LC21-06 | Low | **Fixed** | Inbox search ignored phone | Search `orWhere` visitor phone |
| LC21-07 | Medium | **Fixed** (2026-10-25 retest) | Headed e2e hit another Vite via Windows `localhost`→`::1` (ESAPetCare on `[::1]:5173`) instead of EloSync on `127.0.0.1:5173` | Playwright baseURL normalizes `localhost`→`127.0.0.1`; `.env.e2e.example` + Docs Playwright guide |

### Ops (not code blockers)

| ID | Severity | Status | Finding | Owner |
|----|----------|--------|---------|-------|
| O1 | Medium | Open | Queue workers for optional `email_notify_agents` / transcript | Ops |
| O2 | Medium | Open | Every entitled widget should set default department + roster | CS / tenant admin |
| O3 | Low | Open | Customer + marketing embeds: refresh to `?v=2.1.0` | CS / Website |
| O4 | Low | Open | Confirm CI Quality Gates on companion PRs after merge | Eng |

### Explicitly deferred (unchanged)

- Captcha / Turnstile beyond throttle + session TTL  
- Bots / FAQ flows; invoice/record share in chat  
- Multi-widget / multi-domain brands  
- Full mobile agent desk parity  

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php vendor/bin/pest tests/Feature/Tenant/LiveChat/LiveChatModuleTest.php --filter="requires visitor identity"` | **Pass locally** | Includes tenant show `data.visitor.phone` |
| Live Chat Pest batches (prior session) | **Pass locally 43/43** | Identity, offline, notify meta, widget validation |
| `npm run test:e2e:live-chat:headed` | **Pass locally 11/11** | One shared demo login: gate → entitle → invite → filters → settings validation/save → regen key → visitor phone in panel + agent reply → notes/typing/canned → claim/close → lead → search |
| Retest `npm run test:e2e:live-chat:headed` (2026-10-25) | **Pass locally 11/11** | After LC21-07 baseURL fix; Vite on `127.0.0.1:5173` |

Local headed evidence verified **2026-10-24** (ship) and **2026-10-25** (regression retest). Companion CI for the localhost harness fix is on the follow-up Frontend/Docs PRs.

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs / Mobile types / Website embed bump)  
2. **Backend** — `php artisan migrate --force` through `2026_10_24_190027_expand_live_chat_visitor_phone_prechat_and_bump_to_2_1_0`; confirm catalog `live-chat` = **2.1.0** and `public/widgets/live-chat.js` matches **2.1.0**  
3. **Frontend** — SPA with visitor phone + settings remediations  
4. **Docs** — this page live  
5. **Website** (optional same window) — marketing embed `?v=2.1.0`  
6. Staging smoke below before production marketing embeds  

Suggested merge order: **Backend → Frontend → Mobile → Docs → Website**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrate through `2026_10_24_190027_…`; catalog `live-chat` = **2.1.0** | Ops | ☐ |
| 2 | API serves `GET {APP_URL}/widgets/live-chat.js`; Settings snippet uses `?v=2.1.0` | Ops | ☐ |
| 3 | SPA shows visitor phone; Settings clears stale default department | Ops | ☐ |
| 4 | Widget has default department; agents with `live-chat.reply` on roster | Tenant admin | ☐ |
| 5 | Staging: pre-chat validation → open chat → agent bell/FCM with name/email/phone | QA | ☐ |
| 6 | Staging: out-of-hours + offline leave off returns clear error; leave-a-message works when on | QA | ☐ |
| 7 | Queue / Horizon healthy when email notify or transcript enabled | Ops | ☐ |

---

## Staging smoke

1. Entitled workspace → Settings → Live Chat: set default department; copy embed `?v=2.1.0`  
2. Public site: omit phone → Start blocked; fill name/email/phone/department → chat opens  
3. Agent desk: conversation visitor panel shows phone; search by phone finds thread  
4. First visitor message → agent notification includes visitor name/email/phone (+ department when set)  
5. Toggle offline leave off while outside business hours → leave-a-message unavailable with clear copy; enable leave → offline path stores phone + department  

---

## Rollback

1. Redeploy previous Backend release (widget JS + code)  
2. Do **not** drop `phone` in production unless coordinated; catalog bump rollback via migration `down` only in non-prod  
3. Frontend/Website can stay forward-compatible (optional phone display)  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | — | 2026-10-24 | **Go** (local Pest + headed e2e; CI pending merge) |
| Ops | — | — | ☐ after migrate + embed refresh |
