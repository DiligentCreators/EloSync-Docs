# Operator notification mailbox — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-20 |
| **Status** | **Go for production** — feature Pest **9/9**; headed Playwright **1/1** (plus central login setup) |
| **Scope** | Central setting `ops_notification_email` emails operators for new feedback, beta applications, and self-service workspace signups |
| **Catalog** | No bump |
| **Companion** | [Central settings user guide](/user-guide/central-settings) · [Central settings developer guide](/developer-guide/central-settings) · [Central feedback](/developer-guide/central-feedback-system) · [Central API](/api/central-v1) · [CHANGELOG](/changelog/) |

---

## Executive summary

Operators choose one mailbox under **Central Settings → Mail**. When it is set, EloSync queues mail after a workspace submits feedback (any type; critical bugs use a critical subject), after a public beta application is stored, and after a self-service workspace signup commits. A blank address sends none of those. Superadmin users are not recipients. Workspaces created by a Central admin do not send this mail. Public `support_email` is unchanged.

**Go / No-Go:** **Go.** Deploy Backend and Frontend together. No migrate. Set the mailbox after deploy or these three alerts stay off.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — existing Central settings form and notification mail |
| Setting stored and omitted from public bootstrap | **Pass** (Pest) |
| Feedback, beta application, and self-service signup mail the mailbox | **Pass** (Pest) |
| Blank mailbox and admin-created workspaces send nothing | **Pass** (Pest) |
| Superadmin user is not a recipient | **Pass** (Pest) |
| Invalid email shows field error and toast; valid save, clear, and restore | **Pass** (headed Playwright, one login) |

---

## Security summary

| Control | Status |
|---------|--------|
| Setting update still requires `system-settings.update` | Pass |
| Address is not included in the public bootstrap payload | Pass |
| Mail is on-demand to the configured address, not fanned out to Central users | Pass |
| No new permission | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | Medium | Central Playwright setup launched missing bundled Chromium even when `E2E_BROWSER_CHANNEL=chrome` | **Fixed** — setup and chromium projects use the same channel as tenant |
| **F2** | Low | Shared e2e admin had two-factor enabled, so API login returned no token | **Fixed for this run** — `php scripts/reset-e2e-central-admin.php` (existing e2e helper). Re-run it if a two-factor spec leaves 2FA on |
| **I1** | Info | Invalid operator email shows both the field error and a toast | **Accepted** — same pattern as other Central settings validation |

---

## Headed browser coverage

`npm run test:e2e:ops-notification:headed` on 2026-10-20. Result: **2 passed** (central login setup + one serial session).

One central login, one page session:

1. Open **Settings → Mail** and confirm the operator email field and helper text
2. Enter `not-an-email`, save → field error **Enter a valid operator email** and the same toast; settings are not saved
3. Enter a valid address, save, reload → value persists
4. Clear the field, save, reload → blank
5. Restore the address that was there before the test

---

## Upgrade

1. Deploy Backend (no migrate). The key is created when settings are seeded or when an admin saves it.
2. Deploy Frontend SPA and hard-refresh.
3. Open **Settings → Mail** and set **Operator notification email**, or leave it blank.
4. Smoke: save an invalid address (error, no success toast), then a valid address, reload, and confirm it stuck.
