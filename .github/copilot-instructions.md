# Loop User App - AI Coding Agent Instructions

## Architecture Overview

This is an **Expo-managed React Native app** (v0.79.6) using the new architecture (`newArchEnabled: true`). The app name is "لوپ" (Persian) and appears to be a service platform supporting technician services, orders, and user management.

### Tech Stack
- **Framework**: Expo SDK ~53.0.22 with React Native 0.79.6
- **Navigation**: React Navigation v7 with nested navigators (Stack, Drawer, Bottom Tabs, Material Top Tabs)
- **State Management**: Redux Toolkit with multiple slices (`auth`, `language`, `user`, `contacts`, `weight`, `newUser`)
- **Internationalization**: i18next with Persian (`fa`) and English (`en`) locales
- **Date/Time**: Both `dayjs` and `moment` libraries, with Jalaali (Persian calendar) support
- **Networking**: Axios for API calls to `https://narchino.com/api`
- **Storage**: AsyncStorage for persistence

## Project Structure Pattern

```
App.js             # Providers only (~80 lines) — screens are NOT registered here
/navigation/       # routes.js = single source of truth for all 85 screens
/i18n/             # i18next bootstrap
/screens/          # Customer screens, grouped by domain into subdirectories
/org/              # Organization-specific screens and auth flows
  /logreg/         # Login/registration components
/components/       # Reusable UI components (Button, CheckBox, etc.)
/contexts/         # React contexts (MenuContext)
/slices/           # Redux Toolkit slices
/services/         # API configuration and utilities
/styles/           # NewStyles.js — the only shared stylesheet
/theme/            # Design tokens: Color, Spacing, Radius, Typography, Shadows
/helpers/          # Utility functions (Common.js)
/assets/           # Static assets including localization files
```

### Import paths — always use an `@alias`

```javascript
import Button from '@components/Button';
import { colors } from '@theme/Color';
```

Aliases: `@assets @components @contexts @helpers @hooks @i18n @navigation @org @screens
@services @slices @store @styles @theme @utils`. A parent-relative `../` import is an
ESLint **error**. The table lives in `babel.config.js`, mirrored in `jsconfig.json` and
`eslint.config.js`.

Run `npm run lint` before finishing. It must stay at **0 errors**.

## Key Development Patterns

### Navigation Structure
- One flat `Stack.Navigator`, no nested navigators. `navigation.navigate('ScreenName')`.
- **`navigation/routes.js` is the single source of truth.** `RootNavigator.js` (the stack)
  and `linking.js` (web deep links) are both generated from it, so a screen cannot be
  registered on one and forgotten on the other.
- Screens are loaded via `getComponent: () => require('@screens/X').default`, which keeps
  them out of the startup path. Do not switch a route to a static `component={X}` import.
- `headerShown: false` is the navigator-wide default — never repeat it per screen.

### Redux State Management
Store configured in `store.js` with slices:
```javascript
// State slices: auth, lang, user, contacts, weight, newUser
import { useSelector, useDispatch } from 'react-redux';
const token = useSelector(state => state.auth.token);
```

### Styling System
- **One style file**: `NewStyles.js`. (`Styles.js` has been deleted.)
- **Color theming**: prefer the semantic `colors` object from `theme/Color.js`
  (`colors.primary`, `colors.error`, ...) over indexed `themeColorN`. No raw hex literals.
- **Tokens**: `theme/Spacing.js`, `theme/Radius.js`, `theme/Typography.js`, `theme/Shadows.js`.
- **Responsive utilities**: `getColumnsCount()`, `getImageSize()` in `helpers/Common.js`
- **RTL Support**: Persian fonts on a deliberately LTR layout. Use `getFontFamily()` from
  `theme/Typography.js` — the registered families are `VazirBold`/`VazirLight`/`VazirBoldFD`/
  `VazirLightFD`; a hyphenated `'Vazir-Bold'` silently falls back to the system font.
