# AI Platform Architecture

Cross-cutting **AI Assistant** capability for EloSync workspaces. Product surface is licensed as the billable `ai` marketplace module; prepaid credit packs are additive SKUs that depend on `ai`.

## Goals

- Answer business questions using **trusted workspace context** (modules, permissions, timezone).
- Expose **read-only tools** gated by module entitlement and Spatie permissions (including cross-module `search_workspace`).
- Require **explicit confirmation** before low-risk writes (for example `create_task`).
- Support **Platform billing** (Central provider + credit wallet) or **BYOK** (tenant-owned API key).

## High-level layout

```text
Tenant UI / API
    └── AIGateway (orchestration)
            ├── AiConfigResolver (platform | byok | central)
            ├── AiCreditWalletService (included + prepaid buckets)
            ├── AIToolRegistry + LaravelToolAdapter (permission-aware tools)
            ├── PendingAiActionService (write confirmation)
            ├── EloSyncBusinessAgent (laravel/ai structured output)
            ├── AiUsageRecorder + PlatformAuditService
            └── ContextBuilder (workspace + page context)
```

## Billing modes

| Mode | Source | Credits |
|------|--------|---------|
| **Platform** | Central `ai_api_key` when `ai_allow_platform` | Burns wallet credits per token usage |
| **BYOK** | Tenant `ai_api_key` when `ai_mode=byok` and `ai_allow_byok` | No platform credit burn |
| **Central** | Central key (operator/test flows) | N/A for tenant chat |

Workspace setting `ai_mode` defaults to `platform`. Tenant keys never appear in admin API payloads (masked as `********`).

## Credit wallet

Each workspace has one `ai_wallets` row:

- **`included_remaining`** — monthly allowance from the AI module subscription; expires on rollover.
- **`prepaid_balance`** — purchased packs (`ai-credits-*` SKUs); carries over month to month.

Ledger entries in `ai_credit_ledgers` record grants, burns, expirations, and purchase idempotency (reference = subscription).

Scheduled command: `ai:rollover-monthly-credits` (see [AI credits guide](/developer-guide/ai-credits)).

## Authorization layers

1. **Module gate** — `module:ai` on tenant routes.
2. **Permissions** — `ai.use`, `ai.confirm`, `ai.manage` (see `config/tenant-permissions.php`).
3. **Tool registry** — each tool declares `module()` + `permissions()`; destructive tools are excluded.
4. **Policies** — Lead Copilot endpoints call `Gate::authorize('view', $lead)`.
5. **Tenant isolation** — `BelongsToTenant` global scope; foreign conversation IDs return 404.

## Data model (tenant DB)

| Table | Purpose |
|-------|---------|
| `ai_conversations` | User-owned chat threads |
| `ai_messages` | User/assistant turns + structured JSON |
| `ai_pending_actions` | Write proposals awaiting confirmation |
| `ai_wallets` | Dual-balance credit store |
| `ai_credit_ledger` | Immutable wallet movements |
| `ai_usage_events` | Token/credit telemetry |
| `ai_tool_executions` | Tool audit trail |

## Lead Copilot

Focused endpoints on a single lead (`summarize`, `next-action`, `draft-follow-up`) reuse the gateway, wallet gate, and structured agent schema without tool calling.

## Related docs

- [AI tools — developer guide](/developer-guide/ai-tools)
- [AI credits — developer guide](/developer-guide/ai-credits)
- [Tenant AI API](/api/tenant-v1-ai)
- [AI Assistant — user guide](/user-guide/ai-assistant)
- [Module dependencies — AI packs](/architecture/module-dependencies)
- [AI deployment](/deployment/ai) · [Production readiness](/deployment/ai-production-readiness)
