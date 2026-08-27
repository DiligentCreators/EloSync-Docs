# Email — Deployment

## Production deploy (migrate-only)

```bash
php artisan migrate --force
php artisan optimize
```

This ships:

1. Schema for `email_accounts`, `email_folders`, `email_labels`, `email_message_label`, `email_messages`, `email_attachments`, `email_signatures`, `email_templates`, `email_message_links`
2. Catalog row for free opt-in module `email` (data migration — **not** default-included); later migrations bump catalog version (e.g. **1.1.0** shared templates, **1.2.0** EloSync labels, **1.3.0** reading-pane layout + multi-select bulk API) via `DefaultModuleRegistrar::bumpVersion`
3. Additive permission grants for default roles (`email.*`)
4. Additive template column `is_shared` (existing rows backfilled private)

Do **not** run `db:seed`, `CatalogSeeder`, or any permission seeder in production for this module.

## PHP IMAP extension

Personal sync uses PHP’s native `imap_*` API (`NativeImapMailboxClient`). Ensure `ext-imap` is enabled on **every** app and queue host that runs sync/connect:

```bash
php -m | grep -i imap
```

Without the extension, account test/sync fails with a clear runtime error. Do not rely on Composer IMAP packages for v1.

On **PHP 8.4+**, IMAP is unbundled (PECL). Windows / Laravel Herd:

1. Download the matching NTS build from [PECL imap Windows releases](https://downloads.php.net/~windows/pecl/releases/imap/) (e.g. `php_imap-1.0.3-8.4-nts-vs17-x64.zip` for Herd PHP 8.4 NTS x64).
2. Copy `php_imap.dll` into the PHP `ext` directory (Herd: `%USERPROFILE%\.config\herd\bin\php84\ext\`).
3. Add `extension=imap` to that version’s `php.ini`, then `herd restart`.
4. Confirm with `php -m` (must list `imap`).

## Queue worker (`email-sync`)

Sync and outbound personal send jobs use the **`email-sync`** queue (not the platform `emails` notification queue).

### Local / Supervisor

```bash
php artisan queue:work redis --queue=email-sync --sleep=1 --tries=3 --timeout=300 --max-time=3600
```

Keep personal mailbox jobs separate from transactional `emails` / `emails-high` capacity. After credential or queue config changes, restart workers.

### Laravel Forge daemon (recommended)

Add a **second** API daemon (do not mix into the notifications worker):

| Field | Value |
|-------|--------|
| Command | `php artisan queue:work redis --queue=email-sync --sleep=1 --tries=3 --timeout=300 --max-time=3600` |
| User | `forge` |
| Directory | Same as the API release root (`…/current` or site path) |
| Processes | `1` (scale if many concurrent mailbox syncs) |

Ensure PHP `ext-imap` is enabled on the Forge server (see above). Deploy scripts should already run `queue:restart` so both daemons pick up new code.

## Scheduler

Enable Forge **Scheduler** (`schedule:run` every minute). The Email module registers:

```bash
php artisan email:sync
```

**every minute** with `withoutOverlapping` + `onOneServer`. The command only dispatches `SyncEmailAccountJob` for accounts that are due based on each mailbox’s `sync_interval_minutes` (default **5**, options 5 / 10 / 15 / 30 / 60). Manual Sync from the SPA always dispatches immediately.

```bash
* * * * * php /path/to/artisan schedule:run
```

## Attachment storage (deferred)

The `email_attachments` table and client helpers exist for a future download/compose path. **v1 sync does not persist attachment files** to disk; it may set `has_attachments` from IMAP headers only. Prefer a private disk and monitor growth when that path ships.

Personal attachments are unrelated to platform email log body storage (`EMAIL_LOGS_STORE_BODY`).

## What the data migrations do (and do not do)

### `register_email_module`

Uses `App\Support\Catalog\DefaultModuleRegistrar`:

- Ensures Communication category + `email` catalog row **if missing**
- `is_default_included=false`, `is_billable=false`, monthly/yearly `0`
- Does **not** auto-install for existing or new workspaces
- Never overwrites commercial flags if the row already exists

### `add_email_permissions`

Uses `App\Support\Permissions\TenantPermissionSynchronizer`:

- Creates missing `email.*` vocabulary
- Grants missing defaults to mapped roles (additive only)
- Never `syncPermissions()` / never revokes customizations

## New workspaces

Email is **not** in `installDefaultModules()`. Owners install from Marketplace when needed. RBAC vocabulary exists after migrate; roles receive mapped grants from the permission data migration / provisioning maps.

## Verification

```bash
php artisan test --compact tests/Feature/Tenant/Email
php -m | grep -i imap
```

Frontend (optional):

```bash
cd EloSync-Frontend
npm run test:e2e:email
```

Smoke after deploy:

1. Marketplace shows **Email** as free to install
2. After install + `email.accounts.manage`, user can open `/email` and see **Connect your mailbox**
3. With `ext-imap` + worker on `email-sync`, test connection and sync succeed for app-password mailboxes
4. Settings → Mail and notification queues remain unchanged
5. User A cannot list User B’s accounts or messages

## Related

- [Platform production runbook](/deployment/platform-production-runbook)
- [Module development — production](/deployment/module-development)
- [Developer guide](/developer-guide/email)
- [Multi-Provider Email](/developer-guide/multi-provider-email) — transactional mail queues (`emails`)
