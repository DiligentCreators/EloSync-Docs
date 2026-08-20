# Assets — Developer Guide

Mirror of the [Vendors developer guide](/developer-guide/vendors). Prefer copying those patterns over inventing new ones. Numbering follows Help Desk / Purchase Orders (`RetriesOnDuplicateNumber` + tenant setting prefix).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Asset.php`, `AssetNote`, `AssetActivity` |
| Enums | `app/Enums/Tenant/AssetStatusEnum`, `AssetCategoryEnum`, `AssetActivityTypeEnum` |
| Service | `app/Services/Tenant/AssetService.php` (`ScopesToAssignee` + `RetriesOnDuplicateNumber`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/AssetController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Asset/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Asset/*` |
| Policy | `app/Policies/AssetPolicy.php` |
| Events | `app/Events/Asset*.php` |
| Subscriber | `app/Listeners/AssetEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Asset/AssetAssignedNotification.php` |
| Soft link rules | `LinkableVendor`, `LinkableEmployee`, `EligibleAssetAssignee` |
| Tests | `tests/Feature/Tenant/Asset/AssetTest.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `assets.assign`; without it, users only see assets assigned to them.
- `EligibleAssetAssignee` reuses the CRM lead eligibility pool (`User::isEligibleLeadAssignee`): excludes suspended users, workspace owners/superadmin, and `exclude_from_lead_auto_assign`. Create defaults `assigned_to` to the creator without requiring eligibility; explicit assign/update to an owner fails validation. `assigned_to: null` unassigns.
- `assets.force.delete` is not granted to default roles — owner/superadmin only, matching Vendors.
- Auto-number `AST-` via `assets_number_prefix` tenant setting (default `AST-`).
- Status enum: `active` \| `in_repair` \| `retired` \| `disposed`.
- Category enum: `equipment` \| `furniture` \| `vehicle` \| `electronics` \| `software_license` \| `other`.
- Soft FKs: `vendor_id` (`LinkableVendor`), `employee_id` (`LinkableEmployee`) — no hard `module_dependencies`.
- Location is free-text in v1 (no Warehouse FK).

## Permissions

`config/tenant-permissions.php`:

```
assets.view | create | update | delete | restore | force.delete | assign
```

Routes use `module:assets` then `can:assets.*` / policies.

## Catalog

- Slug `assets`, category `operations`, `sort_order` 80
- `is_default_included = false`, `is_billable = false`, version **1.0.0**
- Registered via migrate-only `DefaultModuleRegistrar::ensureModule` (no seeder in production)

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-assets.md](/api/tenant-v1-assets).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/assets` | view |
| GET | `/assets/stats` | view |
| GET | `/assets/{asset}` | view |
| GET | `/assets/{asset}/timeline` | view |
| POST | `/assets` | create |
| PUT | `/assets/{asset}` | update |
| DELETE | `/assets/{asset}` | delete |
| POST | `/assets/{asset}/restore` | restore |
| DELETE | `/assets/{asset}/force` | force.delete |
| POST | `/assets/{asset}/assign` | assign |
| POST | `/assets/{asset}/notes` | update |

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/assets/assets-page.tsx` |
| Form | `asset-form.tsx`, `asset-form-page.tsx` |
| View | `asset-view-page.tsx` |
| Service | `assetService` in `src/api/services.ts` |
| Nav | `permission: assets.view`, `module: 'assets'` |

## Tests

```bash
# Backend
php artisan test --compact --filter=Asset

# Frontend
npm run test:e2e:assets
```
