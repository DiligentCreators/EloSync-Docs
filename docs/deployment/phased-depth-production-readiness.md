# Phased Depth Program (Phases 0–3c) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-31 |
| **Re-verified** | 2026-08-31 — five milestone PRs + Docs #235 merged to `main` |
| **Status** | **Go** — engineering complete; **operator deploy remaining** |
| **Scope** | Hygiene, webhook depth, credit-note applied refund, Help Desk @mentions, Kanban board, Communication Template replies |
| **Code** | On `main` (from `feature/phased-depth-program`) |
| **PRs** | Backend [#165](https://github.com/DiligentCreators/EloSync-Backend/pull/165) · Frontend [#159](https://github.com/DiligentCreators/EloSync-Frontend/pull/159) · Docs [#234](https://github.com/DiligentCreators/EloSync-Docs/pull/234) · Mobile [#51](https://github.com/DiligentCreators/EloSync-Mobile/pull/51) · Website [#42](https://github.com/DiligentCreators/EloSync-Website/pull/42) · Docs status [#235](https://github.com/DiligentCreators/EloSync-Docs/pull/235) — all **merged** |
| **Companion** | [Credit Notes deploy](./credit-notes) · [Help Desk deploy](./help-desk) · [Webhooks readiness](./tenant-api-webhooks-production-readiness) · [CHANGELOG](/changelog/) · [Release process](./release-process) |

---

## Remaining (operator)

Engineering is **done**. Only production/staging rollout is left:

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Deploy Backend from `main` | Ops | **Todo** |
| 2 | `php artisan migrate --force` (central **and** tenants) — **no** `db:seed` | Ops | **Todo** |
| 3 | `php artisan queue:restart` (and `reverb:restart` if used) | Ops | **Todo** |
| 4 | Confirm queue workers include `webhooks`, `help-desk-ingest`, `default` | Ops | **Todo** |
| 5 | Confirm scheduler: `help-desk:scan-sla-breaches`, `help-desk:sync-mailboxes`, `webhooks:prune-deliveries` | Ops | **Todo** |
| 6 | Deploy Frontend SPA + Mobile + Website from `main` (same window as Backend) | Ops | **Todo** |
| 7 | Staging smoke — Developers webhook edit + Send test | Ops / QA | **Todo** |
| 8 | Staging smoke — Credit note issue → apply → **Refund** (web + mobile) | Ops / QA | **Todo** |
| 9 | Staging smoke — Help Desk Board drag, `@mention`, WhatsApp template picker (if entitled) | Ops / QA | **Todo** |
| 10 | Production cutover per [release process](./release-process) | Ops | **Todo** |

### Migrations to apply (step 2)

1. `2026_08_31_040000_add_credit_notes_refund_permission`
2. `2026_08_31_040001_bump_credit_notes_module_version_to_1_2_0`
3. `2026_08_31_050000_create_help_desk_note_mentions_table`
4. `2026_08_31_050001_bump_help_desk_module_version_to_1_5_0`
5. `2026_08_31_060000_bump_help_desk_module_version_to_1_6_0`
6. `2026_08_31_070000_bump_help_desk_module_version_to_1_7_0`

### Staging smoke detail (steps 7–9)

| Area | Steps |
|------|--------|
| **Developers** | Settings → Developers → edit webhook (name, URL, events) → Send test → Recent deliveries |
| **Credit Notes** | Issue CN → apply to invoice → Refund → confirm `amount_credited` / `balance_due` restored (void apply journal when Accounting entitled) |
| **Help Desk** | Board/List toggle → drag status → note with `@mention` → notification; soft-gated WhatsApp template when CT + WhatsApp entitled |

---

## Done (engineering)

| Gate | Result |
|------|--------|
| Phases 0–3c product surface | **Pass** |
| Five-repo code on `main` | **Pass** — merged 2026-08-31 |
| Migrations / permissions / catalog bumps | **Pass** — migrate-only |
| Pest (depth) | **Pass** — 70/70 local (`phpunit.xml` 512M; Backend CI is `workflow_dispatch` only) |
| Playwright (depth) | **Pass** — developers, credit-notes, help-desk |
| Docs / Mobile / Frontend / Website CI | **Pass** |
| Doc drift + mobile CN refund docs | **Pass** |

| Phase | Deliverable | Catalog | Status |
|-------|-------------|---------|--------|
| **0** Hygiene | Roadmap rebuilt; CN/PO PDF/email copy synced | — | **Done** |
| **1** Webhooks | 5 events + Developers **Edit** UI | Platform | **Done** |
| **2** CN refund | `POST /credit-notes/{id}/refund` | `credit-notes` **1.2.0** | **Done** |
| **3a** @mentions | Mentions + notifications | `help-desk` **1.5.0** | **Done** |
| **3b** Kanban | `GET /help-desk/board` | `help-desk` **1.6.0** | **Done** |
| **3c** Templates | Soft-gated WhatsApp picker | `help-desk` **1.7.0** | **Done** |

**Not remaining for this milestone:** full 312-test Playwright suite (pre-existing env failures; not a release gate) · Help Desk Kanban/mentions/templates on mobile (web-only by design) · Customer Portal / chat channels / OAuth tokens (out of scope).

---

## Test evidence (reference)

```bash
# Backend (depth)
php artisan test --compact \
  tests/Feature/Tenant/Developers/DeveloperWebhookEndpointTest.php \
  tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteTest.php \
  tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteAccountingTest.php \
  tests/Feature/Tenant/HelpDesk/HelpDeskTicketTest.php \
  tests/Feature/Tenant/Notification/NoteMentionNotificationTest.php \
  tests/Feature/Tenant/CommunicationTemplates/TemplateRendererTest.php

# Frontend (after php artisan local:seed-demo; E2E_DEMO_DOMAIN=demo-crm.localhost)
npm run test:e2e:developers
npm run test:e2e:credit-notes
npm run test:e2e:help-desk
```

---

## Checklist

### Engineering — complete

- [x] Code complete (five repos)
- [x] Doc drift remediated
- [x] Depth Pest + Playwright green
- [x] CI green (Docs / Mobile / Frontend / Website)
- [x] Merged to `main` (2026-08-31)

### Operator — remaining

- [ ] Deploy Backend from `main`
- [ ] `migrate --force` (central + tenants)
- [ ] Queue restart + workers + scheduler confirmed
- [ ] Deploy Frontend + Mobile + Website from `main`
- [ ] Staging smoke (Developers, CN refund, Help Desk)
- [ ] Production cutover per [release process](./release-process)
