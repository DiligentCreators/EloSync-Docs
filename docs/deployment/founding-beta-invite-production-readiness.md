# Founding Beta invites — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Status** | **Go for production** after companion CI green + staging smoke |
| **Scope** | Invite-led Founding Beta: Central Accept & send invite, public register with `invite_token`, expired self-serve resend, settings |
| **Branch** | `feature/founding-beta-invite` |
| **Companions** | Backend · Frontend · Docs · marketing `/beta/` resend |

**Companion docs:** [Founding Beta](/product/founding-beta) · [Central API v1](/api/central-v1) · [Authentication](/developer-guide/authentication) · [Deployment authentication](/deployment/authentication) · [Upgrade](/deployment/upgrade#founding-beta-invites) · [Playwright](/developer-guide/playwright) · [Changelog](/changelog/)

---

## Executive summary

Founding Beta access is **invite-led** while public registration stays off:

| Step | Surface |
|------|---------|
| Apply | Marketing `/beta/` → `POST /public/beta-applications` |
| Qualify | Central Beta Applications → **Accept & send invite** |
| Activate | SPA `/#/register?invite=TOKEN` → `POST /public/register-workspace` with `invite_token` |
| Expired | Public resend (non-enumerating; requires a prior invite) or Central **Resend invite** |

Does **not** redesign auth, settings hierarchy, or Sanctum SPA login (platform freeze). Marketing origins must **not** be added to `SANCTUM_STATEFUL_DOMAINS`.

**Go / No-Go:** **Go** — audit residuals **H1–H3**, **M2**, **M4**, **L1**, and **L5** remediated.

| Gate | Result |
|------|--------|
| Hashed invite tokens (SHA-256); raw token only in invite response + encrypted queued mail | **Pass** |
| Email binding on activate | **Pass** |
| Single-use via `activated_at` / `hasActiveInvite()` (hash retained for preview) | **Pass** |
| Public resend requires prior invite (`hasBeenInvited`) | **Pass** |
| `issueInvite` refuses activated applications | **Pass** |
| Invite TTL max **90** days (UI, API validation, runtime clamp) | **Pass** |
| Registration bypass only with valid invite when registration closed | **Pass** |
| Invalid invite + open registration falls back to normal signup | **Pass** |
| Central invite gated by `beta-applications.update` | **Pass** |
| CSRF except `api/central/v1/public/*`; Bearer SPA login unchanged | **Pass** |
| Invite columns not mass-assignable (service `forceFill` only) | **Pass** |
| Pest `FoundingBetaInviteTest` + `BetaApplicationTest` | **Pass** |
| Playwright `test:e2e:beta-applications` | **Pass** |
| Docs product / API / auth / upgrade / changelog / Playwright | **Pass** |

---

## Security summary

| Control | Status |
|---------|--------|
| Token: `Str::random(64)` → store `hash('sha256')`; unique index | Pass |
| Resource omits hash; `$hidden = ['invite_token']` | Pass |
| Preview: invalid / expired / activated without leaking raw token | Pass |
| Activate: case-insensitive email match + active invite | Pass |
| Central `Gate::authorize('update')` on invite | Pass |
| Public resend non-enumerating; no mint for Accepted-never-invited | Pass |
| Queued invite notification implements `ShouldBeEncrypted` | Pass |
| Invite link uses HashRouter fragment (`FrontendUrl::foundingBetaInvite`) | Pass |

### Remediations (closed)

| ID | Item | Resolution |
|----|------|------------|
| **H1** | Public resend minted first invite for Accepted-only | **Remediated** — `hasBeenInvited()` required |
| **H2** | TTL UI/API 365 vs clamp 90 | **Remediated** — max **90** everywhere |
| **H3** | `issueInvite` on activated apps | **Remediated** — 422 validation |
| **M2** | Pest gaps | **Remediated** — extended FoundingBetaInviteTest |
| **M4** | Plain token in queue payload | **Remediated** — `ShouldBeEncrypted` |
| **L1** | Invite columns `$fillable` | **Remediated** — removed; factory `withInvite` uses `forceFill` |
| **L5** | Invalid invite + open registration | **Remediated** — fall back to normal register (email-mismatch still 422) |

### Accepted residual

| ID | Item | Notes |
|----|------|-------|
| **M3** | Playwright skips public resend UI (throttle 5/min) | Covered by Pest; e2e covers Central resend + expired UI |
| **L3** | Preview returns email for known tokens | Acceptable while token stays secret |
| **L4** | Resend can rotate pending invites (5/min) | Intended self-serve recovery |

### Intentional

- Keep hashed token after activation so preview reports `activated=true` (`.ai/rules/central.md`).
- `founding_beta_enabled` controls CTA visibility only, not invite validity.

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest `FoundingBetaInviteTest` | Pass | Issue/hash/preview/resend, H1/H3, TTL max, authz, activated reuse, open-reg fallback |
| Pest `BetaApplicationTest` | Pass | CRUD + permission gates |
| Playwright `npm run test:e2e:beta-applications` | Pass | One Central admin session funnel |

---

## Staging / production smoke

1. `php artisan migrate --force` — migration `2026_08_16_232506_add_founding_beta_invites_to_beta_applications_table` (+ settings `updateOrInsert`).
2. Confirm `FRONTEND_URL` points at the production SPA (invite links).
3. Set `founding_beta_apply_url` (absolute URL) or rely on `MARKETING_URL` + `/beta/`.
4. CORS: allow marketing origin for public apply/resend — **do not** add it to `SANCTUM_STATEFUL_DOMAINS`.
5. Queue: `queue:work --queue=emails` (or include `emails` in the worker list); `APP_KEY` required for encrypted notification payloads.
6. Central Settings: `registration_enabled=false`, `founding_beta_enabled=true`, invite TTL 1–90 days.
7. Smoke: apply → Accept & send invite → inbox/link → register → reopen link → “already activated”.
8. Smoke: Accepted via status Save alone → public resend does **not** email a new invite; use **Accept & send invite**.
9. Smoke expired: expire invite → expired UI → public or Central resend → new link registers.
