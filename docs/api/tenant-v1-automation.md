# Tenant API v1 — Automation

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:automation`, plus `can:automation.*`.

## Catalog

### GET `/automation/catalog/triggers`

Permission: `automation.view`.

Returns trigger definitions: `key`, `label`, `module`, `wired`, `available` (module entitled), `entity`, `payload_fields`.

### GET `/automation/catalog/actions`

Permission: `automation.view`.

Same shape for actions (`required` module when applicable).

## Templates

### GET `/automation/templates`

Permission: `automation.view`. List starter templates (`key`, `name`, `description`).

### POST `/automation/templates`

Permission: `automation.create`. Body: `{ "template_key": "new_lead_follow_up" }`. Creates an **inactive** workflow.

## Workflows

### GET `/automation/workflows`

Query: `search`, `is_active`, `trigger_type`, `sort`, `direction`, `page`, `per_page`.

### POST `/automation/workflows`

Permission: `automation.create`.

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
