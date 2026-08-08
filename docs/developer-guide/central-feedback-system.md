# Central Feedback System

Architecture for EloSync product feedback: **submitted from the Tenant Application**, **managed in the Central Application**.

> **Implementation status**
>
> This document describes the **target architecture** aligned with existing EloSync conventions (Sanctum dual-guard, Spatie RBAC, single-DB tenancy, Central React SPA, `FileUploadService`, `PlatformAuditService`). Sections marked **Implemented** reflect code that exists; sections marked **Planned** must be updated when the corresponding PR lands. Do not treat Planned APIs as live contracts until backend + SPA ship.

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

**Planned:** in-app feedback APIs and UIs.  
**Planned:** public beta application intake used by `elosync.com/beta/`.

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

## API flow (target)

Exact paths must follow existing `routes/tenant/v1.php` and `routes/central/v1.php` conventions when implemented.

### Tenant (auth: `tenant-api`)

| Method | Path (illustrative) | Purpose |
|--------|---------------------|---------|
| `POST` | `/api/tenant/v1/feedback` | Create feedback (+ multipart attachment) |
| `GET` | `/api/tenant/v1/feedback` | List own / allowed submissions |
| `GET` | `/api/tenant/v1/feedback/{feedback}` | Show (public fields + public comments only) |
| `POST` | `/api/tenant/v1/feedback/{feedback}/comments` | Public comment |

### Central (auth: `central-api`)

| Method | Path (illustrative) | Purpose |
|--------|---------------------|---------|
| `GET` | `/api/central/v1/feedback` | List + filters + pagination |
| `GET` | `/api/central/v1/feedback/{feedback}` | Full detail including internal notes |
| `PATCH` | `/api/central/v1/feedback/{feedback}` | Status, priority, module linkage fields |
| `POST` | `/api/central/v1/feedback/{feedback}/comments` | Public reply or internal note (`visibility`) |
| `GET` | `/api/central/v1/feedback/stats` | Lightweight triage summary (optional) |

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

**Planned** Central permissions (add to `config/central-permissions.php` + seeders), for example:

- `feedback.list`
- `feedback.read`
- `feedback.update`
- `feedback.comment`
- `feedback.stats` (if stats endpoint ships)

Tenant: typically **authenticated workspace users** may submit; listing own feedback should not require a Marketplace module entitlement. Do not invent a `module:feedback` license.

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

**Planned** reuse:

- `App\Services\Storage\FileUploadService`
- Private disk path prefix pattern similar to Team Chat attachments (`tenants/{uuid}/feedback/...`)
- Allowlisted MIME types + max size validation
- Authorized download routes (tenant: own item; central: with permission)

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

**Planned:**

| Event | Audience | Channel candidates |
|-------|----------|--------------------|
| New / critical feedback | Central operators | Mail (and later Central inbox if added) |
| Public reply / meaningful status change | Submitting tenant user | Database + mail / push patterns already used by CRM notifications where appropriate |

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

When implemented, Pest (and SPA/E2E where applicable) must cover:

1. Tenant A cannot read Tenant B feedback or attachments
2. Tenant cannot read internal notes
3. Unauthorized Central user cannot list/manage feedback
4. Validation rejects invalid types / oversized files
5. Only Central can change status/priority
6. Public comments visible; internal notes hidden on tenant show

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

When the feature ships:

1. Move Planned → Implemented with exact routes, permissions, and UI entry points.
2. Update [Founding Beta](/product/founding-beta) status table.
3. Add User Guide operator + tenant pages if the UX is user-visible.
4. Add API pages under Central / Tenant v1 docs.
5. Add a changelog delivery note the same day.

Until then, treat this page as **architecture + contract intent**, not a live API reference.
