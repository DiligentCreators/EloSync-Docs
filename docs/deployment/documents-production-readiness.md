# Documents Module — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Re-verified** | 2026-08-17 (full open-finding remediation → **1.0.1**) |
| **Status** | **Go for production** after migrate + uploads disk confirmation + Storage-first smoke |
| **Scope** | Free Marketplace opt-in `documents` **1.0.1** (hard dependency on `storage`) |
| **Branch** | `feature/documents-module-mvp-b5f1` |
| **Companion** | [Documents ops](./documents) · [Developer](/developer-guide/documents) · [User](/user-guide/documents) · [API](/api/tenant-v1-documents) |

**PRs:** Backend [#117](https://github.com/DiligentCreators/EloSync-Backend/pull/117) · Frontend [#112](https://github.com/DiligentCreators/EloSync-Frontend/pull/112) · Docs [#138](https://github.com/DiligentCreators/EloSync-Docs/pull/138) · Website [#31](https://github.com/DiligentCreators/EloSync-Website/pull/31)

---

## Executive summary

Documents is a **flat internal file library** (upload, flat categories, download, soft/force delete) on Storage quota. Catalog is **free**, **not** default-included, with a **hard** Storage dependency.

Audit open findings **M2–M4** and **L2** are remediated in **1.0.1**. Notes/timeline/assignment remain intentional MVP deferrals (**L1**).

**Go / No-Go:** **Go** — engineering complete; ops completes migrate-only rollout, object-storage uploads disk, and staging smoke.

| Gate | Result |
|------|--------|
| Catalog: `documents` / operations / **1.0.1** / free / not default | **Pass** |
| Hard dependency Documents → Storage | **Pass** |
| Permissions sync + default role maps | **Pass** (`force.delete` owner-only — intentional) |
| Quota on create / replace / restore | **Pass** |
| Soft-deleted disk lifecycle + trash purge | **Pass** (`TrashPurgeRegistry` + `forceDeleting` disk cleanup) |
| Force delete disk-before-DB | **Pass** (`forceDeleting` hook) |
| Platform audit create/update/delete/restore/force | **Pass** |
| Multipart update via `POST /documents/{id}` | **Pass** |
| Pest `DocumentTest` | **Pass** |
| Playwright headed Documents | **Pass** (prior 1.0.0 session; replace path still POST) |
| Docs + marketing free / available | **Pass** |
| Notes / timeline / assign / nested folders | **Accepted** — deferred MVP (**L1**) |

---

## Remediation log (audit → fix)

| ID | Was | Fix |
|----|-----|-----|
| **H1** | Restore could exceed Storage quota | `assertCanStore` on restore + Pest |
| **M1** | No Pest for file replace | Multipart `POST /documents/{id}` Pest |
| **M2** | Soft-deleted objects linger forever on disk | `Document` (+ category) in `TrashPurgeRegistry`; purge uses workspace `trash.retention_days` |
| **M3** | DB force-delete before disk → orphan objects | `Document::forceDeleting` deletes via `FileUploadService` before row removal (covers API + `trash:purge-expired`) |
| **M4** | No platform audit for restore / force delete | `document_restored` + `document_force_deleted` (Help Desk–style `force` flag) |
| **L2** | True HTTP PUT multipart unreliable | Named `POST documents/{id}` twin (`documents.update.post`); SPA posts FormData without `_method` |
| **D1** | No production-readiness page | This page |

### Accepted / intentional

| Item | Notes |
|------|-------|
| **L1** notes / timeline / assignment | Deferred flat-library MVP |
| `force.delete` not on admin defaults | Owner / custom grant (Assets / Vendors parity) |
| Soft-deleted `show` → not found | Trash list + restore / force remain |
| Concurrent soft over-quota | Check-then-write; Storage class residual |
| Local uploads disk in non-prod | Production must use object storage |

---

## Security summary

| Control | Status |
|---------|--------|
| Tenant isolation | Pass |
| Module gate + Spatie permissions + policies | Pass |
| File validation max 50 MB + mime allow-list | Pass |
| Download authz | Pass |
| Path / disk not in API resources | Pass |
| Trash purge removes objects | Pass |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Document/DocumentTest.php` | **16 passed** (81 assertions) | create/list, categories, CRUD trash, download, quota, restore-over-quota, POST replace, audit restore/force, trash purge + disk, registry |
| `npm run test:e2e:documents:headed` | **Pass** (~47s prior) | Re-run on staging after 1.0.1 |

---

## Deploy order

1. Deploy **Backend** (through `2026_08_17_100005` catalog bump to **1.0.1**)
2. `php artisan migrate --force`
3. Confirm `FILESYSTEM_UPLOADS_DISK` + object-storage credentials
4. Confirm scheduler runs `trash:purge-expired` daily (`onOneServer`)
5. Deploy **Frontend** (multipart update POST)
6. Deploy **Docs** / marketing
7. Staging smoke → production

Suggested merge order: **Backend → Frontend → Docs → Website**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through Documents `100005` applied | Ops | ☐ |
| 2 | Catalog `documents` version **1.0.1**, free, not default | Ops | ☐ |
| 3 | `module_dependencies` Documents → Storage | Ops | ☐ |
| 4 | Uploads disk is object storage | Ops | ☐ |
| 5 | `trash:purge-expired` scheduled | Ops | ☐ |
| 6 | Pest Document suite green in CI | Eng | ☑ |
| 7 | Headed Playwright Documents on staging | QA | ☐ |
| 8 | Storage entitled before Documents install | QA | ☐ |

---

## Staging smoke (human)

1. Install Documents without Storage → blocked
2. Install Storage → Documents → upload / categorize / download
3. Soft delete → used bytes drop → restore → bytes return
4. Soft-delete → fill quota → restore blocked (`STORAGE_QUOTA_EXCEEDED`)
5. Soft-delete → set retention 30 → age `deleted_at` → `trash:purge-expired` removes DB row **and** object
6. Force delete removes object; category delete blocked while docs reference it
7. Multipart replace via `POST /documents/{id}` (no `_method` required)
8. Platform audit: create, soft delete, restore, force delete

---

## Rollback

- Forward-fix only — **do not** `migrate:rollback`
- Feature rollback = revert SPA/API deploys; catalog entitlements may remain

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | ☐ Prod Go |
| Ops (migrate + uploads disk + scheduler) | | | ☐ |
| Product | | | ☐ |

**Current decision (2026-08-17):** **Go** — ship after migrate-only rollout, object-storage confirmation, and staging smoke.
