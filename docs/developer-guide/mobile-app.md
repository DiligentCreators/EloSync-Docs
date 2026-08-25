# EloSync Mobile (tenant app)

Official tenant workspace mobile client (`SaaS-Mobile` repo). **Tenant API only** ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ no Central admin surface.

## Stack

| Piece | Choice |
|-------|--------|
| Framework | Expo SDK 57 + React Native |
| Navigation | Expo Router |
| Dev workflow | **EAS development builds** (`expo-dev-client`) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ not App Store Expo Go |
| API | Axios ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ `/api/tenant/v1` |
| Auth | Laravel Sanctum Bearer tokens |
| Token storage | `expo-secure-store` |

App Store Expo Go remains on SDK 54; this project targets SDK 57. Use a **development build** or EAS `production`/`preview` binaries for devices.

## Configuration

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

Tenant API base: `${EXPO_PUBLIC_API_URL}/api/tenant/v1`

Native apps do not use browser CORS. Pin API TLS and rate limits on the backend as for any API client.

Physical devices cannot use `http://saas-backend.test` unless that host resolves on the phone ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ use a LAN IP or production API URL in `.env` / `eas.json` profiles.

## Development builds (EAS)

Identifiers: iOS `com.diligentcreators.elosync`, Android `com.diligentcreators.elosync`, scheme `elosync`.

```bash
npm ci
eas login
eas init
npm run build:dev:android          # internal APK
npm run build:dev:ios              # internal IPA (Apple Developer)
npm run build:dev:ios:simulator    # iOS Simulator only
```

After installing the dev client on a device:

```bash
npm run start:dev-client
```

Open the **EloSync** dev build and scan the Metro QR code.

Rebuild when changing native modules, `app.json` plugins, or EAS native settings.

### EAS profiles

| Profile | Purpose |
|---------|---------|
| `development` | Dev client, internal, physical devices |
| `development-simulator` | Dev client for iOS Simulator |
| `preview` | Internal release-like build |
| `production` | Store binaries (`npm run build:production`) |

Store submission: `eas submit` after a `production` build.

## Authentication

Mirrors the tenant web login (`SaaS-Frontend` `login-page.tsx` + `auth-store.ts`):

1. `POST /auth/login` with `email`, `password`, optional `remember`, optional `workspace` slug/domain, optional `latitude`/`longitude` (attendance check-in side-effect on the API).
2. Response: `token`, `user` (roles, permissions), `modules`, `workspace`.
3. `GET /me` on cold start and after login to refresh session payload.
4. `POST /me/logout` + clear SecureStore on sign out.
5. When `email_verified_at` is null, gate the app until verification (resend via `POST /me/email/verification-notification`).

Workspace resolution (`InitializeTenancy` on the backend):

- Login can resolve tenant from **email alone** (tenant user emails are globally unique).
- Optional `workspace` body or `X-Tenant-Domain` header disambiguates branding (`GET /public/settings`) and forgot-password flows.
- After login, tenant context is carried by the Bearer token.

Forgot password on mobile always includes **workspace** + email (the app is never host-bound like a workspace subdomain).

## Authorization gates

Reuse the web SPA model:

- **Modules:** `user.modules` from login/`/me` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ hide nav when module slug not entitled.
- **Permissions:** Spatie permission strings on `user.permissions`; `superadmin` role bypasses checks.

## Module development

New mobile module screens should mirror the **Leads** web module (list / create / view / edit) and gate by module + permission. Shared API contracts live in `SaaS-Docs/docs/api/`.

## Store release

One multi-tenant binary (Play Store + App Store) via EAS `production` profile. Workspace users sign in with email ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ not per-customer white-label builds unless product adds that later.

## Mobile module rollout

Extend `config/modules.ts` and add `app/(app)/(tabs)/{slug}/` stack screens per module PR. Each PR should include:

- API service + types
- List / create / view / edit (or justified subset)
- Nav registration in `config/modules.ts` + tab visibility gates
- User guide slice + changelog line

Current shipped mobile modules: **leads**, **tasks**, **contacts**, **companies**, **opportunities**, **notifications** (shell), **profile**.

### Leads (`module:leads`)

