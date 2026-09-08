# Automation

Workflow Automation lets your workspace react to CRM and operations events without custom code.

## Install

1. Open **Marketplace** and install **Automation** (billable add-on).
2. Ensure your role includes Automation permissions (Admin gets full access by default).
3. Install any **business modules** the journey needs (for example Leads + Tasks, or Help Desk + Tasks).
4. Open **Automation** in the **Operations** sidebar section.

## Build a workflow

1. **New** or pick a **Template**.
2. Choose a **trigger**. Triggers for modules you have not installed are marked **Module not installed** and cannot be activated until that module is entitled.
3. For **Schedule**, set frequency (daily / weekly / monthly / cron) and time in the **workspace timezone**.
4. Add optional **conditions** — pick fields from the trigger’s payload (AND or OR groups).
5. Add one or more **actions** in order. People, tags, and stages use searchable pickers; notify supports **multiple recipients** including **Record assignee (from trigger)**.
6. For **Create task** on a Lead trigger, optionally tick **Also create a lead follow-up** (off by default; templates may enable it).
7. **Save** (inactive) or **Save & activate**. Only active workflows run.

### Manual Run

From the workflow list, **Run** opens a dialog. For event-style triggers pick a related record so actions receive assignee and entity context. Manual / Schedule triggers run without a related record.

### Recipes (real-world journeys)

| Recipe | Trigger | Typical actions | Modules |
|--------|---------|-----------------|---------|
| New lead follow-up | Lead created | Create task + lead follow-up + notify | Automation, Leads, Tasks |
| High-priority task alert | Task created (priority = high) | Notify assignee | Automation, Tasks |
| Opportunity stage chase | Opportunity stage changed | Create follow-up task | Automation, Opportunities, Tasks |
| Invoice created follow-up | Customer invoice created | Task + notify | Automation, Invoices, Tasks |
| Payment posted notify | Customer payment posted | Notify AR owner | Automation, Payments |
| Credit note applied | Credit note applied | Notify assignee | Automation, Credit Notes |
| Help Desk SLA escalate | Help Desk SLA breached | Notify + escalate task | Automation, Help Desk, Tasks |
| WhatsApp inbound triage | WhatsApp message received | Notify (+ optional WA template) | Automation, WhatsApp Cloud |
| Contact welcome | Contact created | Welcome task + notify | Automation, Contacts, Tasks |
| Quotation follow-up | Quotation created | Follow-up task | Automation, Quotations, Tasks |
| Large expense alert | Expense created (amount ≥ 1000) | Notify | Automation, Expenses |
| Employee onboarding | Employee created | Onboarding task | Automation, Employees, Tasks |
| Project kickoff | Project created | Kickoff task + notify | Automation, Projects, Tasks |

Starter **Templates** seed the same journeys when the required modules are installed.

### Triggers (v1.3)

| Trigger family | When |
|----------------|------|
| Manual / Schedule | You click Run, or workspace-timezone schedule |
| Leads / Tasks / Opportunities / Meetings | CRM lifecycle |
| Contacts / Quotations / Expenses / Employees | Stubbed triggers now wired |
| Invoices / Payments / Credit Notes | Billing lifecycle (invoice created; payment posted; credit applied) |
| Help Desk | Ticket created, status changed, SLA breached |
| WhatsApp Cloud | Inbound message received |
| Projects | Created, status changed, assigned |
| Estimates / Contracts / Purchase Orders | Created |
| Leave / Documents / Knowledge Base / Assets | Created |

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
| Send WhatsApp template | Requires WhatsApp Cloud |
| Webhook | Signed outbound HTTP POST |
| Delay | Wait before the next step |

Use `{{field}}` chips in titles/bodies (for example `{{name}}`) to insert values from the triggering record.

## Templates

Use **Templates** to seed a draft workflow (inactive). The list only shows templates whose **required modules** are installed. Edit conditions/actions, then activate.

## Runs

**Runs** shows each execution with status and step logs. Failures keep an error message for troubleshooting. Manual **Run** is useful for testing.

## Coexistence with built-in Lead rules

Lead tag auto follow-ups and inactivity digests remain hard-coded product rules. They are **not** replaced by Automation in v1 — you can use both.

## Timezone

Schedule triggers use the workspace timezone from **Settings → General**. Absolute timestamps in run logs follow the same convention as other modules.
