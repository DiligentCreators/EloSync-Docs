# Vendors — Developer Guide

Mirror of the [Companies developer guide](/developer-guide/companies). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Vendor.php`, `VendorNote`, `VendorActivity` |
| Enums | `app/Enums/Tenant/VendorStatusEnum`, `VendorActivityTypeEnum` |
| Service | `app/Services/Tenant/VendorService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/VendorController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Vendor/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Vendor/*` |
| Policy | `app/Policies/VendorPolicy.php` |
| Events | `app/Events/Vendor*.php` |
| Subscriber | `app/Listeners/VendorEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Vendor/VendorAssignedNotification.php` |
| Tests | `tests/Feature/Tenant/Vendor/VendorTest.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `vendors.assign`; without it, users only see vendors assigned to them (view/update/list/stats).
- `vendors.force.delete` is not granted to any default role — owner/superadmin only, matching Companies/Leads/Tasks/Contacts.
- No `contacts` relationship — Vendor is a first-class, standalone entity (unlike Companies).
- No `industry`, `source`, or `source_meta` fields.
- `status` enum (`active` | `inactive`, default `active`) replaces the workflow fields used by other modules.
- Assignee eligibility mirrors Companies (`EligibleVendorAssignee` / `User::isEligibleLeadAssignee`).
- Soft delete only — no stage/status workflow beyond the `active`/`inactive` flag.

## Permissions

`config/tenant-permissions.php`:

```
vendors.view | create | update | delete | restore | force.delete | assign
```

Routes use `module:vendors` then `can:vendors.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-vendors.md](/api/tenant-v1-vendors).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/vendors` | view |
| GET | `/vendors/stats` | view |
| GET | `/vendors/{vendor}` | view |
| GET | `/vendors/{vendor}/timeline` | view |
| POST | `/vendors` | create |
| PUT | `/vendors/{vendor}` | update |
| DELETE | `/vendors/{vendor}` | delete |
| POST | `/vendors/{vendor}/restore` | restore |
| DELETE | `/vendors/{vendor}/force` | force.delete |
| POST | `/vendors/{vendor}/assign` | assign |
| POST | `/vendors/{vendor}/notes` | update |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/vendors/vendors-page.tsx` (table + filters + KPIs) |
| Form | `vendor-form.tsx` + `vendor-form-page.tsx` |
| Detail | `vendor-view-page.tsx` (Details, Notes, Timeline sections) |
| Service | `vendorService` in `src/api/services.ts` |
| Nav | `permission: vendors.view`, `module: 'vendors'` — new **Purchasing** group after Billing |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Vendor/VendorTest.php

# Frontend
npm run typecheck && npm run lint && npm run build
npm run test:e2e:vendors
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Vendor/VendorTest.php` |
| E2E | `e2e/tests/vendors/`, `npm run test:e2e:vendors` |

## Logging

- Spatie `LogsActivity` on `Vendor` (log name `vendors`)
- Domain `vendor_activities` timeline
- `PlatformAuditService` via `VendorEventSubscriber`

## Intentional differences from Companies

| Companies | Vendors |
|-------|--------|
| `industry`, `source`, `source_meta` fields | `tax_id`, `payment_terms`, `currency`, `status` fields |
| Linked `contacts` relationship | No `contacts` relationship |
| No status enum | `status` enum (`active`/`inactive`) |
| Category: CRM | Category: **Purchasing** (new) |

## Deferred

- Purchase Orders (Phase 4 Milestone 2, depends on Vendors)
- Expenses (Phase 4 Milestone 3, soft dependency on Vendors)
- Vendor scorecards / performance tracking
- Dashboard widgets for Vendors
- Communication template placeholders for Vendors
