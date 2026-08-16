# Tenant Audit Logs & Impersonation History — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Status** | **Go for production** after companion CI green + staging smoke |
| **Scope** | Central tenant details: Impersonation history + platform Audit Logs |
| **Branch** | `feature/tenant-audit-impersonation-history` |
| **Backend** | `b27abb1` + remediations |
| **Frontend** | `1d240a39` + remediations |

**Companion docs:** [Admin UI](/user-guide/admin-ui) · [Central API v1](/api/central-v1) · [Authentication](/developer-guide/authentication#central-platform-impersonation) · [Changelog](/changelog/)

---

## Executive summary

Central already **wrote** impersonation and platform audit events; this ship **surfaces** them on tenant details:

| Tab | Data | Permission |
|-----|------|------------|
| **Impersonation** | `impersonation_sessions` | `impersonation.list` |
| **Audit Logs** | Spatie `activity_log` (`platform`) for the workspace | `tenants.read` |

Does **not** redesign auth, tenancy, or audit write paths (platform freeze).

**Go / No-Go:** **Go** — prior residuals remediated; no hard blockers remain.

| Gate | Result |
|------|--------|
| Authz (`impersonation.list` / `tenants.read`) | **Pass** |
| Tenant isolation | **Pass** |
| List responses omit tokens | **Pass** |
| Audit list `properties` allowlisted (no before/after blobs) | **Pass** |
| Pagination / sort allowlists | **Pass** |
| Central session resume after end (`resumeToken` + `skipSessionExpiry`) | **Pass** |
| Impersonation **Expired** status (`is_expired` + UI badge) | **Pass** |
| FE permission gates + **ErrorState** on tab fetch failure | **Pass** |
| Pest Impersonation + TenantAuditLog | **Pass** |
| Playwright one-session validation + history | **Pass** (impersonation + tenants.view) |
| Docs admin-ui / central-v1 / authentication / changelog | **Pass** |
| MySQL migration (`activity_log.properties_tenant_id` index) | **Pass** — run on deploy |

---

## Security summary

| Control | Status |
|---------|--------|
| Central API auth + verified + not.suspended | Pass |
| Policy `viewAny` → `impersonation.list` | Pass |
| Tenant `view` → `tenants.read` for audit list | Pass |
| Query scoped to route tenant | Pass |
| No `tenant_token` / PAT id on list resource | Pass |
| Audit list redacts non-allowlisted `properties` keys | Pass |
| Resume central admin after end (even if end API fails) | Pass |

### Residual risk — remediated

| ID | Item | Resolution |
|----|------|------------|
| **M1** | Full audit `properties` visible to `tenants.read` | **Remediated** — `TenantAuditLogResource` allowlists public keys; `before` / `after` and other unreviewed keys omitted from list responses. |
| **L1** | Audit tab not FE-gated like Impersonation | **Remediated** — both tabs check `tenants.read` / `impersonation.list`; restricted empty state when permission missing; **ErrorState** on failed fetch. |
| **L2** | `isActive()` ignores `expires_at` | **Remediated** — `isActive()` / `isExpired()` honour `expires_at`; list resource exposes `is_expired`; UI shows **Expired** badge. |
| **L3** | JSON `properties->tenant_id` unindexed | **Remediated** — migration `2026_08_17_040000_add_activity_log_properties_tenant_id_index` adds MySQL virtual column + index. |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest `ImpersonationTest` + `TenantAuditLogTest` | Pass | Authz, isolation, allowlisted properties, `is_expired` |
| Playwright `test:e2e:impersonation` | Pass | Validation, start/end, history tabs |
| Playwright `tenants.view` | Pass | Tabs not placeholder; permission empty states |

---

## Staging smoke

1. Open an active workspace → **Impersonation** / **Audit Logs** tabs (no “not available yet”).
2. Impersonate with empty / short reason → client validation (≥ 5 chars).
3. Start with a real reason → End impersonation → land on Central dashboard as same admin (verify `resumeToken` restore).
4. Impersonation tab shows the reason and **Ended** status; expired open sessions show **Expired**.
5. Audit Logs shows `impersonation_started` (and ended) with allowlisted `properties` (reason visible; no before/after blobs in network payload).
6. Role without `impersonation.list` → restricted empty state on Impersonation tab (not a silent empty table).
7. Role without `tenants.read` → restricted empty state on Audit Logs tab.
8. Simulate audit-list API failure (or revoke permission mid-session) → **ErrorState** with retry, not a blank table.

---

## Deploy

- **Run migrations** before traffic: `php artisan migrate --force` (includes `2026_08_17_040000_add_activity_log_properties_tenant_id_index` — MySQL/MariaDB virtual column on `activity_log.properties->tenant_id`). No-op on SQLite test runs.
- Deploy Backend + Frontend + Docs companions together.
- Confirm Central roles that should view history have `impersonation.list` (already in `central-permissions`; sync via existing Permissions / Role seeders if a custom role lacks it).
- `tenants.read` still required for Audit Logs; list responses no longer expose full property blobs.

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Engineering | **Go** | 2026-08-17 |
| Ops | ☐ Staging smoke | |
| Product | **Go** — M1 accepted remediation | 2026-08-17 |

**Current decision (2026-08-17):** **Go** — merge after CI green; complete staging smoke before production traffic.
