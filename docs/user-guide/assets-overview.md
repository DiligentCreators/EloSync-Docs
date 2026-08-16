# Assets Module

Operations module on the frozen platform. A workspace register of company equipment and fixed assets — number, name, status, category, identity fields, purchase/warranty details, assignment, notes, and an activity timeline — with **soft, optional** links to Vendors and Employees. Assets is **standalone**: it installs with no hard module dependencies and works fully on its own.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [assets.md](/user-guide/assets) |
| Engineers | [assets.md](/developer-guide/assets) |
| Production / ops | [assets.md](/deployment/assets) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [vendors-overview.md](/user-guide/vendors-overview) |
| Tenant API | [../api/tenant-v1-assets.md](/api/tenant-v1-assets) |

## Capabilities

- Auto-number (`AST-` prefix, configurable via `assets_number_prefix`)
- Name, status (`active` / `in_repair` / `retired` / `disposed`), category enum
- Manufacturer, model, serial number, free-text location
- Purchase date, purchase cost, currency, warranty end date
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `assets.assign`
- Optional `vendor_id` and `employee_id` — soft links, only validated (and only pickable in the UI) when the corresponding module is entitled
- Notes + activity timeline
- Table view with search, status/category/assignee filters, and **My Assets** toggle
- KPIs via `GET /assets/stats` (total, my assets, unassigned, active, in repair, retired, disposed)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:assets`) + Spatie permissions — **free Marketplace opt-in**, no hard dependencies
- Audit + activity logging

## Permissions

`assets.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Assets from Marketplace (free). Catalog: slug `assets`, category `operations` (Operations), `is_default_included = false`, `is_billable = false`, `sort_order = 80`, version **1.0.0**.

## Soft links (not install dependencies)

| Link | When usable |
|------|-------------|
| Vendor | Vendors module entitled |
| Employee (custodian) | Employees module entitled |
| Workspace assignee | Always (platform user) |

## Explicitly deferred

- Depreciation / Accounting journals
- Product / Inventory / Warehouse FKs
- Maintenance tickets → Help Desk
- Attachments / barcodes / QR
- Dashboard widget
- Automation triggers
