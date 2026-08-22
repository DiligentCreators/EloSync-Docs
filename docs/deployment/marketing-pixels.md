# Marketing pixels (GTM, Meta, LinkedIn, X)

Optional, **env-gated** marketing tags for acquisition analytics on the **product SPA** ([SaaS-Frontend](https://github.com/DiligentCreators/SaaS-Frontend)) and **marketing site** ([saas-website](https://github.com/DiligentCreators/SaaS-Website)). Omit an env var to disable that vendor — no scripts load and no network requests are made.

::: warning Do not double-fire
Configure each vendor **either** in code (env vars below) **or** inside Google Tag Manager — not both. Duplicate tags inflate metrics and conversion counts.
:::

## Surfaces

| Surface | Stack | Init | SPA page views |
|---------|-------|------|----------------|
| Product app | React + Vite + HashRouter | `initMarketingPixels()` in `App.tsx` | `MarketingPageView` → `trackMarketingPageView()` |
| Marketing site | Next.js App Router | `MarketingScripts` in `app/layout.tsx` | `MarketingPageView` (`usePathname`) |

## Environment variables

### SaaS-Frontend (Forge `config.js` + local `.env`)

| Variable | Vendor | Where to find the ID |
|----------|--------|----------------------|
| `VITE_GTM_ID` | Google Tag Manager | [tagmanager.google.com](https://tagmanager.google.com) → Container ID (`GTM-…`) |
| `VITE_META_PIXEL_ID` | Meta Pixel | Meta Events Manager → Data sources → Pixel ID (numeric) |
| `VITE_LINKEDIN_PARTNER_ID` | LinkedIn Insight Tag | LinkedIn Campaign Manager → Analyze → Insight Tag → Partner ID |
| `VITE_X_PIXEL_ID` | X Pixel | X Ads → Events Manager → Pixel ID |

Local: copy keys into `.env` (see `.env.example` in SaaS-Frontend).

Production: add keys to the Forge site `.env` and extend the deploy script `config.js` block (see [Frontend build artifacts](/developer-guide/frontend-build-artifacts) and SaaS-Frontend `README.md`):

```bash
echo "  VITE_GTM_ID: \"${VITE_GTM_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_META_PIXEL_ID: \"${VITE_META_PIXEL_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_LINKEDIN_PARTNER_ID: \"${VITE_LINKEDIN_PARTNER_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_X_PIXEL_ID: \"${VITE_X_PIXEL_ID:-}\"" >> "$FORGE_RELEASE_DIRECTORY/config.js"
```

No SPA rebuild is required to enable or disable pixels in production — only redeploy so Forge regenerates `config.js`.

### saas-website (Forge `config.js` + local `.env.local`)

| Variable | Vendor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Central API origin (stats, modules, beta form) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn Insight Tag |
| `NEXT_PUBLIC_X_PIXEL_ID` | X Pixel |

Local: copy keys into `.env.local` (see `.env.example` in saas-website). `public/config.js` is an empty stub; local `.env.local` is the fallback when `window.env` keys are absent.

Production: add keys to the **marketing** Forge site `.env` and extend the deploy script `config.js` block (see [website build artifacts](https://github.com/DiligentCreators/SaaS-Website/blob/main/docs/ci-cd/website-build-artifacts.md)):

```bash
echo "window.env = {" > "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  NEXT_PUBLIC_API_URL: \"${NEXT_PUBLIC_API_URL:-https://api.elosync.com}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  NEXT_PUBLIC_GTM_ID: \"${NEXT_PUBLIC_GTM_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  NEXT_PUBLIC_META_PIXEL_ID: \"${NEXT_PUBLIC_META_PIXEL_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  NEXT_PUBLIC_LINKEDIN_PARTNER_ID: \"${NEXT_PUBLIC_LINKEDIN_PARTNER_ID:-}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  NEXT_PUBLIC_X_PIXEL_ID: \"${NEXT_PUBLIC_X_PIXEL_ID:-}\"" >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "};" >> "$FORGE_RELEASE_DIRECTORY/config.js"
```

No website rebuild is required to change API URL or pixels in production — only redeploy so Forge regenerates `config.js`.

## Code layout (saas-website)

```
lib/
  runtime-env.ts       # resolveRuntimeEnv(), getApiBaseUrl()
  marketing-pixels.ts  # getMarketingPixelIds(), trackMarketingPageView()
components/analytics/
  MarketingScripts.tsx # client init from window.env
  MarketingPageView.tsx
public/config.js       # local stub; Forge overwrites in production
```

## Code layout (SaaS-Frontend)

```
src/lib/marketing-pixels/
  env.ts       # resolveRuntimeEnv()
  gtm.ts       # GTM + virtual_page_view
  meta.ts      # Meta Pixel (fbq)
  linkedin.ts  # LinkedIn Insight Tag (lintrk)
  x.ts         # X Pixel (twq)
  index.ts     # initMarketingPixels(), trackMarketingPageView()
```

`src/lib/gtm.ts` re-exports GTM helpers for backward compatibility.

## SPA page-view behavior

| Vendor | Initial load | HashRouter / client navigation |
|--------|--------------|--------------------------------|
| GTM | `gtm.js` | `virtual_page_view` dataLayer event |
| Meta | `PageView` | `fbq('track', 'PageView')` |
| X | `PageView` | `twq('track', 'PageView')` |
| LinkedIn | Insight Tag | No generic page-view API — use conversion IDs for funnel events |

## Conversion events (examples)

Call from product flows when IDs are configured (imports from `@/lib/marketing-pixels`):

```typescript
import { trackLinkedInConversion, trackMetaEvent, trackXEvent } from '@/lib/marketing-pixels'

// Beta signup / registration complete
trackMetaEvent('CompleteRegistration')
trackXEvent('tw-signup')
trackLinkedInConversion('<campaign-manager-conversion-id>')
```

Wire these at the same points you consider product funnel milestones (e.g. after successful register or beta application).

## Verification

1. **Disabled:** With all env vars empty, Network tab shows no requests to `googletagmanager.com`, `facebook.net`, `licdn.com`, or `ads-twitter.com`.
2. **Single vendor:** Set one ID; only that vendor's script loads.
3. **SPA:** Navigate between routes; GTM `virtual_page_view` and Meta/X `PageView` fire once per navigation.
4. **Unit tests:** `npm run test:unit -- src/lib/marketing-pixels/` in SaaS-Frontend.

## Deferred

- Cookie consent banner gating before `initMarketingPixels()` (cookie policy on elosync.com already references optional analytics).
- Server-side Conversions API (Meta CAPI, LinkedIn offline conversions).
- Per-tenant marketing pixels on branded domains — platform-level IDs only.
- Internal **Reports** module (`analytics` slug) — unrelated to these marketing tags.

## Related

- [Frontend build artifacts](/developer-guide/frontend-build-artifacts) — CI + Forge `config.js`
- [Laravel Forge deployment](./laravel-forge) — three-site topology
