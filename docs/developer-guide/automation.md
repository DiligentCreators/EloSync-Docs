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

Schedule evaluation uses workspace timezone from `TenantSettingService` — see [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes).

## Frontend

| Piece | Path |
|-------|------|
| Pages | `src/pages/automation/*` |
| API | `automationService` in `src/api/services.ts` |
| Nav / routes | `module: 'automation'`, `/automation*` |
| E2E | `npm run test:e2e:automation` |

## Explicit non-goals

WhatsApp Cloud triggers, Marketing Automation, Branch / commercial document generators — deferred.
