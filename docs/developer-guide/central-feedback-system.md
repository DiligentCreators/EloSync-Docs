# Central Feedback System

Architecture for EloSync product feedback: **submitted from the Tenant Application**, **managed in the Central Application**.

> **Status: Implemented**
>
> Shipped with Backend [#93](https://github.com/DiligentCreators/SaaS-Backend/pull/93) and Frontend [#88](https://github.com/DiligentCreators/SaaS-Frontend/pull/88). Architecture stays aligned with Sanctum dual-guard, Spatie RBAC, single-DB tenancy, Central React SPA, `FileUploadService`, and `PlatformAuditService`. User-facing flows: [Give Feedback](/user-guide/feedback).

Related: [Founding Beta](/product/founding-beta) · [Authentication](/developer-guide/authentication) · [Object Storage](/developer-guide/object-storage) · [Admin UI](/user-guide/admin-ui) · [Platform Freeze](/getting-started/platform-freeze)

---

## Goals

1. Give tenant users a lightweight way to report bugs, UX issues, feature requests, performance problems, and integration gaps.
2. Give the EloSync operator team a Central inbox for triage, priority, public replies, and private notes.
3. Enforce **tenant isolation** and **internal-note secrecy** in the API, not only in the UI.
4. Keep feedback as a **platform concern** — not a licensed tenant Marketplace module and not a second support-ticket product.

---

## Architecture overview

```text
┌────────────────────┐     Tenant Sanctum      ┌─────────────────────┐
│  Tenant SPA        │ ─────────────────────► │  /api/tenant/v1/     │
│  Give Feedback UI  │                         │  feedback*           │
└────────────────────┘                         └──────────┬──────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  Central DB models  │
                                               │  (tenant_id linked) │
                                               └──────────┬──────────┘
                                                          │
┌────────────────────┐     Central Sanctum     ┌──────────▼──────────┐
│  Central SPA       │ ◄────────────────────── │  /api/central/v1/   │
│  Feedback inbox    │                         │  feedback*           │
└────────────────────┘                         └─────────────────────┘
```

| Concern | Home |
|---------|------|
| Ticket storage | Central-owned tables with `tenant_id` + submitting `user_id` |
| Tenant submit / view own | Tenant API + tenant shell dialog |
| Operator triage | Central API + Central nav (`feedback.*` permissions) |
| Website Founding Beta applications | Separate public intake (`/api/central/v1/public/beta-applications`) — applications, not in-app feedback tickets |

**Implemented:** in-app feedback APIs + Tenant Give Feedback dialog + Central Feedback inbox.  
**Implemented:** public beta application intake used by `elosync.com/beta/` + Central Beta Applications triage.

---

## Data ownership

- Feedback rows are **platform records** visible to authorized Central users.
- Each row references the originating **tenant** and **tenant user**.
- Tenants never receive cross-tenant lists.
- Central users operate outside `TenantScope` (same pattern as other Central APIs).

---

## Tenant isolation

Server-side rules (non-negotiable):

| Actor | Allowed | Forbidden |
|-------|---------|-----------|
| Tenant user | Create feedback for own tenant; list/show own submissions (or policy-scoped tenant submissions if explicitly designed); post **public** comments on own items | See other tenants; see internal notes; set internal priority / Central-only statuses beyond any allowed public fields; download another tenant's attachments |
| Central user with `feedback.*` | List/filter all; update status/priority; internal notes; public replies | N/A |

Isolation is enforced with policies + query scoping on tenant routes — **not** frontend filtering alone.

---

## Central visibility

Central detail view should include:

- Feedback identity (`FB-######` public number + UUID)
- Type, title, description, severity/impact (if collected)
- Status, priority
- Tenant / workspace context
- Submitter
- Module + route / page context
- Browser / device metadata when captured
- Attachments
- Activity timeline (status changes, public comments, internal notes)

---

## API flow

Routes live in `routes/tenant/v1.php` and `routes/central/v1.php`. Feedback is a **platform** concern (no `module:feedback` middleware).

### Tenant (auth: `tenant-api`)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/tenant/v1/feedback` | Create feedback (JSON, or multipart when an attachment is present) |
| `GET` | `/api/tenant/v1/feedback` | List own submissions |
| `GET` | `/api/tenant/v1/feedback/{feedback}` | Show (public fields + public comments only) |
| `POST` | `/api/tenant/v1/feedback/{feedback}/comments` | Public comment |
| `GET` | `/api/tenant/v1/feedback/attachments/{attachment}/download` | Download own attachment |

### Central (auth: `central-api`)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/central/v1/feedback` | List + filters + pagination |
| `GET` | `/api/central/v1/feedback/stats` | Lightweight triage summary |
| `GET` | `/api/central/v1/feedback/{feedback}` | Full detail including internal notes |
| `PATCH` | `/api/central/v1/feedback/{feedback}` | Status, priority, module linkage fields |
| `POST` | `/api/central/v1/feedback/{feedback}/comments` | Public reply or internal note (`is_internal` boolean) |
| `GET` | `/api/central/v1/feedback/attachments/{attachment}/download` | Authorized download |

### Beta applications

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/central/v1/public/beta-applications` | Public + throttle (marketing site) |
| `GET` | `/api/central/v1/beta-applications` | `beta-applications.list` |
| `GET` | `/api/central/v1/beta-applications/{beta_application}` | `beta-applications.read` |
| `PATCH` | `/api/central/v1/beta-applications/{beta_application}` | `beta-applications.update` |

Envelope: existing `ApiResponseService` `{ status, message, data, meta }`.

---

## Authentication

| Surface | Guard | Model |
|---------|-------|-------|
| Tenant feedback | `tenant-api` | `User` |
| Central feedback | `central-api` | `CentralUser` |
| Website beta applications | Public + throttle (no tenant session) | Stored as application rows for Central review |

No new auth system. Sanctum + existing SPA cookie/token flows only.

---

## Authorization

Central permissions in `config/central-permissions.php` (synced via migration / seeders):

- `feedback.list`, `feedback.read`, `feedback.update`, `feedback.comment`, `feedback.stats`
- `beta-applications.list`, `beta-applications.read`, `beta-applications.update`

Tenant: **any authenticated workspace user** may submit and list their own feedback. There is no Marketplace module entitlement and no `module:feedback` license.

Policies decide attachment download and comment visibility.

---

## Feedback types

| Type | Intent |
|------|--------|
| `bug` | Something is broken |
| `feature_request` | Missing capability |
| `ux` | Confusing / hard to use |
| `performance` | Slow / unreliable |
| `integration` | Connector / third-party issue |
| `other` | General product feedback |

---

## Status lifecycle

Recommended statuses:

```text
new → triaged → planned → in_progress → resolved → closed
```

Also support: `duplicate`, `wont_fix`, `not_reproducible`.

Only Central (authorized) transitions statuses. Tenant resources may expose a reduced public status label.

---

## Priority

Internal only: `low` | `medium` | `high` | `critical`.

Tenant submitters may optionally send **impact** language; they must not arbitrarily set operator priority unless a future product decision says otherwise.

---

## Attachments / screenshots

**Implemented** reuse:

- `App\Services\Storage\FileUploadService`
- Private disk path under the workspace prefix for feedback attachments
- Allowlisted MIME types + max size validation (`max:5120` KB)
- Authorized download routes (tenant: own item; Central: with permission; SPA uses authenticated blob download, not bare public URLs)

Do **not** invent a parallel storage stack.

---

## Comments

| Kind | Visibility | Who can create |
|------|------------|----------------|
| Public response | Tenant submitter + Central | Tenant (on own item) + Central |
| Internal note | Central only | Central |

API resources for tenant **must omit** internal notes even if a client crafts requests. Tests must prove this.

---

## Notifications

Reuse existing notification infrastructure — do not build a second bus.

| Event | Audience | Channel |
|-------|----------|---------|
| Critical bug reported | Operators via System Settings `support_email` | Mail (`CriticalFeedbackReported`) |
| Public reply / meaningful status change | Submitting tenant user | **Later** — reuse existing CRM-style database + mail / push patterns; not required for v1 triage |

---

## Audit logging

Use `PlatformAuditService` / `activity('platform')` for Central triage actions (status/priority changes, sensitive access if required). Tenant create events may also be audited consistently with other platform actions.

---

## Identifiers

Prefer human-readable **`FB-000001`** style numbers using Central sequential allocation (same idea as Central invoice numbers / document prefixes), plus UUID for stable public references if needed. Do not expose only auto-increment IDs if that conflicts with broader API norms for new resources.

---

## Retention & privacy

- Feedback may contain PII and screenshots of customer data — treat as sensitive tenant-linked content.
- Retention policy should follow broader platform data retention once defined; until then, do not build open public indexes of feedback.
- Internal notes must never appear in tenant payloads, exports meant for tenants, or marketing surfaces.

---

## Security checklist (tests required)

Pest + SPA unit/e2e coverage ships with the feature and includes:

1. Tenant A cannot read Tenant B feedback or attachments
2. Tenant cannot read internal notes
3. Unauthorized Central user cannot list/manage feedback
4. Validation rejects invalid types / oversized files
5. Only Central can change status/priority
6. Public comments visible; internal notes hidden on tenant show
7. Critical bugs mail `support_email` (cache cleared after system-settings seed)
8. Frontend: dialog schema + Playwright shell wiring (`test:e2e:feedback`) against a stubbed tenant API

---

## Future integrations (do not pre-build)

Nullable linkage fields only until a real system exists:

- Roadmap item / release id
- External issue tracker id
- Internal development task reference

Do **not** create a duplicate task management product inside feedback.

---

## Analytics / product learning (later)

Design aggregates later from stored type/module/tenant/status fields:

- Modules with most bugs vs feature requests
- Most active feedback tenants
- Recurring UX themes
- Multi-tenant critical bugs

Do not ship a full analytics suite in v1.

---

## Website beta applications vs in-app feedback

| Channel | Purpose |
|---------|---------|
| Marketing `/beta/` form | Qualify founding beta applicants **before** workspace use |
| Tenant Give Feedback | Continuous product learning **after** access |

Keep models/APIs separate so applicant PII and product tickets do not overload one ambiguous table without clear type discrimination.

---

## Documentation sync rule

Keep this page synchronized when behavior changes:

1. Exact routes, permissions, and UI entry points below stay accurate.
2. Update [Founding Beta](/product/founding-beta) status table when intake / access model changes.
3. Keep [Give Feedback](/user-guide/feedback) aligned with shell + Central UX.
4. Add dedicated API reference pages under Central / Tenant v1 docs when those catalogs grow a Feedback section.
5. Add a changelog delivery note the same day as user- or operator-visible changes.
