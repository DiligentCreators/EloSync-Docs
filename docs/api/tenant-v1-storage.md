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
  "storage_required": false
}
```

`pack_slug` is set when a billable pack (`storage-10` … `storage-1000`) is entitled; otherwise `null` with free 1 GiB when `base_entitled` is true. `storage_required` is `true` when the workspace has no Storage entitlement (usage callers that somehow reach the endpoint without module middleware still see the flag; normal gated clients always have base entitled).

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
