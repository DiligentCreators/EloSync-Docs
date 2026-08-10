# Automation

Workflow Automation lets your workspace react to CRM and operations events without custom code.

## Install

1. Open **Marketplace** and install **Automation** (billable add-on).
2. Ensure your role includes Automation permissions (Admin gets full access by default).
3. Open **Automation** in the sidebar.

## Build a workflow

1. **New** or pick a **Template**.
2. Choose a **trigger** (Lead created, Task completed, Manual, Schedule, …). Triggers for modules you have not installed are unavailable.
3. Add optional **conditions** (field / operator / value; AND or OR groups).
4. Add one or more **actions** in order (create task, notify, webhook, …).
5. **Save**. Use **Activate** when ready — only active workflows run.

### Triggers (v1)

| Trigger | When |
|---------|------|
| Manual | You click Run |
| Schedule | Daily / weekly / monthly / cron (workspace timezone) |
| Lead created / updated / assigned | Lead lifecycle |
| Task created / completed / assigned | Task lifecycle |
| Opportunity created / stage changed / assigned | Pipeline |
| Meeting created / completed | Meetings |
| Customer invoice created | Invoicing |

Some catalog entries may show as “coming soon” until their bridge ships; you cannot activate those yet.

### Actions (v1)

| Action | Notes |
|--------|------|
| Create task | Requires Tasks module |
| Create note | On lead / task / opportunity from the triggering entity |
| Assign user | Sets assignee on the entity |
| Add / remove tag | Lead or task tags |
| Update field | Allowlisted fields only |
| Move stage | Opportunity (and Lead stage when applicable) |
| Send notification | In-app; `source=workflow` |
| Webhook | Signed outbound HTTP POST |
| Delay | Wait before the next step |

## Templates

Use **Templates** to seed a draft workflow (inactive). Edit conditions/actions, then activate.

## Runs

**Runs** shows each execution with status and step logs. Failures keep an error message for troubleshooting. Manual **Run** is useful for testing.

## Coexistence with built-in Lead rules

Lead tag auto follow-ups and inactivity digests remain hard-coded product rules. They are **not** replaced by Automation in v1 — you can use both.

## Timezone

Schedule triggers use the workspace timezone from **Settings → General**. Absolute timestamps in run logs follow the same convention as other modules.
