# EloSync Mobile

Tenant workspace app for **iOS** and **Android**. Sign in with the same email and permissions as the web workspace — Central admin is not available on mobile.

## Sign in

1. Open the EloSync app (development build or store release when available).
2. Enter your **email** and **password**.
3. Optional: workspace slug for branded login or if directed by your administrator.
4. Complete **email verification** if prompted.

Forgot password requires your **workspace** slug or domain plus email (the mobile app is not tied to a workspace subdomain URL like the browser).

## What's on mobile today

Mobile modules roll out **PR-by-PR**. The app home screen lists modules your role can access.

| Module | Mobile surface |
|--------|----------------|
| **Leads** | List, search, create, view, edit, delete (permission-gated) |
| **Tasks** | List, search, create, view, edit, delete, complete/reopen (permission-gated) |
| **Contacts** | List, search, create, view, edit, delete (permission-gated) |
| **Companies** | List, search, create, view, edit, delete (permission-gated) |
| **Opportunities** | List, search, create, view, edit, delete (permission-gated); Pipeline tab |
| **Activities** | List, search, create, view, edit, delete, complete (permission-gated); Log tab |
| **ToDos** | List, search, create, view, edit, delete, mark complete (permission-gated); ToDos tab |
| **Quotations** | List, search, create, view, edit, delete, send, accept (permission-gated); Quotes tab |
| **Calendar** | List (60-day range), search, create, view, edit manual events, cancel, delete (permission-gated); Calendar tab |
| **Meetings** | List (60-day range), search, create, view, edit, cancel, complete, delete (permission-gated); Meetings tab |
| **Projects** | List, search, create, view, edit, status transitions, delete (permission-gated); Projects tab |
| **Contracts** | List, search, create, view, edit (draft only), status transitions, delete (permission-gated); Contracts tab |
| **Invoices** | List, search, create, view, edit (draft only), send, void, delete (permission-gated); Invoices tab |
| **Payments** | List, search, create, view, edit (draft only), post, void, delete (permission-gated); optional invoice allocation; Payments tab |
| **Credit notes** | List, search, create, view, edit (draft only), issue, apply, void, delete (permission-gated); Credits tab |
| **Notifications** | In-app notification list, mark read |
| **Profile** | Account details, sign out |

Everything else remains on the web app until a mobile module PR ships. See the [product roadmap](/getting-started/product-roadmap#elosync-mobile-tenant-app) and [developer mobile guide](/developer-guide/mobile-app).

## Tips

- Use the same API-backed data as the web — changes sync immediately.
- Module and permission gates match the web app (installed Marketplace modules + Spatie permissions).
- For full CRM workflows (import, board, integrations, Meta ads), use the web app.

## Related

- [Leads user guide](/user-guide/leads-overview)
- [Tasks user guide](/user-guide/tasks-overview)
- [Contacts user guide](/user-guide/contacts-overview)
- [Companies user guide](/user-guide/companies-overview)
- [Opportunities user guide](/user-guide/opportunities-overview)
- [Activities user guide](/user-guide/activities-overview)
- [ToDos user guide](/user-guide/todos-overview)
- [Quotations user guide](/user-guide/quotations-overview)
- [Calendar user guide](/user-guide/calendar-overview)
- [Meetings user guide](/user-guide/meetings-overview)
- [Projects user guide](/user-guide/projects-overview)
- [Contracts user guide](/user-guide/contracts-overview)
- [Invoices user guide](/user-guide/invoices-overview)
- [Payments user guide](/user-guide/payments-overview)
- [Credit notes user guide](/user-guide/credit-notes-overview)
- [Tenant application guide](/user-guide/tenant-application)
