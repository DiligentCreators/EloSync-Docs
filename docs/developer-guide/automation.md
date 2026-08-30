# Automation — Developer Guide

Billable marketplace module (`automation` v1.0.0). Mirrors Tasks packaging; domain logic lives in a cross-module engine that subscribes to existing domain events.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Automation{Workflow,Trigger,Condition,Action,Run,Log}.php` |
| Enums | `AutomationRunStatusEnum`, `AutomationConditionOperatorEnum`, `AutomationLogLevelEnum` |
| Services | `app/Services/Tenant/Automation/*` (`WorkflowService`, `AutomationEngine`, `ConditionEvaluator`, `ActionRunner`, registries, handlers) |
| Bridge | `Listeners/AutomationEventBridge` (registered in `AppServiceProvider`) |
| Job | `ExecuteAutomationRunJob` on queue `automations` |
| Schedule | `automation:dispatch-schedules` every minute |
| Controllers | `AutomationWorkflowController`, `AutomationRunController`, `AutomationCatalogController`, `AutomationTemplateController` |
| Policies | `AutomationWorkflowPolicy`, `AutomationRunPolicy` |
| Notification | `AutomationWorkflowNotification` (`NotificationSourceEnum::Workflow`) |
| Tests | `tests/Feature/Tenant/Automation/*`, `tests/Unit/Automation/*` |

## Activation gate

Workflows are always persisted **inactive**. Create/update with `is_active=true` still saves first, then calls `activate()`. Unwired catalog triggers (for example `contact.created`) cannot be activated — the row stays inactive and the API returns validation errors on `trigger`.

## Loop guard & notification source

- While `AutomationContext` depth &gt; 0, `AutomationEngine::dispatchEvent()` no-ops so action side-effects do not recurse.
- Mentions / DMs use `NotificationSourceEnum::Mention` and `DirectMessage`. Reserve `Workflow` for Automation-fired notifications.

## Trigger / action registries

Modules publish metadata via `AutomationTriggerRegistry` and `AutomationActionRegistry` (singletons with `registerDefaults()`).  
`wired=false` stubs appear in the catalog but cannot be activated.

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
| Pages | `src/pages/automation/*` |
| API | `automationService` in `src/api/services.ts` |
| Nav / routes | `module: 'automation'`, `/automation*` |
| E2E | `npm run test:e2e:automation` |

## Explicit non-goals

Marketing Automation, Branch / commercial document generators — deferred. WhatsApp Cloud trigger `whatsapp.message_received` and action `send_whatsapp_template` shipped in Automation **1.1.0** / WhatsApp Cloud **1.2.0**. Help Desk triggers `help_desk.ticket_created`, `help_desk.ticket_status_changed`, `help_desk.sla_breached` shipped with Help Desk **1.3.0**.
