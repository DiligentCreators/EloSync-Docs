# Central Playwright E2E

The Playwright suite for the **Central Application** lives in the Frontend repository:

- Guide: [`SaaS-Frontend/docs/testing/PLAYWRIGHT.md`](https://github.com/DiligentCreators/SaaS-Frontend/blob/main/docs/testing/PLAYWRIGHT.md)
- Tests: `SaaS-Frontend/e2e/tests/<module>/`
- Shared POM / fixtures: `SaaS-Frontend/e2e/{pages,fixtures,helpers,utils,test-data}/`
- Config: `SaaS-Frontend/playwright.config.ts`

## Scope

Covers Platform/Core only: auth, dashboard, tenants (workspaces), users, roles, permissions matrix, modules, marketplace, billing (Billing nav + payment gateways + settings billing tab + tenant invoice/payment tabs), impersonation, settings, profile, smoke, and regression.

Does **not** cover Stripe Checkout or future ERP modules beyond what is listed below. Tenant Settings branding/mail coverage lives in `e2e/tests/settings/tenant-settings.spec.ts`. Tenant Users/Roles RBAC coverage lives in `e2e/tests/users/tenant-users.spec.ts` (`npm run test:e2e:tenant-rbac`). **Leads** product UI: `e2e/tests/leads/` (`npm run test:e2e:leads`). **Tasks** product UI: `e2e/tests/tasks/` (`npm run test:e2e:tasks`). **Projects** product UI: `e2e/tests/projects/` (`npm run test:e2e:projects`). **ToDos** product UI: `e2e/tests/todos/` (`npm run test:e2e:todos`). **Contacts** product UI: `e2e/tests/contacts/` (`npm run test:e2e:contacts`). **Companies** product UI: `e2e/tests/companies/` (`npm run test:e2e:companies`). **Opportunities / Quotations / Contracts**: `e2e/tests/{opportunities,quotations,contracts}/` plus shared-session `e2e/tests/sales/` (`npm run test:e2e:sales`). **Invoices**: `e2e/tests/invoices/` (`npm run test:e2e:invoices`). **Payments**: `e2e/tests/payments/` (`npm run test:e2e:payments`) — installs both `invoices` and `payments` modules (hard dependency). **Credit Notes**: `e2e/tests/credit-notes/` (`npm run test:e2e:credit-notes`) — installs both `invoices` and `credit-notes` modules (hard dependency). **Estimates**: `e2e/tests/estimates/` (`npm run test:e2e:estimates`) — installs both `invoices` and `estimates` modules (hard dependency), covers create → send → accept → convert to invoice. **Vendors**: `e2e/tests/vendors/` (`npm run test:e2e:vendors`) — installs the `vendors` module (free Purchasing opt-in), covers list KPIs, create, notes, and activity timeline. **Purchase Orders**: `e2e/tests/purchase-orders/` (`npm run test:e2e:purchase-orders`) — installs both `vendors` and `purchase-orders` modules (hard dependency), covers create, status transitions (draft → sent → partially received → received), and the timeline. **Expenses**: `e2e/tests/expenses/` (`npm run test:e2e:expenses`) — installs `vendors` + `purchase-orders` + `expenses` (all soft/free Purchasing opt-ins, no hard dependency), covers list KPIs, create → submit → approve → pay, and converting a purchase order to a draft expense via the PO detail sheet. **Communication Templates**: `e2e/tests/communication-templates/` (`npm run test:e2e:communication-templates`). **Automation**: `e2e/tests/automation/` (`npm run test:e2e:automation`) — billable Marketplace install, then workflows / templates / runs smoke plus create → activate → run and unwired-trigger activate guard. Tenant suites use Playwright project `tenant`.

## Spec directories (independently runnable)

| Suite | Path | npm script |
|-------|------|------------|
| Auth | `e2e/tests/auth/` | `npm run test:e2e:auth` |
| Dashboard | `e2e/tests/dashboard/` | `npm run test:e2e:dashboard` |
| Tenants / workspaces | `e2e/tests/tenants/` | `npm run test:e2e:tenants` |
| Users | `e2e/tests/users/` | `npm run test:e2e:users` (Central) · `npm run test:e2e:tenant-rbac` (workspace Users/Roles) |
| Roles | `e2e/tests/roles/` | `npm run test:e2e:roles` |
| Permissions | `e2e/tests/permissions/` | `npm run test:e2e:permissions` |
| Modules | `e2e/tests/modules/` | `npm run test:e2e:modules` |
| Marketplace | `e2e/tests/marketplace/` | `npm run test:e2e:marketplace` |
| Billing | `e2e/tests/billing/` | `npm run test:e2e:billing` |
| Impersonation | `e2e/tests/impersonation/` | `npm run test:e2e:impersonation` |
| Settings | `e2e/tests/settings/` | `npm run test:e2e:settings` — Central identity/flags + `tenant-settings.spec.ts` workspace branding/mail fallback (`npm run test:e2e:tenant-settings`) |
| Leads | `e2e/tests/leads/` | `npm run test:e2e:leads` |
| Tasks | `e2e/tests/tasks/` | `npm run test:e2e:tasks` |
| Projects | `e2e/tests/projects/` | `npm run test:e2e:projects` / `test:e2e:projects:headed` |
| Contacts | `e2e/tests/contacts/` | `npm run test:e2e:contacts` |
| Companies | `e2e/tests/companies/` | `npm run test:e2e:companies` |
| Opportunities | `e2e/tests/opportunities/` | `npm run test:e2e:opportunities` |
| Quotations | `e2e/tests/quotations/` | `npm run test:e2e:quotations` |
| Contracts | `e2e/tests/contracts/` | `npm run test:e2e:contracts` |
| Sales (shared session) | `e2e/tests/sales/` | `npm run test:e2e:sales` / `test:e2e:sales:headed` |
| Invoices | `e2e/tests/invoices/` | `npm run test:e2e:invoices` |
| Payments | `e2e/tests/payments/` | `npm run test:e2e:payments` |
| Credit Notes | `e2e/tests/credit-notes/` | `npm run test:e2e:credit-notes` |
| Estimates | `e2e/tests/estimates/` | `npm run test:e2e:estimates` |
| Vendors | `e2e/tests/vendors/` | `npm run test:e2e:vendors` / `test:e2e:vendors:headed` |
| Purchase Orders | `e2e/tests/purchase-orders/` | `npm run test:e2e:purchase-orders` / `test:e2e:purchase-orders:headed` |
| Expenses | `e2e/tests/expenses/` | `npm run test:e2e:expenses` / `test:e2e:expenses:headed` |
| Purchasing (shared session) | `e2e/tests/purchasing/` | `npm run test:e2e:purchasing` / `test:e2e:purchasing:headed` — one login, then Vendors → Purchase Orders → Expenses with form validation + PO convert; includes negative authz (`purchasing.authz.spec.ts`) |
| Communication Templates | `e2e/tests/communication-templates/` | `npm run test:e2e:communication-templates` |
| Email | `e2e/tests/email/` | `npm run test:e2e:email` (+ `test:e2e:email:headed`) |
| Automation | `e2e/tests/automation/` | `npm run test:e2e:automation` / `test:e2e:automation:headed` |
| Knowledge Base | `e2e/tests/knowledge-base/` | `npm run test:e2e:knowledge-base` / `test:e2e:knowledge-base:headed` |
| Profile | `e2e/tests/profile/` | `npm run test:e2e:profile` |
| Smoke | `e2e/tests/smoke/` | `npm run test:e2e:smoke` |
| Regression | `e2e/tests/regression/` | `npm run test:e2e:regression` |

Setup project (`auth.setup.ts`) authenticates once for chromium suites. Auth and **tenant** projects use empty storage and do not depend on setup.

## QA status (Central stabilization)

- Full suite: **48 passed**, 0 skipped, 0 failed (local Chromium run).
- Each module directory is executable independently via `npx playwright test e2e/tests/<module>` or the npm scripts above.
- After module-level green runs, re-run `npm run test:e2e` before declaring Central stable.

## Screenshots

Playwright writes generated screenshots under:

```text
SaaS-Frontend/docs/testing/images/
SaaS-Frontend/test-results/
SaaS-Frontend/playwright-report/
```

Those paths are **gitignored** in Frontend and Backend — never commit e2e-generated images, videos, or traces there.

Curated documentation screenshots may be committed **only** in this Docs repo (`testing/images/…`) when intentionally documenting a workflow. Do not dump raw Playwright run output into Docs.

## Quick start

```bash
cd SaaS-Frontend
cp .env.e2e.example .env.e2e
npm install
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
```

See the Frontend guide for environment variables, CI usage, debugging, and extension patterns.
