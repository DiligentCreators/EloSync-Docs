# Customer Portal 1.3.0 (+ Help Desk 1.15.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Status** | **Go for production** |
| **Scope** | Magic-link login; portal TOTP 2FA; published Knowledge Base in portal; Help Desk customer-reply reopen + notify (**help-desk 1.15.0**); conversation UI polish; Settings email toggles for Help Desk events |
| **Catalog** | **customer-portal 1.2.0 → 1.3.0**, **help-desk 1.14.0 → 1.15.0** (migrate-only + CatalogSeeder) |
| **Companion** | [Help Desk 1.15.0 readiness](./help-desk-1-15-0-production-readiness) · [Customer Portal](/user-guide/customer-portal) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

Portal auth deepens with passwordless magic links (Central mail, 15 min single-use token) and Fortify TOTP 2FA on `PortalUser`. Published Knowledge Base articles are readable in the portal when soft-entitled. Help Desk **closed** and **resolved** tickets reopen automatically on customer public reply (portal or email ingest); assignees get mandatory in-app notify and optional mail (`email_notifications.help_desk_*`, defaults off). Staff Conversation / portal Support UIs use clearer chat-style threads.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (portal SPA remains isolated; no parallel staff shells) | **Pass** |
| Magic-link request always generic success; Active accounts only; Central mail | **Pass** |
| Magic-link consume single-use; challenges 2FA when enabled | **Pass** |
| Portal 2FA manage under `auth:portal-api`; challenge issues `portal-token` (no attendance) | **Pass** |
| Portal KB published-only; soft `knowledge-base` entitlement | **Pass** |
| Customer reply reopens closed **and** resolved → open (system actor) | **Pass** |
| In-app notify always; mail gated by prefs (default off) | **Pass** |
| Catalog migrate-only **1.3.0** / **1.15.0** + CatalogSeeder companion | **Pass** |
| Playwright headed (one session per workflow) | **Pass** — Customer Portal **3/3**; Help Desk **3/3** |
| Pest (focused Customer Portal + Help Desk reopen/notify + catalog bumps) | **Pass** |
| Docs + CHANGELOG + upgrade path | **Pass** |

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Med | Portal ticket reopen e2e: same-hash navigation did not refetch closed status (`staleTime` 30s) | Workflow forces `page.reload()` after staff close before asserting reopen copy |
| A2 | Low | Magic-link empty-email assertion matched field error + toast | Scoped to `getByRole('main')` |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Full TOTP enable→challenge→login not automated in Playwright (Security page visit + Enable control asserted); Pest covers 2FA challenge paths |
| R2 | Info | Portal passkeys and online checkout remain deferred |
| R3 | Ops | Deploy Backend + Frontend together; migrate-only — **do not** `db:seed` |
| R4 | Info | Email ingest reopen shares `reopenFromCustomerReply` with portal; covered by Pest + service path |

## What shipped

### Backend

- Migrations: magic-login token columns; portal `two_factor_*`; catalog bumps
- `PortalAuthService` magic-link request/consume; `authenticateCredentials` + 2FA challenge wiring
- `PortalTwoFactorChallengeController` / `PortalTwoFactorController`; `InitializeTenancy` challenge tenant resolve
- `PortalKnowledgeBaseService` + controller + resource
- `HelpDeskTicketService::reopenFromCustomerReply`; `HelpDeskCustomerReplyNotification`; prefs keys
- Pest: PortalAuth/TwoFactor/KnowledgeBase/HelpDesk reopen + catalog bump tests

### Frontend

- Magic-link request/consume pages; Security (2FA); portal KB list/view
- Login 2FA challenge form; Help Desk conversation UI polish
- Settings → Notifications Help Desk email toggles; `help_desk.customer_reply` registry
- Playwright Customer Portal workflow extended (KB, reopen, Security, magic-link, settings toggles)

### Docs

- User / developer / API / roadmap / upgrade / CHANGELOG; this readiness page + Help Desk 1.15.0 companion

## Operator checklist

1. Deploy Backend → `php artisan migrate --force` (**do not** `db:seed`)
2. Confirm catalog: `customer-portal` **1.3.0**, `help-desk` **1.15.0**
3. Deploy Frontend SPA
4. Smoke: magic-link request → consume; Security enable 2FA → re-login challenge; portal KB when entitled; reply on closed ticket → Open + staff in-app notification; Settings Help Desk mail toggles default off

## Related

- [Help Desk 1.15.0 readiness](./help-desk-1-15-0-production-readiness.md)
- [Customer Portal deployment](./customer-portal.md)
- [Changelog](/changelog/)
