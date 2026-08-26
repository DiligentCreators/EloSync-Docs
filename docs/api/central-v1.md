# Central API v1

Base path: `/api/central/v1`

Auth: Sanctum bearer token, guard `central-api`.

Authorization: Spatie permissions + policies. The `superadmin` role bypasses all gates.

Response envelope on every endpoint:

```json
{ "status": "success" | "error", "message": "...", "data": { } | [ ] | null, "meta": { } | null }
```

Paginated list endpoints populate `meta` (`current_page`, `last_page`, `per_page`, `total`, `next_page_url`, `prev_page_url`); single-resource endpoints set `meta: null`.

## Auth & profile

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | Throttled (`throttle:auth-login`, 5/min by email or IP) |
| POST | `/auth/forgot-password` | |
| POST | `/auth/reset-password` | Body: `email`, `token`, `password`, `password_confirmation` |
| GET | `/me` | Current user + roles/permissions (+ `avatar_url`) |
| POST | `/me` | Update profile (`name`, `email`) |
| POST | `/me/avatar` | Upload profile picture (`multipart/form-data` field `file`; jpg/png/webp, max 2 MB) |
| DELETE | `/me/avatar` | Remove profile picture |
| POST | `/me/change-password` | |
| POST | `/me/logout` | Revokes tokens |
| GET | `/dashboard` | Platform stats — permission `dashboard.view`; see [Dashboard payload](#dashboard-payload) |
| GET | `/pulse/enter` | **Role-only:** `superadmin`, `developer`, or `tester`. Returns `{ url }` — a signed web URL that opens Laravel Pulse (`/pulse`) on the central domain. Not a Spatie permission. Requires verified email (`verified` middleware). |
| GET | `/horizon/enter` | **Role-only:** `superadmin`, `developer`, or `tester`. Returns `{ url }` — a signed web URL that opens Laravel Horizon (`/horizon`) on the central domain. Not a Spatie permission. Requires verified email (`verified` middleware). |

## Platform

### Tenants

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/tenants` | `tenants.list` | |
| POST | `/tenants` | `tenants.create` | Provisions default modules — see [tenant provisioning](/developer-guide/tenant-provisioning) |
| GET | `/tenants/{tenant}` | `tenants.read` | Includes `installed_modules` when loaded |
| PUT/PATCH | `/tenants/{tenant}` | `tenants.update` | |
| DELETE | `/tenants/{tenant}` | `tenants.delete` | Soft delete |
| POST | `/tenants/{tenant}/restore` | `tenants.restore` | Also restores the tenant's soft-deleted users and domains |
| DELETE | `/tenants/{tenant}/force` | `tenants.force.delete` | Force-deletes users, domains, module subscriptions, then the tenant |
| POST | `/tenants/{tenant}/archive` | `tenants.archive` | Sets `archived_at`; independent of soft delete |
| POST | `/tenants/{tenant}/unarchive` | `tenants.archive` | Clears `archived_at` |
| POST | `/tenants/{tenant}/verify-owner` | `tenants.verify` | Marks workspace owner email verified |
| POST | `/tenants/{tenant}/branded-domain/mark-ssl-provisioned` | `tenants.update` | After Forge / proxy TLS is live for the workspace custom domain |
| GET | `/tenants/{tenant}/entitlements` | `tenants.read` | `{ core, modules }` — licensing only |
| POST | `/tenants/{tenant}/modules` | `module-subscriptions.create` | Install module — body: `module_id`, optional `billing_cycle` |
| GET | `/tenants/{tenant}/invoices` | `invoices.list` | Paginated workspace invoices |
| GET | `/tenants/{tenant}/payments` | `payments.list` | Paginated workspace payments |
| GET | `/tenants/{tenant}/impersonation-sessions` | `impersonation.list` | Paginated sessions for this workspace (reason, admin, start/end; no token) |
| GET | `/tenants/{tenant}/audit-logs` | `tenants.read` | Paginated platform `activity_log` rows for this workspace |
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Body: `reason` (required, 5–1000 chars) |

Tenant create/update body: `company_name`, `workspace_name?`, `slug?`, `email`, `phone?`, `logo?` (image upload), `notes?`, `status?`, `timezone?`, `currency?`, `country?`, `locale?`. Multipart form-data is supported for logo uploads. Response includes `logo_path` and `logo_url`. Platform domain is **auto-generated** from the slug + `PLATFORM_DOMAIN_SUFFIXES` (client `domain` values are ignored). Custom domains are tenant self-service via the Branded module.

### Users

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| POST | `/users/invite` | `users.invite` | Creates the user, assigns roles, emails an invite, sets `invite_token`/`invite_sent_at` |
| GET | `/users` | `users.list` | |
| POST | `/users` | `users.create` | |
| GET | `/users/{user}` | `users.read` (or self) | |
| PUT/PATCH | `/users/{user}` | `users.update` | |
| DELETE | `/users/{user}` | `users.delete` | |
| POST | `/users/{user}/restore` | `users.restore` | |
| DELETE | `/users/{user}/force` | `users.force.delete` | |
| POST | `/users/{user}/suspend` | `users.suspend` | |
| POST | `/users/{user}/unsuspend` | `users.unsuspend` | |
| POST | `/users/{user}/change-password` | `users.reset-password` | |
| GET | `/users/{user}/activity` | `users.read` (or self) | Up to 50 recent `spatie/laravel-activitylog` entries for the user |

Invite body: `name`, `email`, `phone?`, `role[]` (role names, at least one).

Create/update body adds: `phone?`, `avatar_path?`, `password` (create), `role[]`.

### Roles

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/roles/permissions-matrix` | `roles.list` | All permissions grouped by prefix, with the list of role names holding each one |
| GET | `/roles` | `roles.list` | |
| POST | `/roles` | `roles.create` | |
| GET | `/roles/{role}` | `roles.read` | Returns the role plus every permission with an `is_assigned` flag |
| PUT/PATCH | `/roles/{role}` | `roles.update` | Body: `name`, `permissions[]` (permission IDs) |
| DELETE | `/roles/{role}` | `roles.delete` | Blocked for protected roles (`config('central-protected-roles')`) |
| POST | `/roles/{role}/clone` | `roles.clone` | Copies all permissions to a new role; optional `name` in body, otherwise auto-generated |

`permissions-matrix` response shape: `[{ "id", "name", "group", "roles": ["admin", "manager", ...] }]`, where `group` is the permission name's prefix before the first `.` (e.g. `tenants` for `tenants.archive`).

## Catalog (admin)

| Resource | Paths | Notes |
|----------|-------|-------|
| Modules | CRUD + restore/force | Full catalog admin. Fields include `uuid`, pricing (`monthly_price`, `yearly_price`, `currency`), `status`, `is_default_included`, `is_billable` — **no** payment-provider IDs |

Default-included modules (Leads, Tasks, ToDos) cannot be deleted while marked `is_default_included`. Modules with workspace subscriptions cannot be deleted until those subscriptions are removed.

Provider price mappings are managed under Payment Gateways (`GET/PUT /payment-gateways/{id}/module-prices`), not on Modules. Features catalog has been removed — modules are licensing products; Spatie permissions handle authorization.

## Marketplace

Published modules only. Permission: `modules.list` / `modules.read`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/marketplace/modules` | Paginated; filters: `search`, `category_id` |
| GET | `/marketplace/modules/{module}` | Detail + `already_installed`, `can_cancel`, `blocking_dependents`, dependency hints; optional `?tenant_id=` |

Install for a workspace: `POST /tenants/{tenant}/modules`. Tenants self-serve via [Tenant Marketplace](/api/tenant-v1-marketplace) (`purchase` / `cancel`).

## Module subscriptions

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/module-subscriptions` | `module-subscriptions.list` | Filters: `tenant_id`, `status`, `source` |
| GET | `/module-subscriptions/{module_subscription}` | `module-subscriptions.read` | Includes `module`, `tenant`, `history` |
| POST | `/module-subscriptions/{module_subscription}/cancel` | `module-subscriptions.update` | Purchased modules only; included modules rejected |
| POST | `/module-subscriptions/{module_subscription}/deactivate` | `module-subscriptions.deactivate` | Platform-admin suspend (works on included modules) |

## Financial ledger (read-only)

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/invoices` | `invoices.list` | Platform-wide paginated list |
| GET | `/invoices/{invoice}` | `invoices.read` | Includes `tenant`, `items`, `payments` |
| GET | `/payments` | `payments.list` | Platform-wide paginated list |
| GET | `/payments/{payment}` | `payments.read` | Includes `tenant`, `invoice`, `transactions` |

Tenant-scoped lists: `GET /tenants/{tenant}/invoices`, `GET /tenants/{tenant}/payments`.

Invoices are created by the Billing Engine (consolidated run or purchase settlement) — no public write endpoints.

## Payment gateways

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/payment-gateways` | `payment-gateways.list` | List providers |
| GET | `/payment-gateways/{id}` | `payment-gateways.read` | Redacted config (secrets never returned) |
| POST | `/payment-gateways/{id}/enable` | `payment-gateways.update` | |
| POST | `/payment-gateways/{id}/disable` | `payment-gateways.update` | Rejects if default |
| POST | `/payment-gateways/{id}/default` | `payment-gateways.update` | Syncs `default_payment_gateway` setting |
| PUT | `/payment-gateways/{id}/config` | `payment-gateways.update` | Merge encrypted credentials |
| PUT | `/payment-gateways/{id}/mode` | `payment-gateways.update` | `sandbox` \| `live` |
| POST | `/payment-gateways/{id}/test-connection` | `payment-gateways.update` | Driver probe |
| GET | `/payment-gateways/{id}/webhook-status` | `payment-gateways.read` | |
| GET | `/payment-gateways/{id}/logs` | `payment-gateways.read` | Operational logs |
| GET | `/payment-gateways/{id}/webhook-logs` | `payment-gateways.read` | |
| GET | `/payment-gateways/{id}/capabilities` | `payment-gateways.read` | Capabilities + currencies + `requires_product_mapping` |
| GET | `/payment-gateways/{id}/module-prices` | `payment-gateways.read` | Gateway ↔ module product/price mappings |
| PUT | `/payment-gateways/{id}/module-prices` | `payment-gateways.update` | Replace mappings (`{ mappings: [...] }`); 422 if gateway does not require mapping |

Also accepts `billing.manage` as an alternate permission.

## Impersonation

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/tenants/{tenant}/impersonation-sessions` | `impersonation.list` | Paginated history for the workspace; optional `search` on reason / admin |
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Creates session; audits reason, IP, user-agent |
| POST | `/impersonation/{impersonation}/end` | `impersonation.end` (or session owner) | Sets `ended_at`, `duration_seconds` |

Start returns session metadata plus a short-lived `tenant_token`. List responses never include tokens.

Tenant **Audit Logs** (`GET /tenants/{tenant}/audit-logs`, `tenants.read`) include `impersonation_started` / `impersonation_ended` (and other platform events for that workspace). List responses **allowlist** `properties` to a safe subset — e.g. `reason`, impersonation session ids, `duration_seconds`, `tenant_id`, actor/ip metadata — and **omit** nested `before` / `after` blobs and other unreviewed keys. Full audit rows remain in the database; only the list resource redacts.

## Stripe / gateway / email webhooks

| Method | Path | Notes |
|--------|------|-------|
| POST | `/stripe/webhook` | Cashier-compatible path (`config('cashier.path')` + `/webhook`) |
| POST | `/webhooks/gateways/{code}` | Gateway-agnostic ingress for all drivers |
| POST | `/webhooks/email/{provider}` | Email delivery webhooks (Central) |
| POST | `/webhooks/email/{provider}/{tenant}` | Email delivery webhooks (Tenant custom mail) |

**Not** under `/api/central/v1`. Payment paths normalize via `PaymentGatewayInterface::parseWebhook()` into `BillingEngine`. Email paths use `SupportsWebhooks` drivers. CSRF-exempt; rate-limited. Stripe Cashier route additionally syncs Cashier mirror tables.

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/public/settings` | Unauthenticated bootstrap (branding, formats, registration/Founding Beta/maintenance flags). No secrets. |
| GET | `/public/stats` | Unauthenticated marketing Trust metrics: `workspaces` (active non-archived), `module_installations` (active/trial subscriptions), `published_modules`, `uptime_percent`, `currency` (platform default). |
| GET | `/public/modules` | Unauthenticated marketing catalog: `{ currency, modules[] }` with `availability` (`available` / `in-progress` / `planned`), `pricing` (`included` / `free` / `paid` when available), and prices in **catalog `modules.currency`** (not workspace default `system_settings.currency`). Excludes deprecated. |
| POST | `/public/beta-applications` | Public beta intake, throttled 10/min. Returns the application UUID. |
| GET | `/public/beta-invites/{token}` | Public invite preview, throttled 60/min. Returns `valid`, `expired`, `activated`, `email`, `name`, `company`, and `message`. |
| POST | `/public/beta-invites/resend` | Body: `email`; throttled 5/min. Rotates and emails only if Central already issued an invite (`invite_sent_at` / token present), status accepted, and not activated. Always returns the same non-enumerating success message. |
| POST | `/public/register-workspace` | Self-service workspace create when `registration_enabled`; otherwise `403` unless `invite_token` identifies an accepted, active, unactivated Founding Beta invite and `email` matches the application. Body: `company_name`, `owner_name`, `email`, `password` (+ confirmation), optional `invite_token`; platform domain auto-generated from slug (client `domain` ignored). |
| GET | `/system-settings` | All admin settings (secrets masked). Response `meta.mail_webhook` includes webhook URL + event catalog when the active provider supports webhooks. |
| PUT | `/system-settings` | `{ "settings": { "key": value } }` — per-key validation; may include `mail_webhook_events` / `mail_webhook_secret` |
| POST | `/system-settings/test-mail` | `{ "email": "…" }` — sends test mail using runtime SMTP config |
| POST | `/system-settings/branding/{logo\|favicon}` | Multipart `file` upload → stores via `FileUploadService` on the configured uploads disk |
| GET | `/email-logs` | Paginated delivery logs (`has_body`; bodies omitted) |
| GET | `/email-logs/{uuid}` | Log detail including `body_html` / `body_text` |
| POST | `/email-logs/{uuid}/resend` | Resend from stored body (`email-logs.resend`, throttle 6/min) |

Settings groups: `general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`.

### Consumed keys

| Group | Keys | Runtime use |
|-------|------|-------------|
| general | `app_name`, `company_name`, `timezone`, `locale`, `currency`, `registration_enabled`, `founding_beta_enabled`, `founding_beta_apply_url`, `founding_beta_invite_ttl_days` | App title/config, tenant defaults, self-service registration, registration-closed beta CTA, invite lifetime |
| localization | `date_format`, `time_format` | Central SPA formatters |
| mail | `mail_provider`, SMTP / Postmark / Mailgun credentials, `mail_webhook_secret`, `mail_webhook_events`, From identity | Laravel mail + delivery webhooks |
| branding | `button_color`, `support_email`, `logo_path`, `favicon_path` | SPA CSS/`document.title`/sidebar; support footer on tenant-facing emails |
| security | `session_lifetime_minutes`, `password_min_length`, `password_require_special` | Session lifetime; centralized `PasswordRule` / `Password::defaults()` |
| maintenance | `maintenance_mode`, `maintenance_message`, `maintenance_eta` | **Tenant Application only** (`tenant.available` middleware). Central stays up. |
| billing | `invoice_prefix`, `proration_mode`, `default_payment_gateway`, `trial_enabled`, `stripe_enabled`, `stripe_webhook_configured` | Billing engine / invoices |

Removed: `primary_color`, `feature_registration`, `feature_invites`, `queue_connection_display`, `filesystem_disk`.

### Founding Beta application administration

All administration endpoints require Central authentication. Listing/reading uses the matching `beta-applications.list` / `beta-applications.read` permission; update and invite actions use `beta-applications.update`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/beta-applications` | Paginated list; filters `status`, `search`; sort by `created_at`, `updated_at`, `name`, or `status`. |
| GET | `/beta-applications/{beta_application}` | Full application including invite timestamps and `has_active_invite`, `invite_expired`, `activated`. |
| PATCH | `/beta-applications/{beta_application}` | Update `status` and internal `notes`. |
| POST | `/beta-applications/{beta_application}/invite` | Accepts the application (unless already activated — then 422), rotates the hashed token and expiry, queues the encrypted invite email, and returns the application plus one-time plaintext `invite_url`. |

## Dashboard payload

`GET /dashboard` returns workspace stats, module subscription status counts, revenue (MRR from billable active subscriptions), growth series, recent tenants, recent module subscriptions, recent activities.

Series shapes (frontend contract):

- `growth[]`: `{ month: "YYYY-MM", count: number }`
- `revenue_series[]`: `{ month: "YYYY-MM", amount: number }` (zeros until paid modules exist)

## Permissions

Seeded by `Database\Seeders\Central\PermissionsSeeder`, guard `central-api`.

| Group | Permissions |
|-------|-------------|
| `users` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `suspend`, `unsuspend`, `invite`, `reset-password` |
| `tenants` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `archive` |
| `roles` | `list`, `create`, `read`, `update`, `delete`, `clone` |
| `dashboard` | `view` |
| `billing` | `manage` |
| `modules` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `module-subscriptions` | `list`, `create`, `read`, `update`, `delete`, `deactivate` |
| `invoices` | `list`, `read`, `update` |
| `payments` | `list`, `read`, `update` |
| `impersonation` | `start`, `end`, `list` |
| `system-settings` | `list`, `update` |
| `beta-applications` | `list`, `read`, `update` |
| `feedback` | `list`, `read`, `update`, `comment`, `stats` |

## Removed

- `/features` (+ restore/force)
- `/plans`, `/plans/{plan}/modules|features|limits`
- `/limit-definitions`
- `/tenant-subscriptions` (+ cancel/resume/suspend)
- `/subscriptions`, `/setting-definitions`

## Artisan

| Command | Notes |
|---------|-------|
| `billing:run-consolidated` | Daily scheduled; invoices all due workspaces |

Postman: `SaaS-Backend/.docs/postman/Central.postman_collection.json` (refresh after API changes).

