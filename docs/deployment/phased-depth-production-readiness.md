# Phased Depth Program (Phases 0–3c) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-31 |
| **Re-verified** | 2026-08-31 — depth Playwright re-run green; Pest `phpunit.xml` memory; doc/mobile/e2e fixes pushed |
| **Status** | **Go** — merge PRs + migrate-first deploy + staging smoke |
| **Scope** | Hygiene, webhook depth, credit-note applied refund, Help Desk @mentions, Kanban board, Communication Template replies |
| **Branch** | `feature/phased-depth-program` |
| **PRs** | Backend [#165](https://github.com/DiligentCreators/EloSync-Backend/pull/165) · Frontend [#159](https://github.com/DiligentCreators/EloSync-Frontend/pull/159) · Docs [#234](https://github.com/DiligentCreators/EloSync-Docs/pull/234) · Mobile [#51](https://github.com/DiligentCreators/EloSync-Mobile/pull/51) · Website [#42](https://github.com/DiligentCreators/EloSync-Website/pull/42) |
| **Companion** | [Credit Notes deploy](./credit-notes) · [Help Desk deploy](./help-desk) · [Webhooks readiness](./tenant-api-webhooks-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Phased Depth Program delivers six incremental milestones across five repos without breaking platform freeze. Engineering gates are **closed** on the feature branch. **Production deploy:** merge all five PRs to `main`, deploy together, `migrate --force`, queue restart, run staging smoke below.

| Gate | Result |
|------|--------|
| Code complete (Backend, Frontend, Docs, Mobile, Website) | **Pass** |
| PRs opened (five repos) | **Pass** — see PR links in header |
| Migrations idempotent (migrate-only, no `db:seed`) | **Pass** — 6× `2026_08_31_*` migrations |
| Permissions rollout (`credit-notes.refund`) | **Pass** — `TenantPermissionSynchronizer` migration |
| Catalog versions (`credit-notes` 1.2.0, `help-desk` 1.7.0) | **Pass** — `CatalogSeeder` + bump migrations |
| Pest (depth scope) | **Pass** — local 70/70; Backend PR CI is `workflow_dispatch` only (billing) |
| Playwright (depth scope) | **Pass** — Developers, credit-notes, help-desk; `local:seed-demo` documented |
| Playwright (full 312) | **N/A** — not a release gate for this milestone (pre-existing env failures) |
| Docs Quality Gate | **Pass** — dead links in product-roadmap fixed (`/user-guide/ai-assistant`, `/getting-started/platform-freeze`) |
| Mobile typecheck | **Pass** — `refunded` status label on list screen |
| Docs + CHANGELOG + deployment pages | **Pass** — drift remediated |
| Webhooks prod-readiness doc | **Pass** — expanded events + Edit UI re-verified |
| Mobile parity | **Pass** — CN refund on mobile; Help Desk depth intentionally web-only (Kanban, mentions, CT picker) |
| Queue / scheduler | **Pass** — `webhooks`, `help-desk-ingest`, SLA scanner unchanged |
| Frontend / Website CI | **Pass** — Quality Gate green on PRs #159 / #42 |

**Go / No-Go:** **Go** after PR merge and operator checklist.

---

## Phase delivery

| Phase | Deliverable | Catalog | Status |
|-------|-------------|---------|--------|
| **0** Hygiene | Roadmap rebuilt; CN/PO PDF/email copy synced; FCM verify-only | — | **Pass** |
| **1** Webhooks | 5 new outbound events + Developers **Edit** UI | Platform | **Pass** |
| **2** CN refund | `POST /credit-notes/{id}/refund`, `credit-notes.refund`, accounting reverse | `credit-notes` **1.2.0** | **Pass** |
| **3a** @mentions | `help_desk_note_mentions`, `HelpDeskMentionedNotification`, `MentionComposer` | `help-desk` **1.5.0** | **Pass** |
| **3b** Kanban | `GET /help-desk/board`, Board/List toggle, drag status | `help-desk` **1.6.0** | **Pass** |
| **3c** Templates | `HelpDeskPlaceholderProvider`, soft-gated WhatsApp template picker | `help-desk` **1.7.0** | **Pass** |

---

## Migrations (migrate-first)

Run on central + tenant databases during deploy — **no** `db:seed`:

1. `2026_08_31_040000_add_credit_notes_refund_permission`
2. `2026_08_31_040001_bump_credit_notes_module_version_to_1_2_0`
3. `2026_08_31_050000_create_help_desk_note_mentions_table`
4. `2026_08_31_050001_bump_help_desk_module_version_to_1_5_0`
5. `2026_08_31_060000_bump_help_desk_module_version_to_1_6_0`
6. `2026_08_31_070000_bump_help_desk_module_version_to_1_7_0`

---

## Test evidence

### Backend Pest (depth scope)

```bash
php artisan test --compact \
  tests/Feature/Tenant/Developers/DeveloperWebhookEndpointTest.php \
  tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteTest.php \
  tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteAccountingTest.php \
  tests/Feature/Tenant/HelpDesk/HelpDeskTicketTest.php \
  tests/Feature/Tenant/Notification/NoteMentionNotificationTest.php \
  tests/Feature/Tenant/CommunicationTemplates/TemplateRendererTest.php
```

Local `phpunit.xml` sets `memory_limit=512M` (PDF/font paths OOM at 128M). CI Quality Gate uses 2G.

### Frontend Playwright (depth scope)

Backend: `php artisan local:seed-demo` · Frontend: `E2E_DEMO_DOMAIN=demo-crm.localhost` in `.env.e2e`

```bash
npm run test:e2e:developers
npm run test:e2e:credit-notes
npm run test:e2e:help-desk
```

Use `--workers=1` on Windows if tenant session contention appears.

---

## Deploy checklist (operator)

1. Merge Backend + Frontend + Docs + Mobile + Website PRs to `main`.
2. `php artisan migrate --force` (central + tenants).
3. `php artisan queue:restart` (and `reverb:restart` if applicable).
4. Confirm workers: `webhooks`, `help-desk-ingest`, `default`.
5. Confirm scheduler: `help-desk:scan-sla-breaches`, `help-desk:sync-mailboxes`, `webhooks:prune-deliveries`.
6. Deploy Frontend SPA + Mobile + Website from `main`.

### Staging smoke

| Area | Steps |
|------|--------|
| **Developers** | Settings → Developers → edit webhook (name, URL, events) → Send test → Recent deliveries |
| **Credit Notes** | Issue CN → apply to invoice → Refund (web + mobile) → confirm `amount_credited` / `balance_due` restored |
| **Help Desk** | Board/List toggle → drag status → add note with `@mention` → confirm notification |
| **Templates** | On workspace with Communication Templates + WhatsApp entitled → ticket reply → template picker (soft-gated) |

---

## Mobile scope (accepted)

| Surface | Mobile | Web |
|---------|--------|-----|
| Credit note refund | **Yes** — `credit-notes.refund` | **Yes** |
| Help Desk Kanban / @mentions / CT picker | **No** — web v1 | **Yes** |

Documented in [Mobile app developer guide](/developer-guide/mobile-app#credit-notes-module-credit-notes).

---

## Explicitly out of scope (unchanged)

Customer Portal · chat/social Help Desk channels · OAuth/scoped integration tokens · WhatsApp interactive · AI tools depth · standalone credit notes · multi-currency

---

## Pre-merge engineering checklist

- [x] Code complete on `feature/phased-depth-program` (five repos)
- [x] Doc drift remediated (Help Desk deployment roadmap, webhooks readiness, audit page)
- [x] Pest memory + Playwright prerequisites documented
- [x] Depth Playwright re-verified green (2026-08-31): developers, credit-notes, help-desk
- [x] Open PRs: Backend, Frontend, Docs, Mobile, Website
- [x] Code review + CI green on each PR (Backend Pest local — PR CI manual-only by design)
- [ ] Merge to `main` in one milestone
- [ ] Staging smoke per table above
- [ ] Production deploy per [release process](./release-process)
