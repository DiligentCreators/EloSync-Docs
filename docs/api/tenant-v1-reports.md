# Tenant API v1 — Department performance reports

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:departments`, `can:dashboard.view`.

Authorization is enforced in the Form Request: workspace owner (`superadmin`) or an active department manager (`isDepartmentManager()`). Staff without manager scope receive **403**.

## GET `/reports/department-performance`

Aggregated leads/tasks metrics by department for a date range. Counts include records **created** within the period and assigned to performance-eligible users in each department (direct members, linked employee users, and the department manager). Open / won / lost (leads) and open / completed (tasks) use each record’s **current** stage/status flags at query time — not historical stage changes within the period.

Query:

| Param | Type | Notes |
|-------|------|-------|
| `from` | date | Optional. Defaults to start of current workspace month. |
| `to` | date | Optional. Defaults to today. Must be on or after `from`. |

### Visibility

Requires `dashboard.view` (route middleware) **and** one of the rows below.

| Actor | Departments returned |
|-------|----------------------|
| Workspace owner (`superadmin`) with `dashboard.view` | All active departments |
| Department manager with `dashboard.view` | Active departments where `manager_id` = user id |
| Others (including managers missing `dashboard.view`) | **403 Forbidden** |

### Response `data`

```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-05" },
  "departments": [
    {
      "id": 1,
      "name": "Sales",
      "slug": "sales",
      "manager": { "id": 2, "name": "Alex Manager" },
      "leads": { "available": true, "open": 3, "won": 1, "lost": 0, "total": 4 },
      "tasks": { "available": true, "open": 2, "completed": 5, "total": 7 }
    }
  ],
  "totals": {
    "leads": { "available": true, "open": 3, "won": 1, "lost": 0, "total": 4 },
    "tasks": { "available": true, "open": 2, "completed": 5, "total": 7 }
  }
}
```

When Leads or Tasks is not installed, the corresponding `available` flag is `false` and counts are zero.

## Weekly digest (scheduled)

Command: `reports:send-department-digest`

Schedule: Mondays at 08:00 in the **application** timezone (`routes/console.php` → `weeklyOn(1, '08:00')`; default `UTC` unless `app.timezone` / `schedule_timezone` is configured). For each tenant, previous calendar week bounds are computed **after** applying that workspace’s Settings → General timezone.

Recipients: workspace owners + active department managers (non-suspended), still gated by `canAccessReport()` (`dashboard.view` + owner or manager). Notification: `DepartmentPerformanceDigestNotification` via **database** + **mail**. Idempotency: `daily_summary_deliveries.kind = department_weekly` per user per week start date.

See [Departments developer guide](/developer-guide/departments) and [Departments user guide](/user-guide/departments).
