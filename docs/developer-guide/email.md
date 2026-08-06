# Email — Developer Guide

Personal **IMAP/SMTP** mailbox module (`email`). Tenants install it from Marketplace (`is_default_included=false`, `is_billable=false`, prices `$0`). Authorization uses Spatie `email.*` permissions. Mailboxes are **personal** — every account, folder, message, template, and signature is scoped to `user_id`.

v1 uses **app passwords / IMAP+SMTP credentials** only. There is **no OAuth** for Gmail or Microsoft in this version.

## Purpose

- Let each workspace user connect their own mailbox inside EloSync
- Sync folders and messages over IMAP (`ext-imap`)
- Send and save drafts over personal SMTP
- Support personal templates (`{{variables}}`) and signatures; CRM soft-links API exists (no SPA UI in v1)

## Separation from platform mail

| Concern | Personal Email module | Platform / transactional mail |
|---------|----------------------|-------------------------------|
| Config | Per-user `EmailAccount` IMAP/SMTP credentials (encrypted passwords) | `EmailConfigResolver` + Central/tenant Settings → Mail |
| Send path | `SmtpClient` (`SymfonySmtpClient`) | Laravel Mail / `EmailManager` drivers |
| Queue | `email-sync` | `emails` / `emails-high` (notifications) |
| Logs | Module tables (`email_messages`, …) | `email_logs` / Email Logs UI |

**Do not** call `EmailConfigResolver`, `EmailManager`, or Settings mail drivers for personal mailbox sync or send. Mixing them would route user mail through platform providers or steal notification queue capacity.

## Architecture

```text
SPA /email
  → Tenant API /api/tenant/v1/email/*
      → Controllers (accounts, folders, messages, templates, signatures)
          → EmailAccountService / EmailSyncService / EmailMessageService / …
              → MailboxClient (IMAP)  — list folders, fetch, flags, move, append
              → SmtpClient (SMTP)     — test + send
          → Jobs on queue email-sync
              → SyncEmailAccountJob
              → SendEmailMessageJob
  → Schedule: email:sync every minute (due by sync_interval_minutes; withoutOverlapping)
```

| Concern | Implementation |
|---------|----------------|
| Licensing | Catalog slug `email` + `module:email` middleware |
| Authorization | `email.{view,create,update,delete,accounts.manage,templates.manage,signatures.manage}` + personal policies |
| IMAP | `NativeImapMailboxClient` when `extension_loaded('imap')`; otherwise clear `RuntimeException` |
| SMTP | `SymfonySmtpClient` with dynamic mailer config from the account row |
| Tests | `FakeMailboxClient` / `FakeSmtpClient` bound in testing |
| Audit | Light `PlatformAuditService` on connect / disconnect |

### Backend layout

| Piece | Path |
|-------|------|
| Models | `EmailAccount`, `EmailFolder`, `EmailMessage`, `EmailAttachment`, `EmailSignature`, `EmailTemplate`, `EmailMessageLink` |
| Enums | `EmailFolderTypeEnum`, `EmailMessageDirectionEnum`, `EmailSyncStatusEnum` |
| Contracts | `app/Services/Tenant/Email/Contracts/MailboxClient.php`, `SmtpClient.php` |
| DTOs | `app/Services/Tenant/Email/Dto/RemoteFolder.php`, `RemoteMessage.php`, `RemoteAttachment.php` |
| Clients | `NativeImapMailboxClient`, `SymfonySmtpClient`, fakes for tests |
| Services | `EmailAccountService`, `EmailSyncService`, `EmailMessageService`, `EmailTemplateService`, `EmailSignatureService` |
| Jobs | `SyncEmailAccountJob`, `SendEmailMessageJob` (`ShouldQueue`, `onQueue('email-sync')`) |
| Command | `email:sync` — dispatches sync jobs for accounts that need sync |
| Controllers | `app/Http/Controllers/Tenant/Api/V1/Email/*` |
| Policy | Personal ownership (`user_id`) + `email.*` abilities |
| Tests | `tests/Feature/Tenant/Email/*` |

Bindings (e.g. `AppServiceProvider`): testing → fakes; otherwise native IMAP + Symfony SMTP.

### Frontend layout

