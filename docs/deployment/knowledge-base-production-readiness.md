# Knowledge Base — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-13 |
| **Status** | **Conditional Go** — staging go-live OK; fix must-fix items before calling production “complete” |
| **Scope** | Knowledge Base module `knowledge-base` v1.0.0 |
| **Branch** | `feature/knowledge-base-module-22e6` |
| **Companion** | [KB production](./knowledge-base) · [Developer guide](/developer-guide/knowledge-base) · [User guide](/user-guide/knowledge-base) · [API](/api/tenant-v1-knowledge-base) |

**PRs:** Backend [#103](https://github.com/DiligentCreators/SaaS-Backend/pull/103) · Frontend [#101](https://github.com/DiligentCreators/SaaS-Frontend/pull/101) · Docs [#125](https://github.com/DiligentCreators/SaaS-Docs/pull/125) · Website [#23](https://github.com/DiligentCreators/SaaS-Website/pull/23)

---

## Executive summary

Knowledge Base is a **free** Operations Marketplace SKU (`$0`). It is **not** default-included. Workspaces install from Marketplace after migrate; existing tenants are unchanged until they opt in.

Locked v1 scope is implemented: **internal workspace only**, flat categories, no public portal / Help Desk links / attachments / nested categories / dashboard widget / Automation triggers.

**Go / No-Go:** **Conditional Go** for staging → production after CI on companion PRs. Address the must-fix list (or explicitly accept residual risk) before broad GA.

| Gate | Result |
|------|--------|
| Catalog: operations / `knowledge-base` / `1.0.0` / `book-open` / sort 60 / free opt-in | Pass |
| Module + verified + RBAC middleware on tenant routes | Pass |
| Published-only visibility for view-only roles | Pass (list/show) |
| Editor drafts / archived / trash list filters | Pass (API); UI trash filter needs restore/force (see findings) |
| MySQL-safe notes/activities index & FK names | Pass |
| Slug unique ignore on update (camelCase route param) | Pass (fixed + Pest) |
| Pest `tests/Feature/Tenant/KnowledgeBase` | Pass (6) |
| Playwright headed `test:e2e:knowledge-base:headed` | Pass (full human workflow) |
| Docs + marketing SKU (available / free; Help Desk stays planned) | Pass |
| Detail/edit error handling for trashed & failed body fetch | Fail — must-fix / accept |
| Notes/timeline privacy for view-only | Partial — product decision |
| Real cross-tenant isolation Pest case | Gap — recommended |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Internal-only | Pass | Pass | Pass | Pass |
| Free Operations opt-in (not default, not billable) | Pass | Pass (Marketplace install in e2e) | Pass | Pass (`available` / `free`) |
| v1.0.0 · `book-open` · sort 60 | Pass | Pass | Pass | Pass |
| No public portal | Pass | Pass | Pass (deferred) | Pass (“yet” soft wording — Low) |
| No Help Desk shipping | Pass | Pass | Pass | Pass (`planned`) |
| No attachments / nested cats / dashboard / Automation | Pass | Pass | Pass | Pass |

---

## Findings

### Must-fix before calling production complete

| ID | Severity | Area | Finding | Evidence / remediation |
|----|----------|------|---------|------------------------|
| F1 | **HIGH** | Frontend | Detail sheet shows permanent skeleton when `show` fails (including **trashed** articles opened via View) | `knowledge-base-detail-sheet.tsx` — no `isError` branch; backend `show` 404s trashed. Add `ErrorState`; hide View for trashed rows (or restore-only sheet). |
| F2 | **HIGH** | Frontend | Edit dialog can reset **body to empty** if detail fetch fails (list payload omits body) | `knowledge-base-form-dialog.tsx` — on `detailQuery.isError`, block Save and show error. |
| F3 | **MEDIUM** | Frontend / Docs | Trash filter UI requires `restore` \| `force.delete`; docs say **`update`** editors see trash | Managers (view/create/update) get no trash filter. Align UI with docs **or** update docs to restore+. Gate status filter on `update`. |
| F4 | **MEDIUM** | Backend / Product | View-only users receive **notes** + **activity timeline** (including update snapshots with HTML body) via `show` / `timeline` | Adding notes is `update`-gated; reading is not. Gate read of notes/timeline to `update`, or document as intentional internal transparency. |
| F5 | **MEDIUM** | Tests | “Tenant isolation” Pest case only asserts module entitlement 403 — no cross-tenant ID access case | Add Announcements-style isolation test. |

### Should-fix (quality / parity)

| ID | Severity | Area | Finding |
|----|----------|------|---------|
| F6 | MEDIUM | Backend | Soft-deleted slugs still occupy unique `(tenant_id, slug)` — reuse blocked until purge (same as Products) |
| F7 | MEDIUM | Backend | `category_id` exists rule ignores `is_active`; inactive categories assignable |
| F8 | MEDIUM | Backend | Category update/destroy do not guard already-trashed rows (articles do) |
| F9 | MEDIUM | Backend | No platform audit events for restore / force-delete |
| F10 | MEDIUM | Backend | Auto `Str::slug($title)` can yield empty slug for non-Latin / symbol-only titles |
| F11 | MEDIUM | Frontend | Categories dialog shows Edit/Delete without per-action `PermissionGate` (create-only → 403 toasts) |
| F12 | MEDIUM | Frontend | Missing loading/error states on categories dialog, form category query, KPI/stats failures |
| F13 | LOW | Docs | Developer guide hub + Playwright suite table omitted KB rows (fixed alongside this audit) |
| F14 | LOW | Docs | `database.md` notes/activities field list incomplete (`tenant_id`, activity `user_id` / no `updated_at`) |
| F15 | LOW | Website | “no customer portal **yet**” softens explicit deferral |
| F16 | LOW | A11y | Filter selects lack explicit accessible names; form Labels not always wired with `htmlFor` |

### Accepted / intentional

| Item | Notes |
|------|-------|
| `force.delete` not on admin default map | Documented: owner/custom grant. Vocabulary still created via `ensurePermissionVocabulary()`. |
| Trashed `show` → 404 for everyone | Matches Products; Announcements allows managers. List trash remains for restore/force. |
| Body stored as HTML; sanitize on SPA render | DOMPurify via `sanitizeKnowledgeBaseHtml` — same class as email/announcements. |
| No dashboard widget / Automation / portal | Locked v1 exclusion. |
| Activity logging of full body snapshots | Accept for v1; watch table growth. |

### Informational (verified pass)

- Schema: categories, articles (soft delete), notes, activities; shortened `kb_*` FK/index names for MySQL
- Factories for article/category/note/activity; TrashPurgeRegistry (articles then categories)
- Routes: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:knowledge-base`, `can:*`
- Frontend: nav, lazy route, tour, `PERMISSIONS` / `QUERY_KEYS`, TipTap + `isRichTextEmpty`
- Headed e2e: one session — validation, category, draft → publish, notes/activity, soft delete + trash filter
- Marketing: KB available/free; Help Desk remains planned

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (schema + catalog + permissions)
2. **SPA** — Knowledge Base nav + pages + tour
3. **Docs** + **marketing site**
4. Staging smoke (below) before production traffic

Suggested merge order: **Backend → Frontend → Docs → Website**.

No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied (`knowledge_base_*` + register module + permissions) | Ops | ☐ |
| 2 | Catalog: `knowledge-base` published, Operations, **not** default-included, **not** billable, `$0` | Ops | ☐ |
| 3 | New workspace does **not** see KB until Marketplace install | QA | ☐ |
| 4 | Frontend `RequireAccess` (`module=knowledge-base`, `knowledge-base.view`) | QA | ☐ |
| 5 | Pest Knowledge Base suite green in CI | Eng | ☐ |
| 6 | Playwright `npm run test:e2e:knowledge-base` (or `:headed`) green on staging | QA | ☐ |
| 7 | F1–F2 fixed **or** accepted in sign-off | Eng / PM | ☐ |
| 8 | F3–F4 product decision recorded (UI vs docs; notes visibility) | PM | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Knowledge Base** (free)
2. Sidebar shows **Knowledge Base** for a role with `knowledge-base.view`
3. Manage categories → create category
4. New article → empty submit shows Title/Body required → create **draft**
5. Publish via Edit → status **Published**
6. Staff **view-only**: sees published; cannot open drafts
7. Editor: add note + confirm Activity tab
8. Soft delete → trash / restore path (role with restore)
9. Confirm 403 when module uninstalled / not entitled
10. Optional: confirm force-delete only for roles explicitly granted `knowledge-base.force.delete`

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA; KB nav disappears |
| Backend code | Redeploy previous release; keep migrations (catalog insert is additive) |
| Module disable | Marketplace uninstall (article rows retained) |
| Schema | Do **not** roll back KB migrations in production without a data plan |

---

## Monitoring

- Platform audit: `knowledge_base_article_created` / `_updated` / `_deleted` / `_note_added`
- Spatie log name: `knowledge-base`
- Domain timeline: `knowledge_base_article_activities`
- Nightwatch / exception tracker on tenant KB routes
- Watch `knowledge_base_article_activities.properties` size if editors churn large HTML bodies

---

## Test evidence (this audit)

| Suite | Result |
|-------|--------|
| `php artisan test --compact tests/Feature/Tenant/KnowledgeBase` | **6 passed** |
| `xvfb-run -a npm run test:e2e:knowledge-base:headed` | **1 passed** (full workflow, one session) |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | Conditional Go / No-Go |
| Product | | | Accept F3–F4 / request fixes |
| Ops | | | Staging migrate smoke ☐ |

**Recommendation:** Merge companions after CI green; run staging smoke; ship F1–F2 in a fast follow (or same PR) before broad tenant rollout. F3–F5 should not block a limited staging pilot if product accepts the residual behavior.
