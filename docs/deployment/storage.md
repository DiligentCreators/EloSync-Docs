# Storage — Production Guide

Full go-live audit / checklist: [Storage production readiness](./storage-production-readiness).

## Licensing

| Slug | Default included | Billable | Monthly / yearly |
|------|------------------|----------|------------------|
| `storage` | false | false | $0 / $0 |
| `storage-10` | false | true | $4 / $40 |
| `storage-50` | false | true | $12 / $120 |
| `storage-100` | false | true | $20 / $200 |
| `storage-500` | false | true | $75 / $750 |
| `storage-1000` | false | true | $120 / $1200 |

Catalog versions: **1.0.0** for each slug.

## Bootstrap

1. Migrate (registers modules, pack → `storage` dependencies, permissions, Team Chat grandfather)
2. Confirm `CatalogSeeder` is **not** required in production
3. Map Stripe/Creem products for each pack × monthly/yearly in Central → Payment Gateways → Product Mapping
4. Prefer a **dedicated Wasabi/S3 bucket** for EloSync content (keep SQL backups out of the sellable pool)
5. Confirm env (content on S3/Wasabi; branding/avatars stay on the VPS `public` disk):

```env
FILESYSTEM_DISK=s3
FILESYSTEM_UPLOADS_DISK=s3
FILESYSTEM_BRANDING_DISK=public
# FILESYSTEM_AVATAR_DISK=public

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_ENDPOINT=https://s3.wasabisys.com
AWS_URL=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

See [object-storage.md](/developer-guide/object-storage) for Wasabi notes.

6. Migrate order (forward-fix only — **do not** `migrate:rollback` these):
   `2026_08_13_220700` → `220710` → `220720` → `220730` → `233733` (expand grandfather to all workspaces)
7. Verify pack checkout mappings before selling packs:

```bash
php artisan storage:verify-pack-mappings
```

## Upgrade path for packs

Tenants cancel the active pack subscription, then purchase the new size. There is no automatic pack swap/proration helper in v1.

**Warning:** after cancel, allowance falls back to free **1 GiB** immediately. If the workspace already uses more than 1 GiB, further uploads soft-block (`STORAGE_QUOTA_EXCEEDED`) until the new pack is active.

## Monitoring

- Settings → Storage usage per workspace
- Wasabi bucket usage alerts (recommend alert at ~70% of sellable capacity after reserving backup headroom)
- Soft-block codes: `STORAGE_REQUIRED`, `STORAGE_QUOTA_EXCEEDED`, `STORAGE_PACK_CONFLICT`

## Permissions

Owner/manager default roles receive `storage.view` and `storage.manage` via `TenantPermissionSynchronizer`.
