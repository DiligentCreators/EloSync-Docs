# Opportunities Module

Sales deals module on the frozen platform. Mirrors the [Leads](/user-guide/leads-overview) pipeline UX (stages + Kanban board + table) and the [Activities](/user-guide/activities-overview) / Contacts / Companies reference architecture for notes, assignment, and soft related links.

**Sales Pipeline** is delivered **inside** Opportunities — stages and the Kanban board are not a separate Marketplace SKU.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [opportunities.md](/user-guide/opportunities) |
| Engineers | [opportunities-developer.md](/developer-guide/opportunities) |
| Production / ops | [opportunities-production.md](/deployment/opportunities) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [leads.md](/user-guide/leads-overview) · [activities.md](/user-guide/activities-overview) |
| Tenant API | [../api/tenant-v1-opportunities.md](/api/tenant-v1-opportunities) |

## Capabilities

- Deal fields: name (required), optional amount / currency / probability / expected close date
- Pipeline stages (seeded: Prospecting → Qualification → Proposal → Negotiation → Won / Lost)
- **Colored tags** — per-workspace Opportunities catalog; create/assign inline; filter by `tag_id`
- **Kanban board (default)** + table view; drag-and-drop auto-saves stage via `POST /opportunities/{id}/stage`
- KPIs via `GET /opportunities/stats`; board via `GET /opportunities/board`
- Soft optional links: Contact / Company / Lead (FK rejected when that module is not installed; gated **New** inline create when entitled + create permission)
- Lead convert can optionally create an Opportunity (when Opportunities + create permission are present)
- Assignment with assignee scoping via `opportunities.assign`
- Notes + domain activity timeline
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:opportunities`) + Spatie permissions — **free Marketplace opt-in** (Sales category)
- Audit + activity logging; assignment notification

## Permissions

`opportunities.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Opportunities from Marketplace (free). Catalog: slug `opportunities`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 40`, version **1.2.0**. Only Leads and Tasks install automatically on new workspaces.

## Related modules (optional)

No hard `module_dependencies` row today. Linking a Contact, Company, or Lead requires that module to be entitled; otherwise validation rejects the FK.

**Planned hard dependencies (future):** Quotations and Contracts are expected to depend on Opportunities when those Sales modules ship — see [Module Dependencies](/architecture/module-dependencies).

## Explicitly deferred

- Separate Marketplace SKU for “Sales Pipeline” (pipeline lives in this module)
- Custom stage admin UI (stages are seeded / idempotent seeder)
- Quotations / Contracts integration
- Real-time board sync (Reverb / Echo)
- Export / import
