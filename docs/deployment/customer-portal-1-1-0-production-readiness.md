# Customer Portal 1.1.0 — Production Readiness

| Field | Value |
|-------|--------|
| **Scope** | Portal shared projects/tasks visibility — catalog **customer-portal 1.0.0 → 1.1.0**, **projects 1.8.0 → 1.9.0**, **tasks 1.8.0 → 1.9.0** |
| **Date** | 2026-10-07 |
| **E2E** | `npm run test:e2e:customer-portal:headed` — **3/3 passed** (smoke + full human workflow with projects) |
| **Pest** | `PortalProjectsTest` + catalog bump companions — **passed** |

## Locked scope

Invite-only Contact portal accounts continue as in **1.0.0**. Additive: staff can **Share with customer portal** on a Contact/Company-linked project; tasks stay internal unless **Visible to customer**. Portal SPA gains Projects list/detail (milestones, customer-visible tasks, filtered timeline). Magic-link login, public KB, portal 2FA, online checkout remain out of scope.

## Audit report (2026-10-07)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | **High** | Portal logout navigated to `/portal/login` without `?workspace=` after clearing workspace storage → shared-host re-login could hit tenant-less 400 / missing error UX | Fixed: capture workspace before `clearSession()`, navigate to login with `?workspace=` |
| A2 | Med | No Playwright coverage for portal projects/tasks gates | Extended `customer-portal.workflow.spec.ts` (staff share toggle validation, visible/internal tasks, portal list/detail/timeline) + `test:e2e:customer-portal:headed` |
| A3 | Med | Wrong-password toast overlay blocked the next Sign in click in headed runs | `submitLogin` uses `{ force: true }`; `expectLoginError` waits for toast clear |
| A4 | Low | Timeline section is `CardTitle` (not heading role) — brittle `getByRole('heading')` | Assert `[data-record-section="Timeline"]` |
| A5 | Info | Two-gate model (`portal_visible` + `visible_to_portal`) prevents accidental company-wide leaks | Documented + Pest + e2e; unshare clears task flags |

## Verification matrix

| Check | Backend | Frontend | Docs |
|-------|---------|----------|------|
| Migrations `portal_visible` / `visible_to_portal` + catalog bumps | Pass | N/A | Pass |
| PortalRecordScope + `portal_visible` list/show | Pass (Pest) | Pass (e2e) | Pass |
| Task `visible_to_portal` requires shared project | Pass (Pest) | Pass (e2e API 422) | Pass |
| Customer-safe timeline filter | Pass (Pest) | Pass (e2e) | Pass |
| Soft module 403 for `projects` / `tasks` | Pass (Pest) | Pass (nav probe) | Pass |
| Staff toggles (share / visible) | Pass (API) | Pass (e2e UI) | Pass |
| Logout preserves workspace for shared host | N/A | Pass (A1) | Pass |
| Human e2e: validation + invite + projects + docs + support | N/A | **3/3** headed | Pass |

## Go-live

1. Deploy Backend and run `php artisan migrate --force` (`2026_10_07_135903_*`, `2026_10_07_135905_*` — catalog bumps; **do not** `db:seed`)
2. Deploy Frontend (portal Projects pages + logout workspace preserve + staff toggles)
3. Ensure target workspace has **Contacts**, **Customer Portal**, and optionally **Projects** / **Tasks** entitled
4. Staff: link Contact/Company → Share project → mark selected tasks Visible to customer → invite portal user
5. Confirm portal customer sees only shared projects and customer-visible tasks

## Pest / Playwright

- Backend: `tests/Feature/Tenant/CustomerPortal/PortalProjectsTest.php`, `CustomerPortalProjectsPortalVisibilityBumpTest.php`
- Frontend: `npm run test:e2e:customer-portal` / `:headed` (set `E2E_BROWSER_CHANNEL=chrome` when bundled Chromium is unavailable)
