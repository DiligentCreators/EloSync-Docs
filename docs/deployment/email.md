# Email — Deployment

## Production deploy (migrate-only)

```bash
php artisan migrate --force
php artisan optimize
```

This ships:

1. Schema for `email_accounts`, `email_folders`, `email_messages`, `email_attachments`, `email_signatures`, `email_templates`, `email_message_links`
2. Catalog row for free opt-in module `email` (data migration — **not** default-included)
3. Additive permission grants for default roles (`email.*`)

Do **not** run `db:seed`, `CatalogSeeder`, or any permission seeder in production for this module.

## PHP IMAP extension

Personal sync uses PHP’s native `imap_*` API (`NativeImapMailboxClient`). Ensure `ext-imap` is enabled on **every** app and queue host that runs sync/connect:

```bash
php -m | grep -i imap
```

Without the extension, account test/sync fails with a clear runtime error. Do not rely on Composer IMAP packages for v1.

## Queue worker (`email-sync`)

Sync and outbound personal send jobs use the **`email-sync`** queue (not the platform `emails` notification queue).

```bash
php artisan queue:work --queue=email-sync,default
```

Run a supervised worker that includes `email-sync` on production (Forge / Cloud / Supervisor). Keep personal mailbox jobs separate from transactional `emails` / `emails-high` capacity.

After credential or queue config changes, restart workers.

## Scheduler

Ensure the scheduler is running. The Email module registers:

```bash
php artisan email:sync
```

every **five minutes** with `withoutOverlapping`, dispatching `SyncEmailAccountJob` for accounts that need sync.

```bash
* * * * * php /path/to/artisan schedule:run
```

## Attachment storage

Fetched and composed attachments persist on the Laravel filesystem disk recorded on `email_attachments` (`disk` + `path`, default disk typically `local` / private storage).

Operational notes:

- Disconnect / account delete removes local attachment files for that mailbox
- Disk growth scales with sync depth and attachment size — monitor storage on app servers (or the configured disk)
- Prefer a private disk not web-accessible
- Size caps: enforce provider-safe limits on upload/compose; refuse oversized payloads rather than buffering unbounded MIME into memory during sync/send
- Tune PHP `memory_limit` and queue `--timeout` for large mailboxes

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
cd SaaS-Frontend
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
