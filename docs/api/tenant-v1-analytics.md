# Tenant API v1 — Analytics

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:analytics`, `can:analytics.view`.

No hard Marketplace dependency on other modules. Each overview section is included only when that source module is entitled **and** the actor has `{module}.view`.

| Method | Path | Query |
|--------|------|-------|
| GET | `/analytics/overview` | `period` (`this_month` default, `last_month`, `last_3_months`, `last_6_months`, `this_year`, `last_year`, `custom`); for `custom`: `period_from`, `period_to` (required, `period_to` ≥ `period_from`) |

### Response shape

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

MVP section ids: `leads`, `opportunities`, `tasks`, `invoices`, `help_desk`, `projects`. Empty `sections` is valid when no source modules/permissions apply. Metric `format` is `number`, `currency`, or `percent`. Period bounds and “today”/overdue clocks follow workspace timezone (`Settings → General → Timezone`).
