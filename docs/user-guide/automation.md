# Automation

Workflow Automation lets your workspace react to CRM and operations events without custom code.

## Install

1. Open **Marketplace** and install **Automation** (billable add-on).
2. Ensure your role includes Automation permissions (Admin gets full access by default).
3. Open **Automation** in the **Operations** sidebar section.

## Build a workflow

1. **New** or pick a **Template**.
2. Choose a **trigger** (Lead created, Task completed, Manual, Schedule, …). Triggers for modules you have not installed are unavailable.
3. For **Schedule**, set frequency (daily / weekly / monthly / cron) and time in the **workspace timezone**.
4. Add optional **conditions** — pick fields from the trigger’s payload (AND or OR groups).
5. Add one or more **actions** in order. People, tags, and stages use searchable pickers; notify supports **multiple recipients** including **Record assignee (from trigger)**.
6. For **Create task** on a Lead trigger, optionally tick **Also create a lead follow-up** (off by default; templates may enable it).
7. **Save** (inactive) or **Save & activate**. Only active workflows run. Triggers marked **Coming soon** can be saved but not activated.

### Manual Run

From the workflow list, **Run** opens a dialog. For event-style triggers (Lead created, Task completed, …) pick a related record so actions receive assignee and entity context. Manual / Schedule triggers run without a related record.

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
| Create task | Requires Tasks module. Defaults to **record assignee**. Always notes the triggering lead/opportunity/task; optional **lead follow-up** via `create_lead_follow_up`. |
| Create note | On lead / task / opportunity from the triggering entity |
| Assign user | Sets assignee on the triggering entity (picker) |
| Add / remove tag | Tag picker for the trigger’s module |
| Update field | Allowlisted fields for the trigger entity |
| Move stage | Stage picker (leads / opportunities) |
| Send notification | In-app; multi-recipient including record assignee; `source=workflow` |
| Webhook | Signed outbound HTTP POST |
| Delay | Wait before the next step |

Use `{{field}}` chips in titles/bodies (for example `{{name}}`) to insert values from the triggering record.

## Templates

Use **Templates** to seed a draft workflow (inactive). Edit conditions/actions, then activate.

## Runs

**Runs** shows each execution with status and step logs. Failures keep an error message for troubleshooting. Manual **Run** is useful for testing.

## Coexistence with built-in Lead rules

Lead tag auto follow-ups and inactivity digests remain hard-coded product rules. They are **not** replaced by Automation in v1 — you can use both.

## Timezone

Schedule triggers use the workspace timezone from **Settings → General**. Absolute timestamps in run logs follow the same convention as other modules.
