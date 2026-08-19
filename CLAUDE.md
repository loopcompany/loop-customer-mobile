# Loop Customer Mobile — Working Rules

This file governs how Claude works in this repo. It is derived from the app's actual
conventions (not aspirational ones) — cross-checked against `.github/copilot-instructions.md`,
`docs/`, and a full knowledge-graph pass over the codebase (`graphify-out/GRAPH_REPORT.md`).
When this file and observed code disagree, trust the newer code — many rules below exist
*because* an older pattern is being migrated away from.

## What this app is

**Loop** (لوپ) — an Expo-managed React Native app (SDK ~53, RN 0.79.6, new architecture
enabled) for a home-service platform: customers order technician services, track orders,
manage an organization account, pay via wallet, and rate technicians. Persian is the
primary language (RTL content, LTR layout), English is secondary.

Tech stack: Expo Router-less single `Stack.Navigator` (React Navigation v7) · Redux Toolkit ·
i18next (`fa`/`en`) · Axios (`services/axiosConfig.js`) · AsyncStorage · Jalaali/Gregorian
dual calendars.

## Directory map

```
screens/      Main app screens (flat, ~40+ registered directly in App.js)
org/          Organization-specific flows, isolated from /screens
  logreg/     Org login/register/OTP
components/   Reusable UI (Button, ScreenHeaders, CustomStatusBar, ...)
slices/       Redux Toolkit slices (one file per domain)
services/     Axios instance, per-domain API modules, TokenManager, OrganizationService
hoc/          Higher-order components (withOrganizationAccess)
hooks/        Custom hooks (useAuth, useOrganizationAccess, useLogout)
styles/       NewStyles.js (current) — Styles.js (legacy, do not extend)
theme/        Color.js, Spacing.js, Radius.js, Typography.js, Shadows.js —
              the design-token single source of truth (see below)
helpers/      Common.js — the everything-utility file (dates, validation, alerts, formatting)
utils/        Smaller focused utilities (screenProtectionHelper, performanceOptimization)
docs/         Feature/bugfix write-ups — check here before re-solving a problem
cross-platform-map-package/  Vendored, semi-independent map package (own package.json)
```

## Non-negotiable conventions

These are migrations already in progress in this codebase. Never move code backward onto
the deprecated side.

### Colors — use `themeColor` / `colors`, never raw hex
`theme/Color.js` exports `themeColor0`..`themeColor16`, each `{ color, bgColor(opacity) }`,
plus a semantic `colors` object (`colors.primary`, `colors.error`, `colors.textSecondary`,
`colors.border`, ...) — see **Design tokens** below. The old top-level `Colors` object is
fully removed (`docs/COLORS_TO_THEMECOLOR_MIGRATION.md` migration is complete, not
in-progress — zero `Colors.x` usages remain). Don't reintroduce a `Colors.*` reference or a
new raw hex literal.

### Alerts — use `showAlert()` / `showToastOrAlert()`, never raw `Alert.alert()`
Both live in `helpers/Common.js`. `Alert.alert()` from `react-native` does not work on web,
and `docs/ALERT_USAGE_LIST.md` tracks the (incomplete) migration off it. Any new alert/confirm
dialog must go through `showAlert(title, message, buttons)`; toasts/simple messages through
`showToastOrAlert(message)`. If you touch a screen still calling `Alert.alert` directly,
migrate that call while you're in there.

### Styles — extend `NewStyles.js`, not `Styles.js`
`styles/Styles.js` is legacy. New style objects go in `styles/NewStyles.js` and reference
`themeColor*`/`colors`, not hardcoded hex. `NewStyles.js` itself still has its own hardcoded
spacing/radius/shadow numbers (pre-dates the token files below) — don't add *new* hardcoded
values to it, and don't rewrite its existing numbers as a drive-by; that migration is tracked
separately. New composite styles should compose from `theme/*` tokens directly instead of
adding another one-off number to `NewStyles.js`.

### Design tokens — the single source of truth for color / spacing / radius / typography / shadow
An audit (2026-08) found the app effectively had none of this: 83 files hardcoded raw hex
colors that mostly didn't even match `theme/Color.js`'s own palette, 32 distinct
spacing values with two competing informal scales, 21 distinct border-radius values, 20
distinct font sizes, and per-component ad hoc shadows. `theme/` now holds the primitives —
**use them for any new or touched styling code**:

