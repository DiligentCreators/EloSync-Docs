# AI Workspace Search (ai 1.3.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-31 |
| **Status** | **Eng Ready / Go** — remediations closed on `feature/ai-workspace-search`; **operator deploy + PR merge remaining** |
| **Scope** | Cross-module Ask EloSync tool `search_workspace` (Wave A+B+C providers), resilient fan-out, citation deep links, Search workspace starter chip; catalog **ai 1.2.0 → 1.3.0**; lead create assignee eligibility fix |
| **Branch** | `feature/ai-workspace-search` (Backend / Frontend / Mobile / Docs); Website roadmap sync on same milestone |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [CHANGELOG](/changelog/) |

**PRs:** open from `feature/ai-workspace-search` (not yet merged to `main` at audit time).

---

## Executive summary

Additive AI tools depth: one read-only agent tool fans out SQL/`LIKE` search across **20 entitled + permitted** modules (Wave A+B CRM/sales/billing/purchasing/people/products plus Wave C documents, knowledge-base, activities, meetings). Existing specialized tools stay registered. Provider failures are isolated (`modules_failed`) so one module error cannot fail the whole tool. No RAG/embeddings, no schema changes beyond catalog version bump, no new permissions.

**Go / No-Go:** **Go** (engineering ready). Production cutover requires migrate-only catalog bump to **1.3.0**, SPA + Mobile deploy in the same window, and staging smoke of Search workspace.

| Gate | Result |
|------|--------|
| Platform freeze (AIGateway + AIToolRegistry only) | **Pass** |
| `search_workspace` `module(): null`; providers enforce entitlement + `*.view` | **Pass** |
| Tenant isolation (`BelongsToTenant` via domain services) | **Pass** |
| Hit payload: `id` + `uuid` + `path` for citations | **Pass** |
| Limits clamped (`limit_per_module` ≤ 10, `limit_total` ≤ 50) | **Pass** |
| Per-provider try/catch → `modules_failed` | **Pass** |
| Wave C providers (documents, knowledge-base, activities, meetings) | **Pass** |
| Catalog bump migrate-only `ai` **1.3.0** + CatalogSeeder sync | **Pass** |
| System prompt prefers workspace search; citation paths include Wave C | **Pass** |
| Web + Mobile citation maps Wave A+B+C + Search workspace starter (`ai` + `ai.use`) | **Pass** |
| Lead create does not default assignee to ineligible owner | **Pass** |
| Docs (tools, API, user, mobile, deployment, roadmap, changelog, website) | **Pass** |
| Pest `AiWorkspaceSearchTest` + auth registry | **Pass** — 18/18 workspace search + auth (2026-08-31 remediations) |
| Playwright `test:e2e:ai` serial | **Pass** — 8/8 (2026-08-31; includes Search workspace starter) |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| One `search_workspace` tool (not N new `search_*` tools) | Pass | — | — | Pass |
| Wave A+B+C providers (CRM… + Docs/KB/Activities/Meetings) | Pass | Pass (citations) | Pass | Pass |
| SQL via existing `*Service::paginate` | Pass | — | — | Pass |
| Provider isolation (try/catch; sequential fan-out) | Pass | — | — | Pass |
| Starter chip gated by `ai` + `ai.use` | — | Pass | Pass | Pass |
| Same-app citations only (`isSafeRedirectPath` / entity routes) | Prompt | Pass | Pass | Pass |
| Catalog MINOR **1.3.0** (additive) | Pass | — | — | Pass |

---

## Findings

### Closed during delivery / remediations

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| W1 | Medium | Playwright entitle path `spawnSync php ENOENT` on Windows Herd | Resolve Herd `php.exe` in `e2e/helpers/verify-tenant-email.ts` |
| W2 | Medium | Lead Copilot e2e create via UI failed assignee validation on demo (owner auto-assigned) | **Root cause fixed:** create form only defaults `assigned_to` when `isEligibleLeadAssigneeCandidate` (owners / excluded / suspended stay Unassigned) |
| W3 | Low | CatalogSeeder / `ensureAiModuleCatalog` lagged at **1.1.0** | Synced to **1.3.0** with bump migration |
| R1 | Low | Wave C not searched | **Closed** — documents, knowledge-base, activities, meetings providers + citations |
| R2 | Low | Sequential fan-out / no resilience | **Closed (resilience)** — per-provider try/catch + `modules_failed`; sequential kept (tenancy-safe; limits remain low) |

