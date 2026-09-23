# Contracts 1.7.0 — Accept Evidence Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-24 |
| **Status** | **Go** — migrate + SPA; signature/ID toggles hard-gated on Storage |
| **Scope** | Tenant Contracts module `contracts` **1.6.0 → 1.7.0** (optional phone / signature image / ID document on public accept) |
| **Companion** | [Contracts production](./contracts) · [1.1.0 readiness](./contracts-production-readiness) · [Storage readiness](./storage-production-readiness) · [Developer](/developer-guide/contracts) · [User](/user-guide/contracts) · [API](/api/tenant-v1-contracts) · [Tenant settings](/user-guide/tenant-settings) · [CHANGELOG](/changelog/) |

Additive MINOR on the existing contracts module. No new permissions, queues, scheduler entries, or env vars. Evidence toggles default **off** — workspaces that never change Settings keep the 1.5.0 name/email/IP accept path.

This audit is **Contracts 1.7.0 accept evidence only**. Prior Contracts readiness pages remain valid for their scopes.

---

## Executive summary

Public contract accept (`/#/accept/contracts/{token}`) can require **phone**, a **drawn or uploaded signature image**, and/or a **national ID / passport / other** upload. Each requirement is an independent Settings → General boolean. Signatures and ID files store on the private uploads disk under tenant-scoped paths; staff download via authenticated `contracts.view` endpoints (timeline-audited). IP and user agent are always recorded on accept. Accepted contracts embed signer metadata and the signature image on the branded PDF (ID files remain download-only).

| Gate | Result |
|------|--------|
| Catalog `1.7.0` migrate-only (no `db:seed`) | **Pass** |
| Evidence columns additive + nullable | **Pass** |
| Settings toggles default off | **Pass** |
| Public accept throttle `contract-acceptance` | **Pass** |
| Token hashed; cleared on accept / terminate | **Pass** |
| Uploads private disk; paths omitted from list/show JSON | **Pass** |
| Staff downloads gated `module:contracts` + `can:contracts.view` | **Pass** |
| Workspace upload validation (size/MIME) via `ValidatesWorkspaceUploads` | **Pass** |
| Storage entitlement required to enable signature/ID settings (API + SPA) | **Pass** |
| Orphan files cleaned if accept txn fails after `store()` | **Pass** |
| Force-delete purges signature/ID files; soft-delete retains | **Pass** |
| Download audit on contract timeline | **Pass** |
| PDF embeds signature image + acceptance block | **Pass** |
| Empty stub migration `2026_09_23_210611_…` | **Pass** — not shipped |
| Pest `ContractAcceptanceTest` | **Pass** |
| Playwright `e2e/tests/contracts` | **Pass** |
| Docs + upgrade + this page | **Pass** |

**Go / No-Go:** **Go** after companion CI and `php artisan migrate --force` **before** the SPA that posts evidence multipart / Settings toggles.

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| F1 | High | **Fixed** | Empty stub migration duplicated evidence filename intent | Deleted; only `2026_09_24_020619_…` ships |
| F2 | Medium | **Fixed** | Settings allowed signature/ID without Storage | API rejects enabling those keys without Storage; SPA disables switches + copy |
| F3 | Low | **Fixed** | Orphan private files if accept txn failed after store | Track paths and delete in `finally` when txn does not commit |
| F4 | Medium | **Fixed** | ID/signature PII had no purge or download audit | Force-delete purges files; soft-delete retains; downloads record `acceptance_evidence_downloaded` |
| F5 | Low | **Fixed** | PDF lacked signature image | Acceptance block + signature data URI on PDF; ID stays download-only |
| F6 | Low | **Fixed** | Ops docs lagged version / upgrade / readiness | This page + contracts ops + [Upgrade](/deployment/upgrade) |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No new permissions | Reuse `contracts.view` for downloads; public accept remains token-gated |
| Defaults off | Phone / signature / ID requirements are opt-in per workspace |
| ID not embedded in PDF | Full ID images stay on authenticated download only |
| Soft-delete keeps evidence | Restore must recover files; permanent delete is the purge boundary |
| Quotation accept parity | Only URL/`workspace=` tenancy fix; quotation does not gain evidence fields |
| Catalog bump ≠ auto-install | Workspaces that never entitled Contracts are unchanged |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Contract/ContractAcceptanceTest.php` | Required green | Link issue, basic accept, expired token, email link, terminate clears token, PDF, evidence + downloads + purge + Storage settings gate |
| `npm run test:e2e:contracts` | Required green | Workflow activate + `contracts.accept-evidence` |

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs)
2. **Backend** — `php artisan migrate --force` (`2026_09_24_020619_add_contract_acceptance_evidence_fields_to_contracts_table` + catalog bump `1.7.0`)
3. Confirm catalog `contracts` version `1.7.0` (no `db:seed`)
4. Confirm **only** the `2026_09_24_020619_…` evidence migration ships
5. **SPA** — Settings soft-gate + guest accept evidence UI + record download actions
6. **Docs**
7. Staging smoke below before production traffic

Suggested merge: **Backend → Frontend → Docs**. Do **not** `db:seed`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Pest `ContractAcceptanceTest` green in CI | Eng | ☐ |
| 2 | Playwright `test:e2e:contracts` green | QA | ☐ |
| 3 | Migration `2026_09_24_020619_…` applied; no empty stub in release | Ops | ☐ |
| 4 | Catalog `contracts` version `1.7.0` | Ops | ☐ |
| 5 | SPA deployed **after** migrate | Ops | ☐ |
| 6 | Staging smoke signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → Opportunities, Contracts (free). Optionally install **Storage** before testing file evidence.
2. Settings → General → without Storage, signature/ID switches are disabled; enabling via API returns 422. Phone toggle still works.
3. Install Storage → enable all three toggles → send contract → public accept incomplete → validation; complete with phone + draw/upload + ID → Active.
4. Contract view: phone, IP, Download signature / ID → timeline shows download events.
5. **Download PDF** shows acceptance block + signature image (not the ID file).
6. Soft-delete → files still downloadable after restore; force-delete → signature/ID objects gone.
7. Confirm JSON show does **not** expose storage paths.

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (evidence UI disappears; columns remain) |
| Backend code | Redeploy previous release; keep additive migrations |
| Settings | Turn all three `contracts.acceptance_require_*` toggles **off** |
| Module disable | Marketplace uninstall Contracts (rows retained) |
| Schema | Do **not** drop evidence columns in prod without a data / PII plan |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | Go / No-Go |
| QA | | | |
| Ops | | | |
