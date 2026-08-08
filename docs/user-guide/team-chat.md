# Team Chat — User Guide

Install **Team Chat** from Marketplace (free Collaboration module). Until it is installed, the Team Chat nav item and `/team-chat` page stay hidden.

## Who can use Team Chat?

Workspace users with a login — owners, admins, managers, and staff — after the module is installed and their role includes the relevant permissions (at least `team-chat.view`).

Employees without a linked login cannot open EloSync, so they cannot use Team Chat.

**Guests** (external participants without a workspace login) are not supported in this version; that is planned for a later release.

## Install

1. Open **Marketplace**.
2. Find **Team Chat** (Collaboration category).
3. Click **Install** (free — `$0`; not included by default on new workspaces; not billable yet).

You need Marketplace purchase permission to install. After install, your role still needs Team Chat permissions (below).

On install, the workspace provisions a public **#general** channel and joins every active (verified, non-suspended) user automatically. Opening Team Chat later re-checks that #general exists and that active users are members.

## Open Team Chat

Open **Team Chat** from the sidebar (`/team-chat`).

## Channels, DMs, and group DMs

| Type | Behavior |
|------|----------|
| **Public channel** | Visible in the sidebar to everyone with `team-chat.view`. Join to read and post. Creating a channel requires `team-chat.channels.create`. |
| **Private channel** | Invite-only. Non-members cannot open or join; someone with `team-chat.channels.manage` adds members. |
| **Direct message (DM)** | 1:1 conversation with another workspace user. Opening a DM with the same person reuses the existing thread. Anyone with `team-chat.view` can start a DM. |
| **Group DM** | Multi-person direct conversation (created with a list of users). |

#general is the default company-wide public channel. It cannot be deleted.

### Channel creator settings

If you **created** a channel, open **Channel settings** (gear) in the conversation header to:

- Rename the channel or edit its description
- Switch visibility **public ↔ private**
- **Permanently delete** the channel and all of its history (messages, reactions, pins, and attachments) by typing the exact channel name to confirm

Only the creator can change visibility or delete the channel. Deleting #general is blocked.

## Messages

With `team-chat.messages.create` you can post in conversations you belong to.

- **Send** — press **Enter** to send; **Shift+Enter** inserts a new line.
- **@mentions** — type `@` and pick a teammate. Mentions use the same `@[Name](user:id)` token pattern as lead notes / task comments and notify the mentioned member.
- **Threads** — reply to a message to keep a side conversation under the parent.
- **Reactions** — add or remove emoji reactions on a message.
- **Edit / delete** — authors with `team-chat.messages.update` can edit their own messages; `team-chat.messages.delete` (or update on own messages, depending on role) can remove them.
- **Pins** — pin important messages in a conversation; pinned messages are listed for everyone in that room.
- **Typing** — teammates see when someone is typing in the open conversation (realtime over Reverb).
- **Attachments** — upload files on a message; files are stored on the workspace object storage disk (S3 in production) under a Team Chat path and downloaded through the app (not a public URL).
- **Search** — search message text across conversations you can access (`mod+f` focuses search on the Team Chat page).

## Notifications and unread

- **Bell** — @mentions and new direct messages create in-app notifications (`team-chat.mentioned`, `team-chat.direct_message`). Clicking a notification deep-links into `/team-chat` for that conversation (and message when provided).
- **Unread** — each conversation shows an unread count based on messages after your last read; opening a conversation marks it read.

Realtime delivery uses the existing per-user notification channel plus the conversation channel for live message updates.

## Retention

Workspace admins set how long Team Chat keeps messages and attachments:

| Setting | Key | Options |
|---------|-----|---------|
| **Message & file retention** | `team-chat.retention_days` | **30**, **90**, **365** days, or **Forever** |

This is one workspace-wide setting (Settings → Team Chat when the module is installed). **Forever** keeps history indefinitely. Otherwise a scheduled purge permanently removes messages older than the window (attachments go with those messages).

## Keyboard shortcuts

On the Team Chat page (same pattern as other modules):

| Shortcut | Action |
|----------|--------|
| `n` | Start a new conversation / channel (permission-gated) |
| `mod+f` (⌘F / Ctrl+F) | Focus Team Chat search |

## Permissions

| Permission | Ability |
|------------|---------|
| `team-chat.view` | Open Team Chat, list/join public channels, open DMs; read messages, search, and download attachments in conversations you belong to |
| `team-chat.channels.create` | Create public/private channels (creators can later edit visibility / delete their own channels) |
| `team-chat.channels.manage` | Add/remove members on channels where you are a moderator, or with this permission |
| `team-chat.messages.create` | Post messages, reactions, pins, attachments |
| `team-chat.messages.update` | Edit own messages |
| `team-chat.messages.delete` | Delete messages (moderators / elevated roles) |

Default role map grants full Team Chat permissions to **admin** and **manager**. **Staff** get view, channel create, and message create/update (not channel manage or message delete). Workspace owners (`superadmin`) receive all permissions via provisioning.

## Related

- [Tenant Settings](/user-guide/tenant-settings) — retention and other workspace settings
- [Marketplace](/user-guide/tenant-application#marketplace-add--remove-modules)
