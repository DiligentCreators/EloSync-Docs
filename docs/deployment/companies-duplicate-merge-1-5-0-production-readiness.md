# Companies duplicate matching and merge (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-16 |
| **Status** | **Go for production** — feature Pest green; headed companies Playwright 8/8 on one demo login |
| **Scope** | Normalized company identity, import match before create, contact-import and lead-convert reuse, merge of duplicates under `companies.delete` |
| **Branch** | `feature/company-duplicate-merge` (Backend, Frontend, Docs) |
| **Catalog** | **companies 1.4.0 → 1.5.0** |
| **Companion** | [Companies user guide](/user-guide/companies) · [Companies developer guide](/developer-guide/companies) · [Companies API](/api/tenant-v1-companies) · [CHANGELOG](/changelog/) |

---

## Executive summary

Company CSV/XLSX import, contact import, and lead conversion were creating a second company when the name differed only by case, punctuation, or a trailing suffix such as Inc. Companies **1.5.0** stores a non-unique `normalized_name`, matches that key and a company website/email domain before insert, and lets a user with **delete** merge the extras onto one primary inside a transaction.

**Go / No-Go:** **Go.** No new permissions, no shell/auth/settings redesign, no unique index. Operators merge existing duplicates first; the index stays non-unique on purpose.

| Gate | Result |
|------|--------|
| Platform freeze (no shell/auth/billing redesign) | **Pass** |
| Identity key: lowercase, trim, collapse spaces, strip punctuation and trailing Inc/LLC/Ltd/Pvt/Co/Corp | **Pass** (Pest) |
| Indexed `(tenant_id, normalized_name)` with backfill; **not** unique | **Pass** |
| Import matches name, then website/email domain, before create; preview shows matched vs new | **Pass** (Pest + headed Playwright) |
| Consumer email domains (gmail, outlook, and the rest of the free-mail list) do not collapse unrelated companies | **Pass** (code review) |
| Contact import and lead convert reuse the same key | **Pass** (Pest) |
| Merge is one DB transaction, fills only empty fields, moves related records, writes “Merged from …”, soft-deletes duplicates | **Pass** (Pest + headed Playwright) |
| Merge routes require `companies.delete`; other tenants’ ids are rejected | **Pass** (Pest) |
| Rollback leaves both companies when a later step fails | **Pass** (Pest) |
| Catalog migrate-only bump + CatalogSeeder companion | **Pass** (Pest) |
| Create form rejects an empty name and an invalid email before the API call | **Pass** (headed Playwright) |
| Merge confirmation lists what moves and which empty fields will be filled | **Pass** (headed Playwright) |
| Feature Pest | **Pass** — 35 tests / 210 assertions (duplicate, company import, contact import, company CRUD, catalog bump) plus 6 lead company assertions |
| Companies Playwright, headed, one worker | **Pass** — 8/8 (`test:e2e:companies:headed`) |

---

## Security summary

| Control | Status |
|---------|--------|
| `POST /companies/{id}/merge-preview` and `POST /companies/{id}/merge` use `can:companies.delete` | Pass |
| Form request authorizes `companies.delete` and requires a distinct integer `duplicate_ids` list | Pass |
| Missing or other-tenant ids return 422 (“could not be found in this workspace”) because of the tenant global scope | Pass |
| Staff without `companies.delete` receive 403 | Pass |
| Soft-delete of duplicates does not write a second activity row onto the archived company | Pass |
| Import identity match still goes through `CompanyService::create()` / `update()` | Pass |
| `normalized_name` is not mass-assignable, so activity logs do not treat it as a user field | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | Medium | Company create accepted an invalid email in the browser and only failed after the API returned 422 | **Fixed** — form uses the same “Enter a valid email” rule as Leads. Headed test submits `not-an-email` and stays on the form |
| **F2** | Low | Merge confirmation listed empty fields as raw keys (`phone`) | **Fixed** — dialog shows Email, Phone, Website, Industry, Address, Source |
| **I1** | Info | No unique index on `normalized_name` | **Accepted** — existing duplicates must be merged before a unique index is safe |
| **I2** | Info | Two different names that share a company email or website domain match as one company | **Accepted** — that is the identity rule. Free-mail domains are excluded |
| **I3** | Info | Full `php artisan test --compact` was not re-run for this audit | **Accepted for this change** — the companies, contact-import, lead-convert, and catalog suites that this change touches passed |

---

## Headed browser coverage

One demo login for `e2e/tests/companies/companies.duplicate-merge.headed.spec.ts`, then the rest of `e2e/tests/companies` on the same Playwright project (`--headed --workers=1`):

1. Sign in once and open Companies
2. Submit an empty name (**Name is required**) and an invalid email (**Enter a valid email**)
3. Create `Acme {suffix} Inc` and `ACME, {suffix}, Inc.`, add a note on the duplicate, see **Possible duplicate**
4. Open the merge dialog, confirm it lists the note and the phone fill, cancel, then merge
5. Primary shows the moved note, the filled phone, and “Merged from …”; the duplicate is gone from the active directory
6. Import preview shows **Matched existing company** and **New company**, then the import completes and the new company is in the directory
7. Existing follow-ups, import history, and notes workflow specs

Result on 2026-10-16: **8 passed**.

---

## Change inventory

### Backend

- `CompanyName`, `CompanyIdentityMatcher`, `CompanyMergeService`
- `companies.normalized_name` (nullable, indexed with `tenant_id`, backfilled)
- Catalog migration **companies 1.4.0 → 1.5.0**
- Import preview counts `matched_existing_companies` and `new_companies`
- Routes `merge-preview` and `merge`
- Pest: `CompanyDuplicateTest`, `CompaniesModuleVersion150BumpTest`

### Frontend

- Directory **Possible duplicate** badge
- Company page hint and **Merge duplicates** confirmation
- Import preview chips **New company** / **Matched existing company**
- Create-form email format check
- Playwright: `e2e/tests/companies/companies.duplicate-merge.headed.spec.ts`, `npm run test:e2e:companies:headed`

### Docs

- User, developer, and API guides
- This audit

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_10_15_232609_add_normalized_name_to_companies_table` | Adds nullable `normalized_name`, index `(tenant_id, normalized_name)`, backfills existing rows |
| `2026_10_15_232611_bump_companies_module_version_for_duplicate_merge` | companies **1.4.0 → 1.5.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade. `CatalogSeeder` already records companies **1.5.0** for fresh installs.

The bump does not install Companies into workspaces that do not already have it.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force`
2. Confirm `modules.version` for `companies` is **1.5.0**
3. Deploy **Frontend** after a production build; hard-refresh the SPA
4. Deploy **Docs**
5. Staging smoke (below)

No new env vars. No new queues. Company import still uses the `imports` queue.

Do **not** add a unique index in this release.

---

## Staging smoke

- [ ] Create “Acme Inc” and “ACME, Inc.” — the second page shows a possible duplicate
- [ ] Submit a company with email `not-an-email` — the form shows **Enter a valid email** and does not create a row
- [ ] Import a CSV whose name is “Acme Inc” when “Acme Inc” already exists — preview says matched existing, and skip mode does not create a second row
- [ ] Merge the duplicate — contacts/notes stay on the primary, empty fields fill, the duplicate disappears from Active only
- [ ] A user without `companies.delete` does not see **Merge duplicates**

---

## Rollback

- Code rollback is safe. `normalized_name` can remain; older code ignores it.
- Migration `down` drops the column and sets the catalog back to **1.4.0**. Do not roll back after operators have merged companies if you still need the archived duplicates’ history on the primary — the moved foreign keys are already on the primary and are not reversed by the migration.
