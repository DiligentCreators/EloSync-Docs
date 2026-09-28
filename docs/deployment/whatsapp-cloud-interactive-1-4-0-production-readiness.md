# WhatsApp Cloud interactive (1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 |
| **Re-verified** | 2026-09-28 — Playwright WhatsApp Cloud **9/9**; Pest `WhatsAppInteractiveTest` **4/4**; local catalog `whatsapp-cloud=1.4.0` |
| **Status** | **Go for production** (live Meta WABA smoke deferred; merge/deploy remaining) |
| **Scope** | Outbound reply buttons / list messages; inbound `button_reply` / `list_reply`; inbox UI; catalog **whatsapp-cloud 1.3.0 → 1.4.0** |
| **Companion** | [WhatsApp deployment](./whatsapp-cloud) · [Depth rollup](./depth-wa-cal-ai-2026-09-28-production-readiness) · [Overview](/user-guide/whatsapp-cloud-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Agents can send Meta **interactive** messages (≤3 reply buttons or a list) inside the 24-hour customer service window. Inbound button/list replies persist `interactive_payload` (id/title) instead of a stub `[interactive message]` body. Graph outbound/inbound covered by Pest with `Http::fake` and signed webhook fixtures. Live handset smoke against a real WABA is **deferred** (operators should smoke when a test number is available).

**Go / No-Go:** **Go** for engineering deploy. Optional follow-up: one-phone Meta smoke.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| 24h window enforced for interactive (same as text/media) | **Pass** |
| Graph send shape `type: interactive` + button/list | **Pass** (Pest) |
| Webhook button_reply / list_reply idempotent ingest | **Pass** (Pest) |
| Tenant API `POST …/interactive` + MessageResource | **Pass** |
| Inbox composer + render + Playwright coverage | **Pass** — e2e **9/9** (2026-09-28); OAuth success invalidates integration query |
| Catalog migrate-only **1.4.0** + CatalogSeeder | **Pass** |
| Live Meta WABA smoke | **Post-deploy QA** |
| `META_HTTP_FAKE` production hard-fail | **Pass** — boot throws if enabled when `APP_ENV=production` |

## Upgrade & staging smoke

1. `php artisan migrate --force` — `interactive_payload` column + catalog → **1.4.0** (do **not** `db:seed`).
2. Confirm `META_HTTP_FAKE` is **unset** in production.
3. Smoke (when WABA available): open CS window conversation → send reply buttons → tap on phone → reply appears in inbox with id/title.

## Rollback

Roll back catalog bump (`down` → **1.3.0**) and drop `interactive_payload` migration after code rollback. Existing text/media/template paths unchanged.
