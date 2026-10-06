# Customer Portal 1.0.0 — Production Readiness

| Field | Value |
|-------|--------|
| **Scope** | Marketplace module `customer-portal` **1.0.0** + Help Desk note `portal_user_id` (**1.12.0 → 1.13.0**) |
| **Date** | 2026-10-06 |
| **E2E** | `test:e2e:customer-portal` — **3/3 passed** (smoke + full human workflow) |

## Locked scope

Invite-only Contact portal accounts (email/password), separate `portal-api` guard, staff invite/manage UI, customer SPA for invoices/payments/quotations/contracts/Help Desk. Projects/tasks, magic-link login, public KB, Vendor Portal out of scope.

## Audit report (2026-10-06)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | **High** | Portal login/accept did not persist workspace domain; after navigate away from `?workspace=`, `X-Tenant-Domain` was missing → 401 on document APIs | Fixed: `portalWorkspaceStorage` (`dc_saas_portal_workspace`) set on login/accept; axios reads it first; cleared on logout |
| A2 | Med | Playwright `tenant` project omitted `customer-portal` `testMatch` | Added to `playwright.config.ts` |
| A3 | Med | Smoke/workflow needed `video: 'off'` (ffmpeg missing in some agents) | Top-level `test.use({ video: 'off', … })` |
| A4 | Low | Contract create in e2e omitted required `start_date` | Fixed in workflow seed |
| A5 | Info | Invite tokens are hash-only (no plaintext in API) | E2E plants known token via `runBackendTinker` after real invite |

## Verification matrix

| Check | Backend | Frontend | Docs |
|-------|---------|----------|------|
| Catalog free Operations + contacts hard dep | Pass | Pass (Marketplace) | Pass |
| PortalUser invite / accept / login / disable | Pass (Pest) | Pass (e2e) | Pass |
| PortalRecordScope + PDF services | Pass (Pest) | Pass (e2e lists) | Pass |
| Help Desk stamp contact + portal_user_id notes | Pass (Pest) | Pass (e2e) | Pass |
| Soft module 403 / hidden sections | Pass | Pass | Pass |
| Isolated portal auth + workspace storage | N/A | Pass (A1 fix) | Pass |
| Human e2e: validation + invite + docs + support | N/A | **3/3** | Pass |

## Go-live

1. Migrate Backend (customer-portal + help-desk 1.13.0)
2. Deploy Frontend (includes portal workspace persistence)
3. Install Contacts → Customer Portal on target workspace
4. Invite one Contact end-to-end on a non-tenant-bound SPA host (workspace field / `?workspace=`)
5. Confirm Vendor Portal remains unshipped

## Pest / Playwright

- `tests/Feature/Tenant/CustomerPortal/*` + catalog seeder / help-desk 1.13.0 bump
- `npm run test:e2e:customer-portal` (set `E2E_BROWSER_CHANNEL=chrome` when bundled Chromium is unavailable)
