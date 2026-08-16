# Tenant Audit Logs & Impersonation History — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Status** | **Go for production** after companion CI green + staging smoke |
| **Scope** | Central tenant details: Impersonation history + platform Audit Logs |
| **Branch** | `feature/tenant-audit-impersonation-history` |
| **Backend** | `b27abb1` |
| **Frontend** | `1d240a39` |

**Companion docs:** [Admin UI](/user-guide/admin-ui) · [Central API v1](/api/central-v1) · [Changelog](/changelog/)

---

## Executive summary

Central already **wrote** impersonation and platform audit events; this ship **surfaces** them on tenant details:

| Tab | Data | Permission |
|-----|------|------------|
| **Impersonation** | `impersonation_sessions` | `impersonation.list` |
| **Audit Logs** | Spatie `activity_log` (`platform`) for the workspace | `tenants.read` |

Does **not** redesign auth, tenancy, or audit write paths (platform freeze).

**Go / No-Go:** **Go** — no hard blockers; optional polish listed below.

| Gate | Result |
|------|--------|
| Authz (`impersonation.list` / `tenants.read`) | **Pass** |
| Tenant isolation | **Pass** |
| List responses omit tokens | **Pass** |
| Pagination / sort allowlists | **Pass** |
| Central session resume after end (`resumeToken` + `skipSessionExpiry`) | **Pass** |
| Pest Impersonation + TenantAuditLog | **Pass** (9 tests) |
| Playwright one-session validation + history | **Pass** (impersonation + tenants.view) |
| Docs admin-ui / central-v1 / changelog | **Pass** |
| New migrations | **N/A** (none) |

---

## Security summary

| Control | Status |
|---------|--------|
| Central API auth + verified + not.suspended | Pass |
| Policy `viewAny` → `impersonation.list` | Pass |
| Tenant `view` → `tenants.read` for audit list | Pass |
| Query scoped to route tenant | Pass |
| No `tenant_token` / PAT id on list resource | Pass |
| Resume central admin after end (even if end API fails) | Pass |

### Accepted residual risk

| ID | Item | Notes |
|----|------|-------|
| **M1** | Full audit `properties` visible to `tenants.read` | Includes impersonation reason without `impersonation.list`. Documented; allowlist later if needed. |
| **L1** | Audit tab not FE-gated like Impersonation | Backend still enforces; failed fetch can look empty. |
| **L2** | `isActive()` ignores `expires_at` | Pre-existing; Active = `ended_at === null`. |
| **L3** | JSON `properties->tenant_id` unindexed | Fine at current volume; index if lists slow. |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest `ImpersonationTest` + `TenantAuditLogTest` | Pass | Authz, isolation, reason in audit |
| Playwright `test:e2e:impersonation` | Pass | Validation, start/end, history tabs |
| Playwright `tenants.view` | Pass | Tabs not placeholder |

---

## Staging smoke

1. Open an active workspace → **Impersonation** / **Audit Logs** tabs (no “not available yet”).
2. Impersonate with empty / short reason → client validation (≥ 5 chars).
3. Start with a real reason → End impersonation → land on Central dashboard as same admin.
4. Impersonation tab shows the reason and Ended status.
5. Audit Logs shows `impersonation_started` (and ended) with reason in properties.
6. Role without `impersonation.list` → restricted empty state on Impersonation tab.

---

## Deploy

- **No migrations.** Deploy Backend + Frontend + Docs companions together.
- Confirm Central roles that should view history have `impersonation.list` (already in `central-permissions`; sync via existing Permissions / Role seeders if a custom role lacks it).
- Anyone with `tenants.read` can open Audit Logs (including impersonation reasons in properties).

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Engineering | **Go** | 2026-08-17 |
| Ops | ☐ Staging smoke | |
| Product | ☐ Accept M1 residual | |

**Current decision (2026-08-17):** **Go** — merge after CI green; complete staging smoke before production traffic.
