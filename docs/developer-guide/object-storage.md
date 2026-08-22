# Object Storage (Wasabi / S3-Compatible)

Production file uploads use Laravel’s filesystem abstraction with an S3-compatible backend (Wasabi by default). Local development continues to use the `public` disk. Switching backends requires **environment variables only** — no code changes.

## Architecture

| Concern | Behavior |
|---------|----------|
| Default disk | `FILESYSTEM_DISK` (`public` locally, `s3` in production) |
| Uploads disk | `FILESYSTEM_UPLOADS_DISK` (defaults to `FILESYSTEM_DISK`) — imports, attachments, exports |
| Branding disk | `FILESYSTEM_BRANDING_DISK` (defaults to uploads disk) — logo/favicon only |
| Avatar disk | `FILESYSTEM_AVATAR_DISK` (default `public`) — profile photos only; never follows S3 |
| Upload entrypoint | `App\Services\Storage\FileUploadService` (+ `UserAvatarService` for avatars) |
| DB values | Relative object keys only (e.g. `branding/logos/….png`) |
| Public URLs | Always via `FileUploadService::url()` / `Storage::disk(…).url()` |
| Private downloads | Prefer `temporaryUrl()` when the driver supports it |
| Tenant isolation | Key prefixes `tenants/{tenant_uuid}/…` on a shared disk |

Stancl’s `FilesystemTenancyBootstrapper` remaps only the private `local` disk. Uploads stay on the shared `public` / `s3` disk so object keys match across environments and after `storage:migrate-to-s3`.

## Object key layout

```text
branding/logos/
branding/favicons/
tenants/{tenant_uuid}/branding/logos/
tenants/{tenant_uuid}/branding/favicons/
tenants/{tenant_uuid}/feedback/       # feedback screenshots (quota-counted)
tenants/{tenant_uuid}/documents/      # Documents module (quota-counted)
tenants/{tenant_uuid}/whatsapp/{conversation_id}/  # WhatsApp Cloud media (quota-counted)
tenants/{tenant_uuid}/users/{user_id}/avatars/
central/logos/
central/branding/
central/users/{user_id}/avatars/
team-chat/{tenant_uuid}/{conversation_id}/   # chat attachments (quota-counted)
imports/{tenant_uuid}/                       # lead import CSVs + error reports (quota-counted)
exports/
temp/
```

Legacy `tenant-logos/` keys may still exist on disk until rewritten; new admin uploads use `tenants/{uuid}/branding/logos/`.

## Local development

```env
FILESYSTEM_DISK=public
```

```bash
php artisan storage:link
```

URLs resolve as `{APP_URL}/storage/{key}`.

Optional override (defaults to `FILESYSTEM_DISK`):

```env
FILESYSTEM_UPLOADS_DISK=public
```

## Production (Wasabi)

