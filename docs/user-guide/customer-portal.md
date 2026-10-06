# Customer Portal

Install **Customer Portal** from Marketplace (free **Operations** module). It requires **Contacts**. Until it is installed, the Customer Portal nav stays hidden.

## Invite a customer

1. Open a Contact that has an **email**.
2. On the contact record, use **Invite to portal** (needs `customer-portal.invite`).
3. The contact receives an email with a link to `/#/portal/invite/{token}` to set a password.
4. They sign in at `/#/portal/login` with email + password.

On a **shared** app host (not a tenant subdomain), login asks for **email first**, then a searchable **company/workspace** list of only the workspaces that already invited that email. Invitation and reset emails still include `?workspace=` so most customers skip the picker. On a tenant-bound domain the workspace step is hidden.

From **Operations → Customer Portal** you can list accounts, resend invites, disable, or enable access (`customer-portal.manage` for disable/enable).

## What customers see

After login, the portal shell shows sections only when the related workspace module is installed:

| Section | Module | Actions |
|---------|--------|---------|
| Invoices | `invoices` | List, view, download PDF |
| Payments | `payments` | List, view, download receipt PDF |
| Quotations | `quotations` | List, view, PDF, get accept link |
| Contracts | `contracts` | List, view, PDF, get accept link |
| Support | `help-desk` | List, open ticket, add notes |

Visibility is limited to the Contact’s own records, or records for their Company when `company_id` is set. Contracts resolve via the linked Opportunity’s party.

One-shot e-sign pages (`/#/accept/quotations|contracts/...`) still work without a portal login.

## Staff vs portal

- Staff use the normal workspace app and Spatie permissions.
- Portal users never receive `invoices.view` or other staff permissions.
- Disabling a portal account blocks login without deleting the Contact.

## Deferred

Projects, tasks, magic-link login, and public Knowledge Base are not in **1.0.0** — see the [overview](/user-guide/customer-portal-overview) and [Product Roadmap](/getting-started/product-roadmap).
