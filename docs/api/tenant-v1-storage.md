# Tenant API v1 — Storage

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:storage`, plus permission middleware.

## Usage

### GET `/storage/usage`

Permission: `storage.view`.

Returns:

```json
{
  "used_bytes": 0,
  "allowance_bytes": 1073741824,
  "remaining_bytes": 1073741824,
  "percent_used": 0,
  "pack_slug": null,
  "base_entitled": true,
  "upload_policy": {
    "max_image_kb": 5120,
    "max_video_kb": 51200,
    "max_document_kb": 51200,
    "platform_max_image_kb": 20480,
    "platform_max_video_kb": 102400,
    "platform_max_document_kb": 51200,
    "images": ["jpg", "jpeg", "png", "gif", "webp"],
    "videos": ["mp4", "webm", "3gp"],
    "documents": ["pdf", "txt", "csv", "log", "doc", "docx", "xls", "xlsx", "…"],
    "accept": ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.3gp,.pdf,.txt,.csv,.log,.doc,.docx,.xls,.xlsx,…"
  }
}
```

`upload_policy` is the SPA-safe client hint derived from tenant setting `storage.upload_policy` (defaults when unset; `accept` lists every enabled extension). Saving the policy requires `settings.update` + `storage.manage` via `PUT /settings`.

`pack_slug` is set when a billable pack (`storage-10` … `storage-1000`) is entitled; otherwise `null` with free 1 GiB when `base_entitled` is true.

## Upload error codes

Content upload endpoints (chat attachments, feedback attachment, lead import upload) may return **422** with:

| `errors.code` | Meaning |
|---------------|---------|
| `STORAGE_REQUIRED` | Free Storage module not installed |
| `STORAGE_QUOTA_EXCEEDED` | Used + incoming bytes exceed allowance |

Marketplace pack install may return:

| `errors.code` | Meaning |
|---------------|---------|
| `STORAGE_PACK_CONFLICT` | Another storage pack is already active/pending |

## Marketplace detail extras

`GET /marketplace/modules/{id}` includes:

- `active_storage_pack` — current pack slug or `null`
- `storage_pack_conflict` — `true` when viewing a different pack SKU while another pack is active