### Accepted residual (ops / out of engineering scope)

| ID | Severity | Notes |
|----|----------|-------|
| R3 | Ops | Platform AI still needs Central `ai_api_key` + FPM timeouts (unchanged from AI platform readiness) |
| R4 | Ops | Full 300+ Playwright suite not a release gate for this milestone |

---

## Remaining (operator)

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend / Frontend / Mobile / Docs (+ Website roadmap) PRs from feature branches → `main` | Eng | **Todo** |
| 2 | Deploy Backend from `main` | Ops | **Todo** |
| 3 | `php artisan migrate --force` (central) — apply `2026_08_31_200000_bump_ai_module_version_to_1_3_0` — **no** `db:seed` | Ops | **Todo** |
| 4 | Confirm catalog `ai.version` = **1.3.0** | Ops | **Todo** |
| 5 | Deploy Frontend SPA + Mobile (same window) | Ops | **Todo** |
| 6 | Staging smoke — Search workspace (below) | Ops / QA | **Todo** |
| 7 | Production cutover per [release process](./release-process) | Ops | **Todo** |

### Migrations to apply (step 3)

1. `2026_08_31_200000_bump_ai_module_version_to_1_3_0`

No new tenant schema tables. No new Spatie permissions.

---

## Done (engineering)

| Gate | Result |
|------|--------|
| Provider registry + 20 Wave A+B+C providers + resilient `AiWorkspaceSearchService` | **Pass** |
| `SearchWorkspaceTool` registered first in `AIToolRegistry` | **Pass** |
| EloSyncSystemPrompt citation paths + search preference | **Pass** |
| Frontend / Mobile citation maps + starter | **Pass** |
| Lead assignee eligibility on create | **Pass** |
| Pest workspace search + authorization (+ Wave C + failure isolation) | **Pass** — 18/18 |
| Playwright AI serial (Search workspace + settings validation + Copilot) | **Pass** — 8/8 |
| Docs + Website roadmap delivery note | **Pass** |

---

## Test evidence (reference)

```bash
# Backend
php artisan test --compact \
  tests/Feature/Tenant/Ai/AiWorkspaceSearchTest.php \
  tests/Feature/Tenant/Ai/AiAuthorizationTest.php

# Frontend unit
npx vitest run src/lib/ai-reference-href.test.ts

# Frontend e2e (Vite up; Herd PHP on PATH or E2E_PHP_BIN)
npm run test:e2e:ai -- --workers=1
# → 8 passed (2026-08-31)
```

---

## Staging smoke (human)

1. Confirm Central AI key / Test connection (platform mode) or tenant BYOK  
2. Workspace with `ai` entitled + `ai.use`  
3. Open Ask EloSync → **Search workspace** starter visible  
4. Ask: “Find Acme across my workspace” (or click starter) → assistant uses tools; citations only same-app paths  
5. Entitle only a subset of modules → hits omit non-entitled modules  
6. User without `invoices.view` → no invoice hits even if Invoices installed  
7. Entitle Documents / KB / Activities / Meetings → Search workspace can cite those paths  
8. As workspace **owner**, create a lead via UI → assignee stays Unassigned (not forced to owner)  
9. Lead Copilot Summarize still works on a lead the user can view  
10. Settings → AI → invalid preferred language → validation; save with valid values  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend / Mobile | Redeploy previous build (hides Search workspace starter; citations fall back to prior entity map) |
| Backend code | Redeploy previous release; keep bump migration (catalog version alone is harmless) |
| Catalog | Optional: `bumpVersion('ai', '1.2.0')` only if ops must match old marketing copy — not required for safety |
| Schema | No tenant tables to roll back |

---

## Monitoring

- Unchanged AI platform signals: wallet burns, HTTP **402**, `ai_usage_events`, `ai.chat_completed`  
- Watch tool-call latency / FPM timeouts when `search_workspace` fans out many entitled modules  
- `ai.workspace_search.provider_failed` warnings when a single provider throws  

---

## Verdict

**Eng Ready / Go** for merge. Operator checklist above is the only remaining production gate.