```js
import { colors, themeColor0 } from '../theme/Color';   // semantic + indexed palette
import { spacing } from '../theme/Spacing';               // xs 4, sm 8, md 12, lg 16, xl 20, xxl 24, xxxl 32, huge 40
import { radius } from '../theme/Radius';                 // none 0, sm 8, md 12, lg 20, pill 9999
import { fontSize, getFontFamily } from '../theme/Typography'; // xs 12 .. display 32
import { shadow } from '../theme/Shadows';                 // sm / md / lg, neutral + iOS+Android paired

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.bgColor(1),
    borderColor: colors.border.bgColor(1),
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: getFontFamily('bold', i18n.language),
    color: colors.textPrimary.color,
  },
});
```

`colors` semantic keys: `primary`, `primaryLight`, `accent`, `success`, `error`, `warning`,
`info`, `white`, `black`, `background`, `surface`, `border`/`divider`, `textPrimary`,
`textSecondary`, `textMuted`, `textInverse`, `overlay`, `disabled`. Prefer these over reaching
for `themeColorN` by index in new code — the semantic name documents intent, the index
doesn't.

**If you touch a screen/component with hardcoded hex, a one-off spacing/radius number, or a
raw `fontSize`, migrate what you touch onto these tokens while you're in there** (same rule as
the Colors/Alerts migrations above). Do not attempt to migrate a whole untouched file as a
drive-by — the full-app migration off hardcoded values is tracked separately and done in
reviewable batches, because color values visibly shift on screen as each file moves over and
needs to be checked, not blindly bulk-replaced.

**Known bug this token pass fixed:** several screens referenced `fontFamily: 'Vazir-Bold'` /
`'Vazir-Light'` (hyphenated), which were never registered in `App.js`'s `useFonts()` call —
only `VazirBold`/`VazirLight`/`VazirBoldFD`/`VazirLightFD` are real registered font keys, so
those elements were silently falling back to the system font. Fixed at the call sites; if you
see the hyphenated form reappear anywhere, it's the same bug — use `getFontFamily()` from
`theme/Typography.js` instead of a string literal so it can't happen again.

### Dates — this app has three date systems; know which one you're in
`moment`, `dayjs`, and `jalaali-js` are all present. Jalaali (Persian calendar) conversion
helpers live in `helpers/Common.js` (`jalaliToGregorian`, `formatJalaaliDate`, etc.) — reuse
those rather than writing a new conversion. Don't introduce a fourth date library.

## Redux

One slice per domain in `slices/`, registered in `store.js`. Standard RTK pattern:
`useSelector(state => state.auth.token)`, async thunks for API calls. Before adding a new
slice, check whether an existing one (`orderSlice`, `stepSlice`, `organizationSlice`, etc.)
already owns that domain — `stepSlice.js` in particular is large and already covers most of
the order-creation wizard state.

## API layer

- `services/URL.js` — base URLs (API + image storage on `narchino.com`).
- `services/axiosConfig.js` — the shared Axios instance: interceptors, response caching
  (`withCache`), auth-header injection. New API calls should go through this instance, not a
  fresh `axios.create()`.
- `services/ApiEndpoints.js` and per-domain service files (`OrganizationService.js`,
  `WalletApi.js`, `ReviewApi.js`, ...) — add new endpoints next to their domain's existing
  ones rather than inlining a URL string in a screen.
- `services/Api.js` is large and central — check it before assuming an endpoint doesn't
  exist yet.

**Known landmine:** the order-submission endpoint is documented inconsistently across
`docs/ORDER_SUBMIT_API_COMPLETE_DOCS.md`, `docs/ORDER_SUBMIT_UPDATES.md`, and
`docs/API_ENDPOINT_FIX.md` — variously `/api/orders/`, `/api/orders/submit`, `/orders/`.
**Before touching order submission, read the actual call site in
`screens/category/Preview.js`, not the docs** — the docs disagree with each other.

## Organization access control (security-sensitive — read before editing)

There is a dedicated access-control system gating what an "organization" account can do
until their profile/contract is approved. It follows two explicit principles documented in
`docs/ORGANIZATION_ACCESS_CONTROL_README.md` / `docs/SECURITY_FIX_ACCESS_CONTROL.md`:

