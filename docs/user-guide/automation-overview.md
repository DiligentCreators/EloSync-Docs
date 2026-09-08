# Automation Module

Cross-module workflow engine for EloSync. Install from Marketplace (billable add-on), then build trigger → condition → action workflows that react to domain events across any installed module.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [automation.md](/user-guide/automation) |
| Engineers | [automation.md](/developer-guide/automation) |
| Production / ops | [automation.md](/deployment/automation) |
| Tenant API | [tenant-v1-automation.md](/api/tenant-v1-automation) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |

## Capabilities (v1.3.0)

- Workflow builder: trigger, conditions (AND/OR), ordered actions
- Manual run + schedule trigger (workspace timezone; builder configures frequency/time)
- Event triggers wired across CRM, sales, billing, Help Desk, WhatsApp, HR, projects, documents, KB, and assets — gated by installed modules (`available` in catalog)
- Related-context UX: people/tag/stage pickers; multi-notify; **Record assignee**; Manual Run related-record dialog; opt-in lead follow-up
- Actions: create task/note, assign user, add/remove tag, update field, move stage, send notification, WhatsApp template, outbound webhook, delay
- Starter templates filtered by entitled modules (lead/task/opportunity/invoice/payment/credit note/contact/quotation/expense/employee/Help Desk SLA/project recipes)
- Run history + step logs
- Module licensing (`module:automation`) + Spatie permissions
- Loop guard: nested domain events during a run do not re-enter the engine
- Single event fan-out via `IntegrationEventDispatcher` (no dual Automation bridge)

## Permissions

`automation.view` · `create` · `update` · `delete` · `run` · `manage_logs`

## Explicitly deferred

- Marketing Automation / Email Campaigns (separate SKUs)
- Branching, generate quote/invoice/order actions, `create_project` action
- Migrating hard-coded Lead tag auto follow-ups or inactivity digests into this engine
