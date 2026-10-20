# Tenant API v1 — Dashboard

Base path: `/api/tenant/v1`

### GET `/dashboard`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `subscription`. Authorization: `dashboard.view`.

Returns workspace chrome plus a **widget registry**. Widgets are filtered by installed module, Spatie permission, and assignee scope, then ordered/filtered by the actor’s saved **dashboard layout**.

## Payload

| Key | Description |
|-----|-------------|
| `welcome` | Greeting string |
| `workspace` | Company / slug / email / timezone / currency / locale |
| `installed_modules` | Active module subscriptions (`slug`, `name`, `status`) |
| `widgets` | Ordered list of widget objects (visible customizable widgets + chrome widgets) |
| `layout` | Per-user layout metadata (items, catalog, templates) |
| `scope` | `org` if the user has `leads.assign` or `tasks.assign` (or superadmin); otherwise `mine` |

## Widget shape

```json
{
  "id": "pipeline_overview",
  "module": "leads",
  "permission": "leads.view",
  "scope": "org",
  "data": {}
}
```

`module` may be `null` for core widgets. `scope` is `org` or `mine` for the data inside `data`.

## Layout shape

```json
{
  "template_id": "sales_rep",
  "version": 1,
  "items": [{ "id": "pipeline_overview", "visible": true }],
  "new_widget_ids": [],
  "catalog": [
    {
      "id": "pipeline_overview",
      "title": "Pipeline overview",
      "module": "leads",
      "category": "sales"
    }
  ],
  "templates": [
    {
      "id": "sales_rep",
      "name": "Sales rep",
      "description": "…",
      "widget_ids": ["todays_follow_ups", "pipeline_overview"],
      "matching_count": 2
    }
  ]
}
```

- `items` lists every **eligible customizable** widget with visibility + order.
- `catalog` / `templates` are filtered to the actor’s eligible widgets (`matching_count` > 0).
- `new_widget_ids` lists eligible widgets that appeared after the user’s last saved layout (default: hidden until opted in).
- With no saved preference, all eligible customizable widgets are visible in platform default order (`template_id` is `null`).

Chrome widgets (`activity_feed`, `notifications`, `quick_actions`) are not layouted; they remain appended after customizable widgets when the service returns them.

### PUT `/dashboard/layout`

Middleware: same as `GET /dashboard`. Authorization: `dashboard.view`.

Persists the actor’s layout. Body (one of):

```json
{ "template_id": "sales_rep" }
```

```json
{
  "items": [
    { "id": "todays_follow_ups", "visible": true },
    { "id": "pipeline_overview", "visible": false }
  ]
}
```

- `template_id` must be a known platform template id.
- `items` is required when `template_id` is omitted. Unknown / ineligible widget ids are dropped; missing eligible ids are appended as `visible: false`.
- Response `data` is the resolved `layout` object (same shape as on `GET /dashboard`).

Storage: `users.dashboard_layout` (JSON). Implementation: `App\Services\Tenant\DashboardLayoutService`, templates in `App\Support\DashboardLayoutTemplates`.

## Registered widgets

| id | Module gate | Permission | Notes |
|----|-------------|------------|--------|
| `pipeline_overview` | `leads` | `leads.view` | Counts / values by stage |
| `lead_sources` | `leads` | `leads.view` | Source breakdown |
| `revenue_pipeline` | `leads` | `leads.view` | Won-revenue period + open-pipeline value |
| `high_priority` | `leads` | `leads.view` | Open (non-won/lost) leads with priority `high` only (not `urgent`); limited rows + `total_count` |
| `follow_ups` | `leads` | `leads.view` | Pending follow-ups |
| `todays_follow_ups` | `leads` | `leads.view` | |
| `overdue_follow_ups` | `leads` | `leads.view` | |
| `recent_deals_closed` | `leads` | `leads.view` | Recently won leads |
| `deals_closing_soon` | `leads` | `leads.view` | Includes negotiation/proposal previews |
| `recent_companies` | `companies` | `companies.view` | |
| `recent_contacts` | `contacts` | `contacts.view` | |
| `recent_activities` | `activities` | `activities.view` | |
| `tasks_due_today` | `tasks` | `tasks.view` | |
| `upcoming_tasks` | `tasks` | `tasks.view` | |
| `overdue_tasks` | `tasks` | `tasks.view` | |
| `help_desk_my_open` | `help-desk` | `help-desk.view` | |
| `active_projects` | `projects` | `projects.view` | Active status; visibility-scoped (assignee/member/creator or `projects.assign`) |
| `overdue_projects` | `projects` | `projects.view` | Open + `ends_on` before workspace today |
| `pending_expenses` | `expenses` | `expenses.view` | |
| `open_purchase_orders` | `purchase-orders` | `purchase-orders.view` | |
| `active_vendors` | `vendors` | `vendors.view` | |
| `pending_reseller_payouts` | `reseller-payouts` | `reseller-payouts.view` | |
| `calendar` | `calendar` | `calendar.view` | Upcoming events; scoped by `calendar.view_all` |
| `activity_feed` | — | `dashboard.view` | Recent lead/task activity (not customizable) |
| `notifications` | — | `dashboard.view` | Unread count + recent (scoped to current user; not customizable) |
| `quick_actions` | — | `dashboard.view` | Shortcuts gated by module + permission (not customizable) |

Leads/tasks widgets apply assignee scoping: without the module’s `*.assign` permission, data is limited to the current user’s assignments. Projects widgets use assignee **OR** member **OR** creator visibility (or org-wide with `projects.assign`). Calendar uses `calendar.view_all` for org vs mine (no calendar assignment).

## Explicitly not included

- Dedicated Week/Day **dashboard** widgets (Week/Day live on the Calendar page), Meetings host assignment, external calendar sync
- Free-form pixel grids / arbitrary widget resize
- Shared or admin-assigned home layouts (per-user only in this release)

Implementation: `App\Services\Tenant\DashboardWidgetService`, `App\Services\Tenant\DashboardLayoutService`.
