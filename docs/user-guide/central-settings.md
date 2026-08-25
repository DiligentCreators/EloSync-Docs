# Central Application Settings — User Guide

Central admins configure platform identity and behavior under **Settings** (not Billing).

## Tabs

| Tab | What to set |
|-----|-------------|
| **General** | **Application Name** — browser title, sidebar, auth screens. **Company Name** — copyrights and email salutations only. Timezone / Locale / Currency (searchable). Registration and Founding Beta access settings. |
| **Localization** | Date format + 12/24-hour time. Tables and timelines across Central use these formats. |
| **Mail** | Provider (SMTP, Postmark, Mailgun, Log, …), provider credentials, From / Reply-To / timeout. For Postmark/Mailgun: copy the **Webhook URL**, set the signing secret, and select which delivery events to process. Use **Send test** (can use unsaved form values). Leave secrets blank to keep existing values. |
| **Branding** | Button color (primary buttons), support email (shown on maintenance/registration-closed and tenant emails), logo + favicon uploads with preview. Until you upload a logo/favicon, the SPA uses the EloSync press-kit App Store light icon (`/brand/elosync-app-icon-light.png`) for the shell, tab icon, and (via `FRONTEND_URL`) default web push / non-Branded email chrome. |
| **Security** | Session timeout (minutes), minimum password length, require special character. Applies to Central and Tenant password forms. |
| **Maintenance** | Tenant Application only. Central stays fully usable so you can turn maintenance off. Optional message + ETA. |
| **Billing** | Invoice prefix, proration mode, default gateway code, trial / Stripe flags. Gateway secrets are managed under **Billing → Payment Gateways**. |
| **AI** | Platform master switch, allow Platform / BYOK, provider (**OpenAI**, **Anthropic**, **Google Gemini**, **OpenRouter**, **Groq**, **Mistral**, **DeepSeek**, **xAI**, **OpenAI-compatible**, **Ollama**), API key, optional **API base URL** for self-hosted endpoints, and **Default / Fast / Advanced** models (curated dropdowns; OpenRouter and self-hosted providers accept custom model IDs). Credit knobs and **Test AI connection**. |

## Registration closed

When **Registration enabled** is off:

1. Ordinary `POST /public/register-workspace` requests return `403`; a valid accepted Founding Beta invite token can still register.
2. Visiting `/register` shows the dedicated **Registration closed** page (with logo/support/copyright when configured).

General settings control its call to action:

| Setting | Effect |
|---------|--------|
| **Founding Beta enabled** (`founding_beta_enabled`) | Shows the beta application CTA while registration is closed. |
| **Founding Beta apply URL** (`founding_beta_apply_url`) | Sets the CTA destination, normally `https://elosync.com/beta/`. |
| **Founding Beta invite lifetime** (`founding_beta_invite_ttl_days`) | Sets how many days each new or resent workspace invite remains valid (**1–90**). |

Turn off **Founding Beta enabled** to hide the CTA without opening public registration. Enabling ordinary registration is a separate launch decision.

## Tenant maintenance

When **Tenant maintenance mode** is on:

- Tenant API responses return `503` with `code: maintenance_mode`.
- Tenant SPA shows the branded maintenance page.
- Central admin API and UI continue to work.

## Tips

- Change Application Name if you want the product title to update immediately (after save + public bootstrap refresh).
- Use Company Name for legal/copyright wording without renaming the product in the chrome.
- After mail provider changes, always send a test email before relying on invites or password resets. Restart queue workers after credential changes so queued mail picks up the new config.
- For Postmark/Mailgun, paste the webhook URL into the provider dashboard and enable the same events selected in Settings. Open/Click also require open tracking and link tracking in the provider console — saving Central settings does not change Postmark/Mailgun checkboxes.
- Review delivery history under **Email logs** — status progresses through delivered → opened → clicked when those webhooks arrive; open a row for open/click counts, full message body, and **Resend** when you have `email-logs.resend`.
