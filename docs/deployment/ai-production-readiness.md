# AI Assistant — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-21 |
| **Status** | **Go** — remediations merged; staging smoke + Central key + scheduler still required before Marketplace traffic |
| **Scope** | Billable Marketplace module `ai` catalog **1.1.0** + packs `ai-credits-1k` / `5k` / `20k` |
| **Branch** | `feature/ai-tools-depth-ask-elosync` |
| **Companion** | [AI deployment](./ai) · [Architecture](/architecture/ai-platform) · [Credits](/developer-guide/ai-credits) · [Tools](/developer-guide/ai-tools) · [API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) |

**PRs (open):** Backend / Frontend / Docs on `feature/ai-tools-depth-ask-elosync`

---

## Executive summary

EloSync AI is a **billable** Marketplace SKU (`$29/mo`, `$290/yr`), **not** default-included. Phase 1 ships Gateway orchestration over `laravel/ai`, dual-balance credit wallet, BYOK + Central keys, Ask EloSync panel, Lead Copilot, and write confirmation for `create_task`.

Catalog **1.1.0** adds Projects / Opportunities / Invoices **read** tools, Ask EloSync starter chips, numeric deep-link ids, and citation URL allowlisting (`isSafeRedirectPath`).

**Go / No-Go:** **Go**. Credit-integrity hardenings (wallet row lock, pre-provider credit ceiling, request-path `ensurePeriod`), `ai.manage` enforcement on Settings AI, and dedicated `throttle:ai` remain in place. Complete staging smoke and Central AI key + scheduler setup before production Marketplace opt-in.

