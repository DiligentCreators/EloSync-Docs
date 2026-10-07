# Customer Portal Module

Free **Operations** Marketplace module that gives invited Contacts a separate login to view shared projects (and customer-visible tasks), invoices, payments, quotations, and contracts, and to submit/track Help Desk tickets. Staff remain in the workspace SPA; customers use the isolated portal shell (`/#/portal/*`).

> **Not Vendor Portal / not Stripe billing portal**
>
> This is an **end-customer** account hub for CRM Contacts. Vendor self-service stays parked. Stripe/Creem “customer portal” links are SaaS subscription billing for the workspace itself — unrelated.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [customer-portal.md](/user-guide/customer-portal) |
| Engineers | [customer-portal.md](/developer-guide/customer-portal) |
| Production / ops | [customer-portal.md](/deployment/customer-portal) |
| Production readiness | [1.1.0](/deployment/customer-portal-1-1-0-production-readiness) · [1.0.0](/deployment/customer-portal-1-0-0-production-readiness) |
| Tenant API | [../api/tenant-v1-customer-portal.md](/api/tenant-v1-customer-portal) |

## Capabilities (1.2.0)

- Invite-only portal accounts linked 1:1 to a Contact (email + password; no open self-registration)
- Separate Sanctum guard (`portal-api`) — never staff `User` / Spatie roles
- Staff: Operations → Customer Portal list; Contact record invite / resend / disable / enable
- Customer SPA: login, forgot/reset password, accept invite, dashboard
- Soft-gated sections: Projects, Invoices, Payments, Quotations, Contracts, Support (Help Desk)
- Projects: staff **Share with customer portal** + per-task **Visible to customer**; portal shows milestones/tasks/timeline
- Document PDF download; quotation/contract acceptance-link from portal (existing public accept pages)
- Help Desk: customer creates tickets (contact stamped server-side) and adds notes

## Permissions (staff)

`customer-portal.view` · `invite` · `manage`

| Role | Grants |
|------|--------|
| **admin** | All |
| **manager** | `view`, `invite`, `manage` |
| **staff** | `view`, `invite` |

## Licensing

- Catalog slug: `customer-portal`, category `operations`, version **1.2.0**
- `is_default_included = false`, `is_billable = false`
- **Hard dependency:** `contacts`
- Soft: `projects`, `tasks`, `invoices`, `payments`, `quotations`, `contracts`, `help-desk` (section hidden / API 403 when not entitled)

## Explicitly deferred

- Magic-link passwordless login
- Public Knowledge Base
- Vendor / reseller portals
- Online payment checkout
- Portal 2FA / passkeys
