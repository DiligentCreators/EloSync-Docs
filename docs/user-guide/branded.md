# Branded — User Guide

The **Branded** marketplace module lets a workspace map a **custom domain** and use its brand name / logo in emails and web push notifications.

## Pricing

Billable platform add-on (catalog slug `branded`):

| Cycle | Price (USD) |
|-------|-------------|
| Monthly | **$29** |
| Yearly | **$290** |

Not default-included — purchase from Marketplace (`is_billable = true`). See [Entitlements](/developer-guide/entitlements) for the full catalog table.

## Who can use it

1. Purchase or install **Branded** from Marketplace (`module:branded`).
2. You need permission **View branded** / **Manage branded** (`branded.view` / `branded.manage`). Workspace admins get both by default.

Without the module, the Settings **Domain** tab is hidden and custom hostnames never bind to the workspace — even if someone points DNS or an IP at the server.

## Map a custom domain

1. Open **Settings → Domain**.
2. **Step 1 — Enter your website address** (for example `myai.com.pk` or `app.domain.co.uk`; multi-part ccTLDs are supported) and choose **Continue**.
3. **Step 2 — Connect it at your domain provider** (GoDaddy, Namecheap, Cloudflare, etc.):
   - **TXT** — prove you own the address (`_elosync-verification.{hostname}`).
   - **A** — point `{hostname}` to the platform IP shown in Settings.
   - **CNAME** — point `www.{hostname}` to `{hostname}` so the `www` version works too.
   - Advanced: optional AAAA or platform CNAME target when your operator provides them.
4. **Step 3 — Check the connection**: choose **I’ve added the records — Check now**.

DNS can take a few minutes (sometimes up to 24 hours). After the check succeeds, Settings shows **DNS verified** and **Pending SSL certificate** while the platform operator enables secure hosting (TLS certificate) on the server. Your custom `https://` address becomes fully **Active** only after that step — often within 24 hours. Continue using your platform address (for example `app.elosync.com`) until the custom URL works in your browser.

Pointing an IP alone does not activate the workspace. **Active** in the UI means DNS + SSL are both complete.

Platform subdomains (for example `acme.localhost`) stay managed by Central — they are not configured on this tab.

## Hosting status

| UI badge | Meaning |
|----------|---------|
| Waiting for DNS | TXT / A records not verified yet |
| DNS verified + Pending SSL certificate | Records are correct; secure hosting is being set up |
| Connected + Active | Custom `https://` address is ready |

## Brand in notifications

While Branded is active:

- Tenant emails use your application / company name, logo, and button color in the mail chrome.
- Web push notifications use your logo / favicon and prefix titles with your application name.

Without Branded, tenant emails use the **platform (EloSync) logo and app name** from Central branding — not a blank text-only header. Visual SPA branding (Settings → Branding) remains available to all workspaces; custom domains and web-push white-label require Branded.

## Remove or cancel

- **Remove** on the Domain tab deletes the custom hostname mapping.
- Cancelling the Branded subscription clears verification so the custom host stops resolving.