```env
FILESYSTEM_DISK=s3

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_ENDPOINT=https://s3.us-east-1.wasabisys.com
AWS_URL=https://s3.us-east-1.wasabisys.com/your-bucket
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Never hardcode Wasabi hostnames in application code. Set `AWS_ENDPOINT` / `AWS_URL` per region and bucket.

The same `s3` disk works with AWS S3, Cloudflare R2, MinIO, and DigitalOcean Spaces — change endpoint/URL/credentials only.

### Branding + avatars on local public disk

Keep logos/favicons and **profile avatars** on the API server while other uploads stay on S3:

```env
FILESYSTEM_DISK=s3
FILESYSTEM_BRANDING_DISK=public
# Avatars default to public — do not point FILESYSTEM_AVATAR_DISK at s3
APP_URL=https://your-api-domain.com
```

```bash
php artisan storage:link
php artisan config:clear
```

Branding and avatar URLs resolve as `{APP_URL}/storage/{key}`. After switching branding from S3 → `public`, **re-upload** logo/favicon (existing S3 keys will not resolve on the public disk).

**Zero-downtime / multi-release:** persist `storage/app/public` (and the `public/storage` symlink via `artisan storage:link`) across releases. On Laravel Forge zero-downtime deploys, `storage` is shared between releases by default — do not wipe it in the deploy script. On multi-instance hosts, mount a shared volume at `storage/app/public` so avatars and branding survive deploy swaps.

### Bucket recommendations

| Topic | Guidance |
|-------|----------|
| Visibility | When branding stays on S3: public-read for logos/favicons. Keep private modules/exports private and serve via temporary URLs. |
| Bucket policy | Allow `s3:GetObject` for public prefixes if objects are public; never grant public `PutObject` / `DeleteObject`. |
| CORS | Allow SPA origins (`FRONTEND_URL` + admin hosts) for `GET` (and `PUT` only if you later introduce direct browser uploads). |
| Credentials | IAM / Wasabi keys with least privilege on this bucket only; never expose in the SPA. |
| Versioning | Optional on the bucket for recoverability of branding assets. |

### `storage:link`

Required when branding, avatars, or uploads use the `public` disk. Keep the symlink in production whenever `FILESYSTEM_BRANDING_DISK` / `FILESYSTEM_AVATAR_DISK` is `public`.

## Migrating existing local files

After pointing production at S3, copy existing `storage/app/public` objects **except** profile avatars (`*/avatars/*` keys are skipped — they stay on the public disk):

```bash
# Preview
php artisan storage:migrate-to-s3 --dry-run

# Copy (idempotent — skips keys that already exist and all /avatars/ paths)
php artisan storage:migrate-to-s3

# Force re-upload (still skips avatars)
php artisan storage:migrate-to-s3 --force
```

Options: `--source=public` (default), `--destination=s3` (default).

Database paths are already relative keys and do **not** need rewriting when directory structure is preserved.

## Workspace quota (Storage module)

Content uploads on the uploads disk are gated by [`WorkspaceStorageService`](/developer-guide/storage) when the free **Storage** module (or a capacity pack) is entitled. Branding and avatars stay on the VPS disks and are **not** counted toward quota. See [Storage](/user-guide/storage-overview).

## Application usage

```php
use App\Services\Storage\FileUploadService;

$path = $uploads->store($file, FileUploadService::tenantBrandingDirectory($tenantId, 'logos'));
$url = $uploads->url($path);
$uploads->delete($path);
```

Controllers must not call `store()` / `Storage::disk('public')` directly for user uploads.

## Workspace content quota

Tenant **content** uploads (Team Chat attachments, feedback screenshots, lead imports) are gated by the [Storage](/developer-guide/storage) marketplace module (`WorkspaceStorageService` + `config/storage.php`). Branding and avatars stay on the VPS disks above and **do not** count toward that quota.

## Security

- Branding validation rejects SVG and non-image MIME types (`UploadBrandingAssetRequest` / tenant equivalent).
- Filenames are generated (`uuid_timestamp.ext`); client filenames are never trusted as object keys.
- Paths with `..` or absolute URLs are never deleted through `FileUploadService::delete()`.

## Deploy checklist

1. Create Wasabi (or other) bucket + access key.
2. Set `FILESYSTEM_DISK=s3` and `AWS_*` on the app server / secrets store.
3. Set `FILESYSTEM_BRANDING_DISK=public` (avatars already default to `public` via `FILESYSTEM_AVATAR_DISK`). Run `php artisan storage:link`, confirm `APP_URL` is the public HTTPS API origin, and keep `storage/app/public` on shared storage for zero-downtime deploys.
4. Deploy code with `league/flysystem-aws-s3-v3`.
5. Run `php artisan storage:migrate-to-s3` once (or `--dry-run` first) when migrating local objects to S3 — avatar keys under `*/avatars/*` are skipped.
6. Smoke-test Central + tenant logo/favicon + profile avatar upload, replace, delete, and public URLs (`curl -I` the returned `logo_url` / `avatar_url`).
7. Confirm SPA `img` tags receive absolute URLs from the API (no hardcoded Vite-host `/storage` paths).

## Related

- `settings/settings-production.md`
- `settings/tenant-settings-production.md`
- `architecture/platform-production-runbook.md`
