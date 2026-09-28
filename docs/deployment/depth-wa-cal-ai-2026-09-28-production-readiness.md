# Depth program (WhatsApp interactive · Calendar shares · AI Contact triage) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 |
| **Re-verified** | 2026-09-28 (local Pest + Playwright e2e); Eng cutover steps closed same day |
| **Status** | **Go for production** — engineering ship-ready; **Ops deploy remaining** |
| **Scope** | Three catalog MINOR bumps in one depth tranche |
| **Code** | `feature/depth-wa-cal-ai-2026-09-28` — Backend [#216](https://github.com/DiligentCreators/EloSync-Backend/pull/216) · Frontend [#214](https://github.com/DiligentCreators/EloSync-Frontend/pull/214) · Docs [#296](https://github.com/DiligentCreators/EloSync-Docs/pull/296) (draft) |
| **Companions** | [WhatsApp interactive 1.4.0](./whatsapp-cloud-interactive-1-4-0-production-readiness) · [Calendar shares 1.3.0](./calendar-event-shares-1-3-0-production-readiness) · [AI Contact triage](./ai-contact-triage-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

| Module | Catalog | Verdict |
|--------|---------|---------|
| **WhatsApp Cloud** interactive send/ingest + inbox UI | **1.3.0 → 1.4.0** | **Go** (live Meta WABA handset smoke **post-deploy QA**) |
| **Calendar** manual event shares (viewer/editor) | **1.2.0 → 1.3.0** | **Go** |
| **AI** Contact triage tools (confirmed writes) | **1.17.0 → 1.18.0** | **Go** |

Engineering gates (code, migrate-only catalog, Pest, Playwright, Docs, Meta fake hard-fail in production) **Pass**. Depth work ships on **`feature/depth-wa-cal-ai-2026-09-28`** draft PRs (Backend [#216](https://github.com/DiligentCreators/EloSync-Backend/pull/216), Frontend [#214](https://github.com/DiligentCreators/EloSync-Frontend/pull/214), Docs [#296](https://github.com/DiligentCreators/EloSync-Docs/pull/296)). Production must keep **`META_HTTP_FAKE` unset** — boot **refuses** if it is truthy when `APP_ENV=production`.

**Go / No-Go:** **Go** after PR CI green + merge. Ops then migrate-only deploy and staging smoke.

---

## Gate matrix (re-verified 2026-09-28)

| Gate | WhatsApp 1.4.0 | Calendar 1.3.0 | AI Contact 1.18.0 |
|------|----------------|----------------|-------------------|
| Platform freeze | Pass | Pass | Pass |
| Migrate-only catalog + CatalogSeeder | Pass (`1.4.0`) | Pass (`1.3.0`) | Pass (`1.18.0`) |
| Local DB module.version | `1.4.0` | `1.3.0` | `1.18.0` |
| Pest (feature) | Pass — `WhatsAppInteractiveTest` **4/4** | Pass — `CalendarEventShareTest` **7/7** | Pass — write confirm + authz (prior + e2e Contact triage) |
| Playwright (tenant, workers=1) | Pass — **9/9** shared session | Pass — **4/4** (incl. share ACL) | Pass — **10/10** (incl. Contact triage) |
| Docs / changelog / sidebar | Pass | Pass | Pass |
| `META_HTTP_FAKE` production hard-fail | Pass — boot throws if enabled in production | n/a | n/a |
| Live Meta WABA smoke | **Post-deploy QA** | n/a | n/a |
| Feature branch + draft PR | **Done** | **Done** | **Done** |
| Merged to `origin/main` | **Todo** (await CI) | **Todo** (await CI) | **Todo** (await CI) |

### Playwright notes (fixes landed in this tranche)

- OAuth success now **invalidates** WhatsApp integration query (select-phone panel appeared after connect).
- Calendar event detail **hides** Edit/Cancel for `read_only` viewers (badge alone was insufficient).
- E2E HashRouter user-switch uses **reload** after token inject; Vite ignores `playwright-report` / `test-results` watch paths.
- Local e2e requires Meta platform credentials + `META_HTTP_FAKE=true` (never in production; production boot hard-fails if set).

---

## Remaining (operator)

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Create `feature/` branches; commit; open draft PRs | Eng | **Done** |
| 2 | CI green on all three PRs; merge | Eng | **Todo** |
| 3 | Deploy Backend; `php artisan migrate --force` (central **and** tenants) — **no** `db:seed` | Ops | **Todo** |
| 4 | Confirm production env: `META_HTTP_FAKE` **unset**; Meta WhatsApp app id/secret/webhook token set | Ops | **Todo** |
| 5 | Restart queues (`whatsapp-inbound`, `whatsapp-outbound`, default) | Ops | **Todo** |
| 6 | Deploy Frontend SPA (same window as Backend) | Ops | **Todo** |
| 7 | Staging smoke — WA interactive (when WABA available); Calendar share viewer/editor; Ask EloSync Contact confirm | Ops / QA | **Todo** |

### Migrations to apply (step 3)

1. `2026_09_27_213615_add_interactive_payload_to_whatsapp_messages_table`
2. `2026_09_27_214240_bump_whatsapp_cloud_module_version_to_1_4_0`
3. `2026_09_28_000000_create_calendar_event_shares_table`
4. `2026_09_28_000001_bump_calendar_module_version_to_1_3_0`
5. `2026_09_28_104900_bump_ai_module_version_to_1_18_0`

### Staging smoke detail (step 7)

| Area | Steps |
|------|--------|
| **WhatsApp interactive** | Open CS-window thread → send reply buttons → (phone) tap → inbound shows id/title; list path optional |
| **Calendar shares** | Organizer shares manual event as **viewer** → sharee sees **View only**, no Edit/Share manager; **editor** can mutate |
| **AI Contact triage** | Propose/confirm offboard + note + unassign on a contact (pending actions UI) |

---

## Rollback

| Module | Rollback |
|--------|----------|
| WhatsApp | Catalog `down` → **1.3.0**; drop `interactive_payload` after code rollback |
| Calendar | Catalog `down` → **1.2.0**; drop `calendar_event_shares` after code rollback |
| AI | Catalog `down` → **1.17.0** after code rollback (no schema beyond catalog) |

Text/media/template WhatsApp paths, meeting invitee ACL, and prior AI triage tools remain unchanged when rolling back only these bumps.

---

## Test evidence (reference)

```bash
# Backend
php artisan test --compact \
  tests/Feature/Tenant/WhatsApp/WhatsAppInteractiveTest.php \
  tests/Feature/Tenant/Calendar/CalendarEventShareTest.php \
  tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php \
  tests/Feature/Tenant/Ai/AiAuthorizationTest.php

# Frontend (Vite on E2E_BASE_URL, Meta fake enabled locally only)
npm run test:e2e:whatsapp-cloud -- --workers=1
npm run test:e2e:calendar -- --workers=1
npm run test:e2e:ai -- --workers=1
```

**Local re-verify (2026-09-28):** Playwright WA **9/9**, Calendar **4/4**, AI **10/10**; Pest WhatsAppInteractive **4/4**, CalendarEventShare **7/7**; catalog rows `whatsapp-cloud=1.4.0`, `calendar=1.3.0`, `ai=1.18.0`.
