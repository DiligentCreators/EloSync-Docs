# Email

Connect **one or more personal** mailboxes to EloSync with IMAP (receive) and SMTP (send). Browse Inbox and folders, compose drafts, send mail, and manage reusable templates and signatures.

Email is a free Marketplace opt-in module. Mailboxes and signatures stay **personal** — each user connects and sees only their own accounts, folders, and messages. Templates can be **shared** with the workspace or kept private.

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

1. Open **Email** in the **Communication** sidebar section.
2. If you have no account, use **Connect your mailbox**. To add another, use **Add mailbox**.
3. Choose a preset or **Custom**:
   - **Gmail** — IMAP/SMTP hosts and ports prefilled; use a Google [App Password](https://support.google.com/accounts/answer/185833) (2-Step Verification required). OAuth sign-in is not available in this version.
   - **Outlook / Microsoft 365** — hosts prefilled; use an app password or SMTP authenticated credentials as your provider allows. OAuth is not available in this version.
   - **Custom** — enter IMAP and SMTP host, port, encryption, and username/password yourself.
4. Enter email address, display name, passwords, and **Auto-sync interval** (default **every 5 minutes**; options 5 / 10 / 15 / 30 / 60).
5. Optionally mark **Default mailbox** (used as the starting From when you compose).
6. **Test** the connection, then save.

Use the mailbox switcher on the Email page to change which inbox you are viewing. Under **Actions** you can edit credentials, **Set as default**, or **Disconnect**.

Your mail provider must allow SMTP from the application server’s IP. If **Test connection** times out after IMAP works, ask the provider to permit SMTP (ports **587** and/or **465**) for that server IP.

**Manual Sync** on the Email page still runs anytime. Background sync uses each mailbox’s interval when the scheduler and `email-sync` queue worker are running.

Disconnect removes the account and synced folders, labels, and messages from EloSync for that mailbox (mail remains on the provider). Attachment **download and upload are not available in this version**; a paperclip badge may appear when the provider reports attachments on a message.

## Inbox and folders

After connect and sync:

- Folders appear in a left pane (Inbox, Drafts, Sent, Trash, Spam, and custom folders from the server).
- Select a folder to list messages; open a row to read in the reading pane. HTML messages render as full HTML (styled layout) in a sandboxed viewer after sanitization; plain-text-only messages show as text.
- Use the **reading pane** control (layout icon next to search) to switch between **Right panel** (default, resizable list width) and **Full panel** (message fills the content area; **Back to list** returns to the split view without changing your saved layout preference). Your choice is remembered in the browser.
- Search filters the current folder (or label) list.
- Use checkboxes to **select multiple messages** (or select all visible in the current list), then **Mark read / unread**, **Move to**, **Labels**, or **Delete** from the bulk toolbar (up to 25 messages per bulk request). Delete follows the same Trash vs permanent rules as a single message.
- **Reply** / **Forward** from the reading pane opens Compose with the thread quoted.
- **Move to** lets you pick another synced folder (IMAP move).
- **Delete** moves the message to **Trash** when that folder exists; deleting again from Trash permanently removes it. If the message is already gone from your real mailbox (deleted in Gmail/Outlook), EloSync still removes it from the Email module instead of showing an error. Temporary mailbox connection failures keep the EloSync copy and show an error so mail is not lost.

Unread counts refresh with sync. Creating folders happens in your mail provider or webmail, then **Sync** in EloSync — folder create from the EloSync UI is not available in this version.

## Labels

Labels are **EloSync-only** tags for organizing mail. They do **not** sync to Gmail/Outlook IMAP folders.

- Under folders in the left pane, the **Labels** heading lists your labels for the selected mailbox.
- Use the tags icon next to **Labels** to create, rename, recolor, or delete labels.
- Open a message and use **Labels** in the reading pane to apply or remove labels (a message can have several).
- Or select several messages and use the bulk **Labels** menu to add or remove a label across the selection.
- Click a label in the sidebar to list every message on that mailbox that has the label (across folders).

Disconnecting a mailbox removes its EloSync labels and assignments. Mail on your provider is unchanged.

## Compose, drafts, and sent

1. Click **Compose** (or **Reply** / **Forward** on a message).
2. Choose **From** among your connected mailboxes (defaults to your default mailbox, or the inbox you are viewing).
3. Fill To / Cc / Bcc, subject, and body in the rich text editor (bold, italic, underline, lists, links, text color).
4. Optionally apply a **template** (fill `{{variables}}`) and choose a **signature**.
5. **Save draft** or **Send**.

Outbound mail uses the SMTP credentials of the **selected From account**, not Settings → Mail. Replies send `In-Reply-To` / thread metadata when available from the original message. Reply and Forward quote the original message as formatted HTML (not raw source).

## Templates

Email templates store a subject and rich-text body with optional `{{snake_case}}` placeholders you fill when composing. Use the same formatting toolbar as compose. Templates are identified by **id/uuid** (names do not need to be unique across the workspace).

1. Open **Email → Templates** (or the Templates tab).
2. Create / edit name, category, subject, body, and variable list.
3. Leave **Shared with workspace** on (default) so teammates can apply the template when composing, or turn it off for a **private** template only you can use.
4. Toggle **Active** to hide a template from the compose picker without deleting it.

**Who can edit or delete:** the creator, or the workspace owner (superadmin). Teammates can apply shared templates but cannot change them.

In compose, the template picker shows **name · creator · Shared/Private** so similarly named templates are easy to tell apart. These templates are separate from [Communication Templates](/user-guide/communication-templates) (WhatsApp and shared channel messages).

## Signatures

1. Open **Email → Signatures**.
2. Create signatures in the rich text editor; mark one as **default** for compose.

Signatures remain **personal** (per user) — they are never shared with the workspace.

## Not yet in the SPA

These capabilities exist partially on the API/schema but are **not exposed in the Email UI** in this version:

- **CRM links** (API can attach a message to a Lead/Contact/Company/Opportunity when you can view that record) — no link control in the reading pane yet
- **Attachment download / compose attach** — sync may flag `has_attachments`; files are not fetched into EloSync storage yet

## Permissions

| Action | Permission | Typical roles |
|--------|------------|---------------|
| View inbox / folders / labels / messages | `email.view` | Admin, Manager |
| Compose / draft / send / flags / move / labels | `email.create` / `email.update` / `email.delete` | Admin, Manager |
| Connect / update / sync / disconnect accounts | `email.accounts.manage` | Admin, Manager |
| Manage templates | `email.templates.manage` | Admin, Manager |
| Manage personal signatures | `email.signatures.manage` | Admin, Manager |

Workspace owners (superadmin) have full access when the module is installed. Policies still enforce **personal isolation** for mailboxes and signatures — you cannot open another user’s mailbox. Shared templates are visible/usable to entitled teammates; private templates stay creator-only for use, while the owner may still edit them.

## Related

- [Communication Templates](/user-guide/communication-templates)
- [Tenant Settings — Mail](/user-guide/tenant-settings#mail)
- [Marketplace](/user-guide/tenant-application#marketplace-add--remove-modules)
