# Help Desk public replies vs internal notes (1.14.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-07 |
| **Status** | **Go for production** |
| **Scope** | `help_desk_notes.is_internal`; staff Conversation (public TipTap reply) vs Internal notes; portal public-only thread + TipTap + attachments; SLA first response on staff public reply only; AI notes forced internal; catalog **help-desk 1.13.0 → 1.14.0**, **customer-portal 1.1.0 → 1.2.0** |
| **Companion** | [Help Desk developer guide](/developer-guide/help-desk) · [Help Desk overview](/user-guide/help-desk-overview) · [Customer Portal](/user-guide/customer-portal) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

Staff can keep private `@mention` notes while sending customer-visible TipTap replies (with attachments). The Customer Portal only lists and downloads public notes; portal/email-authored notes stay public. SLA first-response clocks advance on staff **public** replies (or leave Open), not on internal notes or portal replies. Ask EloSync confirm always stamps `is_internal = true`. Migrate-only catalog bumps — no `db:seed`.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel shells; Feedback-style `is_internal` on existing notes) | **Pass** |
| Default staff note = internal; explicit `is_internal: false` for public reply | **Pass** |
| Portal show filters `is_internal = false`; attachment download 404s internal | **Pass** |
| Portal / email notes always public; do not mark SLA first response | **Pass** |
| Staff public reply marks SLA first response | **Pass** |
| Mentions only process on internal notes | **Pass** |
| AI write confirm forces internal | **Pass** |
| Migration backfill: staff → internal; portal/`user_id` null → public | **Pass** |
| Catalog migrate-only **1.14.0** / **1.2.0** + CatalogSeeder companion | **Pass** |
| Playwright headed (one session per spec) | **Pass** — Help Desk **3/3**; Customer Portal **3/3** |
| Pest (focused) | **Pass** — `PortalHelpDeskTest` (5), `HelpDeskSlaTest` (6), note `is_internal` case, version bumps (4), CatalogSeeder companions |
| Security: portal cannot read/download internal notes | **Pass** |
| Docs + CHANGELOG + upgrade path | **Pass** |

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Med | Headed Help Desk e2e: SLA dialog `getByLabel('Priority')` matched Edit/Delete on policies named `Priority support…` (strict mode) | Playwright page object uses `getByRole('combobox', { name: 'Priority' })` / Category |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Mobile uses a visibility toggle (Reply vs Internal) rather than dual TipTap sections — API contract identical |
| R2 | Info | TipTap console warn `Duplicate extension names: link, underline` and occasional Select controlled/uncontrolled warn — pre-existing SPA noise; not regressions of this release |
| R3 | Ops | Full `HelpDeskTicketTest` suite can be slow under local DB contention; focused note/SLA/portal suites are the release gate |
| R4 | Info | Existing staff notes backfill to **internal** — operators should send an explicit public reply if a customer must see prior staff context |

## What shipped

### Backend

- Migration `add_is_internal_to_help_desk_notes_table` + index + backfill
- Catalog bumps `help-desk` **1.14.0**, `customer-portal` **1.2.0** (+ CatalogSeeder)
- `HelpDeskTicketService::addNote` / `addEmailNote`; SLA clock gated on public staff reply
- Portal service/resource filter + `findPublicNoteAttachment`; portal note-attachment download route
- `StoreHelpDeskTicketNoteRequest` `is_internal` + richer body max; AI confirm forces internal
- `NoteMentionService` skips non-internal notes

### Frontend

- Ticket view **Conversation** (TipTap public reply + attachment) + **Internal notes** (`MentionComposer`)
- Portal Support TipTap create/reply + attachments
- Playwright Help Desk + Customer Portal workflows updated; SLA Priority locator hardened

### Mobile

- Help Desk notes: visibility toggle + HTML strip for public bodies; `isInternal` on add-note API

### Docs

- User / developer / API / deployment / upgrade / roadmap / CHANGELOG; this readiness page

## Operator checklist

1. Deploy Backend → `php artisan migrate --force` (**do not** `db:seed`)
2. Confirm catalog: `help-desk` **1.14.0**, `customer-portal` **1.2.0**
3. Deploy Frontend SPA (Conversation + portal TipTap) and Mobile
4. Staging smoke: staff public reply visible in portal; internal note not visible; portal reply + attachment; SLA first response after staff public reply only

## Rollback

`php artisan migrate:rollback` through the `is_internal` + catalog bump migrations restores prior schema/versions. Redeploy previous SPA/Mobile. Rolling back drops the column (note visibility history is not preserved after rollback).
