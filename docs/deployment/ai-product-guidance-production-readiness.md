# AI product guidance (ai 1.20.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-03 |
| **Re-verified** | 2026-10-03 — Pest product-help + scope-guard + catalog always-on + version bump; Frontend Vitest citation paths; Docs linked |
| **Status** | **Go for production** |
| **Scope** | Ask EloSync product how-tos via always-on `search_product_help` + curated Settings → Action recipes; catalog **ai 1.19.0 → 1.20.0** |
| **Companion** | [AI deployment](./ai) · [AI tools](/developer-guide/ai-tools) · [User guide](/user-guide/ai-assistant) · [CHANGELOG](/changelog/) · [Roadmap](/getting-started/product-roadmap) |

---

## Executive summary

Ask EloSync answers “how do I…?” / “where do I…?” with grounded navigation paths (for example **Settings → General → Timezone → Save** or **Leads → New → Create**). Recipes live in `app/AI/ProductHelp/`, are filtered by entitled modules, and soft-flag missing permissions. No Docs RAG in this slice. Off-topic patterns are evaluated before workspace indicators so “how to use Canva” still refuses.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.20.0**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — no AppLayout / auth / settings-store redesign |
| Always-on tool + registry | **Pass** — `search_product_help` in `AIToolRegistry` + `config/ai-tools.php` + `AiToolCatalog` fallback |
| System prompt / scope guard | **Pass** — product how-tos allowed; external creative/tool how-tos refused |
| Entitlement + permission soft-flags | **Pass** — Pest module filter + `user_can_perform` |
| Frontend starters + citations | **Pass** — timezone / create-lead starters; `/settings` `/roles` `/marketplace` hrefs |
| Docs same-PR | **Pass** — user guide, tools, architecture, API, deployment, changelog, roadmap, sidebar |
| Catalog migrate-only **1.20.0** + CatalogSeeder | **Pass** |
| Pest | **Pass** — `AiProductHelpTest`, `AiWorkspaceScopeGuardTest`, `AiModuleVersion1200BumpTest`, catalog always-on |

## Audit findings (remediated)

| Finding | Severity | Remediation |
|---------|----------|-------------|
| `AiToolCatalog::alwaysOnNames()` fallback omitted `search_product_help` | Medium | Fallback list aligned with config |
| Product roadmap still listed AI at Company triage **1.19.0** only | Low | Roadmap updated for product guidance **1.20.0** |
| Thin readiness checklist | Low | Expanded gates + smoke steps (this page) |
| Frontend/Docs WIP risk when switching branches | Process | Feature branch committed before other WIP |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.20.0** (do **not** `db:seed`).
2. Ask EloSync: “How do I change timezone?” → expect **Settings → General → Timezone → Save** (+ `/settings` citation).
3. Ask EloSync: “How do I create a lead?” (Leads installed) → expect **Leads → New → …**.
4. Starter chips: **Set timezone** visible with AI + `ai.use`; **Create a lead** when Leads + `leads.create`.
5. Off-topic: “make a logo” / “how to use Canva” still refused.
6. Unentitled module how-to (e.g. expenses without module) does not invent that module’s create path as a hit.
