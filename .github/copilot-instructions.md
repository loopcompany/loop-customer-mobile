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
/screens/          # Main application screens
/org/              # Organization-specific screens and auth flows
  /logreg/         # Login/registration components
/components/       # Reusable UI components (Button, CheckBox, etc.)
/slices/           # Redux Toolkit slices
/services/         # API configuration and utilities
/styles/           # StyleSheet definitions (Styles.js, NewStyles.js)
/theme/            # Color definitions and theming
/helpers/          # Utility functions (Common.js)
/assets/           # Static assets including localization files
```

## Key Development Patterns

### Navigation Structure
- Main entry: `App.js` contains a single `Stack.Navigator` with ~40+ screens
- No nested navigators in main file - all screens are flat in the stack
- Navigation pattern: `navigation.navigate('ScreenName')`

### Redux State Management
Store configured in `store.js` with slices:
```javascript
// State slices: auth, lang, user, contacts, weight, newUser
import { useSelector, useDispatch } from 'react-redux';
const token = useSelector(state => state.auth.token);
```

### Styling System
- **Two style files**: `Styles.js` (legacy) and `NewStyles.js` (current)
- **Color theming**: Use `theme/Color.js` with indexed colors (`themeColor0`, `themeColor1`, etc.)
- **Responsive utilities**: `getColumnsCount()`, `getImageSize()` in `helpers/Common.js`
- **RTL Support**: Uses Persian fonts (Vazir-Bold, Vazir-Light) but forces LTR layout

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
2. Import and add to Stack.Navigator in `App.js`
3. Use `CustomStatusBar`, `ScreenHeaders`, and `Footer` components

**Adding Redux state**:
1. Create slice in `/slices/`
2. Add to store configuration in `store.js`

**Styling**: 
- Use `NewStyles.js` for new components
- Reference theme colors via `theme/Color.js`
- Responsive utilities available in `helpers/Common.js`

**API calls**: 
- Implement in `services/Api.js` using axios
- Use base URLs from `services/URL.js`
- Handle auth tokens via Redux state