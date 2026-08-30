# Installation & Local Configuration

End-to-end plan to install and configure **EloSync** on a developer machine: backend API, React SPA, VitePress docs, Laravel Reverb, email, queues, and related services.

| Audience | Go here |
|----------|---------|
| **Local development** | This page |
| **Production on Laravel Forge** | [Laravel Forge Deployment](/deployment/laravel-forge) |
| **Go-live checklist** | [Production Runbook](/deployment/platform-production-runbook) |
| **Realtime / Redis / Web Push** | [Notification System](/deployment/notifications) |

## Repositories

Clone the sibling repos next to each other (recommended layout):

```text
EloSync/
├── EloSync-Backend/    # Laravel 13 API (Herd: elosync-backend.test)
├── EloSync-Frontend/   # React 19 + Vite SPA (localhost:5173)
├── EloSync-Docs/       # VitePress docs (docs:dev)
├── EloSync-Website/    # Marketing site (localhost:3000)
└── EloSync-Mobile/     # Expo mobile app
```

| Repo | Role | Default local URL |
|------|------|-------------------|
| [EloSync-Backend](https://github.com/DiligentCreators/EloSync-Backend) | Central + Tenant APIs, queues, Reverb, scheduler | `http://elosync-backend.test` |
| [EloSync-Frontend](https://github.com/DiligentCreators/EloSync-Frontend) | Central admin + tenant workspace SPA | `http://localhost:5173` |
| [EloSync-Docs](https://github.com/DiligentCreators/EloSync-Docs) | Product / developer / ops documentation | `http://localhost:5173` (separate process) |
| [EloSync-Website](https://github.com/DiligentCreators/EloSync-Website) | Marketing / Join Beta site | `http://localhost:3000` |
| [EloSync-Mobile](https://github.com/DiligentCreators/EloSync-Mobile) | Expo tenant mobile client | Metro / device |


## Prerequisites

| Tool | Version / notes |
|------|-----------------|
| PHP | **8.3+** (project targets 8.4 via Herd) |
| Composer | 2.x |
| MySQL | 8+ (or MariaDB / PostgreSQL / SQLite for experiments) |
| Node.js | **20+** LTS |
| npm | 10+ |
| Laravel Herd | Recommended on Windows/macOS — serves `elosync-backend.test` with PHP-FPM |
| Redis | Optional locally; **required** in production for cache/queue/Reverb scale |

Optional: Stripe CLI (billing webhooks), Mailpit/Mailhog (SMTP catcher), ngrok (provider webhooks).

---

## 1. Backend (EloSync-Backend)

### 1.1 Install dependencies and bootstrap

```bash
cd EloSync-Backend
composer install
cp .env.example .env
php artisan key:generate
```

Or use the Composer setup script (install + `.env` + key + migrate):

```bash
composer run setup
```

Link public storage for local uploads:

```bash
php artisan storage:link
```

### 1.2 Point Herd at the app

With [Laravel Herd](https://herd.laravel.com/) installed, park or link the project so it resolves as `http://elosync-backend.test` (folder name `EloSync-Backend` → Herd site `elosync-backend`). Confirm:

```bash
herd sites
```

Do **not** rely on `php artisan serve` for day-to-day work unless Herd is unavailable.

### 1.3 Core `.env` (local)

Backend `.env.example` is **production-shaped** (`api.example.com` / `app.example.com` / `reverb.example.com`, Redis + Reverb). After `cp .env.example .env`, override for local:

```env
APP_NAME="EloSync"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://elosync-backend.test
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saas_backend
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=false
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=public
BROADCAST_CONNECTION=reverb

REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
REVERB_ALLOWED_ORIGINS=http://localhost:5173

PLATFORM_DOMAIN_SUFFIXES=localhost
```

| Variable | Purpose |
|----------|---------|
| `APP_URL` | API public URL (Herd site) |
| `FRONTEND_URL` | SPA origin for password-reset / invite links and CORS |
| `CORS_ALLOWED_ORIGINS` | Extra SPA origins (e.g. `http://127.0.0.1:5173` for Windows E2E) |
| `PLATFORM_DOMAIN_SUFFIXES` | Platform subdomain suffixes (local: `localhost`) |

Local cache/queue on `database` is fine. Production requires Redis with Reverb — [Laravel Forge](/deployment/laravel-forge) · [Production Runbook](/deployment/platform-production-runbook).

### 1.4 Migrate and seed (local / greenfield only)

```bash
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\Central\\CentralDatabaseSeeder
```

Fresh wipe (destroys data):

```bash
php artisan migrate:fresh --seed
```

**Never** run `db:seed` / catalog seeders on production. Modules and permissions ship via migrate-only data migrations ([Upgrade Guide](/deployment/upgrade)).

### 1.5 Default central login

After seeding:

| Field | Value |
|-------|-------|
| Central URL | `http://localhost:5173/central/login` (SPA) |
| Email | `superadmin@saas.com` |
| Password | `password` |

Also seeded: `tester@saas.com`, `developer@saas.com`, `admin@saas.com` (same password).

On local Vite (`npm run dev`), `/central/login` prefills these credentials.

### 1.6 Demo workspace (local seed)

When `APP_ENV=local`, `php artisan migrate:fresh --seed` also runs `local:seed-demo` and creates the shared demo tenant:

| Field | Value |
|-------|-------|
| Tenant URL | `http://localhost:5173/login` |
| Domain | `demo-crm.localhost` |
| Email | `demo@demo.com` |
| Password | `password` |

`/login` prefills these credentials in local Vite. Re-seed or enlarge data anytime with `php artisan local:seed-demo` — see [Local Demo Data](./local-demo-data). Aborts when `APP_ENV=production`.

---

## 2. Frontend (EloSync-Frontend)

### 2.1 Install and env

```bash
cd EloSync-Frontend
npm install
cp .env.example .env
```

Local Vite `.env`:

```env
VITE_APP_NAME=EloSync
VITE_API_URL=http://elosync-backend.test
VITE_API_MODE=central
# VITE_CENTRAL_PATH_PREFIX=dc-s87s
VITE_REVERB_APP_KEY=elosync-reverb-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
# Optional marketing pixels — see /deployment/marketing-pixels
# VITE_GTM_ID=GTM-XXXXXXX
# VITE_META_PIXEL_ID=123456789012345
# VITE_LINKEDIN_PARTNER_ID=1234567
# VITE_X_PIXEL_ID=o1234
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL (no trailing `/api`) |
| `VITE_API_MODE` | `central` or `tenant` default context |
| `VITE_CENTRAL_PATH_PREFIX` | Optional Central SPA HashRouter prefix (default `central`; match API `CENTRAL_PATH_PREFIX`) |
| `VITE_REVERB_*` | Must match backend `REVERB_*` / public Echo settings |
| `VITE_GTM_ID` | Optional Google Tag Manager container ID |
| `VITE_META_PIXEL_ID` | Optional Meta Pixel ID |
| `VITE_LINKEDIN_PARTNER_ID` | Optional LinkedIn Insight Tag partner ID |
| `VITE_X_PIXEL_ID` | Optional X Pixel ID |

Production does **not** bake these into CI artifacts. Forge generates `/config.js` → `window.env` from the site `.env` at deploy time ([frontend build artifacts](/developer-guide/frontend-build-artifacts)).

### 2.2 Run the SPA

```bash
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

- Central admin: `/central/login`
- Tenant workspace: `/login` (Workspace slug or domain)

### 2.3 Playwright (optional)

```bash
cp .env.e2e.example .env.e2e
# Align E2E_API_URL / E2E_ADMIN_* / E2E_DEMO_* with your backend seed
npm run test:e2e
```

Tenant Playwright suites sign in to the shared demo workspace (`demo@demo.com` / `demo-crm.localhost`) created by local `migrate:fresh --seed`. Registration-only specs still create disposable workspaces.

---

## 3. Docs (EloSync-Docs)

```bash
cd EloSync-Docs
npm ci
npm run docs:dev
```

Open the printed URL. Production docs deploy from the `build-artifacts` branch (CI builds VitePress; Forge only activates the release) — [Laravel Forge Deployment](/deployment/laravel-forge#3-docs-site-elosync-docs).

Local production build check:

```bash
npm run docs:build
npm run docs:preview
```

---

## 4. Reverb (realtime)

Realtime notifications use Laravel Reverb → Echo in the SPA. Align keys on **both** repos.

### 4.1 Backend `.env`

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=elosync
REVERB_APP_KEY=elosync-reverb-key
REVERB_APP_SECRET=elosync-reverb-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
REVERB_ALLOWED_ORIGINS=http://localhost:5173
REVERB_APP_ACCEPT_CLIENT_EVENTS_FROM=none
```

Echo private-channel auth uses `POST /broadcasting/auth` (already in CORS paths).

### 4.2 Frontend `.env`

```env
VITE_REVERB_APP_KEY=elosync-reverb-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Omit `VITE_REVERB_*` only if you intentionally disable Echo.

### 4.3 Start Reverb

In a dedicated terminal:

```bash
cd EloSync-Backend
php artisan reverb:start
```

Production: supervised process behind TLS, SPA origin pinned — [Notification System runbook](/deployment/notifications).

---

## 5. Email

### 5.1 Local default (log driver)

Keep `MAIL_MAILER=log` locally (also the template default until Settings → Mail is configured):

```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

Messages are written to `storage/logs/laravel.log` — enough for password-reset link debugging without an SMTP server.

### 5.2 Local SMTP catcher (optional)

Point Laravel at Mailpit / Mailhog / similar:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_SCHEME=null
```

Keep `FRONTEND_URL=http://localhost:5173` so reset/invite links open the SPA.

### 5.3 Central / Tenant Settings (preferred for real providers)

Runtime mail is driven by Central and Tenant settings (SMTP, Postmark, Mailgun), not only `.env`:

1. Sign in as central superadmin → **Settings → Mail**
2. Choose provider, save credentials, **Send test**
3. Tenant workspaces inherit Central (`mail_mode=system`) or use custom credentials

Env fallbacks when DB secrets are empty: `POSTMARK_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_SECRET`, etc.

Details: [Multi-Provider Email](/developer-guide/multi-provider-email), [Email Webhooks](/developer-guide/email-webhooks), [Authentication ops](/deployment/authentication).

### 5.4 Email queue

Outbound mail / mail notifications use the `emails` queue. Always process it:

```bash
php artisan queue:work --queue=emails,default --sleep=1 --tries=3
```

Restart workers after changing mail credentials (`php artisan queue:restart`).

---

## 6. Queues, scheduler, and Web Push

### 6.1 Queue worker (required for mail + notifications)

```bash
cd EloSync-Backend
php artisan queue:work --queue=emails,default
```

Local `QUEUE_CONNECTION=database` is fine. Production should use Redis.

### 6.2 Scheduler (local)

Laravel schedule (pruning, CRM due digests, subscription expiry, etc.) needs a one-minute tick:

```bash
php artisan schedule:work
```

Or a cron entry pointing at `php artisan schedule:run`.

### 6.3 FCM desktop push (optional locally)

Closed-browser push uses Firebase Cloud Messaging only. Without credentials, database + Reverb delivery still work; FCM is skipped gracefully.

```env
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
# Or: FCM_CREDENTIALS=/absolute/path/to/service-account.json
FCM_ICON=/brand/elosync-app-icon-light.png
FCM_BADGE=/brand/elosync-app-icon-light.png
```

SPA (`.env` / Forge `config.js`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

`VITE_FIREBASE_VAPID_KEY` is the Firebase Console Web Push certificates key. See [Notification System](/deployment/notifications) for the full ops checklist.

---

## 7. Optional integrations

Configure only what you are actively developing.

| Integration | Local setup |
|-------------|-------------|
| **Stripe / Cashier** | Set `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`; forward webhooks with Stripe CLI to `/webhooks/stripe` (or Cashier path). See [Stripe / Cashier](/developer-guide/stripe-cashier). |
| **Creem** | Prefer Central Payment Gateways UI; env `CREEM_*` as fallback. |
| **Object storage** | Local: `FILESYSTEM_DISK=public`. Production: S3-compatible `AWS_*` — [Object Storage](/developer-guide/object-storage). |
| **Branded domains** | Set `BRANDED_SERVER_IPV4` (and optional CNAME) before verifying custom hosts. |
| **Meta Lead Ads** | Central integrations / `META_LEAD_ADS_*` — [Meta App Setup](/developer-guide/meta-app-setup) (operator) · [Meta Lead Ads](/developer-guide/meta-lead-ads-integration) (architecture). |
| **Automation webhooks** | Optional `AUTOMATION_WEBHOOK_SECRET` for default outbound HMAC when a workflow webhook action omits its own secret. |
| **Nightwatch / Telescope / Sentry** | Disabled by default in `.env.example`; enable intentionally. |
| **Laravel Pulse** | Enabled by default. Dashboard at `/pulse` on the **central domain**. Access: central roles **superadmin**, **developer**, **tester** — open from Central SPA **Settings → Pulse** (full-page redirect via signed session bridge). Not gated by Spatie permissions. |
| **Laravel Horizon** | Enabled when installed. Dashboard at `/horizon` on the **central domain**. Same role-only access as Pulse — open from Central SPA **Settings → Horizon**. Production queue workers run through Horizon (`php artisan horizon`); see [Laravel Forge](/deployment/laravel-forge). |

### Monitoring {#monitoring}

- **Pulse** — In-app performance dashboard (slow requests, queries, jobs, server metrics). Operators with the roles above open **Settings → Pulse** in the Central SPA; Pulse opens in a **new tab** on the backend domain while Central stays on the dashboard. Use **Back to Central** in the Pulse header to return to the SPA. Run `php artisan pulse:check` as a persistent process so the **Servers** card receives metrics (add to Supervisor in production).
- **Horizon** — Redis queue dashboard (throughput, wait times, failed jobs, worker status). Same roles open **Settings → Horizon** in a new tab. Locally run `php artisan horizon` instead of `queue:work` when Horizon is installed. Production: one Forge daemon (`php artisan horizon`); remove separate `queue:work` processes after cutover.
- **Nightwatch / Telescope** — Optional; enable per environment policy.

---

## 8. Recommended terminal layout

Run these processes while developing (Herd serves PHP; you still need workers and SPA):

| Terminal | Command | Repo |
|----------|---------|------|
| 1 | (Herd — no command) | Backend site live |
| 2 | `php artisan reverb:start` | EloSync-Backend |
| 3 | `php artisan horizon` (or `queue:work --queue=automations,emails,default` without Horizon) | EloSync-Backend |
| 4 | `php artisan schedule:work` | EloSync-Backend (optional) |
| 5 | `php artisan pulse:check` | EloSync-Backend (optional; Servers card) |
| 6 | `npm run dev` | EloSync-Frontend |
| 7 | `npm run docs:dev` | EloSync-Docs (when editing docs) |

---

## 9. Verify the install

- [ ] `GET http://elosync-backend.test/up` returns 200
- [ ] Central login works with `superadmin@saas.com` / `password`
- [ ] Tenant login works with `demo@demo.com` / `password` (local demo workspace)
- [ ] SPA calls API (`VITE_API_URL` matches Herd host; no CORS errors)
- [ ] Password-reset mail appears in log / Mailpit when requested
- [ ] Queue worker processes a test mail / notification job
- [ ] Reverb is running; SPA has matching `VITE_REVERB_*` (notification bell updates live when Echo is enabled)
- [ ] `php artisan local:seed-demo` (optional) creates demo workspace `demo-crm.localhost`
- [ ] Docs site builds: `npm run docs:build` in EloSync-Docs
- [ ] **Settings → Pulse** opens Laravel Pulse in a new tab (superadmin / developer / tester); live cards update without 500 errors

---

## 10. Production (Laravel Forge)

Do **not** treat local Herd + `npm run dev` as a production recipe. On Forge you run **three sites**:

| Site | Branch | What Forge runs |
|------|--------|-----------------|
| API (`EloSync-Backend`) | `main` | Composer, `migrate --force`, `optimize`, queue/Reverb restart |
| SPA (`EloSync-Frontend`) | `build-artifacts` | Activate release + generate `/config.js` from site `.env` |
| Docs (`EloSync-Docs`) | `build-artifacts` | Activate release only (no Node) |

Required in production (not optional like local): Redis cache/queue, supervised queue + Reverb, TLS, real mail (Central Settings), Stripe webhook secrets for active gateways, migrate-only upgrades (never `db:seed`).

**Canonical guide:** [Laravel Forge Deployment](/deployment/laravel-forge) — site settings, `.env`, deploy scripts, daemons, scheduler, email, and go-live checklist.

Also: [Production Runbook](/deployment/platform-production-runbook) · [Upgrade Guide](/deployment/upgrade)

## Related docs

| Topic | Link |
|-------|------|
| Laravel Forge (production) | [Laravel Forge Deployment](/deployment/laravel-forge) |
| Local demo CRM data | [Local Demo Data](./local-demo-data) |
| Platform freeze | [Platform Freeze](./platform-freeze) |
| Multi-provider email | [Developer Guide](/developer-guide/multi-provider-email) |
| Notifications / Reverb / Web Push | [Deployment](/deployment/notifications) |
| Auth / mail ops | [Authentication](/deployment/authentication) |
| Frontend CI artifacts | [Frontend Build Artifacts](/developer-guide/frontend-build-artifacts) |
| Documentation governance | [Same-PR rule](/developer-guide/documentation-governance) |
