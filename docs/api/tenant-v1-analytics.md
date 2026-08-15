# Tenant API v1 — Reports (Analytics)

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:analytics`, `can:analytics.view`.

Catalog slug `analytics` (display name Reports, version **1.3.1**). No hard Marketplace dependency on other modules. Overview sections and domain report sources are included only when that source module is entitled **and** the actor has `{module}.view`. Charts are SPA-rendered from the same payloads (no chart-specific endpoints); the SPA picks pie / donut / bar / area / line by metric context.

| Method | Path | Query |
|--------|------|-------|
| GET | `/analytics/overview` | `period` (`this_month` default, …, `custom`); for `custom`: `period_from`, `period_to` |
| GET | `/analytics/reports/{area}` | same period params; `area` ∈ `crm` \| `sales` \| `billing` \| `purchasing` \| `people` |
| GET | `/analytics/reports/{area}/export` | same period params; CSV download (`format=csv` optional) |

### Overview response

```json
{
  "period": { "key": "this_month", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "timezone": "America/New_York",
  "sections": [
    {
      "id": "leads",
      "module": "leads",
      "label": "Leads",
      "scope": "org",
      "metrics": [
        { "key": "total", "label": "Total leads", "value": 120, "format": "number" }
      ]
    }
  ]
}
```

Overview section ids: `leads`, `opportunities`, `tasks`, `invoices`, `help_desk`, `projects`.

### Domain report response

```json
{
  "period": { "key": "this_month", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "timezone": "UTC",
  "area": "crm",
  "sources": ["leads", "tasks"],
  "metrics": [{ "key": "leads_total", "label": "Total leads", "value": 2, "format": "number" }],
  "columns": [{ "key": "source", "label": "Source" }, { "key": "bucket", "label": "Bucket" }],
  "rows": [{ "source": "leads", "bucket": "New", "count": 2, "amount": 100 }]
}
```

Empty `sources` / `metrics` / `rows` is valid when no source modules/permissions apply (HTTP 200). Export streams `text/csv` with the same columns/rows.

**People (`area=people`):** soft sources `employees`, `leave-management`, `attendance`. Payroll is deferred. Department performance and Financial Reports stay on their existing APIs.
