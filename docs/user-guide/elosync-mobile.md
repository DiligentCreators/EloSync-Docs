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
- [Tenant application guide](/user-guide/tenant-application)
