# Dedicated record pages UX — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-20 |
| **Status** | **Go for production** after companion CI green + staging smoke (migrate-first) |
| **Scope** | Tenant CRUD modules: list + dedicated **create / view / edit** pages (`RecordPage` / `RecordSection` / `FormSubmitSplit`); floating labels; query deep-link redirects; notification path URLs; catalog MINOR bumps |
| **Branch** | `feature/dedicated-record-pages-ux` |
| **Backend** | Deep-link resolvers + local demo login + idempotent catalog version bump migration |
| **Frontend** | Dedicated record pages + form validation error wiring + Playwright page-object / authz skip remediation |
| **Docs** | User guides + changelog + this audit |

**Companion docs:** [Module development](/developer-guide/module-development) · [Shared layout](/developer-guide/shared-layout) · [Changelog](/changelog/) · [Upgrade](/deployment/upgrade)

---

## Executive summary

Primary create / view / edit for tenant business modules no longer uses list overlays (dialogs / detail sheets). Users navigate to dedicated routes (`/{slug}/new`, `/{slug}/:id`, `/{slug}/:id/edit`) with stacked record cards and split submit actions (**Create** / **Create & View**, **Save** / **Save & View** / **Save & return to list**). Dialogs remain only for secondary flows (confirm, import, tags/categories, calendar events, email connect).

Platform freeze is intact: AppLayout, auth stores, RBAC, billing, and marketplace architecture are unchanged. Licensing remains `module:{slug}`; authorization remains Spatie permissions.

**Go / No-Go:** **Go** — audit blockers (uncommitted form `error=` wiring, e2e hardeners, Docs readiness page) are remediated. External IMAP and Reverb-dependent Team Chat remain opt-in / infra-gated and are **not** ship blockers for this UX change.

| Gate | Result |
|------|--------|
| Dedicated create/view/edit pages for migrated tenant CRUD modules | **Pass** |
| `FormSubmitSplit` (no dropdown submit) | **Pass** |
| Floating labels on create/edit text fields | **Pass** |
| Required-field validation messages rendered via `error=` on FloatingInput | **Pass** |
| Query deep links `?entity=` → `/:id` redirects; list filters unchanged | **Pass** |
| Notification / digest hrefs use path URLs (`/tasks/:id`, `/leads/:id`) | **Pass** |
| Catalog MINOR bumps via idempotent migration | **Pass** |
| Platform freeze (no parallel shells / auth / billing redesign) | **Pass** |
| Playwright tenant core (CRM, sales, purchasing, HR, accounting) | **Pass** (shared demo; authz negatives skip when already entitled) |
| External IMAP mailbox e2e | **Waived** (opt-in `E2E_RUN_REAL_MAILBOX=1`) |
| Team Chat broadcast | **Infra-gated** (requires Reverb; skip when Pusher unreachable) |

---

## Security summary

| Control | Status |
|---------|--------|
| No new auth / tenancy / billing systems | Pass |
| Module entitlement + Spatie gates unchanged on routes | Pass |
| Policies / form requests unchanged for CRUD authz | Pass |
| Deep links do not expose IDs cross-tenant (same show routes) | Pass |
| Local demo login prefill is **dev builds only** | Pass |

### Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **B1** | High | FloatingInput missing `error=` (employees / payroll / resellers) | **Remediated** |
| **B2** | High | Playwright gaps (settings load, email empty state, chat dialog) | **Remediated** / waived external IMAP |
| **B3** | Medium | Uncommitted remediation not on release branch | **Remediated** (commit with this Go) |
| **I1** | Info | Shared-demo authz /403 suites skip when module entitled | **Intentional** — Pest covers middleware |
| **I2** | Info | Dirty demo ledger / journal pagination | **Hardened** — search after create; structural report asserts |

No High or Medium open residuals for the record-pages ship.

---

## Change inventory

### Backend

- Notification / route URL resolvers emit `/tasks/:id` (and peers) instead of query deep links.
- Local demo tenant service + seeder path for shared Playwright login.
- Migration `2026_08_19_223359_bump_modules_for_dedicated_record_pages` — MINOR catalog bumps for migrated modules.

### Frontend

- Module pages: dedicated form/view pages; remove primary CRUD dialogs/sheets.
- Shared: `RecordPage`, `RecordSection` (`data-record-section`), `FormSubmitSplit`, floating fields.
- Form validation visibility: wire `error=` on required FloatingInputs (employees, payroll profile, reseller rates, plus prior expense/contract/asset polish).
- Playwright: page objects for dedicated routes; `skipIfModuleEntitled`; login rate-limit backoff; settings load retry; email empty-state / opt-in IMAP; team-chat settings save/delete hardeners.

### Docs

- User guides updated for dedicated pages.
- Changelog delivery notes (floating labels, demo login, dedicated pages).
- This production readiness page.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** and run migrations (catalog bumps are idempotent).
2. Deploy **Frontend** SPA build.
3. Deploy **Docs** (this page + changelog).
4. Staging smoke (below).
5. Production same order.

No `db:seed` in production. Catalog bumps do **not** auto-install modules for workspaces that never entitled them.

---

## Staging smoke (minimum)

| # | Check |
|---|--------|
| 1 | Login as workspace owner → open **Leads** → **New lead** → validation errors visible on empty submit → **Create & View** → URL `/leads/:id` |
| 2 | From list, open record → **Edit** → **Save & return to list** |
| 3 | Hit legacy `…/leads?lead=:id` → lands on `/leads/:id` |
| 4 | **Invoices** create/view/edit + **Employees** create validation messages |
| 5 | Confirm a task/lead notification link opens `/tasks/:id` or `/leads/:id` (if a digest is available) |

---

## Rollback

1. Redeploy previous Frontend SPA (dialogs return).
2. Backend catalog rows remain at bumped versions (safe / non-breaking); do not reverse migration unless rolling back the entire release train.
3. Docs: revert this Go note if rolling back the UX.

---

## Sign-off

| Role | Decision |
|------|----------|
| Engineering | **Go** — blockers B1–B3 closed |
| Ops | Staging migrate → SPA → smoke table above |
| Product | Dedicated pages match Leads blueprint |

**Residual risk:** Team Chat requires Reverb in environments that exercise broadcast; Email live IMAP remains optional e2e. Neither blocks the dedicated record pages UX go-live.
