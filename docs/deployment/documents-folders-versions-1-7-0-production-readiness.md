# Documents nested folders + version history (1.7.0) — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-20 |
| **Status** | **Go for production** — Pest and headed Playwright green |
| **Scope** | Nested folders alongside flat categories; simple file version history on replace (list / download / restore); Storage quota includes version bytes |
| **Catalog** | **documents 1.6.0 → 1.7.0** |
| **Companion** | [Documents overview](/user-guide/documents-overview) · [Documents user guide](/user-guide/documents) · [CHANGELOG](/changelog/) · [baseline Documents readiness](/deployment/documents-production-readiness) |

---

## Executive summary

Documents gain optional nested folders (`document_folders`, max depth 5, optional `documents.folder_id`) while flat categories remain unchanged. Replacing a file archives the previous blob as `document_versions` instead of deleting it. Staff can list, download, and restore prior versions (restore copies to a new path so history stays immutable). Soft-deleted documents exclude current + version bytes from Storage used; force-delete removes all related objects. No new Spatie permissions — folders and versions reuse `documents.*`.

**Go / No-Go:** **Go.** Migrate-only. Do not `db:seed`. Mobile folders/versions remain out of scope for this release.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Folder CRUD, nesting, depth limit, delete blocked with children/docs | **Pass** (Pest) |
| List filter `folder_id` / unfiled; category still works | **Pass** (Pest) |
| Replace archives version; download + restore; force-delete cleans blobs | **Pass** (Pest) |
| Quota includes versions; soft-delete excludes them | **Pass** (Pest) |
| Catalog **documents 1.7.0** | **Pass** (migration bump) |
| Headed one session: validation, shortcut `n`, nested folders, folder filter, replace → version download/restore, trash/restore/force, bulk delete | **Pass** (`npm run test:e2e:documents:headed`, 1 passed) |

## Audit

Reviewed `DocumentFolderService`, `DocumentVersionService`, `DocumentService` replace/restore, `WorkspaceStorageService::usedBytes`, SPA folders dialog / filter / Versions panel, and Playwright workflow on 2026-10-20.

E2e fixes applied during readiness: form field errors vs toast strict-mode; sheet Cancel via `clickCancel`; folder list assertion vs parent select options; explicit `Save & return to list` (string alias mapped to stay); restore waits for API + toast.

Deferred remain: check-in/check-out, in-browser preview, recursive descendant folder filters, mobile folders/versions.

---

## Deploy

1. `php artisan migrate --force` (`document_folders`, `document_versions`, `documents.folder_id`, catalog bump). Do not `db:seed`.
2. Confirm `modules.version` for `documents` is `1.7.0`.
3. Deploy Frontend after production build; hard-refresh SPA.
4. Smoke: create nested folder → assign document → filter; replace file → Versions download/restore; soft-delete → used bytes drop → restore.
