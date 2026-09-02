# User Security Settings — Production Readiness

Audit date: **2026-09-02** · Branch: `feature/user-security-settings`

## Verdict

**Production-ready** after remediation in this branch. Ship Backend, Frontend, and Docs together; run migrations before enabling the SPA login 2FA step.

## Scope

| Capability | Central | Tenant | UI |
|------------|---------|--------|-----|
| Active browser sessions | ✅ | ✅ | Profile → Security |
| TOTP two-factor authentication | ✅ | ✅ | Profile → Security + login challenge |
| Passkeys (WebAuthn) | ✅ | ✅ | Profile → Security + login button |
| Password change + revoke other sessions | ✅ | ✅ | Profile → Security |

## Audit summary

### Resolved (this branch)

| Severity | Issue | Fix |
|----------|-------|-----|
| Critical | Parallel Fortify web auth routes (`POST /login`, `/two-factor-challenge`, `/user/passkeys`, …) | `Fortify::ignoreRoutes()` in `AppServiceProvider::register()` |
| Critical | Login audit / `markLoggedIn` / attendance before 2FA completed | Deferred until after 2FA gate or challenge completion |
| High | Tenant 2FA challenge missing workspace binding | `TwoFactorService::assertTenantChallenge()` + user `tenant_id` check |
| High | `config/passkeys.php` unsafe `env()` at load + missing prod defaults | Config-cache-safe file + boot-time RP ID / origins resolution |
| High | Missing `PASSKEYS_*` in `.env.example` | Documented with examples |
| Medium | 2FA disable allowed with password only | Requires authentication or recovery code |
| Medium | No throttle on password-gated security mutations | `throttle:auth-sensitive` (10/min per user) on `/me/two-factor*`, `/me/passkeys*`, change-password |
| Medium | Recovery code regeneration not audited | `two_factor_recovery_codes_regenerated` audit event |
| Frontend | Weak client password validation | `strongPasswordSchema` mirrors default `PasswordRule` |
| Frontend | Unsanitized TOTP QR SVG | `sanitizeSvgHtml()` before render |
| Frontend | Passkey browser cancel UX | Friendly message for `NotAllowedError` / `AbortError` |
| Docs | Missing deployment / API / upgrade guidance | See linked pages below |

### Accepted trade-offs

| Item | Notes |
|------|-------|
| Passkey login skips TOTP | Documented; passkey possession is the second factor |
| Full WebAuthn ceremony in Playwright | Options API + UI validation covered; browser ceremony flaky in CI |
| Branded custom domains | Operators must list each SPA origin in `PASSKEYS_ALLOWED_ORIGINS` |
| Mobile app | Does not yet implement 2FA challenge or passkeys |

## Pre-deploy checklist

### 1. Migrate

```bash
php artisan migrate --force
```

Includes: `passkeys` table, `two_factor_*` on `users` / `central_users`, session metadata on `personal_access_tokens`.

### 2. Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `FRONTEND_URL` | Yes | SPA origin (HTTPS); reset links + default passkey allowed origin |
| `APP_URL` | Yes | Public API origin (HTTPS) |
| `PASSKEYS_RELYING_PARTY_ID` | **Recommended** | WebAuthn RP ID = registrable SPA domain (e.g. `app.example.com`) |
| `PASSKEYS_ALLOWED_ORIGINS` | **When multi-origin** | Comma-separated SPA origins (tenant subdomains, Branded custom domains) |
| `PASSKEYS_USER_HANDLE_SECRET` | Optional | Stable WebAuthn user handle secret (defaults to `APP_KEY`) |
| `SESSION_SECURE_COOKIE` | Yes | `true` in production |

Fortify features remain enabled for **Actions** (TOTP/passkey internals); **web routes are disabled**. The product surface is exclusively `/api/{central\|tenant}/v1/…`.

### 3. HTTPS

WebAuthn requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts). Production SPAs must be served over HTTPS (localhost is exempt for local dev).

### 4. Smoke tests

**Backend**

```bash
php artisan test --compact tests/Feature/Auth/
```

**Frontend E2E**

```bash
npm run test:e2e:profile -- --project=chromium
npx playwright test e2e/tests/auth/auth.two-factor-challenge.spec.ts --project=auth
```

**Manual (staging HTTPS)**

1. Profile → Security → enable TOTP → sign out → password login → TOTP challenge → dashboard
2. Register passkey → sign out → passkey login
3. Profile → Sessions → revoke another session
4. Branded custom domain: confirm passkey register/login on that origin (after adding to `PASSKEYS_ALLOWED_ORIGINS`)

## Test coverage

| Layer | Count | Status |
|-------|-------|--------|
| Pest `tests/Feature/Auth/` | 20 | ✅ Pass |
| Playwright profile security workflow | 1 serial | ✅ Pass |
| Playwright auth 2FA challenge | 2 | ✅ Pass |
| Playwright profile specs | 3 | ✅ Pass |

## Related documentation

- [Authentication (developer)](/developer-guide/authentication) — endpoint matrix, session model, audit events
- [Authentication (user)](/user-guide/authentication) — Profile → Security flows
- [Central API — Auth & profile](/api/central-v1#auth-profile) — security endpoints
- [Deployment — Authentication](/deployment/authentication) — env vars and passkeys
- [Upgrade guide](/deployment/upgrade) — migration names for this release

## Rollback

- Frontend: revert SPA; users on old build cannot complete 2FA challenge UI (password-only login still works if 2FA not enabled per user).
- Backend: do **not** roll back migrations that drop `passkeys` / 2FA columns on active users. Prefer forward fix.
- Disable per-user 2FA via admin DB reset only in break-glass scenarios (`two_factor_*` columns null on affected rows).
