# Tenant API v1 — Email

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:email`, plus Spatie permission middleware / policies.

Route parameters resolve account, folder, message, template, and signature models by **uuid**. Accounts, folders, messages, and signatures are **personal** (authenticated user only). Templates may be **shared** (`is_shared`) for workspace-wide apply.

Personal mailbox traffic does **not** use `EmailConfigResolver` or Settings → Mail. OAuth is not available in v1.x (IMAP/SMTP credentials / app passwords only). Users may connect multiple accounts; compose requires `account_uuid` (SPA sends the mailbox chosen in From).

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

`POST /email/accounts` and `POST /email/accounts/test` accept IMAP + SMTP host/port/encryption/username/password, `email_address`, optional `from_name`, `is_default`, and optional `sync_interval_minutes` (`5` | `10` | `15` | `30` | `60`, default `5`). Passwords are stored with the Eloquent `encrypted` cast. Manual `POST …/sync` always queues a sync regardless of interval.

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

Compose body requires `account_uuid`, optional `to`/`cc`/`bcc` arrays, `subject`, `body_html` / `body_text`, and optional `in_reply_to` / `thread_key` for replies. Creates a draft; call `send` to queue `SendEmailMessageJob` on `email-sync`.

Update supports `is_read`, `is_starred`, `folder_uuid` (IMAP move to another folder on the same account), and draft field edits.

`DELETE /email/messages/{uuid}` moves the message to the account **Trash** folder when present and the message is not already in Trash; otherwise permanently deletes (IMAP expunge + local row). Success message indicates which path ran.

Link body: `{ "linkable_type": "lead\|contact\|company\|opportunity", "linkable_id": 1 }`. Requires `email.update` on the message **and** authorization to `view` the target record (policy). There is no Email SPA linking UI in v1.

## Templates

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/email/templates` | view / `email.templates.manage` |
| GET/PUT/DELETE | `/email/templates/{uuid}` | view / manage (update/delete: creator or workspace owner) |
| POST | `/email/templates/{uuid}/render` | `email.view` (own, shared, or owner) |

Create/update accept `name`, `category`, `subject`, `body_html`, optional `variables`, `is_active`, and **`is_shared`** (boolean; default `true` on create).

List query params:

- `for_compose=1` — active templates the actor may **apply** (own **or** shared). Workspace owner does **not** receive others’ private templates in this mode.
- Without `for_compose` — management list: own **or** shared; workspace owner sees all templates.
- Optional filters: `search`, `category`, `is_active`, `is_shared`.

Resource fields include `uuid`, `is_shared`, `user` `{ id, name, email }`, `can_edit`, `can_delete`. Apply/render always uses `uuid` (names are not unique across users).

Render body: `{ "variables": { "name": "Ada" } }` → `{ subject, body_html }` with `{{placeholders}}` replaced.

## Signatures

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/email/signatures` | view / `email.signatures.manage` |
| GET/PUT/DELETE | `/email/signatures/{uuid}` | view / manage |

## Ops notes

- Queue workers: dedicated `email-sync` daemon (see [deployment](/deployment/email#queue-worker-email-sync)); keep notifications on `emails,default`
- Scheduler: `email:sync` **every minute** — dispatches jobs only for mailboxes whose `sync_interval_minutes` (default 5) has elapsed
- Production sync requires PHP `ext-imap`
- Platform transactional mail remains under Settings → Mail / Email Logs
