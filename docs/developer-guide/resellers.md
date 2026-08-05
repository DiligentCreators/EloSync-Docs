# Resellers — Developer Guide

Phase 1 Sales module. Slug `resellers`, middleware `module:resellers`, permissions `resellers.*`. Hard catalog dependency on **Payments**. Companion ledger: [Reseller Payouts](/developer-guide/reseller-payouts).

Prefer copying Vendors/Companies assignee patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/Reseller.php` |
| Enums | `app/Enums/Tenant/ResellerStatusEnum` |
| Service | `app/Services/Tenant/ResellerService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ResellerController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Reseller/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Reseller/*` |
| Policy | `app/Policies/ResellerPolicy.php` |
| Events | `app/Events/Reseller*.php` |
| Subscriber | `app/Listeners/ResellerEventSubscriber.php` (platform audit) |
| Link rule | `app/Rules/LinkableReseller.php` (invoice `reseller_id`) |
| Assignee rule | `app/Rules/EligibleResellerAssignee.php` |
| Tests | `tests/Feature/Tenant/Reseller/ResellerTest.php`, `ResellerInviteTest.php` |

## Domain notes

- Soft deletes; route binding uses `withTrashed()` for restore/force.
- Status enum: `active` \| `inactive` (default `active`).
- Rates: `commission_rate`, `owner_commission_rate` — `decimal(5,2)`, validated 0–100 on store/update.
- Assignee scoping via `ScopesToAssignee` with `resellers.assign`. Without assign (and not superadmin): list/stats/view limited to `assigned_to = actor` **or** `user_id = actor`. Update without assign is assignee-only (linked login cannot update via that path unless also assignee).
- `resellers.force.delete` is not on default admin/manager/staff maps — owner/superadmin only.
- **Invite login** (`ResellerService::inviteLogin`): requires no existing `user_id`; creates a tenant user via `TenantUserService` with role `['reseller']` only (`exclude_from_lead_auto_assign`, no employee, no website leads); unique email per tenant; unique `(tenant_id, user_id)` on `resellers`.
- Protected default role `reseller` (see `config/tenant-protected-roles.php`) — ensures invited partners cannot escalate via role assignment APIs that block protected names.
- Invoice link: optional `customer_invoices.reseller_id` validated with `LinkableReseller` (entitlement + assignee scope unless `resellers.assign` / superadmin).

## Permissions

`config/tenant-permissions.php`:

```
resellers.view | create | update | delete | restore | force.delete | assign | invite
```

Default role map (`config/tenant-default-role-permissions.php`):

| Role | Grants |
|------|--------|
| admin | view–restore, assign, invite (+ payouts all) — not force.delete |
| manager | view, create, update, assign, invite (+ payouts view/approve) |
| staff | view (+ payouts view) |
| reseller | view (+ payouts view) |

Routes use `module:resellers` then `can:resellers.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-resellers.md](/api/tenant-v1-resellers).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/resellers` | view |
| GET | `/resellers/stats` | view |
| GET | `/resellers/{reseller}` | view |
| POST | `/resellers` | create |
| PUT | `/resellers/{reseller}` | update |
| DELETE | `/resellers/{reseller}` | delete |
| POST | `/resellers/{reseller}/restore` | restore |
| DELETE | `/resellers/{reseller}/force` | force.delete |
| POST | `/resellers/{reseller}/assign` | assign |
| POST | `/resellers/{reseller}/invite-login` | invite |

## Frontend

Phase 1 ships the **backend API** only. SPA pages should mirror Vendors/Leads (`src/pages/resellers/`, `resellerService`, nav `permission: resellers.view` + `module: 'resellers'` under Sales) when the frontend milestone lands.

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Reseller
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Reseller/ResellerTest.php`, `ResellerInviteTest.php` |

## Logging

- Spatie `LogsActivity` on `Reseller` (log name `resellers`)
- `PlatformAuditService` via `ResellerEventSubscriber`: `reseller_created`, `reseller_updated`, `reseller_deleted`, `reseller_assigned`, `reseller_login_invited`

## Deferred

- Cross-workspace identity (Central-linked reseller person across tenants)
- Reseller portal / branded partner UX
- Dashboard widgets, import/export
