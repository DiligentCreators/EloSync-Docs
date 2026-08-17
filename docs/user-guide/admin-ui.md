# Central admin UI

App: `SaaS-Frontend` (React 19 + Vite).

Central Application routes are prefixed with `/central`. Tenant auth uses root paths (`/login`, `/register`, …). See [authentication/authentication-developer.md](/developer-guide/authentication).

## Navigation

| Group | Screens | Route |
|-------|---------|-------|
| Overview | Dashboard | `/central/dashboard` |
| Platform | Tenants, Users, Roles | `/central/tenants`, `/central/users`, `/central/roles` |
| Catalog | Marketplace, Modules | `/central/marketplace`, `/central/modules` |
| Billing | Dashboard, Invoices, Payments, Transactions, Refunds, Payment Methods, Payment Gateways, Coupons, Taxes, Billing Logs | `/central/billing`, `/central/billing/*` |
| Settings | Settings, Profile (name/email/password + optional photo) | `/central/settings`, `/central/profile` |

Tenant Application uses the **same AppLayout shell** with its own nav (`/dashboard`, `/leads`, `/tasks`, `/settings`, `/profile`). Workspace Settings (`/settings`) covers General, Branding, and Mail with Central fallbacks — see [settings/tenant-settings.md](/user-guide/tenant-settings-overview). Shared shell notes: [ui/shared-layout.md](/user-guide/shared-layout).

Auth:

| Screen | Route |
|--------|-------|
| Central login | `/central/login` |
| Central forgot / reset | `/central/forgot-password`, `/central/reset-password/{token}` |
| Tenant login / register | `/login`, `/register` |
| Tenant forgot / reset | `/forgot-password`, `/reset-password/{token}` |
| Tenant dashboard | `/dashboard` |
| Registration closed | `/registration-closed` |

Removed from navigation: Plans, Limits, Tenant Subscriptions.

Not in the sidebar (reached via in-page links): `/central/tenants/:id`, `/central/roles/matrix`.

## Screen ↔ API map

| Screen | Primary APIs |
|--------|----------------|
| Tenants | `/tenants`, archive/unarchive/restore/force |
| Tenant details | `/tenants/{id}`, `/tenants/{id}/entitlements`, `/tenants/{id}/invoices`, `/tenants/{id}/payments`, `/tenants/{id}/modules`, `/tenants/{id}/impersonate`, `/tenants/{id}/impersonation-sessions`, `/tenants/{id}/audit-logs` |
| Marketplace | `/marketplace/modules`, `/marketplace/modules/{id}`, install via `/tenants/{id}/modules` |
| Module subscriptions | `/module-subscriptions`, cancel/deactivate |
| Users | `/users`, invite, activity, suspend, change-password, login-as (`users.impersonate`) |
| Roles | `/roles`, clone, permissions-matrix |
| Modules (admin catalog) | `/modules` |
| Dashboard | `/dashboard` |
| Settings | `/system-settings` |
| Billing dashboard | `/payment-gateways`, `/invoices`, `/payments` |
| Payment Gateways | `/payment-gateways`, enable/disable/default/config/mode/test-connection/logs; **Product Mapping** for Stripe (`price_…`) and Creem (`prod_…`) |
| Invoices / Payments (global) | `/invoices`, `/payments` |

## Beta Applications

Open **Platform → Beta Applications** to review the public Founding Beta intake.

- **Accept & send invite** changes the application to Accepted, creates a time-limited registration token, and emails the applicant.
- **Copy link** copies the invite URL returned after issuing it so an operator can send it through an approved channel.
- **Resend invite** rotates the token and expiry and sends a replacement email. The previous link stops working.
- Activated applications cannot receive another invite. Applicants with an accepted, unactivated application can also request a replacement from the public beta page.

Invite management uses the existing `beta-applications.update` permission; it does not add another authentication or provisioning path.

## Marketplace (`/marketplace`)

- Lists published modules from `GET /marketplace/modules` (search, category filter)
- Detail drawer/page: `GET /marketplace/modules/{id}?tenant_id=` for dependency + install state
- **Install to workspace**: select tenant → `POST /tenants/{tenant}/modules` with `module_id`, optional `billing_cycle`
- Today only Leads/Tasks appear (included, non-billable); UI supports future paid modules

## Tenants

### Tenant details (`/tenants/:id`)

Tabbed layout:

| Tab | Content | APIs |
|-----|---------|------|
| **Overview** | Contact, domain, localization, logo, timeline | `GET /tenants/{id}` |
| **Modules** | Installed subscriptions — status, source, price; cancel/deactivate actions | `installed_modules` on tenant, `/module-subscriptions/...` |
| **Billing** | Invoice and payment history tables | `/tenants/{id}/invoices`, `/tenants/{id}/payments` |
| **Impersonation** | Central impersonation session history (reason, admin, start/end, duration). Status badges: **Active**, **Ended**, or **Expired** (open session past `expires_at`). Gated by `impersonation.list`; restricted empty state when missing. Failed fetch shows **ErrorState** with retry. | `GET /tenants/{id}/impersonation-sessions` (`impersonation.list`) |
| **Audit Logs** | Platform audit trail for the workspace (`activity` log name `platform`). `properties` in the table are **allowlisted** (reason, session ids, duration, tenant/actor/ip — no before/after blobs). Gated by `tenants.read`; restricted empty state when missing. Failed fetch shows **ErrorState** with retry. | `GET /tenants/{id}/audit-logs` (`tenants.read`) |

Header actions:

- Lifecycle: edit, archive, delete, restore, force-delete
- **Impersonate** (`impersonation.start`): reason dialog → `POST /tenants/{id}/impersonate`; end via `POST /impersonation/{id}/end`. The reason is stored on `impersonation_sessions` and in platform audit properties, and appears on the Impersonation and Audit Logs tabs.

Plan subscription and usage-limit cards removed.

## Modules (admin catalog)

List (`/modules`): name, slug, status, default-included / billable flags, pricing.

### Module form

Fields: name, slug, description, icon, category, monthly/yearly price, status, `is_default_included`, `is_billable`, sort order, active.

Only Leads and Tasks exist in the seeded catalog. Modules are licensing products only — user access is managed via Spatie Roles & Permissions.

## Dashboard

- Welcome hero, growth chart, quick actions (Tenants / Users / Modules / Marketplace)
- Recent tenants, recent activity
- Revenue from billable module subscriptions (MRR is `0` while only included modules exist)

## Settings

Tabs: General, Localization, Mail, Branding, Security, Maintenance, Billing.

| Tab | Behavior |
|-----|----------|
| **General** | Application Name (title/sidebar), Company Name (copyright/emails), searchable timezone/locale/currency, registration toggle |
| **Localization** | Predefined date formats + 12/24h time — drives `formatAppDate` / `formatAppDateTime` app-wide |
| **Mail** | Full SMTP + From identity; send test email |
| **Branding** | Button color (CSS `--primary`), support email, logo/favicon file uploads with preview |
| **Security** | Session timeout minutes; min password length; require special character |
| **Maintenance** | Tenant-only. Central remains operational. Optional ETA. |
| **Billing** | Invoice prefix, proration mode, default gateway, trial/Stripe flags |

Public routes: `/register` shows the dedicated “We are not currently accepting new registrations.” page when registration is off. `/maintenance` renders branded tenant maintenance copy from public settings.

Bootstrap: `GET /public/settings` loads branding/formats on app start (Central never enters Laravel maintenance mode from this flag).

## Command palette

`⌘K` / `Ctrl+K` — permission-filtered nav items.

No CRM/tenant-product UI in Central.