- **Alerts**: `showAlert()`/`showToastOrAlert()` from `@helpers/Common`. Bare `Alert.alert()`
  is a no-op on web and is an ESLint error.

### Component Patterns
- Custom components in `/components/`: `Button`, `ScreenHeaders`, `CustomStatusBar`
- Screens use `CustomStatusBar` and `Footer` components consistently
- Button component supports loading states and theme colors

### Internationalization
- i18next setup with Persian primary (`fa.json` minimal, `en.json` extensive)
- Language switching via Redux (`languageSlice`)
- Text appears to be mixed Persian/English in screens

### API Integration
- Base URLs in `services/URL.js`: API (`narchino.com/api`), Images (`narchino.com/storage`)
- `services/Api.js` exists but is empty - likely needs implementation
- Auth token managed via Redux `authSlice`

## Development Commands

```bash
# Start development server
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Clear cache and restart
npx expo start -c

# Web-specific
npx expo start --web
```

## Web App Specific Configuration

### Map Implementation (Leaflet for Web)
**CRITICAL**: Never directly import Leaflet CSS in JavaScript files
```javascript
// ❌ WRONG - Causes Metro bundler error
import 'leaflet/dist/leaflet.css';

// ✅ CORRECT - Load via CDN in HTML
// Add to web/index.html or public/index.html:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

**Map File Structure:**
- `components/MapView.web.js` - Leaflet for web
- `components/MapView.js` - React Native Maps for mobile
- `components/MapView.simple.js` - Simple fallback

**Usage:**
```javascript
import MapView from '../components/MapView';

<MapView
  center={[35.6892, 51.3890]}
  zoom={13}
  onLocationSelect={(location) => console.log(location)}
/>
```

### Navigation & Browser History
- React Navigation handles URL updates automatically
- Browser back button works out of the box
- **DO NOT** override `popstate` events
- **DO NOT** use `window.history.pushState` manually
- Linking configuration in `App.js` handles deep links

**Linking Config Pattern:**
```javascript
const linking = Platform.OS === 'web' ? {
  prefixes: ['http://localhost:8081', 'http://localhost:8082'],
  config: {
    screens: {
      Landing: '',
      MainApp: {
        screens: {
          Profile: 'profile',
          Settings: 'settings',
        }
      }
    }
  }
} : undefined;
```

### State Persistence
- Only enabled in `__DEV__` mode for native platforms
- Web uses URL-based state restoration via linking
- **DO NOT** persist state in production for mobile (causes reload issues)

```javascript
onStateChange={(state) => {
  // Only save for native in dev mode
  if (state && Platform.OS !== 'web' && __DEV__) {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }
}}
```

## Critical Implementation Notes

1. **Dual Date Libraries**: Both `moment` and `dayjs` are used alongside `jalaali-js` for Persian calendar
2. **Font Loading**: Custom Persian fonts loaded via expo-font in `App.js`
3. **Directory Separation**: `/org/` folder contains organization-specific flows (separate from main `/screens/`)
4. **Splash Screen**: Configured with 2-second duration and fade transition
5. **Platform Considerations**: iOS tablet support enabled, Android edge-to-edge enabled

## Common Tasks

**Adding a new screen**: 
1. Create in `/screens/` or `/org/` (for org-specific)
2. Add **one entry to `navigation/routes.js`** — this registers it on the navigator and
   gives it a web URL. Nothing in `App.js` needs to change.
3. Use `CustomStatusBar`, `ScreenHeaders`, and `Footer` components

**Adding Redux state**:
1. Create slice in `/slices/`
2. Add to store configuration in `store.js`

**Styling**: 
- Compose from `theme/*` tokens; use `NewStyles.js` for shared composites
- Reference theme colors via `theme/Color.js`
- Responsive utilities available in `helpers/Common.js`

**API calls**: 
- Implement in `services/Api.js` using axios
- Use base URLs from `services/URL.js`
- Handle auth tokens via Redux state