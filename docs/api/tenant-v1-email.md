# Tenant API v1 — Email

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:email`, plus Spatie permission middleware / policies.

Route parameters resolve account, folder, message, template, and signature models by **uuid**. All resources are **personal** — limited to the authenticated user.

Personal mailbox traffic does **not** use `EmailConfigResolver` or Settings → Mail. OAuth is not available in v1 (IMAP/SMTP credentials / app passwords only).

## Accounts

| Method | Path | Permission |
|--------|------|------------|
| GET | `/email/accounts` | `email.view` |
| POST | `/email/accounts` | `email.accounts.manage` |
| GET | `/email/accounts/{uuid}` | `email.view` (own) |
| PUT | `/email/accounts/{uuid}` | `email.accounts.manage` |
| DELETE | `/email/accounts/{uuid}` | `email.accounts.manage` (disconnect + purge local cache) |
| POST | `/email/accounts/test` | `email.accounts.manage` |
| POST | `/email/accounts/{uuid}/sync` | `email.accounts.manage` |
| POST | `/email/accounts/{uuid}/default` | `email.accounts.manage` |

`POST /email/accounts` and `POST /email/accounts/test` accept IMAP + SMTP host/port/encryption/username/password, `email_address`, optional `from_name`, `is_default`. Passwords are stored with the Eloquent `encrypted` cast.

## Folders

| Method | Path | Permission |
|--------|------|------------|
| GET | `/email/accounts/{uuid}/folders` | `email.view` (own account) |
| GET | `/email/folders/{uuid}` | `email.view` (own) |

Returns synced folders (`uuid`, `name`, `type`, `remote_path`, unread/total counts).

## Messages

| Method | Path | Permission |
|--------|------|------------|
| GET | `/email/folders/{uuid}/messages` | `email.view` |
| GET | `/email/accounts/{uuid}/messages/search?q=` | `email.view` |
| GET | `/email/messages/{uuid}` | `email.view` |
| POST | `/email/messages/compose` | `email.create` |
| PUT | `/email/messages/{uuid}` | `email.update` |
| POST | `/email/messages/{uuid}/send` | `email.update` |
| DELETE | `/email/messages/{uuid}` | `email.delete` |
| POST | `/email/messages/{uuid}/link` | `email.update` |
| DELETE | `/email/messages/{uuid}/link` | `email.update` |

Compose body requires `account_uuid`, optional `to`/`cc`/`bcc` arrays, `subject`, `body_html` / `body_text`. Creates a draft; call `send` to queue `SendEmailMessageJob` on `email-sync`.

Update supports `is_read`, `is_starred`, `folder_uuid` (move), and draft field edits.

Link body: `{ "linkable_type": "lead\|contact\|company\|opportunity", "linkable_id": 1 }`.

## Templates

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/email/templates` | view / `email.templates.manage` |
| GET/PUT/DELETE | `/email/templates/{uuid}` | view / manage |
| POST | `/email/templates/{uuid}/render` | `email.view` |

Render body: `{ "variables": { "name": "Ada" } }` → `{ subject, body_html }` with `{{placeholders}}` replaced.

## Signatures

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/email/signatures` | view / `email.signatures.manage` |
| GET/PUT/DELETE | `/email/signatures/{uuid}` | view / manage |

## Ops notes

- Queue workers: `php artisan queue:work --queue=email-sync,emails,default`
- Scheduler: `email:sync` every five minutes
- Production sync requires PHP `ext-imap`
- Platform transactional mail remains under Settings → Mail / Email Logs
