# AI Credits — Developer Guide

Platform-billed AI usage is metered through a **dual-balance wallet** per workspace.

## Buckets

| Bucket | Column | Source | Rollover |
|--------|--------|--------|----------|
| **Included** | `ai_wallets.included_remaining` | AI module activation + monthly grant | Expires unused balance each period |
| **Prepaid** | `ai_wallets.prepaid_balance` | Credit pack subscriptions (`ai-credits-*`) | Never expires on rollover |

`available = included_remaining + prepaid_balance`.

## Configuration

Central settings (see `SystemSettingDefinitions` / `SystemSettingsSeeder`):

| Key | Purpose |
|-----|---------|
| `ai_monthly_included_credits` | Full-month included grant after rollover / activation refresh |
| `ai_tokens_per_credit` | Tokens per burned credit (minimum 1 credit per billable turn) |

Pack sizes map in `config/ai-credits.php`:

```php
'packs' => [
    'ai-credits-1k' => 1000,
    'ai-credits-5k' => 5000,
    'ai-credits-20k' => 20000,
],
```

## Lifecycle events

### First AI module activation (mid-month)

`GrantAiCreditsOnModuleActivate` calls `AiCreditWalletService::proratedIncludedAmount()`:

```text
prorated = ceil((days_left / days_in_month) * monthly_included)
```

Ledger type: `grant_prorated`.

### Monthly rollover

Command: `php artisan ai:rollover-monthly-credits`

For each entitled workspace whose `period_ym` ≠ current UTC `Y-m`:

1. Ledger `expire_included` for remaining included balance.
2. Grant fresh `grant_included` for `ai_monthly_included_credits`.
3. **Prepaid balance unchanged.**

Also available as `AiCreditWalletService::ensurePeriod()` for request-path catch-up when `period_ym` is stale. **Wired on** chat, Lead Copilot, and `GET /ai/credits` (catalog **1.0.1+**). The scheduled command remains the primary monthly job — see [production readiness](/deployment/ai-production-readiness).

### Purchase grant (idempotent)

`grantPurchase($tenant, $credits, $subscriptionReference)` inserts at most **one** `grant_purchase` row per morph reference (pack subscription). Repeat calls are no-ops.

### Burn order

`burn($tenant, $credits)` depletes **included first**, then prepaid, under a wallet **`lockForUpdate()`**. Throws `InsufficientAiCreditsException` when `available < credits` (HTTP **402** on tenant API).

## API surface

`GET /api/tenant/v1/ai/credits` (`ai.use`) returns wallet summary + recent ledger via `AiCreditWalletResource` (runs `ensurePeriod()` first).

## Gateway gate

When `AiConfig::isPlatform()`:

- Chat / Lead Copilot run `ensurePeriod()`, then assert the wallet can cover a **conservative credit ceiling** (prompt token estimate × 1.25 + `ai_max_output_tokens` + tool buffer) **before** prompting the agent.
- Agent completion tokens are capped via `EloSyncBusinessAgent::maxTokens()`.
- After the turn, credits burn from actual token usage: `ceil(total_tokens / ai_tokens_per_credit)` (minimum 1 when tokens > 0).

BYOK mode skips wallet burn.

## Tests

`tests/Feature/Tenant/Ai/AiCreditWalletTest.php` covers proration, burn order, purchase idempotency, rollover expiration, `ensurePeriod`, and `assertAvailable`.

`tests/Feature/Tenant/Ai/AiPlatformCreditsGateTest.php` asserts HTTP 402, pre-provider ceiling gate, and credits-summary lazy rollover.

## Operations

- Schedule `ai:rollover-monthly-credits` daily (UTC) — see `routes/console.php`.
- Monitor `ai_usage_events` and Central AI usage analytics for operator dashboards.
