# Contracts Module

Sales contract-tracking module on the frozen platform. Mirrors the [Opportunities](/user-guide/opportunities-overview) / [Quotations](/user-guide/quotations-overview) notes/timeline/assignment pattern, kept lean (no line items — a contract is a single signed agreement record).

**Hard dependency:** Contracts requires the **Opportunities** module — Marketplace install is blocked until Opportunities is entitled. Contracts may **optionally** link a Quotation once the Quotations module is also entitled.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [contracts.md](/user-guide/contracts) |
| Engineers | [contracts.md](/developer-guide/contracts) |
| Production / ops | [contracts.md](/deployment/contracts) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [opportunities.md](/user-guide/opportunities-overview) · [quotations.md](/user-guide/quotations-overview) |
| Tenant API | [../api/tenant-v1-contracts.md](/api/tenant-v1-contracts) |

## Capabilities

- Contract fields: opportunity (required), optional quotation link, title, party name, start date (required), optional end date, value, currency, notes
- Status workflow: `draft → active → expired | terminated` (`POST /contracts/{id}/status`)
- Assignment with assignee scoping via `contracts.assign`
- Notes + domain activity timeline (mirrors Opportunities / Quotations)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:contracts`) + Spatie permissions — **free Marketplace opt-in** (Sales category)
- Audit + activity logging; assignment notification

## Permissions

`contracts.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Contracts from Marketplace (free) once Opportunities is installed. Catalog: slug `contracts`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 60`.

## Related modules

**Hard dependency:** Opportunities (see [Module Dependencies](/architecture/module-dependencies)). **Optional:** Quotations — the quotation picker on a contract only appears (and validates) when Quotations is entitled.

## Explicitly deferred

- Contract PDF export / e-signature
- Renewal reminders
- Multi-currency conversion
