# Storage Module — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-13 |
| **Re-verified** | 2026-08-13 (remediation pass) |
| **Status** | **Go for production** after gateway pack mappings (ops) |
| **Scope** | Free `storage` (1 GiB) + packs `storage-10`…`storage-1000` |
| **Branch** | `feature/storage-module-packs-3d4f` |
| **Repos** | Backend [#105](https://github.com/DiligentCreators/EloSync-Backend/pull/105) · Frontend [#103](https://github.com/DiligentCreators/EloSync-Frontend/pull/103) · Docs [#127](https://github.com/DiligentCreators/EloSync-Docs/pull/127) |

---

## Executive summary

Audit blockers from the first pass are **remediated in code**. Happy path and negative-path coverage are in place. **Production go** requires ops to map Stripe/Creem prices for all five packs (`php artisan storage:verify-pack-mappings`) and to apply the new grandfather migration.

**Go / No-Go:** **Conditional Go** — engineering ready; block only on gateway product mapping + migrate.

| Gate | Result |
|------|--------|
| Backend Pest (`--filter=Storage`) | Pass — 30 tests (2026-08-13 remediation) |
| Grandfather expands to all existing workspaces + restores soft-deletes | Pass — `StorageGrandfatherService` + migration `233733` |
| Pending pack abandon via Marketplace cancel | Pass — PENDING in cancel query + `can_cancel` |
| Fail-closed tenant lookup on uploads | Pass |
| Pack install row lock | Pass |
| Import reports respect quota | Pass — skip report write when over quota |
| FE feedback storage errors + usage invalidation | Pass |
| `storage:verify-pack-mappings` | Pass — command available for ops |
| Headed Playwright Storage e2e (incl. STORAGE_REQUIRED import) | ☐ Run on staging |
| Stripe/Creem pack mappings | ☐ Ops |

---

## Remediation log (audit → fix)

| ID | Was | Fix |
|----|-----|-----|
| **B1** | Team Chat–only grandfather | `StorageGrandfatherService` installs/restores free Storage for **all** existing tenants (`2026_08_13_233733_*`) |
| **B2** | PENDING packs blocked cancel | Marketplace cancel includes `PENDING`; `can_cancel` true for pending checkout |
| **B3** | Unmapped packs fail closed | `php artisan storage:verify-pack-mappings` + deploy docs; ops maps products |
| **H1** | Pack exclusivity race | `lockForUpdate` on pack rows inside install transaction |
| **H3/H4** | Docs gaps | Wasabi `AWS_*`, pack-switch warning, migrate order |
| **M2** | Skip quota if tenant missing | `requireTenant()` fail-closed |
| **M3** | Soft-deleted blocked grandfather | Restore + reactivate |
| **M4** | Import reports over quota | Assert before put; skip report if over |
| **M5** | Usage N+1 entitlements | Single `entitledSlugs` pass in `usageSummary` |
| **M6/M7** | Stale usage / feedback mapper | Invalidate `storageUsage`; `getStorageErrorMessage` in feedback |
| **M8** | No STORAGE_REQUIRED e2e | Lead import before Storage install in Playwright |
| **M10** | Wrong object key layout | Updated `object-storage.md` |
| **L2/L3** | Pack label / unused helper | `"10 GB pack"`; `getStorageErrorToastMessage` uses upgrade hint |

### Residual (accepted for v1)

| Risk | Notes |
|------|-------|
| Soft concurrent over-quota | Check-then-write; acceptable at low volume |
| Soft quota on chat attach race | Same |
| Gateway mappings | Ops prerequisite — command fails closed if missing |

---

## Deploy order

1. Deploy **Backend** (includes `233733` grandfather + pending cancel + verify command)
2. Run `php artisan migrate --force`
3. Run `php artisan storage:verify-pack-mappings` — **must exit 0**
4. Confirm `FILESYSTEM_UPLOADS_DISK=s3` + full `AWS_*`; branding/avatars stay `public`
5. Deploy **Frontend**
6. Deploy **Docs**
7. Staging smoke → production

Suggested merge order: **Backend → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `233733` applied | Ops | ☐ |
| 2 | `storage:verify-pack-mappings` exits 0 on active gateway | Ops | ☐ |
| 3 | Existing tenants without Storage now have free Storage entitled | Ops | ☐ |
| 4 | Abandon pending pack in Marketplace, then Subscribe another size | QA | ☐ |
| 5 | New workspace: import without Storage → install message; then install Storage | QA | ☐ |
| 6 | Feedback screenshot + chat attach after Storage | QA | ☐ |
| 7 | Pack cancel with used ≤ 1 GiB falls back to Free 1 GB | QA | ☐ |
| 8 | Branding/avatar still work without Storage | QA | ☐ |
| 9 | Pest Storage suite green in CI | Eng | ☑ |
| 10 | `npm run test:e2e:storage` on staging | QA | ☐ |

---

## Staging smoke (human)

1. New workspace → Leads Import CSV → toast/error mentions installing Storage
2. Marketplace → install free Storage → Settings → Storage `0 B / 1.0 GB`
3. Start Storage 10 Subscribe then cancel pending → can open Storage 50
4. Chat attach + feedback screenshot succeed; usage refreshes
5. Complete real/test checkout for one pack (gateway mapped)

---

## Rollback

- Forward-fix only for Storage migrations — **do not** `migrate:rollback`
- Feature rollback = revert SPA/API deploys; entitlements remain

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | ☐ Prod Go |
| Ops (gateway mappings) | | | ☐ |
| Product | | | ☐ |

**Current decision (2026-08-13 remediation):** **Conditional Go** — ship after `storage:verify-pack-mappings` passes on the production gateway.

---

## Related

- [Storage production guide](/deployment/storage)
- [Developer Storage](/developer-guide/storage)
- [Object storage](/developer-guide/object-storage)
- [Tenant Storage API](/api/tenant-v1-storage)
