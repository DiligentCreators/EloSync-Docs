# Communication Templates 1.1.0 (shared/private) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-09 |
| **Status** | **Go for production** (migrate-only + deploy SPA/Mobile) |
| **Scope** | `is_shared` visibility parity with Email templates; catalog **communication-templates 1.0.0 → 1.1.0** |
| **Companion** | [Communication Templates deploy](/deployment/communication-templates) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

WhatsApp (Communication) templates now support **Shared with workspace** / **Private**, matching Email templates: teammates use shared templates; only the creator or workspace owner edits/deletes; pickers never surface others’ private templates.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no new shell; Templates module only) | **Pass** |
| Schema + backfill existing rows shared | **Pass** — migration defaults + `UPDATE … is_shared = true` |
| List scope own + shared; owner sees private on manage | **Pass** — Pest |
| Picker `for_use=1` own + shared + active | **Pass** — Pest + SPA picker |
| Update/delete creator or owner | **Pass** — Pest |
| Resource `can_edit` / `can_delete` | **Pass** — Pest + SPA row actions |
| Catalog migrate-only + CatalogSeeder companion | **Pass** — **1.1.0** |
| SPA Shared toggle + visibility column/filter | **Pass** |
| Mobile Shared/Private create/edit/list/view | **Pass** |
| Docs + CHANGELOG same delivery | **Pass** |
| Playwright headed one-session (validation + shared/private CRUD) | **Pass** — `npm run test:e2e:communication-templates:headed` |

## Findings and remediations

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| CT-01 | High | Communication templates were always workspace-visible; no private drafts | Added `is_shared` + visibility scopes mirroring Email |
| CT-02 | Medium | Staff with `update` could edit teammates’ templates | Policy: creator or workspace owner only |
| CT-03 | Medium | WhatsApp picker could list inactive/private templates inconsistently | SPA list uses `for_use=true` (active + own/shared) |
| CT-04 | Low | Row Edit/Delete gated only by Spatie permission, not ownership | UI uses `can_edit` / `can_delete` from API |
| CT-05 | Low | Existing rows would become private if defaulted false | Backfill `true` to preserve pre-1.1.0 behavior |

## What shipped

### Backend

- Migration `2026_10_09_145841_add_is_shared_to_communication_templates_table`
- Catalog bump `2026_10_09_145845_bump_communication_templates_module_to_1_1_0`
- `CommunicationTemplateService` visibility + `for_use` / `is_shared` filters
- `CommunicationTemplatePolicy` view/use/update/delete ownership rules
- Resource fields `is_shared`, `can_edit`, `can_delete`
- Pest: `CommunicationTemplateSharingTest`

### Frontend

- Form **Shared with workspace** switch (default on)
- List Visibility column + filter; creator column; ownership-aware actions
- WhatsApp picker `for_use: true`
- Playwright: one-session validation + shared/private CRUD (`test:e2e:communication-templates:headed`)

### Mobile

- Visibility cycle on create/edit; Shared/Private on list/view; `can_edit` / `can_delete` gates

### Docs

- User / developer / API / deployment guides, changelog, this audit

## Test evidence

```
herd php vendor/bin/pest --compact tests/Feature/Tenant/CommunicationTemplates/
```

Pest: **18 passed** (140 assertions).

```
npm run test:e2e:communication-templates:headed
```

Playwright headed (`E2E_VIDEO=off`, bundled Chromium, `--workers=1`): **1 passed** — empty-form validation, shared + private create, visibility filter, edit share flag → private, delete both.

`vendor/bin/pint --dirty --format agent` — pass.

## Known limitations / deferred

- Meta WhatsApp Cloud templates (`whatsapp_cloud_templates`) remain a separate sync model; sharing does not apply.
- No multi-user Playwright ownership matrix (creator vs staff) in headed browser; covered by Pest API tests.
- Templates with `created_by` null are only editable by the workspace owner.

## Upgrade & staging smoke

1. `php artisan migrate --force` — `is_shared` column + catalog **1.1.0** (do **not** `db:seed`).
2. Deploy Frontend SPA + Mobile as needed.
3. Templates → New: Shared on by default; create private; confirm Visibility column.
4. Staff account: sees shared only; cannot edit owner’s shared template; picker omits private.
5. Lead/Help Desk WhatsApp picker: private templates of other users absent.

## Related

- [Communication Templates — Deployment](/deployment/communication-templates)
- [Developer guide](/developer-guide/communication-templates)
- [User guide](/user-guide/communication-templates)