- **Fail secure** — an unauthenticated or unrecognized state must never resolve to granted
  access. If you're modifying `useOrganizationAccess`, `withOrganizationAccess`, or
  `canAccessScreen`, the default branch must deny, not allow.
- **Defense in depth** — access is checked at multiple independent layers (hook →
  HOC-wrapped screen → protected-button component → axios interceptor). Don't remove a layer
  because another layer "already covers it" — that's how the bugs in
  `docs/SECURITY_FIX_ACCESS_CONTROL.md` happened.

**Known landmine:** there appear to be two `withOrganizationAccess` implementations —
`components/withOrganizationAccess.js` and `hoc/withOrganizationAccess.js`. Confirm which one
a screen actually imports before editing either; don't assume they're kept in sync.

## Platform-split files

Several components ship as parallel platform variants instead of `Platform.OS` branches
inside one file — follow this pattern when a component needs real per-platform behavior
(not just style tweaks):

```
MapView.js / MapView.web.js / MapView.native.js / MapView.simple.js
ShowMapDetailComponent.js / ShowMapDetailComponent.web.js
InvoiceViewer.js / InvoiceViewer.web.js
```

Metro/webpack resolve the right file automatically by extension. Import the base name
(`../components/MapView`), never the platform-suffixed file directly, so the resolution
keeps working.

## Web-specific rules

- **Never `import 'leaflet/dist/leaflet.css'`** in JS — it breaks the Metro bundler. Leaflet
  CSS is loaded via CDN `<link>` in `public/index.html`, already wired up. This exact mistake
  has been reintroduced multiple times per `docs/QUICK_WEB_SETUP.md` and
  `.github/copilot-instructions.md` — don't be the next one.
- **Don't touch browser history manually.** No `window.history.pushState`, no `popstate`
  listener overrides. React Navigation's linking config (`App.js`) already owns URL sync and
  the back button.
- **Navigation state persistence is dev-only, native-only** — gated on
  `Platform.OS !== 'web' && __DEV__`. Do not enable it for production or for web; web restores
  state from the URL instead.

## i18n / RTL

- Strings live in `assets/*.json` locale files (`en.json` extensive, `fa.json` minimal —
  Persian text is largely inline rather than keyed). New user-facing strings should still
  prefer i18next keys where a key already exists for that string.
- Layout is forced LTR even though content is Persian/RTL — this is intentional, not a bug to
  "fix." Don't flip `I18nManager` layout direction.
- Custom Persian fonts are loaded in `App.js` via `expo-font` under the registered keys
  `VazirBold` / `VazirLight` / `VazirBoldFD` / `VazirLightFD` (the `FD` variants are for RTL
  content). Use `getFontFamily(weight, lang)` from `theme/Typography.js` rather than typing
  the string literal — a hyphenated `'Vazir-Bold'`/`'Vazir-Light'` is not a registered key and
  silently falls back to the system font (see Design tokens above).

## Adding things — the expected shape

**New screen:** create in `screens/` (or `org/` if organization-specific) → register in the
`Stack.Navigator` in `App.js` → use `CustomStatusBar` + `ScreenHeaders` at the top, consistent
with every other screen.

**New Redux state:** new slice in `slices/`, wire into `store.js`. Check existing slices first
(see Redux section above) before assuming it doesn't exist yet.

**New API call:** add to the relevant `services/*Api.js` / `*Service.js` file, route through
`axiosConfig`'s shared instance, add the path to `ApiEndpoints.js` if that pattern is used
nearby.

**New styling:** compose from `theme/Color.js` (`colors`/`themeColor*`), `theme/Spacing.js`,
`theme/Radius.js`, `theme/Typography.js`, `theme/Shadows.js` — see Design tokens above. No new
hex literals, no new raw spacing/radius/fontSize numbers, no `Styles.js` additions, no
`Colors.*`.

**New alert/confirm dialog:** `showAlert()` / `showToastOrAlert()` from `helpers/Common.js`,
never bare `Alert.alert()`.

## Before large changes

For anything touching architecture, cross-file relationships, or "where does X actually get
used," query the existing knowledge graph instead of re-deriving it by hand:

```
graphify query "<question>"
```

`graphify-out/GRAPH_REPORT.md` has the full community/god-node/hyperedge breakdown from the
last full pass. Re-run `/graphify --update` after a substantial change so the graph doesn't
drift from the code.
