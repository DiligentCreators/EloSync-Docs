# Document-field TipTap — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-03 |
| **Status** | **Go for production** after companion PR merge + migrate-first Backend + SPA/Mobile/Docs deploy + staging smoke |
| **Scope** | Shared TipTap `RichTextEditor` on document bodies only: announcements `body`, Help Desk ticket `description`, task/project `description`, activity `body`. Not notes, chat, addresses, SMS/WhatsApp templates, or automation JSON. |
| **Catalog** | announcements **1.1.0 → 1.2.0** · help-desk **1.10.0 → 1.11.0** · tasks **1.6.0 → 1.7.0** · projects **1.6.0 → 1.7.0** · activities **1.1.0 → 1.2.0** |
| **Companion** | [Announcements](./announcements) · [Help Desk](./help-desk) · [Tasks](./tasks) · [Projects](./projects) · [CHANGELOG](/changelog/) · [Upgrade](./upgrade) |

---

## Executive summary

Workspace document fields that people re-read (announcements, ticket descriptions, task/project descriptions, activity bodies) now use the existing Knowledge Base TipTap editor. HTML is stored as a string (Knowledge Base pattern — **not** billing `DocumentHtmlSanitizer`, which strips `style` and would drop text color). The SPA sanitizes with DOMPurify before `dangerouslySetInnerHTML`. Snippets, dashboard previews, notifications (`strip_tags`), and mobile `Text` use plain text.

Platform freeze is intact: no new shell, auth, or settings store. File a complaint stays a short textarea (plain text still round-trips into the HTML viewer).

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Editor reuse (`RichTextEditor`) — no new package | **Pass** |
| Display never unsanitized HTML | **Pass** (A1, A4) |
| TipTap text color survives display sanitize | **Pass** (A1) |
| Unsafe `javascript:` / `data:` link insert blocked | **Pass** (A2) |
| Empty `<p></p>` not treated as content | **Pass** (A3) |
| Catalog MINOR migrate-only (no `db:seed`) | **Pass** |
| Pest HTML store + catalog bump | **Pass** |
| Vitest sanitize helpers | **Pass** |
| Docs user / API / developer / CHANGELOG / nav | **Pass** |
| Mobile TipTap | **Out of scope** — strip tags on view/edit |
| File a complaint TipTap | **Out of scope** (short note) |

---

## Audit findings (initial → remediated)

| ID | Severity | Finding | Remediation |
|----|----------|---------|-------------|
| **A1** | High | `sanitizeKnowledgeBaseHtml` omitted `style`, so TipTap **text color** (inline `span style`) vanished on view even though it stored. | `ADD_ATTR: ['target', 'style']`. DOMPurify still strips scripts and `javascript:` hrefs. |
| **A2** | Medium | Link toolbar accepted any `href` (`javascript:`, `data:`). | `isSafeRichTextHref` — `http` / `https` / `mailto` / same-origin path. Display sanitize remains a second gate. |
| **A3** | Medium | `RichTextHtml` treated `<p></p>` as content; Help Desk gated on raw `ticket.description`. | Empty check uses `htmlToPlainText`. |
| **A4** | Medium | Inbox/view/dashboard could have shown raw tags before this ship. | `RichTextHtml` on full bodies; `htmlToPlainText` / `htmlSnippet` on previews. |
| **A5** | Medium | `AutomationEngineSupportTest` still expected payments **1.4.0** while CatalogSeeder is **1.5.0** — CI fail once this file is in the PR. | Companion map **1.5.0**. |
| **A6** | Low | Missing production-readiness page / VitePress / upgrade row. | This page + sidebar + upgrade + changelog link. |
| **I1** | Info | File a complaint description remains a textarea. | **Accepted** — short dialog; stored plain text renders via `RichTextHtml`. |
| **I2** | Info | Mobile create/edit stay `FormTextarea`; HTML from web is stripped for display. | **Accepted** (plan). |
| **I3** | Info | LIKE search can match HTML tags. | **Accepted** — same as Knowledge Base. |

No High or Medium **open** residuals for ship.

---

## Security summary

| Control | Status |
|---------|--------|
| No new auth / tenancy / billing | Pass |
| HTML render only after DOMPurify | Pass |
| Scripts / forms / iframes forbidden on document HTML | Pass |
| Link insert allow-list | Pass |
| Notifications already `strip_tags` on announcement body | Pass |
| Tenant isolation unchanged | Pass |

---

## Change inventory

### Backend

- Migration `2026_10_03_182400_bump_document_rich_text_module_versions` — five MINOR catalog bumps
- `CatalogSeeder` versions aligned
- Pest: announcement + Help Desk HTML store; catalog bump test; Automation companion versions

### Frontend

- `RichTextHtml` + `htmlToPlainText` / `htmlSnippet`
- Forms: announcements, Help Desk, tasks, projects, activities
- Display: view pages, announcement inbox, dashboard snippet, peeks
- Playwright `fillRichText` helper
- Vitest `src/lib/sanitize-html.test.ts`

### Mobile

- `lib/html.ts` `htmlToPlainText` on announcement/task/project/help-desk/activity view and edit load

### Docs

- User / API / developer guides; CHANGELOG; this audit; upgrade; VitePress

---

## Test evidence

```
herd php artisan test --compact tests/Feature/Central/Catalog/DocumentRichTextModuleVersionBumpTest.php
herd php artisan test --compact --filter=HTML tests/Feature/Tenant/Announcement/AnnouncementTest.php tests/Feature/Tenant/HelpDesk/HelpDeskTicketTest.php
npm run test:unit -- src/lib/sanitize-html.test.ts
```

`vendor/bin/pint --dirty --format agent` on Backend PHP changes.

Playwright: `test:e2e:announcements`, `test:e2e:help-desk`, `test:e2e:tasks`, `test:e2e:projects` (and activities if the suite fills body) after SPA deploy.

---

## Upgrade & staging smoke

1. Deploy **Backend** and run `php artisan migrate --force` (`2026_10_03_182400_bump_document_rich_text_module_versions`). **Do not** `db:seed`.
2. Confirm catalog: announcements **1.2.0**, help-desk **1.11.0**, tasks **1.7.0**, projects **1.7.0**, activities **1.2.0**.
3. Deploy **Frontend**, then **Mobile** (OTA) and **Docs**.
4. Staging:
   - Create a **published** announcement with heading, list, link, and red text → inbox dialog + record page render HTML (not tags); dashboard snippet is plain text; second user notification preview has no tags.
   - Edit a Help Desk ticket / task / project / activity description in TipTap → view page shows lists; peek snippet has no `<p>`.
   - Existing plain-text rows still load in the editor and display as text.
   - File a complaint still uses a textarea.
   - Mobile announcement/task view shows text without tags.

## Rollback

Revert SPA first (stops HTML authoring). Catalog bump is display-only SemVer — leaving it is harmless. Stored HTML remains valid strings; a reverted SPA would show tags until re-deployed.

## Sign-off

| Role | Result |
|------|--------|
| Engineering | **Go** after companion CI |
| Operator | Staging smoke above before production traffic |
