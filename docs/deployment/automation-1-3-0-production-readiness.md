# Automation 1.3.0 — Cross-module Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | **Go** — engineering residuals closed; Ops migrate + queue/scheduler + staging smoke before production traffic |
| **Scope** | Automation catalog **1.1.1 → 1.2.0 → 1.3.0** (sole event fan-out, installed-module catalog gating, cross-module triggers/templates) |
| **Companion** | [Automation production](./automation) · [v1.0.0 readiness](./automation-production-readiness) · [1.1.1 related-context](./automation-related-context-production-readiness) · [Developer guide](/developer-guide/automation) · [User guide](/user-guide/automation) |

---

## Executive summary

This MINOR closes the dual-bridge double-run risk and makes Automation usable for real workspace journeys across entitled modules:

- **Sole fan-out:** `IntegrationEventDispatcher` only (no `AutomationEventBridge`)
- Builder + activate gate on catalog **`available`** (module not installed)
- Templates declare **`required_modules`**; list + create-from-template filtered by entitlement
- Wired triggers: Contacts, Quotations, Expenses, Employees, Payments posted, Credit Notes applied, Projects, Estimates, Contracts, Purchase Orders, Leave, Documents, Knowledge Base, Assets (plus prior CRM/Help Desk/WhatsApp)
- Invoice trigger module slug corrected to **`invoices`**
- One-session Playwright human workflow; Pest cross-module coverage, template entitlement negatives, and registry↔dispatcher parity

**Go / No-Go:** **Go** for staging → production after CI on companion PRs and Ops pre-flight below.

| Gate | Result |
|------|--------|
| Dual bridge removed (sole `IntegrationEventDispatcher`) | **Pass** |
| Invoice module slug `invoices` | **Pass** |
| Cross-module triggers + dispatcher + payloads | **Pass** |
| Template `required_modules` + entitlement filter | **Pass** (Pest list + create-from-template negatives) |
| Registry↔dispatcher wired-trigger parity | **Pass** |
| Catalog migrate **1.2.0** then **1.3.0** (+ companions) | **Pass** |
| CatalogSeeder `automation` **1.3.0** + companion versions | **Pass** |
| SPA `available` / Module not installed / activate disable | **Pass** |
| Playwright one-session `test:e2e:automation` | **Pass** (local 2026-09-08) |
| Pest CrossModule + module-not-installed + template gates | **Pass** |
| Docs recipes + module-dev Automation hooks + CHANGELOG | **Pass** |
| Queues / scheduler / SSRF / activation inactive→activate | Unchanged — still required |

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_08_011600` | Automation **1.1.0 → 1.1.1** (related-context) |
| `2026_09_08_034500` | Automation **1.1.1 → 1.2.0** (platform reliability) |
| `2026_09_08_034600` | Automation **1.2.0 → 1.3.0** + companion module MINOR bumps for new Automation hooks |

Production: **migrate only**. Do **not** `db:seed` on upgrade. Fresh local/CI seed uses `CatalogSeeder` versions aligned with the 1.3.0 companion bumps.

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (both 1.2.0 and 1.3.0 bumps)
2. Confirm central catalog `automation.version` = **1.3.0**
3. Confirm queue workers include **`automations`** before `emails,default`; scheduler `automation:dispatch-schedules`
4. Deploy **SPA** (builder available gating + templates)
5. Deploy **Docs**
6. Staging smoke below

Suggested merge order: **Backend → Frontend → Docs**.

No new env vars. Optional: `AUTOMATION_WEBHOOK_SECRET`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied; catalog `automation` = **1.3.0** | Ops | ☐ |
| 2 | Workers include `automations`; scheduler runs `automation:dispatch-schedules` | Ops | ☐ |
| 3 | Creating one lead with active `lead.created` workflow produces **exactly one** run | QA | ☐ |
| 4 | Builder shows **Module not installed** for WhatsApp when WA not entitled; Save & activate disabled | QA | ☐ |
| 5 | Invoice / Payment / Contact templates hidden until those modules entitled | QA | ☐ |
| 6 | Contact created / payment posted / Help Desk SLA can activate when modules entitled | QA | ☐ |
| 7 | Pest Automation suites green in CI | Eng | ☐ |
| 8 | Playwright `npm run test:e2e:automation` green | QA | ☐ |

---

## Staging smoke (1.3.0)

1. Marketplace → entitle **Automation**
2. Empty workflow name → Save / Save & activate disabled
3. Select **WhatsApp Message Received** without WhatsApp Cloud → badge **Module not installed**; cannot activate; **Save** still allowed
4. Templates list only recipes whose required modules are installed
5. Manual workflow → Save & activate → **Run** dialog → Run → Runs page shows queued/completed
6. Use **New Lead Follow-up** template → activate → create lead with assignee → one run + task/notify
7. With Contacts entitled: activate `contact.created` recipe; create contact → run
8. With Payments entitled: activate payment-posted notify; post a payment → run
9. Schedule daily `H:i` in workspace timezone → single run in window (no duplicates)

---

## Findings remediations

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| A1 | Critical | Dual bridge | Bridge deleted; sole `IntegrationEventDispatcher` |
| A2–A5 | High/Med | Available gating, invoice slug, payments/CN catalog, template filter | Shipped |
| A6 | Medium | Thin Pest template entitlement | Pest list filter + create-from-template 422 |
| A7 | Low | Companion CatalogSeeder version lag | Aligned to 1.3.0 bump targets |
| A8 | Medium | Stale readiness smoke (Contact unwired) | This page supersedes |
| A9 | Low | Trigger↔dispatcher parity | Unit parity test |
| A10 | Info | Marketing / branching / `create_project` deferred | Accepted |
| A11 | Info | Project created + assigned dual fire | Documented in developer guide |

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; catalog version may remain **1.3.0** (display-only) |
| Schema | No new tables — bump-only migrations |
| Dual bridge | Do **not** reintroduce `AutomationEventBridge` |

---

## Accepted residual risk

| Item | Severity | Notes |
|------|----------|-------|
| Marketing / branching / generate quote-invoice-order / `create_project` action | Info | Explicitly deferred |
| Mobile visual builder | Info | Mobile remains list/run focused |
| Project created + assigned dual fire | Info | Two triggers can match one create when assignee set — intentional |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | 2026-09-08 | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** **Go** — merge after CI green; production opt-in after Ops migrate + staging smoke.
