# Tabbed module record drawers — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-12 |
| **Status** | **Go for production** |
| **Scope** | Platform-wide list peeks: `ModuleRecordSheet` / `EntityRecordSheet` **tabbed** view (`renderTabs`) with shared `RecordSheet*Panel` helpers; **Open full page** escape hatch; billing docs remain view-peek only for create/edit |
| **Companion** | [Module development](/developer-guide/module-development) · [Shared layout](/developer-guide/shared-layout) · [CHANGELOG](/changelog/) |

---

## Executive summary

List drawers are upgraded from thin peeks to tabbed drawers (Leads parity). Agents can work Overview / Notes / Follow-ups / Activity (and module-specific tabs such as Comments, Lines, Timeline) without leaving the list. Dedicated routes remain canonical for deep links, notifications, and complex work.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (reuse `EntityRecordSheet` / `ModuleRecordSheet`; no parallel shell) | **Pass** |
| Hybrid list standard (`renderTabs` + Open full page; billing create/edit page-primary) | **Pass** |
| Shared panel helpers (`RecordSheetNotesPanel`, Follow-ups, Activity, Fields) | **Pass** |
| No Backend migrate / no new permissions | **Pass** |
| Docs + CHANGELOG same delivery | **Pass** |
| Playwright headed one-session (validation → create → tabs → note → full page) | **Pass** — `npm run test:e2e:sheets:headed` |

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Medium | Thin peeks forced full-page hops for notes / follow-ups / activity | `renderTabs` on module record sheets + shared panels |
| A2 | Medium | Contact/company/task peeks still stubbed after Leads sheet ship | Platform-wide tabbed sheets in Frontend PR |
| A3 | Low | No headed one-session coverage for tabbed drawers | `e2e/tests/sheets/tabbed-record-drawers.headed.spec.ts` + `test:e2e:sheets:headed` |
| A4 | Low | Production readiness page missing for this ship | This page + VitePress nav + changelog link |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Billing line-item documents stay **view peek only** for create/edit (page-primary) |
| R2 | Info | Leads Notes tab keeps `MentionComposer` (`#lead-sheet-note`); other modules use `#sheet-note-{entity}` textarea panels |
| R3 | Ops | Deploy Frontend after production build; hard-refresh SPA. No Backend migrate |

## What shipped

### Frontend

- `ModuleRecordSheet` `renderTabs` + dynamic tab grid on `EntityRecordSheet`
- Shared `src/components/common/record-sheet-panels.tsx` (+ billing read-only note helper)
- Module `*-record-sheet.tsx` peeks converted to tabs (Leads, Contacts, Companies, Tasks, and remaining modules)
- Playwright: `test:e2e:sheets:headed` (one login; Leads / Contacts / Companies / Tasks)

### Docs

- Module-development / shared-layout hybrid-sheet guidance for `renderTabs`
- User-guide peek copy updates
- This readiness page + changelog

## Test evidence

```bash
# From EloSync-Frontend (system Chrome if Playwright browser missing)
$env:E2E_BROWSER_CHANNEL='chrome'
npm run test:e2e:sheets:headed
```

Expected: **5 passed** (login + Leads + Contacts + Companies + Tasks) under one shared browser context.

## Go-live checklist

1. Merge Frontend + Docs PRs
2. Wait for Frontend production build → `build-artifacts`
3. Forge-deploy SPA from `build-artifacts` (not `main`)
4. Hard-refresh tenant SPA; spot-check Leads + Contacts list peek tabs
5. No Backend migrate; no `db:seed`