| Piece | Path |
|-------|------|
| Inbox UI | `src/pages/email/email-page.tsx` (3-pane + connect empty state) |
| Connect dialog | `email-account-dialog.tsx` (Gmail / Outlook / Custom presets) |
| Compose | `email-compose-dialog.tsx` (TipTap `RichTextEditor`) |
| Shared editor | `src/components/common/rich-text-editor.tsx` |
| Templates / signatures | `email-templates-page.tsx`, `email-signatures-page.tsx` (+ TipTap body fields) |
| Routes / nav | `/email`, templates & signatures children; `module: 'email'` |
| E2E | `e2e/tests/email/`, `npm run test:e2e:email` |

## Data model

### `email_accounts`

Per-user connection. Unique `(tenant_id, user_id, email_address)`. Passwords encrypted casts. `sync_status`: `idle` | `syncing` | `error`. Soft deletes.

### `email_folders`

Synced remote folders (`remote_path`, `type` from `EmailFolderTypeEnum`, unread/total counts, `uidvalidity` / `uidnext`).

### `email_messages`

Cached message headers/bodies, direction (`inbound` / `outbound`), draft/read/starred flags, `UtcDateTime` for `sent_at` / `received_at`. Unique `(email_folder_id, message_uid)` when UID present.

### `email_attachments`

Schema + client helpers for a future fetch/store/download path (`disk`, `path`, size, mime, inline/`content_id`). **v1 sync does not download attachment bodies**; it may set `email_messages.has_attachments` from headers only.

### `email_templates` / `email_signatures`

Personal CRUD; soft deletes. Templates: `subject`, `body_html`, optional `variables` JSON, `is_active`. Signatures: `body_html`, `is_default` per user.

### `email_message_links`

Polymorphic link (`linkable_type` / `linkable_id`) to CRM entities. API requires `email.update` **and** `Gate::authorize('view', $linkable)`. No Email SPA linking UI in v1.

## Sync & send

1. **Connect / test** — `MailboxClient::testConnection` + `SmtpClient::testConnection` before persist.
2. **Sync** — `EmailSyncService` via `SyncEmailAccountJob` on `email-sync`; also forced from `POST …/accounts/{uuid}/sync`.
3. **Schedule** — `Schedule::command('email:sync')->everyMinute()->withoutOverlapping()->onOneServer()` in `routes/console.php`. Dispatches only accounts due per `sync_interval_minutes`.
4. **Send** — compose/draft in DB → `SendEmailMessageJob` → `SmtpClient::send`; append to Sent when IMAP supports it. Reply compose may include `in_reply_to` / `thread_key`.
5. **Move / trash** — `PUT` with `folder_uuid` moves on IMAP. `DELETE` moves to Trash when present; a second delete from Trash permanently removes.
6. **Disconnect** — delete folders/messages (and any future stored attachment rows/files) for that account.

## Permission model

Config: `config/tenant-permissions.php` → `email` actions.

| Permission | Purpose |
|------------|---------|
| `view` | List/show accounts (own), folders, messages |
| `create` / `update` / `delete` | Compose, draft, send, flags, move, delete messages |
| `accounts.manage` | Connect, update credentials, test, sync, disconnect, default flag |
| `templates.manage` | Personal template CRUD + preview/render |
| `signatures.manage` | Personal signature CRUD |

Default role map (`config/tenant-default-role-permissions.php`): admin and manager receive the full set; staff may be narrower depending on map. Superadmin/owner gets all via provisioning.

Routes: `module:email` then `can:email.*` / policies. Policies reject cross-user access even with matching permission strings.

## Production registration (no seeders)

| Migration | Responsibility |
|-----------|----------------|
| Schema | `2026_08_06_180010`–`180016` email_* tables |
| Catalog | `register_email_module` via `DefaultModuleRegistrar` |
| Permissions | `add_email_permissions` via `TenantPermissionSynchronizer` |

Production:

```bash
php artisan migrate --force
php artisan optimize
```

Do **not** run `CatalogSeeder` or permission seeders in production for this module. See [deployment/email.md](/deployment/email).

## PHP requirement: `ext-imap`

`NativeImapMailboxClient` requires the PHP IMAP extension. Without it, connect/sync fails with an explicit runtime error. Do **not** add `webklex/php-imap` (or similar Composer IMAP wrappers) for v1.

## Related

- [API reference](/api/tenant-v1-email)
- [User guide](/user-guide/email)
- [Deployment](/deployment/email)
- [Multi-Provider Email](/developer-guide/multi-provider-email) — platform transactional mail (separate)
- [Communication Templates](/developer-guide/communication-templates)
- [Module Development Standard](/developer-guide/module-development)
