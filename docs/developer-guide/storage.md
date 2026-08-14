# Storage — Developer Guide

Capacity is **module-entitlement metadata**, not a Plans/Features/limits subsystem. Allowance is derived from entitled catalog slugs in `config/storage.php`.

## Components

| Piece | Role |
|-------|------|
| `config/storage.php` | Free bytes + pack slug → bytes map |
| `App\Services\Storage\WorkspaceStorageService` | Allowance, used bytes, assertCanStore, pack exclusivity |
| `FileUploadService` | Disk store/delete/url (unchanged) |
| `GET /api/tenant/v1/storage/usage` | Settings usage summary (`module:storage` + `storage.view`) |

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

## Used bytes

Sum of:

- `chat_message_attachments.size_bytes`
- `feedback_attachments.size_bytes`
- `lead_imports.file_size`
- Disk size of import `error_report_path` / `failed_records_path` when present

## Pack exclusivity

`ModuleSubscriptionService::install` calls `assertCanInstallPack` (lazy-resolved to avoid DI cycles). Rejects a second pack while another is `active` / `trial` / `pending` with `STORAGE_PACK_CONFLICT`.

Upgrade UX: cancel current pack → purchase new pack (existing Marketplace flows).

## Catalog registration

Migrate-only via `DefaultModuleRegistrar::ensureModule`:

- `2026_08_13_220700_register_storage_modules`
- `2026_08_13_220710_add_storage_pack_dependencies`
- `2026_08_13_220720_add_storage_permissions`
- `2026_08_13_220730_grandfather_storage_for_team_chat_workspaces`

Mirror rows + dependencies in `CatalogSeeder` for local/CI.

## Disks

See [object-storage.md](/developer-guide/object-storage). Production: content on `FILESYSTEM_UPLOADS_DISK=s3` (Wasabi); branding/avatars on `public` VPS disk.
