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

`pack_slug` is the active capacity SKU (`storage-10`, …) or `null` when only free Storage applies.

## Error codes (content uploads)

Content upload endpoints (Team Chat attachments, feedback attachment, lead import upload) may return validation errors:

| Code | When |
|------|------|
| `STORAGE_REQUIRED` | Free Storage (and no pack) is not entitled |
| `STORAGE_QUOTA_EXCEEDED` | `used + incoming > allowance` |
| `STORAGE_PACK_CONFLICT` | Installing a second capacity pack while another is ACTIVE/TRIAL/PENDING |

## Marketplace detail extras

`GET /marketplace/modules/{id}` includes:

- `active_storage_pack` — current pack slug or `null`
- `storage_pack_conflict` — `true` when viewing a different pack SKU while another pack is active
