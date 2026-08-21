# Frontend production build artifacts

Production CI/CD for the **SaaS-Frontend** React + Vite SPA.

- Source of truth: **`main`** (source code only — never commit `dist/`)
- Deployment branch: **`build-artifacts`** (compiled assets only)
- Workflow: `SaaS-Frontend/.github/workflows/frontend-build.yml`
- Frontend-local mirror: `SaaS-Frontend/docs/ci-cd/frontend-build-artifacts.md`
- Forge site setup: [Laravel Forge Deployment](/deployment/laravel-forge#2-spa-site-saas-frontend)

## Purpose

After every merge into `main`, GitHub Actions builds production assets, validates them, uploads a GitHub Actions artifact, and updates the `build-artifacts` branch.

The same artifact is **multi-client ready**: each Laravel Forge site generates `/config.js` (`window.env`) from that site’s `.env` during deploy. No API URL or Reverb host is baked into CI.

## Triggers

- Push to `main` or manual `workflow_dispatch`
- Does **not** run for feature branches, tags, or unmerged PRs

## Build process

1. Checkout `main`
2. Node LTS + `npm ci`
3. Lint / typecheck / optional unit tests
4. `npx vite build` (without `VITE_API_URL`)
5. `build-info.json`
6. Validate (including `index.html` loads `/config.js`)
7. Secret scan
8. Upload artifact `frontend-build` (30 days)
9. Publish to `build-artifacts`

## Runtime configuration (Laravel Forge)

`index.html` loads `/config.js` before the React app. Forge deploy script:

```bash
$CREATE_RELEASE()
cd $FORGE_RELEASE_DIRECTORY

if [ -f ../../.env ]; then
  set -a
  source ../../.env
  set +a
fi

echo "window.env = {" > "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_API_URL: \"$VITE_API_URL\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_APP_NAME: \"${VITE_APP_NAME:-EloSync}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_API_MODE: \"${VITE_API_MODE:-central}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_CENTRAL_PATH_PREFIX: \"${VITE_CENTRAL_PATH_PREFIX:-central}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_REVERB_APP_KEY: \"$VITE_REVERB_APP_KEY\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_REVERB_HOST: \"$VITE_REVERB_HOST\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_REVERB_PORT: \"$VITE_REVERB_PORT\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_REVERB_SCHEME: \"$VITE_REVERB_SCHEME\"" >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "};" >> "$FORGE_RELEASE_DIRECTORY/config.js"

$ACTIVATE_RELEASE()
```

| Site `.env` key | Used as |
|-----------------|---------|
| `VITE_API_URL` | API origin (required in production; no trailing `/api`) |
| `VITE_APP_NAME` | Display name (optional; `VITE_CLIENT_NAME` also accepted) |
| `VITE_API_MODE` | `central` (default) or `tenant` |
| `VITE_CENTRAL_PATH_PREFIX` | HashRouter Central SPA prefix (default `central`; keep in sync with API `CENTRAL_PATH_PREFIX`) |
| `VITE_REVERB_APP_KEY` | Same as backend `REVERB_APP_KEY` (public) |
| `VITE_REVERB_HOST` | Public WebSocket hostname |
| `VITE_REVERB_PORT` | Usually `443` behind TLS |
| `VITE_REVERB_SCHEME` | `https` in production |

Example SPA site `.env`:

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=EloSync
VITE_API_MODE=central
# VITE_CENTRAL_PATH_PREFIX=dc-s87s
VITE_REVERB_APP_KEY=<public-application-key>
VITE_REVERB_HOST=reverb.example.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

Local Vite uses `.env` / `import.meta.env` when `window.env` is absent.

Forge site settings: repository `SaaS-Frontend`, branch **`build-artifacts`**, web directory `/`, Node **not** required on the server.

## `build-artifacts` branch

| Property | Value |
|----------|--------|
| Includes | `index.html`, hashed `assets/`, `.vite/manifest.json`, `build-info.json` |
| Excludes | `src/`, `config.js` (host-generated), `.env`, tooling |

## Actions variables

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_APP_NAME` | No | Build-time fallback only |
| `VITE_API_MODE` | No | Default `central` |
| `APP_VERSION` | No | Metadata override |

`VITE_API_URL` is **not** required in GitHub Actions.

## Security

- No cloud/payment secrets in frontend CI
- SPA API URL and Reverb app key are public; keep them on Forge `.env` per site
- Never put `REVERB_APP_SECRET` in SPA env or `config.js`

## Related

- [Laravel Forge Deployment](/deployment/laravel-forge)
- [Production Runbook](/deployment/platform-production-runbook)
- [Notification System](/deployment/notifications)
- [Object Storage](/developer-guide/object-storage)
