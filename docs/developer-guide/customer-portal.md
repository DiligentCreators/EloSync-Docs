# Customer Portal — Developer Guide

Marketplace Operations module (`customer-portal` **1.0.0**). Flat namespaces (no `Modules/` package). Invite-only Contact accounts with a dedicated Sanctum guard.

## Identity

| Concern | Staff | Portal |
|---------|-------|--------|
| Model | `User` | `PortalUser` |
| Guard | `tenant-api` | `portal-api` |
| Provider | `users` | `portal_users` |
| Permissions | Spatie `tenant-api` | None — `PortalRecordScope` only |
| Token name | `tenant-token` | `portal-token` |

`PortalUser`: `contact_id` (unique per tenant), `email`, `password`, `status` (`invited` \| `active` \| `disabled`), invite token hash/expiry. Soft deletes. Email must match Contact email at invite.

## Services

- `App\Services\Tenant\CustomerPortal\PortalUserService` — invite / resend / disable / enable / accept invite
- `App\Services\Tenant\CustomerPortal\PortalAuthService` — login / logout / token / password reset
- `App\Services\Tenant\CustomerPortal\PortalRecordScope` — contact + optional company scope
- Document services: `PortalInvoiceService`, `PortalPaymentService`, `PortalQuotationService`, `PortalContractService`
- `PortalHelpDeskService` — create stamps `contact_id` / `company_id`; notes set `portal_user_id`

## Frontend

- Staff: `src/pages/customer-portal/`, Contact invite actions, nav under Operations
- Portal SPA: `src/pages/portal/*`, `PortalLayout` / `PortalAuthLayout`, `usePortalAuthStore` (isolated token storage)
- Routes: `/#/portal/login`, invite/reset, authenticated `/#/portal/...`
- `FrontendUrl::portalInvite()` / `portalResetPassword()`

## Help Desk note authorship

`help_desk_notes.portal_user_id` (nullable) — catalog **help-desk 1.12.0 → 1.13.0**. Staff resources expose `portal_author` when present.

## Hard exclusions (v1)

Projects/tasks, magic-link login, public KB, portal 2FA, online checkout.
