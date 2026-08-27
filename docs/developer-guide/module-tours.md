# Module product tours

Every tenant module list page ships a short **product tour** (driver.js) that explains how the module works. Tours are frontend-only for v1 — no backend persistence.

## Goals

- First visit: auto-prompt once per module (`localStorage`)
- Always re-runnable from the PageHeader help icon (`CircleHelp`)
- Short steps (typically 3–6 module-specific steps): purpose, filters/KPIs, create/actions, records
- Every tour appends one shared **Give Feedback** step (avatar menu) at runtime
- Stable selectors; prefer existing roles/labels; add `data-tour` only when needed

## Architecture

| Piece | Location |
|-------|----------|
| Dependency | `driver.js` (CSS imported once in `src/main.tsx`) |
| Helper | `EloSync-Frontend/src/tours/module-tour.ts` |
| Per-module steps | `EloSync-Frontend/src/tours/{slug}.ts` |
| Registry | `EloSync-Frontend/src/tours/registry.ts` |
| UI hook | `PageHeader` `tourId` prop |

```ts
<PageHeader tourId="leads" title="Leads" description="…" actions={…} />
```

When `tourId` is set, PageHeader:

1. Renders an outline icon button (`aria-label="Start page tour"`)
2. Calls `maybeAutoStartModuleTour(tourId)` on mount (skipped if already seen)
3. Marks `module-tour-seen:{slug}` in `localStorage` when a tour starts

## Selectors

Shared constants in `TOUR_SELECTORS`:

| Attribute / role | Meaning |
|------------------|---------|
| `[data-tour="page-header"]` | Page title block |
| `[data-tour="module-actions"]` | Header actions (includes help icon) |
| `[data-tour="module-filters"]` | FilterBar (or report controls) |
| `[data-tour="module-table"]` | DataTable or KanbanBoard |
| `[aria-label="KPI summary"]` | KPI strip |
| `[aria-label="View mode"]` | Board/table toggle |
| `[data-tour="user-menu"]` | Avatar button (shared Give Feedback step) |

Missing elements are skipped (`skipMissingElement: true`).

The shared feedback step is built in `feedbackTourStep()` and appended inside `startModuleTour()` — do not copy it into each `src/tours/{slug}.ts` file.

## Adding a tour for a new module

1. Create `src/tours/{slug}.ts` with a `ModuleTourDefinition` (mirror `leads.ts`).
2. Register it in `src/tours/registry.ts` and extend `ModuleTourId` in `types.ts`.
3. Pass `tourId="{slug}"` on the primary list `PageHeader`.
4. Prefer existing labels; add `data-tour` only for stable anchors.
5. Unit-test coverage lives in `src/tours/module-tour.test.ts`. Optional Playwright: Leads `leads.tour.spec.ts`.

## Styling

Popover class `module-tour-popover` is themed in `globals.css` to match admin density (no purple glow).

## Related

- [Shared UI](./shared-ui)
- [Module Development](./module-development)
- [Leads](./leads) — blueprint module
