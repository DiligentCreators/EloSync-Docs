# Automation WhatsApp interactive + document draft actions (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-01 |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Automation actions `send_whatsapp_interactive`, `generate_quotation`, `generate_invoice`; catalog **automation 1.4.0 → 1.5.0** (no `whatsapp-cloud` bump — interactive *send* already shipped in WhatsApp Cloud **1.4.0**) |
| **Companion** | [Automation developer guide](/developer-guide/automation) · [Automation create_project 1.4.0](./automation-create-project-1-4-0-production-readiness) · [WhatsApp interactive 1.4.0](./whatsapp-cloud-interactive-1-4-0-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

Three Phase 1 automation actions, all following the existing `create_project` / `send_whatsapp_template` related-context pattern (no new architecture):

- **`send_whatsapp_interactive`** (module `whatsapp-cloud`) wraps `WhatsAppConversationService::queueInteractive` — reply buttons or a list, same conversation/lead resolution as `send_whatsapp_template`. Requires the conversation's 24-hour customer service window to be open (existing rule, unchanged).
- **`generate_quotation`** (module `quotations`) drafts a `Quotation` via `QuotationService::create`. Status always stays **`draft`** — nothing is sent. **Requires `opportunity_id`** (from action config or an `opportunity.*` trigger); soft-links company/contact from the opportunity and notes it (mirrors `create_project`'s soft-link + note pattern).
- **`generate_invoice`** (module `invoices`) drafts a `CustomerInvoice` via `CustomerInvoiceService::create`. Status always stays **`draft`**. No FK is required; soft-links `quotation_id` / `company_id` / `contact_id` from the trigger when available and notes that record.

Two optional starter templates: `opportunity_stage_generate_quotation` (opportunities + quotations) and `whatsapp_inbound_quick_replies` (whatsapp-cloud). Builder config shipped for all three actions in the SPA.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.5.0**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Action registry (`config_fields`) + `ActionRunner` handler map | **Pass** |
| `send_whatsapp_interactive` — conversation/lead resolution, CS-window guard, button/list payload mapping | **Pass** |
| `generate_quotation` — requires `opportunity_id`; soft-link + note; fails run clearly when unresolved | **Pass** |
| `generate_invoice` — optional soft-links (quotation/opportunity/contact/company); note on trigger entity | **Pass** |
| Both generated documents remain `draft` (never auto-sent) | **Pass** (verified via service call, no status transition) |
| Starter templates `opportunity_stage_generate_quotation` / `whatsapp_inbound_quick_replies` | **Pass** |
| SPA action config (WhatsApp interactive type/body/buttons/list/footer; quotation/invoice title/notes/assignee/opportunity picker) | **Pass** |
| Catalog migrate-only **automation 1.5.0** + CatalogSeeder | **Pass** |
| Pest (automation suite) | **39/40** — 1 pre-existing unrelated failure (see below) |
| Frontend `tsc -b` + `oxlint` | **Pass** (no new errors; pre-existing warnings only) |

### Pre-existing unrelated failure (not introduced by this change)

`AutomationEngineSupportTest::it declares CatalogSeeder companion versions for automation catalog bumps` expects `contacts => '1.6.0'` but `CatalogSeeder` already has `contacts => '1.7.0'` (shipped by the separate Contact/Company follow-ups + import/export change, 2026-09-30). Reproduced identically on `origin/main` before this branch's changes. Out of scope for this PR — flagged for a follow-up one-line test fix.

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `automation` → **1.5.0** (do **not** `db:seed`).
2. Entitle Automation + WhatsApp Cloud (interactive) / Quotations / Invoices as needed.
3. **WhatsApp interactive:** open a conversation inside the 24h CS window → workflow with `send_whatsapp_interactive` (button type) → Manual Run or trigger `whatsapp.message_received` → confirm queued interactive message with correct buttons.
4. **Generate quotation:** activate `opportunity_stage_generate_quotation` (or a custom workflow) → change an opportunity's stage → confirm a **draft** quotation with soft-linked company/contact and an opportunity note.
5. **Generate invoice:** workflow on `quotation.created` with `generate_invoice` → confirm a **draft** invoice linked to the quotation (quotation/company/contact) and a note on the quotation.
6. Confirm neither generated document transitions past `draft` and no email/WhatsApp send is triggered by these actions.

## Rollback

Catalog `down` → **1.4.0**. No schema changes (existing tables only) — code rollback removes the three action classes/registry entries; no cleanup required.
