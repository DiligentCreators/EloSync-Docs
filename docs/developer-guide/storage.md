# Storage — Developer Guide

Capacity is **module-entitlement metadata**, not a Plans/Features/limits subsystem. Allowance is derived from entitled catalog slugs in `config/storage.php`.

## Components

| Piece | Role |
|-------|------|
| `config/storage.php` | Free bytes + pack slug → bytes map |
| `App\Services\Storage\WorkspaceStorageService` | Allowance, used bytes, assertCanStore, pack exclusivity |
| `FileUploadService` | Disk store/delete/url (unchanged) |
| `GET /api/tenant/v1/storage/usage` | Settings usage summary (`module:storage` + `storage.view`) |

## Catalog

| Slug | Billable | Role |
|------|----------|------|
| `storage` | No | Free base — 1 GiB |
| `storage-10` … `storage-1000` | Yes | Mutually exclusive capacity packs (total allowance) |

Hard dependency: every pack → `storage` (`module_dependencies`). Permissions: `storage.view`, `storage.manage`.

## Allowance resolution

1. If any active `storage-*` pack is entitled → that pack’s bytes
2. Else if `storage` entitled → `free_bytes` (1 GiB)
3. Else → `0` → `STORAGE_REQUIRED`

## Enforcement points

Call `WorkspaceStorageService::assertCanStore($tenant, $incomingBytes)` **before** storing:

- `ChatMessageService::attachFile`
- `FeedbackService::attachFile`
- `ImportManager::upload`

Do **not** gate `UserAvatarService` or branding uploads in `TenantSettingService`.

Team Chat install (`provisionModuleWorkspace`) companion-installs free `storage` when missing. Grandfather migrations cover existing workspaces (Team Chat–scoped, then expanded to all tenants).

## Used bytes

Sum of:

- `chat_message_attachments.size_bytes`
- `feedback_attachments.size_bytes`
- `lead_imports.file_size`
- Disk size of import `error_report_path` / `failed_records_path` when present

Branding and avatars use separate disks and are never counted.

## Pack exclusivity

`ModuleSubscriptionService::install` calls `assertCanInstallPack` (lazy-resolved to avoid DI cycles). Rejects a second pack while another is `active` / `trial` / `pending` with `STORAGE_PACK_CONFLICT`.

Upgrade UX: cancel current pack → purchase new pack (existing Marketplace flows).

Marketplace module detail also returns `active_storage_pack` and `storage_pack_conflict` for pack SKUs.

## Catalog registration

Migrate-only via `DefaultModuleRegistrar::ensureModule`:

- `2026_08_13_220700_register_storage_modules`
- `2026_08_13_220710_add_storage_pack_dependencies`
- `2026_08_13_220720_add_storage_permissions`
- `2026_08_13_220730_grandfather_storage_for_team_chat_workspaces`
- `2026_08_13_233733_*` (expand grandfather to all workspaces)

Mirror rows + dependencies in `CatalogSeeder` for local/CI.

## Disks

See [object-storage.md](/developer-guide/object-storage). Production: content on `FILESYSTEM_UPLOADS_DISK=s3` (Wasabi); branding/avatars on `public` VPS disk.

## Tests

- Pest: `tests/Feature/Storage/WorkspaceStorageTest.php`
- Playwright: `npm run test:e2e:storage` (Storage tab gated without entitlement)

## Related

- [Object Storage](/developer-guide/object-storage)
- [Module Licensing](/architecture/module-licensing)
- [Module Dependencies](/architecture/module-dependencies)
- [User guide](/user-guide/storage)
- [Storage overview](/user-guide/storage-overview)
- [Deployment](/deployment/storage)
- [Production readiness](/deployment/storage-production-readiness)
