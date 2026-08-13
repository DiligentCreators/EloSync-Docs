# Storage Module — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-13 |
| **Status** | **No-Go for production** — Ready for staging with caveats |
| **Scope** | Free `storage` (1 GiB) + packs `storage-10`…`storage-1000` |
| **Branch** | `feature/storage-module-packs-3d4f` |
| **Repos** | Backend [#105](https://github.com/DiligentCreators/SaaS-Backend/pull/105) · Frontend [#103](https://github.com/DiligentCreators/SaaS-Frontend/pull/103) · Docs [#127](https://github.com/DiligentCreators/SaaS-Docs/pull/127) |

---

## Executive summary

Storage quota enforcement, Marketplace packs, Settings usage UI, and Pest coverage are in place and the happy path is verified (headed Playwright + manual walkthrough). **Do not ship to production until cutover, billing, and pending-pack exclusivity are fixed.** Staging is fine for engineering QA.

**Go / No-Go:** **No-Go** for production traffic. **Conditional Go** for staging smoke after gateway product mapping.

| Gate | Result |
|------|--------|
| Backend Pest (`--filter=Storage`) | Pass — 27 tests / 109 assertions (2026-08-13) |
| Frontend unit (`axios.test.ts`) | Pass |
| Headed Playwright `test:e2e:storage` | Pass — validation → install → usage → pack Subscribe |
| Manual headed walkthrough | Pass — Settings shows `0 B / 1.0 GB`, Free 1 GB |
| Grandfather covers all quota surfaces | **Fail** — Team Chat only |
| Pending pack cancel / exclusivity | **Fail** — can soft-lock workspace |
| Stripe/Creem pack price mappings | **Ops required** — not seeded |
| Docs ops completeness (Wasabi `AWS_*`, rollback) | **Gaps** — see below |
| Negative-path e2e (quota / conflict / REQUIRED) | Missing (non-blocking for FE code) |

---

## Product snapshot (as implemented)

| Item | Decision / value |
|------|------------------|
| Free module | `storage` — 1 GiB total allowance |
| Packs (exclusive totals) | 10 / 50 / 100 / 500 / 1000 GiB |
| Monthly prices | $4 / $12 / $20 / $75 / $120 |
| Yearly | ~10× ($40 / $120 / $200 / $750 / $1200) |
| Monetization | Module entitlement metadata (`config/storage.php`) — not metered overage |
| Counted uploads | Team Chat attachments, Feedback screenshots, Lead imports |
| Excluded | Branding logos/favicons, profile avatars (VPS `public` disk) |
| Install model | Free Storage optional (1A); packs hard-depend on `storage` |
| Soft-block codes | `STORAGE_REQUIRED`, `STORAGE_QUOTA_EXCEEDED`, `STORAGE_PACK_CONFLICT` |

---

## Findings

### Blockers (must fix before production)

| ID | Finding | Evidence / impact |
|----|---------|-------------------|
| **B1** | **Grandfather is Team Chat–only.** Feedback + lead imports also call `assertCanStore`. Workspaces without ACTIVE/TRIAL Team Chat get `STORAGE_REQUIRED` on day one for screenshots/imports. | Migration `2026_08_13_220730_*`; `FeedbackService::attachFile`; `ImportManager::upload` |
| **B2** | **Pending pack exclusivity soft-locks.** `assertCanInstallPack` treats `PENDING` as conflicting, but Marketplace `cancel` only finds `ACTIVE`/`TRIAL`. Abandoned checkout on one pack blocks buying another until admin/webhook cleanup. | `WorkspaceStorageService::assertCanInstallPack`; `MarketplaceController::cancel` |
| **B3** | **Paid packs need gateway price mappings.** Checkout fails closed without `PaymentGatewayModulePrice` rows for each pack × monthly/yearly. Not created by Storage migrations. | `BillingEngine` / product mapping; ops must configure Central → Payment Gateways |

### High

| ID | Finding | Notes |
|----|---------|-------|
| **H1** | Pack exclusivity is check-then-act (no DB lock / unique constraint). Concurrent installs can create two active packs; `activePackSlug()` returns first config slug (often the smaller). | Acceptable soft risk at low concurrency; harden before scale |
| **H2** | Test helpers always install `storage` via `installOptionalCrmModules()`, masking production cutover for Feedback/Import suites. | `tests/Helpers.php` |
| **H3** | Deploy docs list `FILESYSTEM_*` but omit full Wasabi/`AWS_*` sample in `deployment/storage.md` / Forge guide. | Ops can miss credentials |
| **H4** | Pack switch path: cancel → allowance drops to free 1 GiB immediately. If used > 1 GiB, uploads soft-block until new pack is active. Undocumented risk. | `allowanceBytes()` |

### Medium

| ID | Finding |
|----|---------|
| **M1** | Soft quota race: `assertCanStore` then write — concurrent uploads can exceed allowance. |
| **M2** | If tenant model lookup fails, chat/feedback/import **skip** quota and upload anyway. |
| **M3** | Soft-deleted storage subscription blocks grandfather (`withTrashed()->exists()`). |
| **M4** | Import error/failed CSVs written after upload without quota check; counted later via remote `size()`. |
| **M5** | Usage API reloads entitlements per pack slug + SUMs + disk stats — fine at v1 scale, watch N+1 later. |
| **M6** | Settings usage not invalidated after chat/import/feedback uploads (stale until refetch). |
| **M7** | Feedback UI does not use `getStorageErrorMessage` (still shows `file`/`attachment` text; skips `code`). |
| **M8** | Playwright does not cover `STORAGE_REQUIRED` / quota exceeded / pack conflict. |
| **M9** | Migrations have empty `down()` — forward-fix only; rollback undocumented. |
| **M10** | Object-storage docs key layout outdated vs real Team Chat / feedback / import paths. |

### Low / info

| ID | Finding |
|----|---------|
| **L1** | `storage.manage` granted to admin/manager but unused on any route/UI (only `storage.view` gates usage). |
| **L2** | Pack label in Settings is `"10 pack"` not `"10 GB pack"`. |
| **L3** | `storageUpgradePath()` helper unused. |
| **L4** | Catalog prices, deps, config bytes, and SPA happy path match product decisions. |
| **L5** | Branding/avatars correctly excluded from quota. |
| **L6** | `tenantSettingService.public()` `skipAuth` fix is correct for anonymous `/register` bootstrap. |

---

## What is production-grade today

- Catalog registration + pack → `storage` hard deps + permission grants for default owner/manager roles
- `WorkspaceStorageService` allowance / used / assert / pack conflict API
- Enforcement wired before store on Team Chat, Feedback, Lead import
- `GET /api/tenant/v1/storage/usage` (`module:storage` + `storage.view`)
- Settings → Storage panel + Marketplace upgrade CTA
- SPA mapping for storage codes on Marketplace, Team Chat, lead import
- Pest feature suite for registration, exclusivity, usage API, workspace math
- Headed e2e happy path (one session: validation → install → usage → Subscribe UI)

---

## Deploy order (when unblocked)

1. **Fix B1–B2 in Backend** (expand grandfather / install free storage for affected workspaces; allow abandon/cancel of `PENDING` packs or auto-expire)
2. Deploy **Backend** migrate `2026_08_13_220700` → `220710` → `220720` → `220730` (**do not** `migrate:rollback` these)
3. Map Stripe/Creem products for all five packs × monthly/yearly (**B3**)
4. Set production env: `FILESYSTEM_UPLOADS_DISK=s3` + full `AWS_*` (Wasabi); keep branding/avatars on `public`
5. Deploy **Frontend**
6. Deploy **Docs**
7. Staging smoke (below) → production

Suggested merge order: **Backend (with B1–B2) → Frontend → Docs**.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | B1: Grandfather/install free Storage for workspaces that already use feedback/imports (or all tenants) | Eng | ☐ |
| 2 | B2: Tenant can abandon/cancel `PENDING` pack (or auto-expire) | Eng | ☐ |
| 3 | B3: Gateway product mapping for `storage-10`…`storage-1000` × monthly/yearly | Ops | ☐ |
| 4 | Migrations applied on staging/prod central DB | Ops | ☐ |
| 5 | Default owner/manager have `storage.view` / `storage.manage`; customized roles reviewed | Ops | ☐ |
| 6 | `FILESYSTEM_UPLOADS_DISK=s3` + Wasabi `AWS_*` verified; branding/avatar stay `public` | Ops | ☐ |
| 7 | Dedicated content bucket (not SQL backups) | Ops | ☐ |
| 8 | Pest Storage suite green in CI | Eng | ☑ local |
| 9 | `npm run test:e2e:storage` green on staging | QA | ☐ |
| 10 | Manual negative paths: no Storage → attach; full quota; second pack while active | QA | ☐ |
| 11 | Pack cancel → interim 1 GiB → buy larger (warn if used > 1 GiB) | QA | ☐ |
| 12 | Draft PRs marked ready and merged in order | Eng | ☐ |

---

## Staging smoke (human)

1. Register workspace → verify email → confirm Settings has **no** Storage tab
2. Marketplace → install free **Storage** → Settings → Storage shows **0 B / 1.0 GB**, Free 1 GB
3. Install Team Chat → attach a small file → usage increases (or stays if tiny)
4. Submit Feedback with screenshot → succeeds with Storage installed
5. Lead import CSV → succeeds with Storage installed
6. Without Storage (fresh workspace): chat/feedback/import attachment → clear install message
7. Open Storage 10 GB → Subscribe → complete test checkout (gateway mapped)
8. Attempt second pack while first active → conflict toast
9. Cancel pack with usage still under 1 GiB → falls back to Free 1 GB
10. Branding logo + avatar upload still work **without** Storage module

---

## Rollback

- Storage migrations are **forward-fix only** (`down()` empty). Do **not** `php artisan migrate:rollback` these four.
- Feature rollback = disable Marketplace installs + revert SPA/API deploys; existing subscriptions remain in DB.
- Quota soft-blocks are upload-time only — no automatic deletion of over-quota objects.

---

## Residual risk (accept or schedule)

| Risk | Accept for v1? | Follow-up |
|------|----------------|-----------|
| Soft concurrent over-quota | Yes at low volume | Lock/reservation if abuse appears |
| Stale Settings usage after uploads | Yes | Invalidate `QUERY_KEYS.storageUsage` |
| Missing negative-path e2e | Yes with manual QA | Add Playwright cases |
| `storage.manage` unused | Yes | Wire later or stop granting |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | ☐ No-Go / ☐ Staging Go / ☐ Prod Go |
| Ops | | | ☐ |
| Product | | | ☐ |

**Current audit decision (2026-08-13):** **No-Go for production** until **B1**, **B2**, and **B3** are closed. Happy-path engineering is solid for continued staging work.

---

## Related

- [Storage production guide](/deployment/storage)
- [Developer Storage](/developer-guide/storage)
- [Object storage](/developer-guide/object-storage)
- [Tenant Storage API](/api/tenant-v1-storage)
- [User Storage overview](/user-guide/storage-overview)
