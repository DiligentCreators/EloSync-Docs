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
| POST | `/portal/auth/login` | `{ email, password }` — status must be `active` |
| POST | `/portal/auth/forgot-password` | `{ email }` |
| POST | `/portal/auth/reset-password` | `{ token, email, password, password_confirmation }` |
| POST | `/portal/auth/logout` | `auth:portal-api` |
| GET | `/portal/auth/me` | `auth:portal-api` |

Throttled (login uses `auth-login`; invite/reset `6,1`). No open registration endpoint.

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
| Help Desk | `GET/POST /portal/help-desk`, `GET /{id}`, `POST /{id}/notes` | `help-desk` |

Create ticket body: `subject` (required), `description` optional. Server stamps `contact_id` / `company_id` from the portal user’s Contact — client-supplied party IDs are ignored.
