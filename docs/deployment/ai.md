# AI Assistant — Deployment

Operational notes for the billable **`ai`** Marketplace module and prepaid credit packs.

Companion readiness audit: [AI production readiness](./ai-production-readiness).

## What ships

| Piece | Notes |
|-------|--------|
| Catalog | `ai` ($29/$290) **1.2.0**, packs `ai-credits-1k` / `5k` / `20k` (require `ai`) |
| Migrations | `2026_08_21_010000` register · `010100` permissions · `010200` tables · `010300` version bump **1.0.1** · `150423` version bump **1.1.0** · `2026_08_25_120000` version bump **1.2.0** |
| Scheduler | `ai:rollover-monthly-credits` (daily UTC period rollover) |
| Rate limits | `throttle:ai` (30/min) on message send + Lead Copilot |
| Queues | None AI-specific — chat/copilot run **synchronously** on the web request |

## Central configuration

Configure under **Central → Settings → AI** (encrypted settings store — not primarily `.env`):

- `ai_enabled`, `ai_allow_platform`, `ai_allow_byok`
- `ai_provider`, `ai_api_key`, `ai_api_base_url` (Ollama / OpenAI-compatible), default / fast / advanced models
- `ai_monthly_included_credits`, `ai_tokens_per_credit`, `ai_max_output_tokens`
- `ai_tool_calling_enabled`

Keep **`APP_KEY`** stable so stored API keys remain decryptable after deploy.

## Tenant configuration

After the workspace entitles `ai`:

- Settings → **AI** — requires **`ai.manage`** (+ `settings.update`); mode (`platform` \| `byok`), provider catalog, optional tenant key and base URL, assistant toggles, instructions
- Platform mode burns EloSync wallet credits (pre-provider ceiling + post-turn burn); BYOK does **not**

## Upgrade

See [Upgrade Guide — AI Assistant platform](./upgrade#ai-assistant-platform-100). Migrate-only; do **not** `db:seed` in production.

## Smoke

1. Central Test AI connection  
2. Entitle `ai` → wallet grant  
3. Ask EloSync + Lead Copilot  
4. Zero credits → HTTP 402 on platform mode  

Full checklist: [production readiness](./ai-production-readiness).
