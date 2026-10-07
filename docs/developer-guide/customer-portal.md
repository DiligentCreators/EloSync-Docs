# Customer Portal — Developer Guide

Marketplace Operations module (`customer-portal` **1.2.0**). Flat namespaces (no `Modules/` package). Invite-only Contact accounts with a dedicated Sanctum guard.

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

- `App\Services\Central\PortalWorkspaceLookupService` — email → workspaces that already have that portal account (`POST /api/central/v1/public/portal-workspaces`)
- `App\Services\Tenant\CustomerPortal\PortalUserService` — invite / resend / disable / enable / accept invite
- `App\Services\Tenant\CustomerPortal\PortalAuthService` — login / logout / token / password reset
- `App\Services\Tenant\CustomerPortal\PortalRecordScope` — contact + optional company scope
- Document services: `PortalInvoiceService`, `PortalPaymentService`, `PortalQuotationService`, `PortalContractService`
- `PortalProjectService` — shared projects (`portal_visible` + `PortalRecordScope`); customer-visible tasks (`visible_to_portal`); filtered timeline
- `PortalHelpDeskService` — create stamps `contact_id` / `company_id`; notes set `portal_user_id` and `is_internal = false`; show loads public notes + attachments only

## Frontend

- Staff: `src/pages/customer-portal/`, Contact invite actions, nav under Operations
- Portal SPA: `src/pages/portal/*`, `PortalLayout` / `PortalAuthLayout`, `usePortalAuthStore` (isolated token storage). Shared-host login/forgot: email first, then searchable company picker from the central lookup (invite/reset links still carry `?workspace=`).
- Routes: `/#/portal/login`, invite/reset, authenticated `/#/portal/...`
- `FrontendUrl::portalInvite()` / `portalResetPassword()`

## Help Desk note authorship

`help_desk_notes.portal_user_id` (nullable) — catalog **help-desk 1.12.0 → 1.13.0**. Staff resources expose `portal_author` when present. **1.14.0** adds `is_internal`; portal never receives internal notes. Customer Portal **1.2.0** adds public reply attachments + TipTap UI.

## Portal projects / tasks (1.1.0)

Two gates — both required for a task to appear in the portal:

1. Project `portal_visible = true` and linked to the portal Contact or Company (`PortalRecordScope`)
2. Task `visible_to_portal = true` (default `false` — internal)

Staff set both toggles on project/task forms when Customer Portal is installed. Unsharing a project clears all of that project's task portal flags. Soft modules: `projects` for list/show/timeline; `tasks` for nested tasks. Timeline exposes only customer-safe activity types (`created`, `status_changed`, `milestone_*` completed/updated/created) — no assignee/members/notes internals.

## Hard exclusions (still deferred)

Magic-link login, public KB, portal 2FA, online checkout.
