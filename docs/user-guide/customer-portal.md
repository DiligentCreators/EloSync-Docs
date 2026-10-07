# Customer Portal

Install **Customer Portal** from Marketplace (free **Operations** module). It requires **Contacts**. Until it is installed, the Customer Portal nav stays hidden.

## Invite a customer

1. Open a Contact that has an **email**.
2. On the contact record, use **Invite to portal** (needs `customer-portal.invite`).
3. The contact receives an email with a link to `/#/portal/invite/{token}` to set a password.
4. They sign in at `/#/portal/login` with email + password, or request a **magic sign-in link** (passwordless email).

On a **shared** app host (not a tenant subdomain), login asks for **email first**, then a searchable **company/workspace** list of only the workspaces that already invited that email. Invitation, reset, and magic-link emails still include `?workspace=` so most customers skip the picker. On a tenant-bound domain the workspace step is hidden.

From **Operations → Customer Portal** you can list accounts, resend invites, disable, or enable access (`customer-portal.manage` for disable/enable).

After login, customers can open **Security** to enable authenticator-app **two-factor authentication** (TOTP). When 2FA is on, password and magic-link sign-in ask for a code before entering the portal.

## What customers see

After login, the portal shell shows sections only when the related workspace module is installed:

| Section | Module | Actions |
|---------|--------|---------|
| Projects | `projects` (+ `tasks` for task list) | List/view shared projects, customer-visible tasks, milestones, timeline |
| Invoices | `invoices` | List, view, download PDF |
| Payments | `payments` | List, view, download receipt PDF |
| Quotations | `quotations` | List, view, PDF, get accept link |
| Contracts | `contracts` | List, view, PDF, get accept link |
| Support | `help-desk` | List, open ticket (rich description), reply with rich text + attachment |
| Knowledge Base | `knowledge-base` | Browse published help articles |

Visibility is limited to the Contact’s own records, or records for their Company when `company_id` is set. Contracts resolve via the linked Opportunity’s party.

**Projects:** Staff must turn on **Share with customer portal** on the project (and link a Contact or Company). Tasks stay internal unless **Visible to customer** is enabled on each task.

**Support:** Replying to a **Closed** or **Resolved** ticket automatically reopens it for staff. Staff internal notes never appear in the portal.

One-shot e-sign pages (`/#/accept/quotations|contracts/...`) still work without a portal login.

## Staff vs portal

- Staff use the normal workspace app and Spatie permissions.
- Portal users never receive `invoices.view` or other staff permissions.
- Disabling a portal account blocks login without deleting the Contact.

## Deferred

Online checkout and portal passkeys are not in **1.3.0** — see the [overview](/user-guide/customer-portal-overview) and [Product Roadmap](/getting-started/product-roadmap).
