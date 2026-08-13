# Storage Module

Free Marketplace module that unlocks **1 GB** of workspace content storage, with optional billable capacity packs.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [storage.md](/user-guide/storage) |
| Engineers | [storage.md](/developer-guide/storage) |
| Production / ops | [storage.md](/deployment/storage) |
| Object disks (Wasabi / VPS) | [object-storage.md](/developer-guide/object-storage) |
| Tenant API | [tenant-v1-storage.md](/api/tenant-v1-storage) |

## Capabilities

- Install free **Storage** from Marketplace → **1 GB** total allowance
- Upgrade with mutually exclusive packs: **10 / 50 / 100 / 500 / 1000 GB** (pack size replaces the free 1 GB)
- Soft-block uploads when quota is exceeded (`STORAGE_QUOTA_EXCEEDED`)
- Settings → **Storage** usage panel (used / allowance / current pack)
- Counts: Team Chat attachments, feedback screenshots, lead import files
- Does **not** count: branding logos/favicons, profile avatars (served from the app server)

## Catalog

| Slug | Billable | Monthly | Yearly |
|------|----------|---------|--------|
| `storage` | No | $0 | $0 |
| `storage-10` | Yes | $4 | $40 |
| `storage-50` | Yes | $12 | $120 |
| `storage-100` | Yes | $20 | $200 |
| `storage-500` | Yes | $75 | $750 |
| `storage-1000` | Yes | $120 | $1200 |

- Category: **Storage**
- Packs require free `storage` (hard dependency)
- Only one pack may be active at a time — cancel the current pack before buying another size
- Workspaces that already had Team Chat receive free Storage via a one-time grandfather migration

## Permissions

`storage.view` · `storage.manage` (usage UI; pack purchase uses Marketplace permissions)
