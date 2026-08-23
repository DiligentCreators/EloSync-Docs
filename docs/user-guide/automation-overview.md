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

## Capabilities (v1.0.0)

- Workflow builder: trigger, conditions (AND/OR), ordered actions
- Manual run + schedule trigger (workspace timezone)
- Event triggers wired for Leads, Tasks, Opportunities, Meetings, Customer Invoices, **WhatsApp Cloud** inbound messages
- Actions: create task/note, assign user, add/remove tag, update field, move stage, send notification, outbound webhook, delay
- Starter templates (new lead follow-up, high-priority task alert, opportunity stage follow-up, invoice created follow-up)
- Run history + step logs
- Module licensing (`module:automation`) + Spatie permissions
- Loop guard: nested domain events during a run do not re-enter the engine

## Permissions

`automation.view` · `create` · `update` · `delete` · `run` · `manage_logs`

## Explicitly deferred

- Marketing Automation / Email Campaigns (separate SKUs)
- Branching, generate quote/invoice/order actions
- Migrating hard-coded Lead tag auto follow-ups or inactivity digests into this engine
