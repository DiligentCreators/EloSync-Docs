# Resellers Module

Phase 1 Sales module on the frozen platform. Workspace directory of **reseller partners** with two-tier commission rates (`commission_rate` for the reseller, `owner_commission_rate` for the workspace assignee / “owner” cut). Resellers link optionally onto customer invoices; commission ledger accrual lives in **Reseller Payouts**.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [resellers.md](/user-guide/resellers) |
| Engineers | [resellers.md](/developer-guide/resellers) |
| Production / ops | [resellers.md](/deployment/resellers) |
| Related module | [Reseller Payouts](/user-guide/reseller-payouts-overview) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [../api/tenant-v1-resellers.md](/api/tenant-v1-resellers) |

## Capabilities

- Name, email, phone, company name, notes, status (active/inactive)
- Two commission percentages: reseller rate and owner rate (0–100 each)
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `resellers.assign`
- Optional **same-workspace** login invite (`user_id`) — creates a user with only the protected `reseller` role
- Soft delete with restore / force delete
- Optional `reseller_id` on customer invoices (when Resellers is entitled)
- Module licensing (`module:resellers`) + Spatie permissions — **free Marketplace opt-in**
- Audit via `ResellerEventSubscriber` + Spatie `LogsActivity`

## Permissions

`resellers.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `invite`

Enable Resellers from Marketplace (free). Catalog: slug `resellers`, category `sales` (Sales), `is_default_included = false`, `is_billable = false`, `sort_order = 70`. Hard dependency: **Payments**. Only Leads and Tasks install automatically on new workspaces.

## Required dependency

Resellers **requires Payments** (`module_dependencies`, not optional). Marketplace blocks install until Payments is entitled — commission is driven by invoices that become fully **Paid** via the Payments ledger.

## Explicitly deferred

- Cross-workspace identity (a reseller person spanning multiple tenants / Central identity)
- Reseller portal / self-service outside the tenant SPA
- Dashboard widgets for Resellers
- Import/export
- Automated payout disbursement (mark-paid is a ledger status, not a bank payout)
