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

Also invoked lazily via `ensurePeriod()` when wallet period is stale.

### Purchase grant (idempotent)

`grantPurchase($tenant, $credits, $subscriptionReference)` inserts at most **one** `grant_purchase` row per morph reference (pack subscription). Repeat calls are no-ops.

### Burn order

`burn($tenant, $credits)` depletes **included first**, then prepaid. Throws `InsufficientAiCreditsException` when `available < credits` (HTTP **402** on tenant API).

## API surface

`GET /api/tenant/v1/ai/credits` (`ai.use`) returns wallet summary + recent ledger via `AiCreditWalletResource`.

## Gateway gate

When `AiConfig::isPlatform()`:

- Chat / Lead Copilot checks `available >= 1` **before** prompting the agent.
- After the turn, credits burn from token usage: `ceil(total_tokens / ai_tokens_per_credit)` (minimum 1 when tokens > 0).

BYOK mode skips wallet burn.

## Tests

`tests/Feature/Tenant/Ai/AiCreditWalletTest.php` covers proration, burn order, purchase idempotency, and rollover expiration.

`tests/Feature/Tenant/Ai/AiPlatformCreditsGateTest.php` asserts HTTP 402 when the wallet is empty.

## Operations

- Schedule `ai:rollover-monthly-credits` daily (UTC) — see `routes/console.php`.
- Monitor `ai_usage_events` and Central AI usage analytics for operator dashboards.
