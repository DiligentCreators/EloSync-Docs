# Workspace File a complaint — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-14 |
| **Status** | **Go for production** after companion PR merge + migrate-first deploy + staging smoke |
| **Scope** | Tenant shell **File a complaint** (user menu + command palette) → Help Desk ticket create; catalog **help-desk 1.9.0 → 1.10.0**; docs contrast with Give Feedback |
| **Branch** | `feature/workspace-complaint-dialog` (Frontend, Backend, Docs) |
| **Backend** | Idempotent catalog bump only (no new APIs) |
| **Frontend** | `ComplaintDialog` + UI store flag + shell entry points |
| **Docs** | User/developer guides + changelog + this audit |

**Companion docs:** [Help Desk user guide](/user-guide/help-desk) · [Give Feedback](/user-guide/feedback) · [Help Desk developer](/developer-guide/help-desk) · [Changelog](/changelog/) · [Upgrade](/deployment/upgrade)

---

## Executive summary

Workspace users already report EloSync product issues via **Give Feedback** (Central). This delivery adds a parallel shell action — **File a complaint** — that creates a normal **Help Desk** ticket for the workspace team. It reuses `POST /api/tenant/v1/help-desk` and existing policies; it is **not** a Central Feedback type and **not** a second ticketing product.

Platform freeze is intact: AppLayout shell extension only (dialog mount + menu/palette), no auth/tenancy/RBAC redesign. Entries are gated by `hasModule('help-desk')` and `help-desk.create`.

**Go / No-Go:** **Go** — engineering residuals closed or accepted as out of scope; operator next: merge companion PRs, migrate catalog bump, deploy Backend → Frontend → Docs, staging smoke.

| Gate | Result |
|------|--------|
| Distinct from Central Feedback (no merge of products) | **Pass** |
| Shell entry points (user menu + command palette) | **Pass** |
| Module + `help-desk.create` gates | **Pass** |
| Create via existing Help Desk API / policies | **Pass** |
| Toast with ticket number + Open ticket (`appHref` anchor) | **Pass** |
| Catalog MINOR **1.9.0 → 1.10.0** (migration + CatalogSeeder) | **Pass** |
| Platform freeze | **Pass** |
| Playwright one-session human workflow | **Pass** (local 2026-09-14) |
| Pest companion CatalogSeeder versions | **Pass** |
| Docs user + developer + CHANGELOG | **Pass** |
| Mobile SPA parity | **Out of scope** |
| New Pest for ticket APIs | **N/A** (no new endpoints) |

---

## Security summary

| Control | Status |
|---------|--------|
| No new auth / tenancy / billing systems | Pass |
| Entry points require Help Desk entitlement | Pass |
| Entry points require `help-desk.create` | Pass |
| Create uses existing `StoreHelpDeskTicketRequest` + `HelpDeskTicketPolicy` | Pass |
| Categories list requires `help-desk.view` (existing) | Pass |
| Does not expose Central Feedback write paths | Pass |
| Toast Open ticket uses hash `appHref` (Toaster outside Router — intentional) | Pass |

### Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **B1** | High | Toast `Link` from react-router rendered outside `HashRouter` (Toaster sibling of App) → toast failed silently | **Remediated** — plain `<a href={appHref(...)}>` |
| **B2** | Medium | Category Select uncontrolled → controlled warning; submit disabled until categories load | **Remediated** — controlled value always; wait for default category; e2e waits for enabled submit |
| **B3** | Medium | Form `reset` on `defaultCategoryId` change wiped in-progress subject | **Remediated** — reset only on open edge (`wasOpen` ref) |
| **M1** | Medium | Multi-test e2e used separate logins; weak human coverage | **Remediated** — one-session Playwright covering gate / validation / cancel / submit / palette / Feedback handoff |
| **I1** | Info | Permission-only negative (`help-desk.create` denied while module entitled) not e2e'd | **Accepted** — module strip covers primary gate; create still enforced by API 403 |
| **I2** | Info | EloSync-Mobile has no File a complaint shell entry | **Out of scope** (web tenant SPA only; plan locked) |

No High or Medium **open** residuals for ship.

---

## Change inventory

### Backend

- Migration `2026_09_13_220802_bump_help_desk_module_version_to_1_10_0` — `help-desk` **1.9.0 → 1.10.0**
- `CatalogSeeder` version aligned to **1.10.0**
- `AutomationEngineSupportTest` companion map updated (`help-desk` + drifted `contacts` expected **1.5.0**)

### Frontend

- `src/store/ui-store.ts` — `complaintOpen` / `setComplaintOpen`
- `src/components/help-desk/complaint-dialog.tsx` — create dialog
- `src/layouts/app-layout.tsx` — tenant mount
- `src/components/layout/user-menu.tsx` + `command-palette.tsx` — gated entries
- Playwright: `e2e/pages/complaint.page.ts`, `e2e/tests/help-desk/complaint-dialog.spec.ts`

### Docs

- User guides: Help Desk (File a complaint), Feedback (contrast)
- Developer Help Desk: version **1.10.0** + Distinct-from-Feedback row
- Product roadmap Help Desk line
- Changelog delivery note
- This production readiness page

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force` (catalog bump only; idempotent).
2. Confirm central catalog: `help-desk` **1.10.0**.
3. Deploy **Frontend** SPA build.
4. Deploy **Docs**.
5. Staging smoke (below).
6. Production same order.

No `db:seed` in production. Catalog bumps do **not** auto-install Help Desk for workspaces that never entitled it. No new env vars, queues, or scheduler entries.

Suggested merge order: **Backend → Frontend → Docs**.

---

## Staging smoke (minimum)

1. Workspace **without** Help Desk: avatar menu and `Ctrl`/`⌘`+`K` have **no** File a complaint.
2. Marketplace → install **Help Desk** (free); user with `help-desk.create`.
3. Avatar → **File a complaint** → empty subject → **Subject is required**.
4. Fill subject + description; set category Technical, priority Urgent → Submit.
5. Toast shows `HD-…` and **Open ticket** → ticket view shows subject / category / priority.
6. Command palette → File a complaint → Cancel.
7. Dialog copy **Give Feedback** opens Central feedback dialog (not a Help Desk ticket).

---

## Verification evidence (local)

| Check | Result |
|-------|--------|
| `npx playwright test e2e/tests/help-desk/complaint-dialog.spec.ts --project=tenant` | **Pass** (one-session human workflow) |
| `php artisan test --compact --filter="companion versions"` (AutomationEngineSupportTest) | **Pass** |
| Frontend `tsc --noEmit` (pre-ship) | **Pass** (earlier in branch work) |

Re-run Playwright and Backend CI on the companion PRs before production cutover.
