# Email — Developer Guide

Personal **IMAP/SMTP** mailbox module (`email`, catalog **v1.3.0**). Tenants install it from Marketplace (`is_default_included=false`, `is_billable=false`, prices `$0`). Authorization uses Spatie `email.*` permissions. Mailboxes, folders, messages, labels, and signatures are scoped to the account owner (`user_id` via `EmailAccount`). Templates support `is_shared` for workspace-wide apply.

v1.x uses **app passwords / IMAP+SMTP credentials** only. There is **no OAuth** for Gmail or Microsoft in this version.

## Purpose

- Let each workspace user connect their own mailbox inside EloSync
- Sync folders and messages over IMAP (`ext-imap`)
- Send and save drafts over personal SMTP
- Support shareable templates (`{{variables}}`, `is_shared`) and private signatures; CRM soft-links API exists (no SPA UI in v1)
- Let each user connect **multiple** IMAP/SMTP accounts, mark a default, and choose From when composing
- Support **EloSync-only labels** (many-to-many on messages; not IMAP-synced)

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
      → Controllers (accounts, folders, labels, messages, templates, signatures)
          → EmailAccountService / EmailSyncService / EmailMessageService / EmailLabelService / …
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
| Models | `EmailAccount`, `EmailFolder`, `EmailLabel`, `EmailMessage`, `EmailAttachment`, `EmailSignature`, `EmailTemplate`, `EmailMessageLink` |
| Enums | `EmailFolderTypeEnum`, `EmailMessageDirectionEnum`, `EmailSyncStatusEnum` |
| Contracts | `app/Services/Tenant/Email/Contracts/MailboxClient.php`, `SmtpClient.php` |
| DTOs | `app/Services/Tenant/Email/Dto/RemoteFolder.php`, `RemoteMessage.php`, `RemoteAttachment.php` |
| Clients | `NativeImapMailboxClient`, `SymfonySmtpClient`, fakes for tests |
| Services | `EmailAccountService`, `EmailSyncService`, `EmailMessageService`, `EmailLabelService`, `EmailTemplateService`, `EmailSignatureService` |
| Jobs | `SyncEmailAccountJob`, `SendEmailMessageJob` (`ShouldQueue`, `onQueue('email-sync')`) |
| Command | `email:sync` — dispatches sync jobs for accounts that need sync |
| Controllers | `app/Http/Controllers/Tenant/Api/V1/Email/*` |
| Policy | Personal ownership (`user_id`) + `email.*` abilities |
| Tests | `tests/Feature/Tenant/Email/*` |

Bindings (e.g. `AppServiceProvider`): testing → fakes; otherwise native IMAP + Symfony SMTP.

### Frontend layout

| Piece | Path |
|-------|------|
| Inbox UI | `src/pages/email/email-page.tsx` (folders + resizable list + reading pane; layout right/full; multi-select bulk toolbar) |
| Connect dialog | `email-account-dialog.tsx` (Gmail / Outlook / Custom presets; multi-account) |
| Labels | `email-labels-dialog.tsx`, `email-label-badges.tsx`; apply via reading-pane or bulk Labels menu |
| Reading pane | `email-reading-pane.tsx` (actions, full-panel toggle, sandboxed HTML) |
| Compose | `email-compose-dialog.tsx` (From select, TipTap `RichTextEditor`) |
| Shared editor | `src/components/common/rich-text-editor.tsx` |
| Templates / signatures | `email-templates-page.tsx`, `email-signatures-page.tsx` (+ TipTap body fields) |
| Routes / nav | `/email`, templates & signatures children; `module: 'email'` |
| E2E | `e2e/tests/email/`, `npm run test:e2e:email` (labels lifecycle, layout toggle, multi-select mark read when mailbox has mail) |

## Data model

### `email_accounts`

Per-user connection. Unique `(tenant_id, user_id, email_address)`. Passwords encrypted casts. `sync_status`: `idle` | `syncing` | `error`. Soft deletes.

### `email_folders`

Synced remote folders (`remote_path`, `type` from `EmailFolderTypeEnum`, unread/total counts, `uidvalidity` / `uidnext`). Sync deletes local folder rows whose `remote_path` is missing remotely — **do not** store EloSync-only labels as folders.

### `email_labels`

EloSync-only labels per mailbox (`email_account_id`, `name` unique per account, optional `color` `#RRGGBB`, `sort_order`). Not touched by IMAP sync.

### `email_message_label`

Pivot many-to-many (`email_message_id`, `email_label_id`). Labels may span folders; folder membership remains exclusive via `email_messages.email_folder_id`.

### `email_messages`

Cached message headers/bodies, direction (`inbound` / `outbound`), draft/read/starred flags, `UtcDateTime` for `sent_at` / `received_at`. Unique `(email_folder_id, message_uid)` when UID present. List/show resources include `labels` when eager-loaded.

