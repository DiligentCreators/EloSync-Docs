# Automation — Developer Guide

Billable marketplace module (`automation` **1.5.0**). Mirrors Tasks packaging; domain logic lives in a cross-module engine that subscribes to existing domain events.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Automation{Workflow,Trigger,Condition,Action,Run,Log}.php` |
| Enums | `AutomationRunStatusEnum`, `AutomationConditionOperatorEnum`, `AutomationLogLevelEnum` |
| Services | `app/Services/Tenant/Automation/*` (`WorkflowService`, `AutomationEngine`, `ConditionEvaluator`, `ActionRunner`, registries, handlers) |
| Related resolver | `Support/AutomationRelatedResolver` — `trigger_assignee`, tag/stage by id or name/slug, related-entity labels |
| Bridge | `IntegrationEventDispatcher` (sole Automation + webhook fan-out; registered in `AppServiceProvider`) |
| Job | `ExecuteAutomationRunJob` on queue `automations` |
| Schedule | `automation:dispatch-schedules` every minute |
| Controllers | `AutomationWorkflowController`, `AutomationRunController`, `AutomationCatalogController`, `AutomationTemplateController` |
| Policies | `AutomationWorkflowPolicy`, `AutomationRunPolicy` |
| Notification | `AutomationWorkflowNotification` (`NotificationSourceEnum::Workflow`) |
| Tests | `tests/Feature/Tenant/Automation/*`, `tests/Unit/Automation/*` |

## Related context (1.1.1+)

- Trigger payloads already include `entity_type` / `entity_id` plus record fields. Entity-bound actions (assign, tag, note, move stage) use that target automatically.
- Config may use semantic **`trigger_assignee`** (resolves `assigned_to` → `new_assignee_id` → `host_id`) for `create_task.assigned_to`, `create_project.assigned_to`, `assign_user.user_id`, and `send_notification.user_ids` (arrays supported).
- Tags/stages accept numeric ids or matching **name/slug**.
- `create_task` appends a related-entity line and posts a note on lead/opportunity/task. Lead **follow-up** requires `create_lead_follow_up: true` (templates enable it).
- `create_project` (**1.4.0**, module `projects`) soft-links `opportunity_id` / `company_id` / `contact_id` from the trigger, optional `starts_in_days` / `ends_in_days`, and notes opportunity/company/contact/lead. Template: `opportunity_stage_create_project`.
- `send_whatsapp_interactive` (**1.5.0**, module `whatsapp-cloud`) wraps `WhatsAppConversationService::queueInteractive` — same conversation/lead resolution as `send_whatsapp_template`. Config: `interactive_type` (`button`|`list`), `body`, optional `footer`, and for `list` also `header` / `action_button` / `sections`, or for `button` `buttons` (id/title pairs, tokens interpolated per row). Requires the conversation's 24-hour customer service window to be open (same rule as manual interactive send). Template: `whatsapp_inbound_quick_replies`.
- `generate_quotation` (**1.5.0**, module `quotations`) drafts a `Quotation` via `QuotationService::create` (status stays `draft`; nothing is sent). **Requires `opportunity_id`** resolved from config or from an `opportunity.*` trigger's `entity_id`; soft-links `company_id` / `contact_id` from the opportunity and notes it. Template: `opportunity_stage_generate_quotation`.
- `generate_invoice` (**1.5.0**, module `invoices`) drafts a `CustomerInvoice` via `CustomerInvoiceService::create` (status stays `draft`). No FK is required — `quotation_id` / `company_id` / `contact_id` soft-link from the trigger when available (`quotation.*` → quotation + its company/contact; `opportunity.*` / `contact.*` / `company.*` → company/contact) and a note is added to that record.
- Manual Run accepts `payload` with related entity fields; SPA dialog picks a record for entity-bound triggers.

## Activation gate

Workflows are always persisted **inactive**. Create/update with `is_active=true` still saves first, then calls `activate()`. Unwired catalog triggers cannot be activated. Triggers/actions whose `module` is not entitled also fail activate (and are disabled in the SPA builder via catalog `available`).

## Loop guard & notification source

- While `AutomationContext` depth &gt; 0, `AutomationEngine::dispatchEvent()` no-ops so action side-effects do not recurse.
- Mentions / DMs use `NotificationSourceEnum::Mention` and `DirectMessage`. Reserve `Workflow` for Automation-fired notifications.

## Trigger / action registries

Modules publish metadata via `AutomationTriggerRegistry` and `AutomationActionRegistry` (singletons with `registerDefaults()`).  
Templates declare `required_modules`; `AutomationTemplateController` filters by entitlement. `WorkflowService::createFromTemplate` rejects missing modules.

Wired trigger families (v1.3.0+): manual/schedule; Leads (including **`lead.converted`**); Tasks; Opportunities; Meetings; Invoices; Payments (`customer_payment.posted`); Credit Notes (`customer_credit_note.applied`); WhatsApp inbound; Help Desk; Contacts; Quotations; Expenses; Employees; Projects (created / status / assigned); Estimates; Contracts; Purchase Orders; Leave requests; Documents; Knowledge Base articles; Assets.

Creating a project with an assignee can emit both `project.created` and `project.assigned` (two intentional domain events). Operators who subscribe both triggers may get two runs for one create — configure one or both deliberately.

## Permissions

```
automation.view | create | update | delete | run | manage_logs
```

Routes: `module:automation` then `can:automation.*`.

## Date and time

Schedule evaluation uses workspace timezone from `TenantSettingService` — see [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes). Daily/weekly/monthly times match within 90 seconds after `H:i`; duplicate schedule runs for the same workflow are suppressed for 2 minutes.

## Outbound webhooks

`OutboundWebhookService` blocks private/loopback hosts (SSRF). Optional HMAC via `AUTOMATION_WEBHOOK_SECRET`. Exhausted `ExecuteAutomationRunJob` retries call `failed()` and persist run status `failed`. The job uses a per-run cache lock (so delay continuations wait instead of overlapping) and `$timeout = 60` (below Redis `retry_after` 90). Action `delay_seconds` is capped at 86400.

## Frontend

| Piece | Path |
|-------|------|
| Pages | `src/pages/automation/*` (`automation-action-config.tsx` pickers + tokens) |
| API | `automationService` in `src/api/services.ts` |
| Nav / routes | `module: 'automation'`, `/automation*` |
| E2E | `npm run test:e2e:automation` |

Builder disables items where `wired=false` (“Coming soon”) or `available=false` (“Module not installed”).

## Explicit non-goals

Marketing Automation, branching, `generate_order` action, and auto-send (Draft is final — the workflow never transitions the document past `draft` or emails/WhatsApps it to the customer) remain deferred. `create_project` shipped in Automation **1.4.0** (requires Projects); `send_whatsapp_interactive` / `generate_quotation` / `generate_invoice` shipped in Automation **1.5.0** (see Related context above). WhatsApp Cloud trigger `whatsapp.message_received` and action `send_whatsapp_template` shipped in Automation **1.1.0** / WhatsApp Cloud **1.2.0**. Help Desk triggers shipped with Help Desk **1.3.0**; SLA escalate template with Help Desk **1.9.0**.
