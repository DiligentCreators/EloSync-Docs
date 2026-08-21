# Tenant API v1 — AI Assistant

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:ai`, plus Spatie permissions noted per route.

Billing: Platform mode burns wallet credits (HTTP **402** when insufficient). BYOK uses the tenant provider key and does not debit the wallet.

## Permissions

| Permission | Purpose |
|------------|---------|
| `ai.use` | Conversations, messages, credits summary, Lead Copilot |
| `ai.confirm` | Confirm or cancel pending write actions |
| `ai.manage` | Update/test workspace AI settings (`PUT /settings` AI keys, `POST /settings/test-ai`) |

## Credits

### GET `/ai/credits`

Requires `ai.use`. Runs `ensurePeriod()` then returns dual-balance wallet summary and recent ledger entries.

```json
{
  "included_remaining": 275,
  "prepaid_balance": 1000,
  "available": 1275,
  "period_ym": "2026-08",
  "recent_ledger": []
}
```

## Conversations

### GET `/ai/conversations`

List current user's conversations (newest first). Requires `ai.use`.

Query: `limit` (default 20).

### POST `/ai/conversations`

Create a conversation. Body: optional `context` object (page/module hints).

### GET `/ai/conversations/{conversation}`

Fetch conversation with messages. Scoped to the authenticated user; foreign workspace IDs → **404**.

### POST `/ai/conversations/{conversation}/messages`

Send a user message and receive structured assistant output.

Body:

```json
{
  "message": "What should I focus on today?",
  "context": { "module": "tasks" }
}
```

Success payload includes:

- `structured.answer`, `structured.insights`, `structured.suggested_actions`, `structured.references`
- `usage` token counts and `credits_burned` (platform mode)
- `recent_messages` (latest user + assistant turns)

Errors:

| Code | When |
|------|------|
| **402** | Platform wallet empty or below pre-provider credit ceiling (`insufficient_ai_credits`) |
| **429** | AI route rate limit (`throttle:ai`) |
| **503** | AI disabled platform-wide or module not entitled |
| **422** | Validation |

## Pending write actions

Low-risk writes (for example `create_task`) create a pending row first.

### POST `/ai/actions/{action}/confirm`

Requires `ai.confirm`. Executes the tool (also requires underlying domain permission, e.g. `tasks.create`).

### POST `/ai/actions/{action}/cancel`

Requires `ai.confirm`. Marks pending action cancelled.

## Lead Copilot

Requires `ai.use` and `view` policy on the lead.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/leads/{lead}/summarize` | One-paragraph overview + themes |
| POST | `/ai/leads/{lead}/next-action` | Recommended next step |
| POST | `/ai/leads/{lead}/draft-follow-up` | Draft message; body `channel`: `general` \| `email` \| `whatsapp` |

Responses mirror conversation message structured output + `usage`.

## Agent tools (server-side)

Tools are not direct HTTP endpoints. The registry exposes them to the agent when module + permission gates pass:

**Leads** (`leads.view`): `search_leads`, `get_lead`, `get_stale_leads`, `get_recent_lead_activity`

**Tasks** (`tasks.view` / `tasks.create`): `search_tasks`, `get_my_tasks`, `get_overdue_tasks`, `get_tasks_due_today`, `create_task` (pending confirmation)

See [AI tools guide](/developer-guide/ai-tools).

## Related

- [AI platform architecture](/architecture/ai-platform)
- [AI credits](/developer-guide/ai-credits)
- [AI Assistant user guide](/user-guide/ai-assistant)