| Gate | Result |
|------|--------|
| Catalog billable `ai` / $29 / $290 / not default-included | **Pass** (version **1.1.0**) |
| Packs depend on `ai`; grant on activate | **Pass** |
| Migrate-only register + permissions (`2026_08_21_010000`–`010300`) | **Pass** |
| Gateway sole orchestration; `module:ai` + `can:ai.*` | **Pass** |
| Encrypted / masked `ai_api_key` (Central + tenant) | **Pass** |
| Tenant isolation (`BelongsToTenant` + conversation ownership) | **Pass** |
| Write confirmation (`ai.confirm` + pending actions) | **Pass** |
| Dual wallet burn order (included → prepaid) + HTTP 402 | **Pass** |
| Wallet row lock + pre-provider credit reserve | **Pass** — `lockForUpdate` + ceiling gate |
| Lazy `ensurePeriod()` on request path | **Pass** — chat, copilot, credits summary |
| `ai.manage` enforced on Settings AI | **Pass** — API + UI |
| AI-specific rate limits | **Pass** — `throttle:ai` (30/min) |
| Pest AI suite | **Pass** — Feature + Unit coverage including remediations |
| Playwright `test:e2e:ai` | **Pass** — 6/6 serial (2026-08-21 local) |
| Deploy / upgrade docs | **Pass** — this page + [Upgrade](./upgrade#ai-assistant-platform-100) |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs |
|----------|---------|----------|------|
| Packaging billable `ai` + credit packs | Pass | Pass | Pass |
| Platform credits vs BYOK (BYOK does not burn EloSync credits) | Pass | Pass | Pass |
| Dual wallet; burn included first | Pass | Pass (badge) | Pass |
| Write tools require confirmation | Pass | Pass | Pass |
| Phase-1 tools: Leads + Tasks (+ `create_task`) | Pass | Pass | Pass |
| 1.1.0 read tools: Projects + Opportunities + Invoices | Pass | Pass (starters) | Pass |
| Citation hrefs same-app only (`isSafeRedirectPath`) | Pass | Pass | Pass |
| UUID conversation / message IDs | Pass | Pass (string IDs) | Pass |
| No chatbot bolt-on / parallel auth | Pass | Pass | Pass |

---

## Findings

### Closed must-fix (Conditional Go → Go)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F1 | **High** | Pre-call gate only checked `available < 1`; burn after LLM | Pre-provider **credit ceiling** from prompt estimate + `ai_max_output_tokens` + tool buffer; agent `maxTokens()` capped; burn still uses actual tokens |
| F2 | **High** | `burn()` lacked row lock | `lockForUpdate()` on wallet (and purchase ledger check) inside grant/burn/rollover transactions |
| F3 | **High** | `ensurePeriod()` never called | Wired on chat, Lead Copilot, and `GET /ai/credits` |
| F4 | **Medium** | `ai.manage` unused | Settings AI update/test require `ai.manage`; UI tab gated by module + `ai.manage` |

### 1.1.0 tools depth (this delivery)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| R5 | **High** | Ask EloSync citations trusted model `url` (open redirect / phishing) | **Closed** — `resolveAiReferenceHref` uses `isSafeRedirectPath`; unsafe urls fall back to numeric entity paths; no external AI anchors |
| L1 | Low | No positive `availableFor` entitlement tests for new tools | **Closed** — positive + module-absent registry Pest cases |
| L2 | Low | Project tool happy paths skip installing `projects` in Pest | **Closed** — `installOptionalCrmModules(..., ['projects'])` on project tool tests |
| L3 | Low | Starter chips gate on module only, not `*.view` | **Closed** — starters require module + view permission; citations suppress unentitled modules |

### Open / ops (ops checklist — not code blockers)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| O1 | — | ~~No dedicated throttle~~ → **Closed** (`throttle:ai`) | Eng |
| O2 | Medium | Central `ai_api_key` must be set before platform mode works; seed leaves key null | Ops |
| O3 | Medium | Sync chat on request worker — long LLM calls need adequate PHP/FPM timeouts | Ops |
| O4 | Medium | Companion CI Quality Gates must pass on PRs | Eng |
| O5 | Low | Architecture doc previously said `ai_credit_ledgers` (actual table `ai_credit_ledger`) | Docs (fixed) |

### Remediated during delivery / e2e

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| R1 | High | Gateway `Gate::authorize` without Auth context failed Pest | Authorize via `$user->can` / `Gate::forUser` |
| R2 | Medium | Frontend typed conversation IDs as `number` | UUID `string` types + panel state |
| R3 | Medium | Playwright `tab name: 'AI'` matched **Mail** | Exact tab name matching |
| R4 | Medium | Billable module stayed pending after Marketplace purchase | E2E `entitleAiModule` activate path |

---

## Deploy order

1. **Backend** — migrate through `2026_08_21_150423` (catalog **1.1.0**); confirm scheduler runs `ai:rollover-monthly-credits`  
2. **Central Settings → AI** — enable platform AI; set encrypted `ai_api_key` + models  
3. **Frontend** — SPA with Ask EloSync starters, safe citations, Settings AI (`ai.manage`), Lead Copilot, Central usage  
4. **Docs** — including this readiness page  
5. Staging smoke before production Marketplace opt-in  

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations `2026_08_21_010000`–`010300` **and** `150423` (ai **1.1.0**) applied (no production `db:seed`) | Ops | ☐ |
| 2 | Catalog rows `ai`, `ai-credits-1k`, `ai-credits-5k`, `ai-credits-20k` published; `ai` billable **1.1.0** | Ops | ☐ |
| 3 | Permissions `ai.use`, `ai.manage`, `ai.confirm` granted to default admin/manager maps | Ops | ☐ |
| 4 | Scheduler includes **`ai:rollover-monthly-credits`** (daily, `withoutOverlapping`, `onOneServer`) | Ops | ☐ |
| 5 | Central AI: `ai_enabled`, `ai_allow_platform` / `ai_allow_byok`, provider + **`ai_api_key`**, models, credits knobs | Ops | ☐ |
| 6 | Stable **`APP_KEY`** (decrypts stored API keys) | Ops | ☐ |
| 7 | FPM/proxy timeouts tolerate sync LLM calls | Ops | ☐ |
| 8 | Marketplace purchase → pending → payment/`activate` before entitlements | Ops | ☐ |
| 9 | Pest AI suite green in CI | Eng | ☐ |
| 10 | Playwright `npm run test:e2e:ai` green | QA | ☐ |
| 11 | F1–F4 remediations shipped in **1.0.1**; read-tool depth + Ask EloSync starters in **1.1.0** | Eng | ☑ |

---

## Staging smoke (human)

1. Central → Settings → AI → set key → **Test AI connection**  
2. Marketplace → install **AI** → activate (payment path or local activate)  
3. Confirm credit badge / wallet after activation (prorated included if mid-month)  
4. Settings → AI (`ai.manage`) → validation → save platform mode  
5. Ask EloSync → starter chips (entitled modules) → send / graceful provider error  
6. Ask overdue projects / pipeline summary / overdue invoices (when modules entitled)  
7. Confirm citation chips never navigate off-app (unsafe model urls ignored)  
8. Exhaust / zero wallet → expect **402** / clear UI error on platform mode  
9. Lead detail → AI Copilot → Summarize / Next action / Draft (preview only)  
10. Prompt a write (`create_task`) → pending action → confirm with `ai.confirm` / cancel  
11. Optional: buy credit pack → prepaid balance increases; ledger idempotent on replay  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (hides Ask EloSync / AI settings when module absent) |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace cancel / deactivate `ai` (packs require `ai`) |
| Schema | Do **not** roll back AI migrations without a data plan |

---

## Monitoring

- Central **AI usage** page + `ai_usage_events`  
- Platform audit events: `ai.chat_completed`, `ai.lead_copilot`  
- HTTP **402** rate (credit exhaustion)  
- Scheduler heartbeat for `ai:rollover-monthly-credits`  
- Provider/API errors in application logs (Nightwatch follows default exception capture)  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — merge companions after CI green. Complete staging smoke and Central AI key + scheduler setup before production Marketplace traffic.
