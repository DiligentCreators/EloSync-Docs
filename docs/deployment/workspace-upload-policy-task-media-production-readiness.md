# Workspace upload policy + Task media — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-09 |
| **Status** | **Go** — engineering complete (incl. authz/isolation Pest + mid-batch store rollback); Ops migrate + staging smoke before production traffic |
| **Scope** | Tenant `storage.upload_policy` (types + per-category max sizes) · shared enforcement on content uploads · Task + task-note multi-file attachments · SPA Upload limits + `useUploadPolicy` |
| **Catalog** | **storage → 1.1.0** · **tasks → 1.4.0** |
| **Companion** | [Storage production readiness](./storage-production-readiness) · [Storage ops](./storage) · [Developer storage](/developer-guide/storage) · [Tasks user guide](/user-guide/tasks) |

---

## Executive summary

This delivery adds a **workspace-wide upload policy** (Settings → Storage → Upload limits) and **ClickUp-style task media** (record + note attachments on the uploads disk with quota accounting).

- Setting key `storage.upload_policy` with platform caps in `config/storage.php`
- `WorkspaceUploadPolicy` + `ValidatesWorkspaceUploads` on Chat, Expenses, Help Desk, Documents, Feedback, Knowledge Base, Lead imports, WhatsApp, and Tasks
- Tables `task_attachments` / `task_note_attachments`; auth’d download/delete; bytes in `WorkspaceStorageService::usedBytes`
- SPA: Upload limits UI (`storage.manage` + `settings.update`); `useUploadPolicy` accept + client checks across content upload surfaces
- Batch quota: task multi-file attach asserts **sum of all files** against remaining allowance before any store
- Mid-batch store failure rolls back written objects + DB rows before rethrowing
- Settings `updateMany` resolves the admin catalog **outside** the write transaction (avoids PHP 30s timeouts)
- One-session Playwright human flow (`npm run test:e2e:upload-policy`); Pest policy + task attachment suites (incl. `storage.manage` 403 + cross-tenant download/delete)

**Go / No-Go:** **Go** — ship after companion CI green; Ops migrate catalog bumps and complete staging smoke. Mobile task media remains **deferred** (accepted for this release).

