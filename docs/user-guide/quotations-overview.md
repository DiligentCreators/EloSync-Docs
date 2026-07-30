# Quotations Module

Sales price-quoting module on the frozen platform. Mirrors the [Opportunities](/user-guide/opportunities-overview) notes/timeline/assignment pattern, kept leaner (no pipeline board, no related Contact/Company/Lead FKs beyond the opportunity link).

**Hard dependency:** Quotations requires the **Opportunities** module — Marketplace install is blocked until Opportunities is entitled.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [quotations.md](/user-guide/quotations) |
| Engineers | [quotations.md](/developer-guide/quotations) |
| Production / ops | [quotations.md](/deployment/quotations) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [opportunities.md](/user-guide/opportunities-overview) |
| Tenant API | [../api/tenant-v1-quotations.md](/api/tenant-v1-quotations) |

## Capabilities

- Quote fields: opportunity (required), title, optional contact/company link, currency, valid-until date, notes
- Line items (description, quantity, unit price, tax rate) — subtotal / tax total / total computed server-side
- Status workflow: `draft → sent → accepted | rejected | expired` (`POST /quotations/{id}/send`, `.../accept`, `.../status`)
- Assignment with assignee scoping via `quotations.assign`
- Notes + domain activity timeline (mirrors Opportunities)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:quotations`) + Spatie permissions — **free Marketplace opt-in** (Sales category)
- Audit + activity logging; assignment notification

## Permissions

`quotations.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `send` · `accept`

Enable Quotations from Marketplace (free) once Opportunities is installed. Catalog: slug `quotations`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 50`.

## Related modules

**Hard dependency:** Opportunities (see [Module Dependencies](/architecture/module-dependencies)). Contracts may optionally link a Quotation once both modules are entitled.

## Explicitly deferred

- Quote PDF export / e-signature
- Multi-currency conversion
- Approval workflow beyond the status enum
