# Customizable tenant dashboard layouts — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-21 |
| **Status** | **Go for production** — Pest **14/14** dashboard widget + layout; headed Playwright **1/1** (one login session) |
| **Scope** | Per-user show/hide + reorder of entitled dashboard widgets; platform templates; server-persisted `users.dashboard_layout` |
| **Catalog** | No bump (platform shell feature) |
| **Companion** | [Tenant application user guide](/user-guide/tenant-application) · [Tenant dashboard API](/api/tenant-v1-dashboard) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspace users with `dashboard.view` can open **Customize** on the tenant Dashboard, apply a job template (Balanced, Sales rep, Sales manager, Service desk, Project ops, Finance ops, CRM lite), show/hide widgets, drag-reorder them, and save. Preferences are stored per user. **Module entitlement + Spatie permission always win** — layouts never grant access. Newly entitled widgets stay hidden until the user opts in (`new_widget_ids`).

**Go / No-Go:** **Go.** Migrate-only (`users.dashboard_layout`). Deploy Backend and Frontend together; hard-refresh SPA.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — AppLayout + existing widget registry; no parallel shell |
| Eligibility still filters widgets | **Pass** (Pest) |
| Default (no preference) shows all eligible widgets | **Pass** (Pest) |
| Custom items persist show/hide + order | **Pass** (Pest) |
| Template apply only includes eligible ids | **Pass** (Pest) |
| Unknown `template_id` → 422 | **Pass** (Pest + headed API check) |
| Missing `dashboard.view` → 403 | **Pass** (Pest) |
| Headed one session: invalid template 422, Sales rep template, hide High Priority, Show all restore | **Pass** (`npm run test:e2e:tenant-dashboard:customize:headed`) |

---

## Security summary

| Control | Status |
|---------|--------|
| Layout update requires `dashboard.view` | Pass |
| Widget ids outside the customizable catalog are dropped | Pass |
| Ineligible module/permission widgets never appear even if pinned | Pass |
| Preference JSON stores layout only (no payload data) | Pass |
| Chrome widgets (`activity_feed`, `notifications`, `quick_actions`) are not user-layouted | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | Medium | Existing tenant dashboard e2e expected removed **Pipeline activity** section after layout unification | **Fixed** — assertions use **Workspace insights** + Customize button; demo layout reset before load |
| **F2** | Medium | `.env.e2e.local` did not override `.env.e2e` (dotenv default) so Windows DNS workarounds never applied | **Fixed** — `playwright.config.ts` loads `.env.e2e.local` with `override: true` |
| **F3** | Medium | Browser could not resolve Herd `elosync-backend.test` (offline banner) while Node APIRequestContext could use `127.0.0.1` + Host | **Fixed** — `e2e/helpers/herd-dns-bypass.ts` routes browser traffic + prefers same-origin Vite `/api` proxy; document local `E2E_API_URL` / `E2E_API_HOST` |
| **I1** | Info | Sonner success toast can dismiss before Playwright asserts text | **Accepted** — headed test waits for PUT `/dashboard/layout` response + sheet close |

---

## Headed browser coverage

`npm run test:e2e:tenant-dashboard:customize:headed` on 2026-10-21. Result: **1 passed** (one serial session).

One demo-tenant login, one page session:

1. Reset layout to all-visible via API (stable baseline on shared demo user)
2. `PUT` unknown `template_id` → **422** validation error
3. Open Dashboard → **Customize** → Cancel (no change)
4. Apply **Sales rep** template → Save → `template_id=sales_rep`; `lead_sources` not visible
5. Hide **High priority deals** → Save → heading gone; `template_id` cleared
6. **Show all** → Save → High Priority returns
7. Restore full-visible layout in `finally`

Also: `npm run test:e2e:tenant-dashboard` (widget chrome + sidebar) after layout reset.

---

## Upgrade

1. `php artisan migrate --force` (adds nullable `users.dashboard_layout`). Do not `db:seed`.
2. Deploy Backend, then Frontend production build; hard-refresh SPA.
3. Smoke: open Dashboard → Customize → apply Sales rep → Save → confirm widgets change → Show all → Save.

---

## Local e2e notes (Windows + Herd)

When Node/Chrome cannot resolve `.test` DNS:

```env
# .env.e2e.local
E2E_BASE_URL=http://localhost:5173
E2E_API_URL=http://127.0.0.1
E2E_API_HOST=elosync-backend.test
E2E_SKIP_WEBSERVER=1
```

Serve the SPA with same-origin API so Vite’s `/api` proxy applies:

```bash
VITE_API_URL=http://localhost:5173 npm run dev -- --port 5173 --strictPort
```
