# Shared UI Layout

Central and Tenant applications share one shell so both sides of the platform feel identical until business modules diverge.

| Guide | Audience |
|-------|----------|
| [shared-layout-developer.md](/developer-guide/shared-layout) | Engineers extending the shell, navigation, or page chrome |
| [tenant-application-user.md](/user-guide/tenant-application) | Workspace users navigating the Tenant Application |
| [../architecture/shared-ui.md](/developer-guide/shared-ui) | Architecture — design system and reuse strategy |

## Principle

Changing a shared layout component should benefit both applications whenever practical. Business dashboards and module pages may diverge later; the shell stays reusable.

Opening another page (sidebar, search, breadcrumbs, or a record link) jumps you to the **top** of that page. Staying on the same list and changing filters or pagination does not.

## Module page tours

On tenant module list pages (Leads, Tasks, HR modules, and the rest of the sidebar modules), a **help** icon in the page header starts a short product tour. The first visit to a module may open the tour automatically once; you can re-run it anytime from the same icon. Every module tour ends with a step that points at your avatar menu so you know how to open **Give Feedback** and report a bug.
