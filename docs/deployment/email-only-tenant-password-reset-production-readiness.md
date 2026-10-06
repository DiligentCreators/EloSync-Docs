# Email-only tenant password reset — Production Readiness

| Field | Value |
|-------|--------|
| **Scope** | Shared-host tenant forgot/reset (`/#/forgot-password`, `/#/reset-password/{token}`) resolve workspace from email like login |
| **Date** | 2026-10-06 |
| **E2E** | Headed Chrome `auth.forgot-reset.workflow.spec.ts` — **passed** (validation → unknown email → known email → reset → sign-in, one session). Auth project: forgot/reset smoke **passed**. |

## Locked scope

Tenant Application password reset on a non-workspace host (`app.elosync.com`). Customer Portal picker flow and Central forgot-password (no workspace) are out of scope except that Central remains email-only.

## Audit report (2026-10-06)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | **High** | `InitializeTenancy` resolved email → tenant only for `tenant.auth.login`. Forgot/reset on the shared SPA returned `workspace_required` | Fixed: email resolution also for `tenant.auth.forgot-password` and `tenant.auth.reset-password` |
| A2 | **High** | Unknown emails without a workspace leaked `workspace_required` (account enumeration) | Fixed: pass-through + generic success when tenancy is not initialized |
| A3 | **High** | Tenant SPA still required a Workspace field when `workspace_host_bound` is false | Removed workspace from tenant forgot/reset pages; POST body is `{ email }` |
| A4 | Med | Reset form kept a stale hidden token after HashRouter navigated to a new `/reset-password/{token}` URL | Sync token/email from route + query; submit uses the current URL token |
| A5 | Med | Playwright `auth` project did not honour `E2E_BROWSER_CHANNEL` (headed Chrome missing bundled Chromium) | Applied the same channel mapping as the `tenant` project |
| A6 | Low | Empty-login e2e submitted Vite DEV-prefilled credentials instead of validating blank fields | `LoginPage.clearCredentials()` before empty submit |
| A7 | Info | Mobile forgot-password required workspace even though login is email-first | Workspace is optional; email alone submits |
| A8 | **High** | Password-reset notifications were `ShouldQueue` on `emails`. Local `QUEUE_CONNECTION=database` had **458** stuck jobs (including resets) with no worker — token created, inbox empty. Central mail provider was also `log` | Fixed: tenant / central / portal reset notifications send **synchronously** in the HTTP request. Ops still need a real mail provider (not `log`) for inbox delivery; other product mail still uses the `emails` queue |
| A9 | **High** | Tenant forgot-password used workspace mail runtime config. Workspaces with custom mail received resets; workspaces on system/unset mail did not | Fixed: `CentralMail::apply()` before tenant/portal reset send so platform auth always uses Central Settings → Mail |

## Verification matrix

| Check | Backend | Frontend | Docs | Mobile |
|-------|---------|----------|------|--------|
| Email-only forgot (known user) sends reset mail | Pass (Pest) | Pass (headed e2e) | Pass | Optional workspace |
| Unknown email generic success, no `workspace_required` | Pass (Pest) | Pass (headed e2e) | Pass | N/A |
| Email-only reset + login after | Pass (Pest) | Pass (headed e2e) | Pass | N/A |
| Client validation (empty / invalid / mismatch) | N/A | Pass (headed e2e) | Pass | N/A |
| No workspace field on shared-host tenant pages | N/A | Pass | Pass | Optional field |
| Reset URL token stays in sync on SPA navigation | N/A | Pass (A4) | Pass | N/A |

## Go-live

1. Deploy Backend (`InitializeTenancy` + synchronous reset notifications + **CentralMail** for tenant/portal forgot-password).
2. Deploy Frontend (email-only forgot/reset + reset token URL sync).
3. Deploy Mobile (optional workspace on forgot-password).
4. Confirm Central **Settings → Mail** is a real provider (SMTP / Postmark / Mailgun), not `log` — forgot-password uses this Central provider for every workspace (not tenant custom mail).
5. Smoke `https://app.elosync.com/#/forgot-password` on a workspace **without** tenant mail configured: submit email; open reset mail from the Central From address; set password; sign in with email only.
6. Confirm Customer Portal `/#/portal/forgot-password` still uses email → company picker (portal emails are not globally unique).

## Pest / Playwright

- `php artisan test --compact tests/Unit/AuthPasswordResetNotificationSyncTest.php tests/Feature/Tenant/Auth/TenantPasswordResetUsesCentralMailTest.php tests/Feature/Tenant/Auth/TenantAuthTest.php tests/Feature/Tenant/Auth/PasswordResetParityTest.php tests/Feature/Tenant/Isolation/TenantIsolationTest.php`
- `E2E_BROWSER_CHANNEL=chrome E2E_BASE_URL=http://localhost:5175 npm run test:e2e:auth:headed` (or the workflow spec alone)
