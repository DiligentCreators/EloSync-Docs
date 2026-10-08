# Tenant API v1 — Automation

Catalog: **automation 1.8.0**.

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:automation`, plus `can:automation.*`.

### Document generate actions (config)

| Action | Module | Notable config |
|--------|--------|----------------|
| `generate_quotation` | `quotations` | `opportunity_id` (required unless opportunity trigger); `auto_send` (**1.6.0**); `auto_send_whatsapp` (**1.7.0**); optional `conversation_id` |
| `generate_invoice` | `invoices` | Soft-links from trigger; same `auto_send` / `auto_send_whatsapp` |
| `generate_order` | `purchase-orders` | Creates a **Purchase Order**; `vendor_id` (required unless vendor trigger); `auto_send` / `auto_send_whatsapp` (**1.8.0**) |

`auto_send*` are booleans (default false). When enabled and delivery cannot complete (missing email / closed WhatsApp window / no conversation), the run **fails** after the document status transition.

## Catalog

### GET `/automation/catalog/triggers`

Permission: `automation.view`.

Returns trigger definitions: `key`, `label`, `module`, `wired`, `available` (module entitled), `entity`, `payload_fields`.

### GET `/automation/catalog/actions`

Permission: `automation.view`.

Same shape for actions (`required` module when applicable).

## Templates

### GET `/automation/templates`

Permission: `automation.view`. List starter templates (`key`, `name`, `description`, `required_modules`) filtered to templates whose required modules are installed in the current workspace.

### POST `/automation/templates`

Permission: `automation.create`. Body: `{ "template_key": "new_lead_follow_up" }`. Creates an **inactive** workflow.

## Workflows

### GET `/automation/workflows`

Query: `search`, `is_active`, `trigger_type`, `sort`, `direction`, `page`, `per_page`.

### POST `/automation/workflows`

Permission: `automation.create`. Workflows are always stored inactive first. `is_active: true` then attempts activation and returns 422 (workflow remains inactive) when the trigger is not wired.

```json
{
  "name": "Manual notify",
  "description": "optional",
  "is_active": false,
  "trigger": { "type": "manual", "config": null },
  "conditions": [
    { "field": "priority", "operator": "eq", "value": ["high"], "logic_group": "and", "sort_order": 0 }
  ],
  "actions": [
    { "type": "send_notification", "config": { "title": "Hi", "message": "There" }, "delay_seconds": 0, "sort_order": 0 }
  ]
}
```

Operators: `eq`, `neq`, `contains`, `starts_with`, `ends_with`, `gt`, `gte`, `lt`, `lte`, `empty`, `not_empty`, `in`, `not_in`.

### GET `/automation/workflows/{id}`

Includes trigger, conditions, actions, creator.

### PUT `/automation/workflows/{id}`

Permission: `automation.update`. Same body as create (partial fields per Form Request).

### DELETE `/automation/workflows/{id}`

Soft delete. Permission: `automation.delete`.

### POST `/automation/workflows/{id}/activate`

Permission: `automation.update`. Fails if trigger is not wired or required modules are missing.

### POST `/automation/workflows/{id}/deactivate`

Permission: `automation.update`.

### POST `/automation/workflows/{id}/run`

Permission: `automation.run`. Body: optional `{ "payload": { ... } }`. Creates a run and queues `ExecuteAutomationRunJob`.

## Runs

### GET `/automation/runs`

Permission: `automation.view` or `automation.manage_logs`.

Query: `workflow_id`, `status`, `search`, pagination.

### GET `/automation/runs/{id}`

Includes logs when loaded.
