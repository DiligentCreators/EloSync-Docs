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
| **Estimates** | List, search, create, view, edit (draft only), send, accept, reject, convert to invoice, delete (permission-gated); Ests tab |
| **Expenses** | List, search, create, view, edit (draft only), submit, approve, reject, pay, cancel, delete (permission-gated); Spend tab |
| **Products** | List, search, create, view, edit, delete (permission-gated); Products tab |
| **Warehouses** | List, search, create, view, edit, delete (permission-gated); WH tab |
| **Inventory** | Stock levels, adjust, transfers (create/view/edit draft/dispatch/complete/cancel/delete); Stock tab |
| **Communication templates** | List, search, create, view, edit, delete (permission-gated); Tmpl tab |
| **Email** | Mailbox list (inbox/sent/drafts), search, read, mark read (permission-gated); Mail tab |
| **Announcements** | Inbox, search, view, mark read; create/edit/delete for managers; News tab |
| **Assets** | List, search, create, view, edit, delete (permission-gated); Assets tab |
| **Short links** | List, search, create, view, edit, delete, share short URL (permission-gated); Links tab |
| **Documents** | List, search, upload, view, edit metadata, delete, download/share (permission-gated); Docs tab |
| **Help desk** | List, search, create, view, edit, delete, close, reopen, add notes (permission-gated); Tickets tab |
| **Knowledge base** | List, search, create, view, edit, delete (permission-gated); KB tab |
| **Team chat** | Conversation list, search, join channels, start DM/group, read thread, send text (permission-gated); Chat tab |
| **WhatsApp Cloud** | Inbox, search, read thread, open chat, send text or approved templates (permission-gated); WA tab |
| **Automation** | Workflow list, search, view, activate/deactivate, run now, delete, run history and logs (permission-gated); Auto tab |
| **Analytics** | KPI overview, preset periods, CRM/Sales/Billing/Purchasing/People reports with metrics and rows (permission-gated); Stats tab |
| **Financial reports** | Trial balance, P&L, balance sheet, aged receivables with date filters (permission-gated); Fin tab |
| **Accounting** | Chart of accounts and journal entries — list, search, create, view, edit, delete, post, void (permission-gated); Acct tab |
| **Employees** | Directory list, search, create, view, edit, delete; department chips and linked user when entitled (permission-gated); Staff tab |
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
- [Estimates user guide](/user-guide/estimates-overview)
- [Expenses user guide](/user-guide/expenses-overview)
- [Products user guide](/user-guide/products-overview)
- [Warehouses user guide](/user-guide/warehouses-overview)
- [Inventory user guide](/user-guide/inventory-overview)
- [Communication templates user guide](/user-guide/communication-templates)
- [Email user guide](/user-guide/email)
- [Announcements user guide](/user-guide/announcements-overview)
- [Assets user guide](/user-guide/assets-overview)
- [Short links user guide](/user-guide/short-links)
- [Documents user guide](/user-guide/documents)
- [Help desk user guide](/user-guide/help-desk)
- [Knowledge base user guide](/user-guide/knowledge-base)
- [Team chat user guide](/user-guide/team-chat)
- [WhatsApp Cloud user guide](/user-guide/whatsapp-cloud)
- [Automation user guide](/user-guide/automation-overview)
- [Analytics user guide](/user-guide/analytics-overview)
- [Financial reports user guide](/user-guide/financial-reports-overview)
- [Accounting user guide](/user-guide/accounting-overview)
- [Employees user guide](/user-guide/employees-overview)
- [Tenant application guide](/user-guide/tenant-application)