| Gate | Result |
|------|--------|
| Migrations `040000` attachments + `040100` catalog bumps | **Pass** |
| Catalog DB `storage` **1.1.0** / `tasks` **1.4.0** | **Pass** |
| `CatalogSeeder` versions aligned | **Pass** |
| Policy write gated (`settings.update` + `storage.manage`) | **Pass** (+ Pest 403 without `storage.manage`) |
| Cross-surface BE validation | **Pass** (FormRequests) |
| Task attach policies + private disk (`public: false`) | **Pass** (+ Pest cross-tenant 404) |
| Batch quota assert (multi-file) | **Pass** (Pest) |
| Mid-batch store rollback | **Pass** (Pest) |
| FE Upload limits + `useUploadPolicy` surfaces | **Pass** |
| Pest `WorkspaceUploadPolicyTest` + `TaskAttachmentTest` | **Pass** (local 2026-09-09, 14 tests) |
| Playwright `test:e2e:upload-policy` | **Pass** (local 2026-09-09, ~4.5m) |
| Docs user/API/changelog + this readiness page | **Pass** |
| Mobile task attachments / upload-policy UI | **Deferred** (Product-accepted) |
| Soft concurrent over-quota (cross-request race) | Accepted residual (same as Storage v1) |
| Content malware scan | Accepted residual (extension allowlist) |

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_09_040000_create_task_attachments_tables` | `task_attachments` + `task_note_attachments` |
| `2026_09_09_040100_bump_tasks_and_storage_module_versions_for_upload_policy` | **storage → 1.1.0**, **tasks → 1.4.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade. Fresh local/CI seed uses `CatalogSeeder` versions aligned to these bumps.

---

## Deploy order

1. Deploy **Backend**
2. `php artisan migrate --force` (through `040100`)
3. Confirm central catalog `storage.version` = **1.1.0**, `tasks.version` = **1.4.0**
4. Confirm `FILESYSTEM_UPLOADS_DISK` / object storage (existing Storage runbook) — task objects under `tenants/{uuid}/tasks/`
5. Deploy **SPA**
6. Deploy **Docs**
7. Staging smoke below

Suggested merge order: **Backend → Frontend → Docs**.

No new env vars or queue workers. Uploads remain synchronous.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `040100` applied | Ops | ☐ |
| 2 | Catalog `storage` = **1.1.0**, `tasks` = **1.4.0** | Ops | ☐ |
| 3 | Settings → Storage shows **Upload limits**; save requires `storage.manage` | QA | ☐ |
| 4 | Task create with 2 images → view shows both; download works; delete removes object | QA | ☐ |
| 5 | Comment with note attachment; download works | QA | ☐ |
| 6 | Rejected type (e.g. `.exe`) blocked client-side on Tasks / Documents / Expenses | QA | ☐ |
| 7 | Documents Office-style types still upload when enabled in policy | QA | ☐ |
| 8 | Storage quota still blocks oversize / over-allowance uploads | QA | ☐ |
| 9 | Pest Storage + Task attachment suites green in CI | Eng | ☐ |
| 10 | Playwright `npm run test:e2e:upload-policy` green | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace → Storage installed (or already entitled)
2. Settings → Storage → set max image **0.1 MB**, uncheck **GIF**, **Save upload limits**
3. Tasks → New (full page) → empty title validation → attach `.exe` (rejected) → attach small PNG + TXT → **Create & View** → files listed
4. Add comment with TXT attachment
5. Documents → reject `.exe` → upload `.txt` / Office type allowed by policy
6. Expenses / Help Desk create → reject `.exe`, accept allowed image/text
7. Restore Upload limits to defaults (or leave documented test values)

---

## Audit findings → remediation

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| H1 | High | Multi-file `assertCanStore` per file could overshoot quota | **Fixed** — batch byte sum before store (`TaskService::attachFiles` / `attachNoteFiles`) + Pest |
| H2 | High | Settings `PUT` double `forAdminApi` / in-transaction catalog walk → PHP 30s | **Fixed** — single resolve outside write transaction |
| M1 | Medium | `CatalogSeeder` missing bump versions | **Fixed** — `tasks` **1.4.0**, `storage` **1.1.0** |
| M2 | Medium | Developer tasks guide still cited **1.2.0** | **Fixed** in this ship |
| M3 | Medium | Thin Pest on `storage.manage` 403 / cross-tenant download | **Fixed** — Pest 403 + cross-tenant download/delete 404 (task + note) |
| M4 | Medium | Mid-batch attach could leave orphan objects | **Fixed** — `storeAttachmentBatch` deletes paths/rows on failure + Pest |
| L1 | Low | Lead import `accept` fixed to csv/txt/xlsx | Intentional; size/type still via policy |
| I1 | Info | Mobile deferred | Accepted for this release — release notes |
| I2 | Info | Extension allowlist (no content virus scan) | Accepted SaaS posture |
| I3 | Info | Soft cross-request quota race | Same as Storage v1 |

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (Upload limits UI + task media disappear; older clients ignore new fields) |
| Backend code | Redeploy previous release; catalog version may remain **1.1.0** / **1.4.0** (display-only) |
| Schema | Forward-fix preferred — **do not** `migrate:rollback` in production; attachment tables are additive |
| Policy setting | Rows in `tenant_settings` for `storage.upload_policy` can remain; unused without new code |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | 2026-09-09 | ☑ **Go** (CI green + Ops smoke still required before traffic) |
| Ops | | | ☐ Migrate + catalog confirm + staging smoke |
| Product | | | ☑ Mobile deferred accepted for this release |

**Current decision (2026-09-09):** **Go** — engineering residuals from the audit are closed; merge after companion CI green; Ops migrate through `040100` and complete staging smoke before production traffic. Mobile task media remains out of scope.

---

## Related

- [Storage production readiness](./storage-production-readiness) (packs / grandfather / gateway)
- [Storage production guide](./storage)
- [Developer Storage](/developer-guide/storage)
- [Developer Tasks](/developer-guide/tasks)
- [Object storage](/developer-guide/object-storage)
- [Tenant Storage API](/api/tenant-v1-storage)
- [Tenant Tasks API](/api/tenant-v1-tasks)
- [Changelog](/changelog/)
