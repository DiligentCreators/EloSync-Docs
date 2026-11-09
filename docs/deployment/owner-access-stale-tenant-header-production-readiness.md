# Owner credentials + stale workspace header — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-21 |
| **Status** | **Go for production** — headed Playwright **2/2** (setup + one serial session) |
| **Scope** | Shared-host `X-Tenant-Domain` / Bearer conflict; Central update of workspace owner login email/password |
| **Catalog** | No bump |
| **Companion** | [Authentication](/developer-guide/authentication) · [Admin UI](/user-guide/admin-ui) · [Central API](/api/central-v1) · [CHANGELOG](/changelog/) |

---

## Executive summary

On the shared SPA host, a leftover `dc_saas_tenant_domain` (sent as `X-Tenant-Domain`) could bind the wrong workspace for forgot/reset or 401 Central impersonation when the Bearer belonged to another tenant. Central also lacked a way to set the workspace **owner login** email/password after create (the Tenants list **Email** column is contact-only).

This ship: token/email win over stale headers; SPA omits the header when a Bearer is present and resets the hint on impersonation start; Central **Owner login** updates owner credentials with audit.

**Go / No-Go:** **Go.** Deploy Backend + Frontend + Docs together. No migrate.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — existing Central tenant details + axios interceptors |
| Forgot/reset prefer email over stale `X-Tenant-Domain` | **Pass** (Pest `StaleWorkspaceHeaderAuthTest`) |
| Bearer token wins over conflicting header | **Pass** (Pest) |
| Central owner email/password update + token revoke | **Pass** (Pest `TenantUpdateOwnerCredentialsTest`) |
| Impersonation start returns `workspace` slug/domain | **Pass** (Pest `ImpersonationTest`) |
| Axios omits `X-Tenant-Domain` with Bearer | **Pass** (Vitest `axios.test.ts`) |
| Headed one-session: validate owner login, save, impersonate with stale hint, audit | **Pass** (`npm run test:e2e:owner-credentials:headed`, 2026-10-21) |

---

## Security summary

| Control | Status |
|---------|--------|
| Owner credentials require `tenants.update` | Pass |
| Password never written to audit properties (flags only) | Pass |
| Password change revokes owner Sanctum tokens | Pass |
| Owner email uniqueness still global on `users.email` | Pass |
| Stale client header cannot override Bearer or auth email resolution | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **A1** | **High** | Stale `X-Tenant-Domain` caused impersonation 401 / reset “user not found” on shared host | **Fixed** — token/email win in `InitializeTenancy`; SPA skips header with Bearer; impersonation replaces storage hint |
| **A2** | **High** | Operators could not set owner login email/password from Central after create | **Fixed** — `POST /tenants/{id}/owner-credentials` + **Owner login** dialog |
| **A3** | Med | Tenants list **Email** confused with owner login email | **Documented** — Admin UI + Owner login copy; Overview already shows Owner email |
| **A4** | Low | Audit list omitted new owner-credential property keys | **Fixed** — allowlist includes `owner_id`, `owner_email`, `email_changed`, `password_changed` |
| **I1** | Info | Clearing localStorage was a workable ops workaround | **Superseded** by product fix |

---

## Headed browser coverage

`E2E_BROWSER_CHANNEL=chrome npm run test:e2e:owner-credentials:headed` on 2026-10-21. Result: **2 passed** (central login setup + one serial session).

One Central admin session (`e2e/.auth/admin.json`):

1. Create tenant with distinct contact email vs owner email  
2. **Owner login** — empty submit → validation; password mismatch → validation  
3. Save new owner email + password → toast + Overview shows new owner email  
4. Inject stale `dc_saas_tenant_domain` → **Impersonate** (reason validation then success)  
5. After verify + reload, impersonation banner visible; storage hint is **not** the stale domain  
6. End impersonation → Central Dashboard → tenant Audit Logs show `workspace_owner_credentials_updated` and `impersonation_started`  
7. Delete tenant  

**Finding during e2e:** success toast overlay blocked the Impersonate submit click — test waits for toast dismiss (product toast timing unchanged).

---

## Upgrade

1. Deploy Backend (no migrate).  
2. Deploy Frontend SPA and hard-refresh.  
3. Deploy Docs.  
4. Smoke: open a workspace → **Owner login** set a temp password → Impersonate with another workspace previously visited on the same browser (stale hint) → confirm no “Unauthenticated” / session-expired loop.  
5. Smoke: shared-host forgot-password with the owner email after visiting a different workspace subdomain in the same browser.