| Piece | Location |
|-------|----------|
| API client | `lib/api/leads.ts` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `GET/POST /leads`, `GET/PUT/DELETE /leads/{id}`, `GET /lead-stages` |
| Types | `types/leads.ts` (re-exported from `types/api.ts`) |
| Routes | `app/(app)/(tabs)/leads/` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `index` (list + search), `new`, `[id]/index` (view), `[id]/edit` |
| Nav | `config/modules.ts` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `permission: leads.view`, tab `/(app)/(tabs)/leads` |
| Permissions | `leads.view`, `leads.create`, `leads.update`, `leads.delete` |

Tenant API reference: [Tenant API ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ Leads](/api/tenant-v1-leads).

### Tasks (`module:tasks`)

Mirrors the Leads mobile pattern (list / create / view / edit stack, React Query, permission gates).

| Piece | Location |
|-------|----------|
| API client | `lib/api/tasks.ts` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `GET/POST /tasks`, `GET/PUT/DELETE /tasks/{id}`, `POST /tasks/{id}/complete`, `POST /tasks/{id}/reopen` |
| Types | `types/tasks.ts` (re-exported from `types/api.ts`) |
| Routes | `app/(app)/(tabs)/tasks/` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `index` (list + search), `new`, `[id]/index` (view + complete/reopen), `[id]/edit` |
| Nav | `config/modules.ts` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ `permission: tasks.view`, tab `/(app)/(tabs)/tasks` |
| Permissions | `tasks.view`, `tasks.create`, `tasks.update`, `tasks.delete`, `tasks.complete` |

Tenant API reference: [Tenant API ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¯Â¿Â½ Tasks](/api/tenant-v1-tasks).

### Contacts (`module:contacts`)

Mirrors the Leads mobile pattern (list / create / view / edit stack, React Query, permission gates).

| Piece | Location |
|-------|----------|
| API client | `lib/api/contacts.ts` Ã¢â‚¬â€� `GET/POST /contacts`, `GET/PUT/DELETE /contacts/{id}` |
| Types | `types/contacts.ts` (re-exported from `types/api.ts`) |
| Routes | `app/(app)/(tabs)/contacts/` Ã¢â‚¬â€� `index` (list + search), `new`, `[id]/index` (view), `[id]/edit` |
| Nav | `config/modules.ts` Ã¢â‚¬â€� `permission: contacts.view`, tab `/(app)/(tabs)/contacts` |
| Permissions | `contacts.view`, `contacts.create`, `contacts.update`, `contacts.delete` |

Tenant API reference: [Tenant API Ã¢â‚¬â€� Contacts](/api/tenant-v1-contacts).

### Companies (`module:companies`)

Mirrors the Contacts mobile pattern (list / create / view / edit stack, React Query, permission gates).

| Piece | Location |
|-------|----------|
| API client | `lib/api/companies.ts` â€” `GET/POST /companies`, `GET/PUT/DELETE /companies/{id}` |
| Types | `types/companies.ts` (re-exported from `types/api.ts`) |
| Routes | `app/(app)/(tabs)/companies/` â€” `index` (list + search), `new`, `[id]/index` (view), `[id]/edit` |
| Nav | `config/modules.ts` â€” `permission: companies.view`, tab `/(app)/(tabs)/companies` |
| Permissions | `companies.view`, `companies.create`, `companies.update`, `companies.delete` |

Tenant API reference: [Tenant API â€” Companies](/api/tenant-v1-companies).

### Opportunities (`module:opportunities`)

Mirrors the Leads mobile pattern with pipeline stage picker (`GET /opportunity-stages`).

| Piece | Location |
|-------|----------|
| API client | `lib/api/opportunities.ts` — `GET/POST /opportunities`, `GET/PUT/DELETE /opportunities/{id}`, `GET /opportunity-stages` |
| Types | `types/opportunities.ts` (re-exported from `types/api.ts`) |
| Routes | `app/(app)/(tabs)/opportunities/` — `index` (list + search), `new`, `[id]/index` (view), `[id]/edit` |
| Nav | `config/modules.ts` — `permission: opportunities.view`, tab `/(app)/(tabs)/opportunities` (label **Pipeline**) |
| Permissions | `opportunities.view`, `opportunities.create`, `opportunities.update`, `opportunities.delete` |

Tenant API reference: [Tenant API — Opportunities](/api/tenant-v1-opportunities).

## Related

- [Tenant API index](/api/index)
- [Module development (web blueprint)](/developer-guide/module-development-guide)
- [Platform freeze](/getting-started/platform-freeze)
