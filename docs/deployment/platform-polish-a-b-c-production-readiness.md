# Platform Polish (Lanes A, B, C) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-23 |
| **Status** | **No-Go** — Backend + Docs PRs still **draft**; Frontend merged to `main` ahead of API; TypeScript + e2e fixes pending commit |
| **Scope** | Cross-module polish wave (billing PDF/email, attachments, dashboard UX, demo seed, AI tools, docs sync) |
| **Companion** | [Upgrade guide](./upgrade#platform-polish-lanes-a-b-c) · [Module development](./module-development) · [Release process](./release-process) |

**PRs:** Backend [#148](https://github.com/DiligentCreators/SaaS-Backend/pull/148) (draft) · Frontend [#143](https://github.com/DiligentCreators/SaaS-Frontend/pull/143) (**merged**) · Docs [#170](https://github.com/DiligentCreators/SaaS-Docs/pull/170) (draft)

---

## Executive summary

Platform polish lanes A/B/C add user-visible attachments, billing document delivery, dashboard onboarding widgets, richer local demo data, and AI copilot starters. Engineering on the **Backend** branch is largely complete with migrations and Pest coverage, but **production must not ship Frontend `main` without merging and deploying Backend `feature/platform-polish-a-b-c` in the same release window**.

**Go / No-Go:** **No-Go** until the three-repo PR set is merged, `php artisan migrate --force` has run in staging/production, TypeScript build fixes are on `main`, and joint smoke passes (Pest + targeted Playwright below).

| Gate | Result |
|------|--------|
| Three-repo same-milestone deploy (Backend + Frontend + Docs) | **Fail** — Backend/Docs draft; Frontend already on `main` |
| `npm run typecheck` (Frontend) | **Fail** on `main` at audit time — 3 TS errors (credit-note email type, `taskService.list` options, Help Desk note mutation); **fixed locally**, needs commit |
| `npm run build` | **Blocked** until typecheck clean |
| Backend migrations idempotent + migrate-only | **Pass** on polish branch (attachment tables, `document_links`, catalog bumps) |
| Storage quota (`usedBytes`) for new attachment types | **Pass** on polish branch |
| Pest (Expense/Document/Help Desk/Credit Note polish tests) | **Pass** locally on `feature/platform-polish-a-b-c` (attachment + link tests) |
| Playwright polish workflows (serial, demo session) | **Pass** when Backend on polish branch + dashboard export present |
| Full tenant Playwright suite (~200 specs) | **Not a release gate** — fails under demo login rate limits when run as one 1h serial marathon; use module scripts + cached demo login |
| Docs changelog + deployment page | **Partial** — this page; full Docs PR #170 not merged |
| Platform freeze respected | **Pass** — module pages, no parallel shells |

---

## Release train status (2026-08-23)

| Repo | Branch | Polish on `main`? | Notes |
|------|--------|-------------------|--------|
| **SaaS-Frontend** | `main` | **Yes** — PR #143 merged (`1f49e46e`) | UI expects Backend APIs not on `main` yet |
| **SaaS-Backend** | `feature/platform-polish-a-b-c` | **No** — PR #148 **draft** | `ExpenseAttachment`, `DocumentLink`, PDF/email services only on feature branch |
| **SaaS-Docs** | `main` | **No** — PR #170 **draft** | Changelog/deployment updates not merged |

**Risk:** Deploying Frontend `main` to production **without** Backend polish causes silent failures (receipt upload ignored, document lead links empty, credit note / PO email/PDF 404).

---

## Feature inventory

### Lane A — Product completeness

| ID | Capability | Backend | Frontend | Tests | Catalog bump |
|----|------------|---------|----------|-------|--------------|
| A1 | Credit notes PDF + email | Polish branch | `main` | Pest + billing e2e patterns | `credit-notes` → **1.1.0** |
| A2 | Purchase orders PDF + vendor email | Polish branch | `main` | Pest | `purchase-orders` → **1.2.0** |
| A3 | Expense receipt attachments (Storage) | Polish branch | `main` | `ExpenseAttachmentTest` + e2e | `expenses` → **1.3.0** |
| A4 | Help desk ticket + **note** attachments | Polish branch | `main` | Help desk Pest + e2e | `help-desk` → **1.2.0** |
| A5 | Knowledge Base article attachments | Polish branch | `main` | KB tests | `knowledge-base` → **1.1.0** |
| A6 | Projects → Calendar projection | Polish branch | `main` | Projects/calendar e2e | `projects` → **1.1.0** |
| A7 | Documents polymorphic soft links (CRM/HR) | Polish branch | `main` | `DocumentTest` + documents e2e | `documents` → **1.3.0** |
| A8 | Lead import retry UI + guard | Polish branch | `main` | leads.import e2e | leads PATCH |
| A9 | Dashboard widgets (expenses, POs, vendors, payouts) | Polish branch | `main` | tenant-dashboard e2e | — |

### Lane B — Demo & onboarding

| ID | Capability | Backend | Frontend |
|----|------------|---------|----------|
| B1 | `local:seed-demo --full` cross-module story | Polish branch | — |
| B2 | Workspace getting-started checklist card | Onboarding API | Dashboard card |
| B3 | Marketplace starter paths + empty-state CTAs | — | `marketplace-starters.ts`, upsell widgets |

### Lane C — Docs & AI polish

| ID | Capability | Backend | Frontend | Docs |
|----|------------|---------|----------|------|
| C1 | Billing docs sync (remove stale deferred email) | — | — | Draft PR |
| C2 | AI write tools + Opportunity Copilot + dashboard starters | Polish branch | `main` | Draft PR |
| C3 | User-guide deferred-list audit | — | — | Draft PR |
| C4 | Verification (Pint, Pest, Playwright, dead links) | Partial | Partial | Partial |

---

## Migrations (migrate-only — do not seed)

Run on **Backend polish branch** after merge:

| Migration theme | Tables / bumps |
|-----------------|----------------|
| Expense receipts | `expense_attachments` |
| Help desk | `help_desk_ticket_attachments`, `help_desk_note_attachments` |
| Knowledge Base | `knowledge_base_article_attachments` |
| Documents | `document_links` |
| Catalog | credit-notes, purchase-orders, expenses, help-desk, documents, knowledge-base, projects (see `2026_08_23_*` migrations) |

```bash
php artisan migrate --force
php artisan queue:restart
```

Confirm object storage disk for uploads matches [Storage production readiness](./storage-production-readiness).

---

## Pre-production checklist

### Engineering (must complete)

- [ ] Merge Backend PR #148 → `main`; tag/release with Frontend + Docs
- [ ] Merge Docs PR #170 → `main`
- [ ] Commit Frontend fixes on `main`: `AnnouncementsDashboardSection` export (if missing), TypeScript fixes (`CustomerCreditNoteRelatedRef.email`, `taskService.list` options, Help Desk `noteMutation`), document lead server search, e2e alignment (see Frontend uncommitted diff)
- [ ] `npm run typecheck && npm run build` on Frontend `main`
- [ ] `vendor/bin/pint --dirty` + targeted Pest on Backend after merge
- [ ] Staging: `migrate --force` then deploy **Backend before or with** Frontend SPA

### Playwright smoke (staging, `--workers=1`)

```bash
# Frontend — demo workspace, one login per worker (cached in registerTenantWorkspaceSession)
npm run test:e2e:documents
npm run test:e2e:expenses
npm run test:e2e:tenant-dashboard
npm run test:e2e:ai
npm run test:e2e:help-desk
npm run test:e2e:leads   # import retry
```

### Ops / runtime

- [ ] Queue workers processing `emails` (credit note / PO / invoice PDF mailables)
- [ ] Central + tenant mail transport configured (or expect graceful queue failures)
- [ ] AI module: Central keys + `ai:rollover-monthly-credits` scheduler ([AI production readiness](./ai-production-readiness))
- [ ] Demo login rate limits: do not use full tenant suite as single CI job without login cache or throttling exemption for e2e

---

## Known issues & mitigations

| Issue | Severity | Mitigation |
|-------|----------|------------|
| Frontend on `main` without Backend APIs | **Critical** | Block production deploy until Backend merged; or revert Frontend polish from `main` |
| `AnnouncementsDashboardSection` missing from `dashboard/index.ts` | **Critical** | Export required — dashboard crashes without it |
| TypeScript errors on merged Frontend | **High** | Commit type/API fixes before `npm run build` in CI |
| Full tenant e2e marathon hits demo login rate limit | **Medium** | Use per-module scripts + credential cache; not a prod defect |
| Toast overlays intercept Playwright clicks | **Low** | e2e uses DOM `evaluate` click helpers for list rows |
| Accounting entitled workspaces: expense “Mark as paid” opens Paid-from dialog | **Low** | e2e `markAsPaid()` handles accounting dialog |

---

## Verdict

| Environment | Recommendation |
|-------------|----------------|
| **Production** | **No-Go** until Backend #148 + Docs #170 merged, migrations applied, joint smoke green |
| **Staging** | **Conditional Go** after checking out Backend `feature/platform-polish-a-b-c`, migrate, deploy paired Frontend build with TS fixes |
| **Local demo** | **Go** with Backend on polish branch, `local:seed-demo --full`, Frontend `main` + local fixes |

After merge, update this page status to **Go** and record verification dates (Pest counts, Playwright module scripts, staging URL).
