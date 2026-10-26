# Announcements 1.3.0 — Production Readiness

| Field | Value |
|-------|--------|
| **Scope** | Multi-audience announcements (staff / customer portal / vendor-reserved) + portal delivery — catalog **announcements 1.2.0 → 1.3.0**, **customer-portal 1.4.0 → 1.5.0** |
| **Date** | 2026-10-26 |
| **E2E** | `npx playwright test e2e/tests/announcements --project=tenant --headed --workers=1` — **2/2 passed** (multi-audience headed one-session + publish/mark-read workflow with peek → Open full page) |
| **Pest** | `AnnouncementTest` + `PortalAnnouncementTest` (incl. bearer-only tenancy) — **passed** |

## Locked scope

Staff CRUD remains under `module:announcements`. Each announcement has `visible_to_staff`, `visible_to_customer_portal`, and `visible_to_vendor_portal` (vendor delivery deferred with Vendor Portal). Customer portal lists only published, non-expired, customer-audience rows via `/portal/announcements` with soft entitlement on `announcements`. Portal read receipts use `announcement_portal_reads`.

## Audit report (2026-10-26)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | **High** | `InitializeTenancy::resolveFromBearerToken` only accepted `User` tokenables. Portal SPA shared-host calls send Bearer without `X-Tenant-Domain` → `workspace_required` / empty portal announcements | Fixed: also resolve `PortalUser.tenant_id`. Pest: bearer-only portal list. Portal axios still sends workspace when known. |
| A2 | Med | No headed Playwright coverage for audience toggles / portal delivery | Added `announcements.audiences.headed.spec.ts` (validation, staff vs customer audiences, invite, portal list/view/mark-read, staff-only 404) + `test:e2e:announcements:headed` |
| A3 | Med | Portal `openAnnouncements` / invite session fragile across full `page.goto` | Hardened portal page object (wait for accept-invite response, token poll, re-login, nav click) |
| A4 | Low | CatalogSeeder companion still asserted customer-portal **1.2.0** | Updated to **1.5.0** / announcements **1.3.0** |
| A5 | Info | Vendor portal flag reserved; no `/vendor/*` routes invented | Documented; staff UI gated on `vendor-portal` module; notify job no-ops vendor fan-out |
| A6 | Med | Legacy workflow e2e used `dismissInboxIfOpen` (mark-read) before asserting `dashboard-announcements`, so the card never appeared | Fixed: `closeInboxWithoutMarkingRead` before dashboard unread asserts; full announcements headed suite green |

## Verification matrix

| Check | Backend | Frontend | Docs |
|-------|---------|----------|------|
| Audience columns + backfill staff=true | Pass | Pass (form/list badges) | Pass |
| Staff inbox/unread/notify filter `visible_to_staff` | Pass (Pest) | Pass (e2e) | Pass |
| Portal list/show/mark-read + soft `announcements` | Pass (Pest) | Pass (e2e) | Pass |
| Bearer-only portal tenancy (no X-Tenant-Domain) | Pass (Pest A1) | Pass (SPA) | Pass |
| At-least-one audience + module coerce | Pass (Pest) | Pass (e2e validation) | Pass |
| Vendor-only excluded from staff consumers | Pass (Pest) | N/A (module absent) | Pass |
| Catalog bumps 1.3.0 / 1.5.0 | Pass | N/A | Pass |
| Human e2e headed one-session | N/A | **2/2** | Pass |

## Go-live

1. Deploy Backend and run `php artisan migrate --force` (`2026_10_26_041500_*`, `2026_10_26_043000_*` — **do not** `db:seed`)
2. Confirm catalog: announcements **1.3.0**, customer-portal **1.5.0**
3. Deploy Frontend (staff audience toggles + portal Announcements + portal axios workspace header)
4. Ensure target workspaces that need portal announcements have **Announcements** and **Customer Portal** entitled
5. Smoke: publish staff-only + customer-only → staff inbox vs portal list; portal mark-read; queue workers for publish fan-out

## Pest / Playwright

- Backend: `tests/Feature/Tenant/Announcement/AnnouncementTest.php`, `tests/Feature/Tenant/CustomerPortal/PortalAnnouncementTest.php`
- Frontend: `npm run test:e2e:announcements` / `:headed` (set `E2E_BROWSER_CHANNEL=chrome` when bundled Chromium is unavailable; start Vite if `E2E_SKIP_WEBSERVER=1`)
