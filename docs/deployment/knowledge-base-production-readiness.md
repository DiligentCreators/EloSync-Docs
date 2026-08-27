# Knowledge Base — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-13 (re-audit after e2e + UI hardening) |
| **Status** | **Go** — ready for staging → production after CI on companion PRs |
| **Scope** | Knowledge Base module `knowledge-base` v1.0.0 |
| **Branch** | `feature/knowledge-base-module-22e6` |
| **Companion** | [KB production](./knowledge-base) · [Developer guide](/developer-guide/knowledge-base) · [User guide](/user-guide/knowledge-base) · [API](/api/tenant-v1-knowledge-base) |

**PRs:** Backend [#103](https://github.com/DiligentCreators/EloSync-Backend/pull/103) · Frontend [#101](https://github.com/DiligentCreators/EloSync-Frontend/pull/101) · Docs [#125](https://github.com/DiligentCreators/EloSync-Docs/pull/125) · Website [#23](https://github.com/DiligentCreators/EloSync-Website/pull/23)

---

## Executive summary

Knowledge Base is a **free** Operations Marketplace SKU (`$0`). It is **not** default-included. Workspaces install from Marketplace after migrate; existing tenants are unchanged until they opt in.

Locked v1 scope is implemented: **internal workspace only**, flat categories, no public portal / Help Desk links / attachments / nested categories / dashboard widget / Automation triggers.

**Go / No-Go:** **Go** for staging → production after CI on companion PRs. Prior HIGH UI blockers (detail/edit failure paths) are fixed and covered by headed Playwright. Remaining items are residual / fast-follow quality work, not ship blockers.

| Gate | Result |
|------|--------|
| Catalog: operations / `knowledge-base` / `1.0.0` / `book-open` / sort 60 / free opt-in | **Pass** |
| Module + verified + RBAC middleware on tenant routes | **Pass** |
| Published-only visibility for view-only roles | **Pass** |
| Editor drafts / archived / trash list filters (API + UI) | **Pass** (trash filter includes `update`; status filter gated on `update`) |
| MySQL-safe notes/activities index & FK names | **Pass** |
| Slug unique ignore on update (camelCase route param) | **Pass** |
| Detail/edit error handling (trashed 404 / failed body fetch) | **Pass** (fixed) |
| Pest `tests/Feature/Tenant/KnowledgeBase` | **Pass** (6) |
| Playwright headed `test:e2e:knowledge-base:headed` | **Pass** (expanded one-session workflow) |
| Docs + marketing SKU | **Pass** |
| Notes/timeline readable by view-only | **Accepted residual** (product: internal transparency) |
| Cross-tenant isolation Pest case | **Recommended fast-follow** |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Internal-only | Pass | Pass | Pass | Pass |
| Free Operations opt-in (not default, not billable) | Pass | Pass | Pass | Pass |
| v1.0.0 · `book-open` · sort 60 | Pass | Pass | Pass | Pass |
| No public portal | Pass | Pass | Pass (deferred) | Pass (soft “yet” — Low) |
| No Help Desk shipping | Pass | Pass | Pass | Pass (`planned`) |
| No attachments / nested cats / dashboard / Automation | Pass | Pass | Pass | Pass |

---

## Findings (re-audit)

### Resolved since first audit

| ID | Was | Now | Evidence |
|----|-----|-----|----------|
| F1 | HIGH — infinite skeleton on failed/trashed `show` | **Fixed** | `knowledge-base-detail-sheet.tsx` `ErrorState`; e2e asserts “Unable to load article” |
| F2 | HIGH — edit could wipe body on failed detail fetch | **Fixed** | Form blocks Save until body loads; `ErrorState` on `detailQuery.isError` |
| F3 | MEDIUM — trash UI vs docs (`update` editors) | **Fixed** | `canManageTrash` includes `canUpdate`; status filter gated on `canUpdate` |
| F13 | LOW — missing hub / Playwright rows | **Fixed** | Developer guide index + `playwright.md` |

### Open (non-blocking)

| ID | Severity | Area | Finding | Recommendation |
|----|----------|------|---------|----------------|
| F4 | MEDIUM | Backend / Product | View-only users can **read** notes + activity timeline (incl. body snapshots) via `show` / `timeline`; **write** notes requires `update` | Accept as internal transparency **or** gate read to `update` in a follow-up |
| F5 | MEDIUM | Tests | Isolation Pest only covers module entitlement 403 | Add Announcements-style cross-tenant ID access test |
| F6 | MEDIUM | Backend | Soft-deleted slugs still unique (same as Products) | Document; purge/force-delete to free slug |
| F7 | MEDIUM | Backend | Inactive categories still assignable via `exists` | Optionally require `is_active` |
| F8 | MEDIUM | Backend | Category update/destroy lack trashed guards | Mirror article controller guards |
| F9 | MEDIUM | Backend | No platform audit for restore / force-delete | Add events if ops needs them |
| F10 | MEDIUM | Backend | Empty auto-slug edge case for symbol-only titles | Fallback slug / validation |
| F11 | MEDIUM | Frontend | Categories dialog Edit/Delete lack per-action gates | Add `PermissionGate` (Products parity gap) |
| F12 | MEDIUM | Frontend | Categories/stats secondary loading/error states thin | Polish |
| F14 | LOW | Docs | `database.md` notes/activities field list incomplete | Expand |
| F15 | LOW | Website | “portal yet” softens deferral | Tighten copy |
| F16 | LOW | A11y | Filter accessible names / Label `htmlFor` | Polish |

### Accepted / intentional

| Item | Notes |
|------|-------|
| `force.delete` not on admin default map | Documented owner/custom grant; vocabulary via `ensurePermissionVocabulary()` |
| Trashed `show` → 404 | Products parity; list trash + restore/force remain; UI ErrorState + no View menu for trashed |
| HTML body + SPA DOMPurify sanitize | Same class as email/announcements |
| No dashboard / Automation / portal | Locked v1 exclusion |
| Activity full-body snapshots in properties | Accept for v1; monitor growth |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/KnowledgeBase` | **6 passed** | CRUD, draft hide, module gate, slug update, category guard |
| `xvfb-run -a npm run test:e2e:knowledge-base:headed` | **1 passed (~38s)** | One login session |

**Headed e2e coverage (single session):**

1. Empty submit → Title/Body required  
2. Title-only submit → Body required  
3. Create category  
4. Create draft + KPI Draft  
5. Status filter Draft / Published / All  
6. Edit → body loaded → publish  
7. Create second article as Published  
8. Notes + Activity tabs  
9. Soft delete → Deleted only  
10. Trashed title → “Unable to load article”  
11. Restore → Active only  
12. Archive → Archived filter  
13. KPI + page healthy  

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (schema + catalog + permissions)  
2. **SPA** — Knowledge Base nav + pages + tour  
3. **Docs** + **marketing site**  
4. Staging smoke below before production traffic  

Suggested merge: **Backend → Frontend → Docs → Website**.  
No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied (`knowledge_base_*` + register + permissions) | Ops | ☐ |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0` | Ops | ☐ |
| 3 | New workspace lacks KB until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=knowledge-base`, `knowledge-base.view`) | QA | ☐ |
| 5 | Pest KB suite green in CI | Eng | ☐ |
| 6 | Playwright `test:e2e:knowledge-base` green on staging | QA | ☐ |
| 7 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Knowledge Base** (free)  
2. Sidebar shows Knowledge Base for `knowledge-base.view`  
3. Manage categories → create  
4. New article → validation errors → create draft  
5. Publish via Edit  
6. View-only staff: published only; no draft access  
7. Editor: note + Activity  
8. Soft delete → trash → restore (admin/owner with restore)  
9. Module uninstalled → routes 403  
10. Optional: `force.delete` only when explicitly granted  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (rows retained) |
| Schema | Do not roll back KB migrations in prod without a data plan |

---

## Monitoring

- Platform audit: `knowledge_base_article_created` / `_updated` / `_deleted` / `_note_added`  
- Spatie log: `knowledge-base`  
- Domain timeline: `knowledge_base_article_activities`  
- Watch activity `properties` size under heavy HTML edits  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Go** / No-Go |
| Product | | | Accept F4 residual / request gate |
| Ops | | | Staging migrate + smoke ☐ |

**Recommendation:** Merge companions after CI green; run staging smoke; treat F4–F12 as post-GA polish unless Product wants notes/timeline gated before launch.
