# Platform note @mentions — production readiness

**Date:** 2026-10-27  
**Scope:** Staff note `@` mentions on full pages + list peeks across note-capable modules (1A + 2A).

## Verdict

**Go** — after migrate-only deploy of Backend through `2026_10_27_180000_bump_modules_for_platform_note_mentions`, Frontend SPA, and Docs. No entitlement changes; catalog MINOR labels only.

## What shipped

| Layer | Change |
|-------|--------|
| Backend | Polymorphic `note_mentions`; `MentionableNoteRegistry`; `RecordNoteMentionedNotification`; `NoteMentionService::syncFromRegistry` wired on 19 `*NoteAdded` subscribers; email prefs default **off** |
| Frontend | `useMentionUsers`; `RecordSheetNotesPanel` + view pages use `MentionComposer`; Invoice/Quotation/Estimate peeks editable notes; notification registries + Settings toggles |
| Docs | Changelog, Settings user guide, module-development mentions pattern |

Legacy Lead / Task / Help Desk mention tables unchanged.

## Audit checklist

| ID | Check | Result |
|----|-------|--------|
| A1 | Tenant isolation on mention resolve (`User` query in tenant DB) | Pass |
| A2 | Self-mention skipped; idempotent notify | Pass (Pest) |
| A3 | Email prefs default false | Pass (Pest + Settings UI) |
| A4 | Drawer + full page share same composer | Pass (FE wiring + headed e2e) |
| A5 | Billing peeks allow note + mention without opening full page | Pass (Invoice/Quote/Estimate sheets) |
| A6 | Catalog companion versions match bumps | Pass (`PlatformNoteMentionsModuleVersionBumpTest`) |
| A7 | No LiveChat/unrelated churn in delivery | Pass (reverted accidental Pint noise) |
| A8 | Contenteditable sheet notes in Playwright | Pass (helpers use `pressSequentially`) |
| A9 | Headed e2e `platform-note-mentions.headed.spec.ts` (one session: company drawer + full page + task drawer) | Pass **4/4** |
| A10 | Headed e2e `tabbed-record-drawers.headed.spec.ts` notes after MentionComposer | Pass **5/5** |

## Go-live

1. Deploy Backend; migrate-only through `2026_10_27_180000_bump_modules_for_platform_note_mentions` (includes `create_note_mentions_table`).
2. Deploy Frontend SPA.
3. Deploy Docs.
4. Smoke: company list peek Notes → `@` teammate → Add note → notification bell.

## Out of scope

Portal customer replies, LiveChat visitor notes, Mobile, document HTML “notes” fields on invoice forms.
