# Staff ↔ Customer Portal login cross-links — Production Readiness

| Field | Value |
|-------|--------|
| **Scope** | Reciprocal guest footer links between tenant workspace login (`/#/login`) and Customer Portal login (`/#/portal/login`), including shared-host `?workspace=` preservation |
| **Date** | 2026-11-09 |
| **Verdict** | **Go** |
| **E2E** | `customer-portal.smoke.spec.ts` — guest footer hop + workspace query preservation (added); existing invite smoke unchanged |
| **Unit** | `src/config/routes.workspace-query.test.ts` — `withWorkspaceQuery` |

## Locked scope

- Footer-only navigation between **isolated** auth shells (staff `useAuthStore` / `tenant-api` vs portal `usePortalAuthStore` / `portal-api`)
- Preserve `?workspace=` on shared (non–host-bound) app hosts
- No unified login form, no shared credentials, no Central admin cross-link
- Forgot/reset/magic-link **staff ↔ portal** footers remain out of scope (portal auth pages still preserve workspace when hopping back to portal login)

## Audit report (2026-11-09)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Med | No automated coverage for reciprocal login links or `?workspace=` hop | Fixed: Vitest for `withWorkspaceQuery` + Playwright smoke asserting portal ↔ workspace hop with workspace query |
| A2 | Med | No production-readiness page / VitePress / deployment hub links for the ship | Fixed: this document + sidebar + deployment index + overview/changelog links |
| A3 | Low | `withWorkspaceQuery` always used `?`, which would break paths that already have a query | Fixed: uses `&` when `path` already contains `?` |
| A4 | Med | Portal login → forgot / magic-link “back to sign in” dropped `?workspace=` on shared hosts | Fixed: portal login, forgot-password, and magic-link request use `withWorkspaceQuery`; forgot-password honors inbound `?workspace=` like login/magic-link |
| A5 | Info | Staff forgot-password ↔ portal forgot-password have no reciprocal footer | Accepted residual — invite/email deep links remain primary; login hop covers the main mis-navigation case |
| A6 | Pass | Central (`/#/central/login`) must not advertise Customer Portal | Verified: cross-link gated to `context === 'tenant'` only |

## Verification matrix

| Check | Backend | Frontend | Docs |
|-------|---------|----------|------|
| Tenant login shows Customer portal sign-in | N/A | Pass | Pass |
| Portal login shows Workspace sign-in | N/A | Pass | Pass |
| Shared-host `?workspace=` survives hop both ways | N/A | Pass (e2e + helper) | Pass |
| Auth stores/guards remain isolated | N/A (unchanged) | Pass | Pass |
| Central login unchanged | N/A | Pass | Pass |
| Portal forgot/magic back-links keep workspace | N/A | Pass | Pass |

## Go-live

1. Deploy **Frontend** (login footers + `withWorkspaceQuery` on portal guest auth links). No Backend migrate / catalog bump.
2. Deploy **Docs** (this readiness page + user/developer notes).
3. Smoke on a shared host: open `/#/portal/login?workspace={domain}` → **Workspace sign-in** → confirm query kept → **Customer portal sign-in** → confirm return to portal with query.
4. Smoke on a tenant-bound host: both footers visible; no workspace picker required.

## Pest / Playwright / Vitest

- Backend: none (UI-only)
- `npm run test:unit -- src/config/routes.workspace-query.test.ts`
- `npm run test:e2e:customer-portal` (or headed variant) — includes the new guest footer smoke
