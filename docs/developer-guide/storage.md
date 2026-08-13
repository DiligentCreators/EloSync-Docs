# Storage — Developer Guide

Workspace content quota built on existing module licensing + `FileUploadService`. Capacity is **entitlement metadata** keyed by catalog slug in `config/storage.php` — not a Plans/Features/limits subsystem.

## Catalog

| Slug | Billable | Role |
|------|----------|------|
| `storage` | No | Free base — 1 GiB |
| `storage-10` … `storage-1000` | Yes | Mutually exclusive capacity packs (total allowance) |

Hard dependency: every pack → `storage` (`module_dependencies`).

Registered via migrate-only `DefaultModuleRegistrar` + `CatalogSeeder` mirror. Permissions: `storage.view`, `storage.manage`.

## Allowance resolution

`App\Services\Storage\WorkspaceStorageService`:

1. Active entitled pack slug → `config('storage.packs.{slug}')` bytes.
2. Else entitled `storage` → `config('storage.free_bytes')` (1 GiB).
3. Else `0` → `assertCanStore` throws `STORAGE_REQUIRED`.

Pack mutual exclusivity enforced in `ModuleSubscriptionService::install` (`STORAGE_PACK_CONFLICT`). Upgrade path = cancel current pack, then purchase another (existing Marketplace flows).

## Usage accounting

`usedBytes()` sums:

- `chat_message_attachments.size_bytes`
- `feedback_attachments.size_bytes`
- `lead_imports.file_size` + on-disk size of error/failed report paths when present

Branding and avatars use separate disks and are never counted.

## Enforcement points

Call `assertCanStore($tenant, $incomingBytes)` **before** `FileUploadService::store` in:

- `ChatMessageService::attachFile`
- `FeedbackService::attachFile`
- `ImportManager::upload`

Team Chat install (`provisionModuleWorkspace`) companion-installs free `storage` when missing. One-time grandfather migration does the same for existing Team Chat workspaces.

## API

`GET /api/tenant/v1/storage/usage` — middleware `module:storage` + `can:storage.view`.

Marketplace module detail also returns `active_storage_pack` and `storage_pack_conflict` for pack SKUs.

## Tests

- Pest: `tests/Feature/Storage/WorkspaceStorageTest.php`
- Playwright: `npm run test:e2e:storage` (Storage tab gated without entitlement)

## Related

- [Object Storage](/developer-guide/object-storage)
- [Module Licensing](/architecture/module-licensing)
- [Module Dependencies](/architecture/module-dependencies)
- [User guide](/user-guide/storage)
- [Deployment](/deployment/storage)
