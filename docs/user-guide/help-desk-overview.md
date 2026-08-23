# Help Desk Module

Operations module on the frozen platform. An internal ticketing MVP — number, subject, description, tenant-managed category, priority, status workflow, assignment, notes, activity timeline, optional due date, and KPIs — with **soft, optional** links to Contacts and Companies. Unlike many CRM modules that hard-depend on Contacts, Help Desk is **standalone**: it installs with no module dependencies and works fully on its own.

> **Not Central Feedback**
>
> [Give Feedback](/user-guide/feedback) is the platform bug/feature intake flow (Tenant submit → Central triage). Help Desk is a **tenant-scoped** internal support queue for your workspace team — distinct product, permissions, and data model.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [help-desk.md](/user-guide/help-desk) |
| Engineers | [help-desk-developer.md](/developer-guide/help-desk) |
| Production / ops | [help-desk-production.md](/deployment/help-desk) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [expenses-overview.md](/user-guide/expenses-overview) |
| Tenant API | [../api/tenant-v1-help-desk.md](/api/tenant-v1-help-desk) |

## Capabilities

- Header ticket: number (`HD-` prefix, configurable), subject, description, tenant-managed category, priority (`low` / `medium` / `high` / `urgent`), status, optional `due_at`
- Optional `contact_id` and `company_id` — soft links, only validated (and only pickable in the UI) when the corresponding module is entitled on the workspace
- Optional **Knowledge Base** article links (soft M2M) when `knowledge-base` is entitled — pick published articles (or drafts when the actor has `knowledge-base.update`); backlinks on article view when Help Desk is entitled
- Status workflow: `open → in_progress | waiting | resolved | closed`; `resolved → closed | open`; `closed → open`
- Content edits blocked when status is **Closed** — use status actions, assignment, and notes instead
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `help-desk.assign`
- Notes (comments) + activity timeline
- Table view with search, status/priority/category filters, assignee filter, overdue filter, and **My Tickets** toggle; **Manage categories** dialog (same `help-desk.*` permissions as ticket CRUD)
- KPIs via `GET /help-desk/stats` (total, mine, open, in progress, waiting, resolved, closed, overdue)
- Dashboard widget `help_desk_my_open` (module + `help-desk.view`; assignee-scoped like list)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:help-desk`) + Spatie permissions — **free Marketplace opt-in**, no hard dependencies
- In-app notifications on assignment, close, and reopen
- Audit + activity logging
- `due_at` stored in UTC; overdue KPIs and filters use workspace timezone convention (see [Workspace timezone](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes))

## Permissions

`help-desk.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `close` · `reopen`

| Role | Grants |
|------|--------|
| **admin** | All except `force.delete` |
| **manager** | `view`, `create`, `update`, `assign`, `close`, `reopen` |
| **staff** | `view`, `create`, `update`, `close`, `reopen` |

Enable Help Desk from Marketplace (free) — it has no hard dependencies, so it can be installed on its own, before or after Contacts / Companies. Catalog: slug `help-desk`, category `operations` (Operations), `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.1.0**.

## Why standalone (soft dependencies)

Most internal tickets (IT requests, billing questions) do not require a CRM contact or company record. Both links are optional and only appear once the related module is installed. This keeps Help Desk usable as a lightweight, install-anywhere operations module rather than forcing the full CRM stack.

## Explicitly deferred

- SLAs and SLA breach automation
- Email ingest / multi-channel intake (email, chat, social)
- Customer portal (external submit / track)
- File attachments on tickets or notes
- `@mentions` in notes
- Automation module triggers for Help Desk events
- Communication Template context for ticket replies
- Kanban board view
