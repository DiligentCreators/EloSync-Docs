# Email

Connect your **personal** mailbox to EloSync with IMAP (receive) and SMTP (send). Browse Inbox and folders, compose drafts, send mail, manage reusable templates and signatures, and optionally link messages to **Leads** or **Contacts**.

Email is a free Marketplace opt-in module. It is **personal-only** — each user connects and sees only their own accounts, folders, and messages.

## Not the same as platform mail or Communication Templates

| Feature | Purpose |
|---------|---------|
| **Email** (this module) | Your personal IMAP/SMTP inbox inside EloSync |
| **Settings → Mail** | Workspace / system **transactional** delivery (invites, password resets, digests, notifications). See [Tenant Settings](/user-guide/tenant-settings#mail). |
| **Communication Templates** | Shared plain-text templates for channels such as WhatsApp from Leads. See [Communication Templates](/user-guide/communication-templates). |
| **Email Logs** | Delivery history for platform/workspace outgoing mail — not your personal mailbox |

Personal mailbox SMTP credentials are **not** the Settings → Mail provider. Connecting Gmail/Outlook here does not change how EloSync sends system notifications.

## Install from Marketplace

1. Open **Marketplace**.
2. Find **Email** (Communication category).
3. Click **Install** (free — `$0`; not included by default on new workspaces).

You need Marketplace purchase permission to install. After install, your role still needs Email permissions (below) and you must connect a mailbox.

## Connect IMAP / SMTP

1. Open **Email** in the navigation.
2. If you have no account, use **Connect your mailbox**.
3. Choose a preset or **Custom**:
   - **Gmail** — IMAP/SMTP hosts and ports prefilled; use a Google [App Password](https://support.google.com/accounts/answer/185833) (2-Step Verification required). OAuth sign-in is not available in this version.
   - **Outlook / Microsoft 365** — hosts prefilled; use an app password or SMTP authenticated credentials as your provider allows. OAuth is not available in this version.
   - **Custom** — enter IMAP and SMTP host, port, encryption, and username/password yourself.
4. Enter email address, display name, and passwords.
5. **Test** the connection, then save.

You can sync on demand from the Email page. Background sync runs periodically when workers and the scheduler are configured.

Disconnect removes the account and synced folders, messages, and attachments from EloSync for that mailbox (mail remains on the provider).

## Inbox and folders

After connect and sync:

- Folders appear in a left pane (Inbox, Sent, Drafts, Trash, Spam, and custom folders from the server).
- Select a folder to list messages; open a row to read in the reading pane.
- Search filters the current folder list.
- Mark read/unread, move, or delete as supported by the UI and your permissions.

Unread counts refresh with sync.

## Compose, drafts, and sent

1. Click **Compose**.
2. Fill To / Cc / Bcc, subject, and body.
3. Optionally apply a **template** (fill `{{variables}}`) and choose a **signature**.
4. **Save draft** or **Send**.

Outbound mail uses your connected **personal SMTP** account, not Settings → Mail.

## Templates

Personal email templates store a subject and HTML body with optional `{{snake_case}}` placeholders you fill when composing.

1. Open **Email → Templates** (or the Templates tab).
2. Create / edit name, category, subject, body, and variable list.
3. Toggle **Active** to hide a template from the compose picker without deleting it.

These templates are **yours only**. They are separate from [Communication Templates](/user-guide/communication-templates) (WhatsApp and shared channel messages).

## Signatures

1. Open **Email → Signatures**.
2. Create HTML signatures; mark one as **default** for compose.

Signatures are personal (per user).

## Link to Leads and Contacts

From a message, link (or unlink) matching **Leads** or **Contacts** so CRM records can show related mail. Linking does not move mail out of your personal mailbox or share the full inbox with teammates.

## Permissions

| Action | Permission | Typical roles |
|--------|------------|---------------|
| View inbox / folders / messages | `email.view` | Admin, Manager |
| Compose / draft / send / flags / move | `email.create` / `email.update` / `email.delete` | Admin, Manager |
| Connect / update / sync / disconnect accounts | `email.accounts.manage` | Admin, Manager |
| Manage personal templates | `email.templates.manage` | Admin, Manager |
| Manage personal signatures | `email.signatures.manage` | Admin, Manager |

Workspace owners (superadmin) have full access when the module is installed. Policies still enforce **personal isolation** — you cannot open another user’s mailbox.

## Related

- [Communication Templates](/user-guide/communication-templates)
- [Tenant Settings — Mail](/user-guide/tenant-settings#mail)
- [Marketplace](/user-guide/marketplace)