### `email_attachments`

Schema + client helpers for a future fetch/store/download path (`disk`, `path`, size, mime, inline/`content_id`). **v1 sync does not download attachment bodies**; it may set `email_messages.has_attachments` from headers only.

### `email_templates` / `email_signatures`

Templates: `subject`, `body_html`, optional `variables` JSON, `is_active`, **`is_shared`** (default `true` for new rows; existing rows backfilled `false`). Soft deletes. List scope:

- Management list: own templates **or** `is_shared`; workspace owner (`superadmin`) sees all (including others’ private) for administration.
- Compose list (`for_compose=1`): own **or** shared, and `is_active` — even owner does not get others’ private in the picker.
- Update/delete: creator **or** workspace owner, with `email.templates.manage`.
- Resource includes `user` (creator), `can_edit`, `can_delete`. Identity for apply/render is always `uuid`.
- Render of **inactive** templates is allowed only for users who can update them (creator / workspace owner); other entitled viewers receive 403 so inactive templates cannot be applied from compose.

Signatures: personal CRUD only; `body_html`, `is_default` per user — never shared.

### `email_message_links`

Polymorphic link (`linkable_type` / `linkable_id`) to CRM entities. API requires `email.update` **and** `Gate::authorize('view', $linkable)`. No Email SPA linking UI in v1.

## Sync & send

1. **Connect / test** — `MailboxClient::testConnection` + `SmtpClient::testConnection` before persist.
2. **Sync** — `EmailSyncService` via `SyncEmailAccountJob` on `email-sync`; also forced from `POST …/accounts/{uuid}/sync`.
3. **Schedule** — `Schedule::command('email:sync')->everyMinute()->withoutOverlapping()->onOneServer()` in `routes/console.php`. Dispatches only accounts due per `sync_interval_minutes`.
4. **Send** — compose/draft in DB → `SendEmailMessageJob` → `SmtpClient::send`; append to Sent when IMAP supports it. Reply compose may include `in_reply_to` / `thread_key`.
5. **Move / trash** — `PUT` with `folder_uuid` moves on IMAP. `DELETE` moves to Trash when present; a second delete from Trash permanently removes. Soft-fail local hard-delete applies only when IMAP reports the UID missing (`MailboxMessageNotFoundException`). Auth/network/UID-resolve failures propagate so the EloSync copy is not deleted.
6. **Show / body refresh** — `GET` message runs `EmailMessageService::show`. When `body_html` is `null`, the service re-fetches from IMAP once and persists HTML or `''` (empty string = fetch attempted, no HTML — avoids re-hitting IMAP on every open). Transient fetch failures leave `null` so a later open can retry. `NativeImapMailboxClient` walks nested `multipart/*` parts and converts common MIME charsets to UTF-8.
7. **Labels** — CRUD under `/email/accounts/{uuid}/labels` and `/email/labels/{uuid}`; `PUT /email/messages/{uuid}/labels` syncs `label_uuids` (account-scoped). `GET /email/labels/{uuid}/messages` lists across folders.
8. **Bulk** — `POST /email/messages/bulk` with up to 50 `message_uuids` and `action` (`delete` | `move` | `flags` | `labels`). Reuses single-message services; label mode is `add` / `remove` (not replace-all). Returns `{ processed, failed[] }`; HTTP 422 when none succeed. Permissions: `email.delete` for delete, `email.update` otherwise. Owned messages only.
9. **Disconnect** — delete pivot labels, messages, folders, and labels for that account.

## Permission model

Config: `config/tenant-permissions.php` → `email` actions.

| Permission | Purpose |
|------------|---------|
| `view` | List/show accounts (own), folders, labels, messages |
| `create` / `update` / `delete` | Compose, draft, send, flags, move, delete messages; create/update/delete/apply labels (`update`) |
| `accounts.manage` | Connect, update credentials, test, sync, disconnect, default flag |
| `templates.manage` | Template CRUD + preview/render (edit/delete still require creator or workspace owner) |
| `signatures.manage` | Personal signature CRUD |

Default role map (`config/tenant-default-role-permissions.php`): admin and manager receive the full set; staff may be narrower depending on map. Superadmin/owner gets all via provisioning.

Routes: `module:email` then `can:email.*` / policies. Account/signature/message policies reject cross-user access even with matching permission strings. Template policies allow shared visibility and owner override for update/delete.

## Production registration (no seeders)

| Migration | Responsibility |
|-----------|----------------|
| Schema | `2026_08_06_180010`–`180016` email_* tables; `2026_08_07_*` `is_shared` + catalog **1.1.0**; labels tables + catalog **1.2.0**; bulk/layout SPA + catalog **1.3.0** |
| Catalog | `register_email_module` via `DefaultModuleRegistrar`; version bumps via `bumpVersion` |
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
