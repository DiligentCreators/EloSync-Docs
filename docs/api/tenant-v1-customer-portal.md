# Tenant API v1 — Customer Portal

Base path: `/api/tenant/v1`

## Staff routes

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:customer-portal`, plus `can:customer-portal.*`.

| Method | Path | Permission |
|--------|------|------------|
| GET | `/customer-portal/users` | `view` |
| POST | `/customer-portal/contacts/{contact}/invite` | `invite` |
| POST | `/customer-portal/users/{portalUser}/resend` | `invite` |
| POST | `/customer-portal/users/{portalUser}/disable` | `manage` |
| POST | `/customer-portal/users/{portalUser}/enable` | `manage` |

Invite requires the Contact to have a non-empty email. Creates or rotates an invite token and emails `FrontendUrl::portalInvite()`.

## Portal auth (no staff token)

Tenancy via domain / `X-Tenant-Domain`. Prefix `/portal/auth`.

| Method | Path | Notes |
|--------|------|-------|
| POST | `/portal/auth/accept-invite` | `{ token, password, password_confirmation }` → active + bearer |
| POST | `/portal/auth/login` | `{ email, password }` — status must be `active`; may return `two_factor_required` + `challenge_token` |
| POST | `/portal/auth/magic-link` | `{ email }` — always generic success; emails Active accounts only (Central mail) |
| POST | `/portal/auth/magic-link/consume` | `{ token }` → bearer or 2FA challenge |
| POST | `/portal/auth/two-factor-challenge` | `{ challenge_token, code }` → bearer |
| GET/POST/DELETE | `/portal/auth/two-factor` (+ `confirm`, `recovery-codes`) | `auth:portal-api` — Fortify TOTP manage |
| POST | `/portal/auth/forgot-password` | `{ email }` |
| POST | `/portal/auth/reset-password` | `{ token, email, password, password_confirmation }` |
| POST | `/portal/auth/logout` | `auth:portal-api` |
| GET | `/portal/auth/me` | `auth:portal-api` |

Throttled (login / magic consume / 2FA challenge use `auth-login`; invite/reset/magic-link request `6,1`). No open registration endpoint.

## Shared-host workspace lookup (central)

Unauthenticated. Not a tenant directory — returns only workspaces where this email already has an invited or active portal account.

| Method | Path |
|--------|------|
| POST | `/api/central/v1/public/portal-workspaces` `{ email }` → `{ workspaces: [{ name, domain, slug }] }` |

Throttle: `portal-workspace-lookup` (8/min per IP+email). Disabled accounts and unavailable tenants are omitted. Unknown email returns an empty list (200).

## Portal data

Middleware: `auth:portal-api`, `module:customer-portal`. Soft module checked per resource (403 if missing). Scope via `PortalRecordScope` — out of scope → **404**.

| Area | Paths | Soft module |
|------|-------|-------------|
| Invoices | `GET /portal/invoices`, `/{id}`, `/{id}/pdf` | `invoices` |
| Payments | `GET /portal/payments`, `/{id}`, `/{id}/pdf` | `payments` |
| Quotations | `GET …`, `/{id}`, `/{id}/pdf`, `POST …/acceptance-link` | `quotations` |
| Contracts | same as quotations | `contracts` |
| Help Desk | `GET/POST /portal/help-desk`, `GET /{id}`, `POST /{id}/notes`, `GET /note-attachments/{uuid}/download` | `help-desk` |
| Knowledge Base | `GET /portal/knowledge-base`, `GET /{id}` | `knowledge-base` |
| Projects | `GET /portal/projects`, `/{id}`, `/{id}/tasks`, `/{id}/timeline` | `projects` (+ `tasks` for nested tasks) |

Create ticket body: `subject` (required), `description` optional (HTML, max 10000). Server stamps `contact_id` / `company_id` from the portal user’s Contact — client-supplied party IDs are ignored.

Help Desk show embeds **public** notes only (`is_internal = false`), oldest-first conversation order, with optional attachments. `POST /{id}/notes` accepts JSON or multipart (`body` max 10000, optional `attachment`). Portal replies are always public and do not set SLA first response. A public customer reply (portal or email ingest) on a **closed** or **resolved** ticket reopens it to **open**. `GET /portal/help-desk/note-attachments/{uuid}/download` streams a public-note attachment in scope (404 for internal attachments or out-of-scope tickets).

Knowledge Base lists/shows **published** articles only.

Projects require `portal_visible` plus Contact/Company scope. Nested tasks require `visible_to_portal`. Timeline is filtered to customer-safe activity types.
