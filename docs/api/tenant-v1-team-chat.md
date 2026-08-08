# Tenant API v1 — Team Chat

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:team-chat`.

Named routes use the `tenant.team-chat.*` prefix. Absolute datetimes serialize as UTC ISO-8601 (`...Z`).

## Authorization notes

| Capability | Rule |
|------------|------|
| List / show conversation metadata | `team-chat.view` — public channels are visible for join UX; private channels and DMs require membership |
| Message history, pins, downloads, search hits in a conversation | Membership (`viewMessages`) — public non-members cannot read history or files |
| Create channel | `team-chat.channels.create` (channel create) or `team-chat.view` (DM / group DM) |
| Update / archive channel, add/remove members | `team-chat.channels.manage` **and** membership; channel conversations only (not DMs) |
| Post / react / pin / attach | `team-chat.messages.create` + membership |
| Edit message | Author with `team-chat.messages.update`, or moderator with `team-chat.messages.delete`; membership required |
| Delete message | Author with `team-chat.messages.update` or `team-chat.messages.delete`, or moderator with `team-chat.messages.delete`; membership required |
| Upload attachment on a message | Own message (or `messages.delete` moderator) + create permission |

Member payloads omit `email`. Read/mute fields are only returned for the acting user’s own membership row.

## Conversations

### GET `/conversations`

Lists conversations the actor belongs to, plus public channels they can join. Ensures `#general` exists and that the actor is a member (cheap per-request join; full active-user join runs on module install only).

### POST `/conversations`

Create a channel, 1:1 DM, or group DM.

- Channel: `type=channel`, `name` (required), optional `visibility` (`public`|`private`), `description`, `member_ids`
- DM: `type=dm`, `user_id` (must not be the actor)
- Group DM: `type=group_dm`, `user_ids` (array)

Reuses an existing 1:1 DM for the same pair (`dm_key`).

### GET `/conversations/{conversation}`

Show metadata + members (names only). Non-members may view **public** channel metadata for join UX.

### PATCH `/conversations/{conversation}`

Permission: `team-chat.channels.manage` + membership. Channel name / description / visibility.

### DELETE `/conversations/{conversation}`

Archives the channel (`is_archived=true`) and clears `slug` so the name can be reused.

### POST `/conversations/{conversation}/join`

Join a **public** channel (idempotent).

### POST `/conversations/{conversation}/members`

Body: `user_ids` (array). Permission: `channels.manage` + membership.

### DELETE `/conversations/{conversation}/members/{user}`

Remove a member. Permission: `channels.manage` + membership.

### POST `/conversations/{conversation}/read`

Marks the conversation read for the actor (`last_read_at`).

## Messages

### GET `/conversations/{conversation}/messages`

Membership required. Query: `before_id`, `limit`, optional `parent_id` (thread replies).

### POST `/conversations/{conversation}/messages`

Body: `body` (required), optional `parent_id` (must belong to the same conversation), optional multipart `attachments[]` (MIME allow-list + max 10 MB each).

Mention syntax: `@[Display Name](user:ID)`.

### PATCH `/conversations/{conversation}/messages/{message}`

Body: `body`. Editing re-syncs mention rows (stale mentions are pruned). Soft-delete of a message removes attachment storage objects immediately.

### DELETE `/conversations/{conversation}/messages/{message}`

Soft-deletes the message and deletes attachment files from storage.

### Reactions / pins

- `POST/DELETE …/messages/{message}/reactions` — body `{ "emoji": "👍" }`
- `POST/DELETE …/messages/{message}/pin`
- `GET …/conversations/{conversation}/pins` — membership required

### Attachments

- `POST …/messages/{message}/attachments` — multipart `attachments[]`
- `GET /attachments/{attachment}/download` — authenticated download (Bearer / Sanctum); membership on the parent conversation required

Allowed MIME types include common images, PDF, plain text/CSV, Office docs, and ZIP.

## Search

### GET `/messages/search?q=`

Searches message bodies in conversations the actor belongs to.

## Realtime (Reverb)

Private channel: `tenant.{tenantId}.conversation.{conversationId}`

Join requires membership + matching tenant. Broadcast payloads include message `attachments` (with `download_url`) and omit member emails. Typing uses client whispers on the same channel.

## Retention

Tenant setting `team-chat.retention_days`: `0` (forever), `30`, `90`, or `365`.

Always schedule `team-chat:purge-expired` in production. When days is `0` the command is a no-op; otherwise it permanently deletes messages older than the window and their storage objects.
