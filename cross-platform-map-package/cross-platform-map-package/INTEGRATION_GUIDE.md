# Cross-Platform MapView Integration Guide

This package provides a unified MapView component that works seamlessly on both **React Native (iOS/Android)** and **Web (React Native Web)** platforms using platform-specific implementations.

## 📦 Package Contents

```
cross-platform-map-package/
├── components/
│   ├── MapView.js              # Main entry point with platform detection
│   ├── MapView.web.js          # Web implementation using Leaflet
│   ├── MapView.simple.js       # Simple fallback for web
│   └── MapErrorBoundary.js     # Error boundary for map failures
├── utils/
│   └── tehranBounds.js         # Geographic bounds validation utilities
└── INTEGRATION_GUIDE.md        # This file
```

## 🎯 Features

- ✅ **Unified API**: Single import works across iOS, Android, and Web
- ✅ **Native Performance**: Uses `react-native-maps` on iOS/Android
- ✅ **Web Support**: Leaflet-based implementation for web platforms
- ✅ **Graceful Fallback**: Static map preview if dependencies fail
- ✅ **Error Handling**: Built-in error boundaries prevent app crashes
- ✅ **Geographic Validation**: Utilities to validate and clamp coordinates (Tehran bounds example)
- ✅ **Zero Configuration**: Automatic platform detection

## 📋 Prerequisites

### For Native (iOS/Android)
- React Native project (Expo or bare React Native)
- `react-native-maps` installed and configured

### For Web
- React Native Web setup
- Optional: Leaflet for interactive maps (gracefully falls back if missing)

## 🚀 Installation Steps

### Step 1: Copy Files to Your Project

Copy the entire package to your project:

```bash
# From the package directory
cp -r cross-platform-map-package/components/* <your-project>/components/
cp -r cross-platform-map-package/utils/* <your-project>/utils/
```

### Step 2: Install Dependencies

#### For Native Apps (iOS/Android)

```bash
# Using npm
npm install react-native-maps

# Using yarn
yarn add react-native-maps
```

**iOS Additional Setup:**
```bash
cd ios && pod install && cd ..
```

Add to `ios/Podfile` if needed:
```ruby
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'
```

**Android Additional Setup:**

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

#### For Web

```bash
# Using npm
npm install leaflet react-leaflet

# Using yarn
yarn add leaflet react-leaflet
```

**Web Configuration:**

Add to your `package.json` (for Expo):
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

Add to `webpack.config.js` (if using custom webpack):
```javascript
module.exports = {
  resolve: {
    alias: {
      'react-native-maps': path.resolve(__dirname, 'components/MapView.js'),
    }
  }
}
```

### Step 3: Update Import Paths

The package uses relative imports. Update them based on your project structure:

**In `components/MapView.js`:**
```javascript
// Update these imports based on your project structure
const webMapModule = require('./MapView.simple');  // Adjust path if needed
const nativeMapModule = require('react-native-maps');
```

**In `components/MapView.web.js`:**
```javascript
import MapErrorBoundary from './MapErrorBoundary';  // Adjust path if needed
```

## 📝 Usage Examples

### Basic Map

```javascript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from './components/MapView';

const MyMapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 35.7219,
    longitude: 51.3347,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker
          coordinate={{
            latitude: 35.7219,
            longitude: 51.3347,
          }}
          title="Tehran"
          description="Capital of Iran"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MyMapScreen;
```

### With Multiple Markers

```javascript
import MapView, { Marker, Polyline } from './components/MapView';

const MultipleMarkersMap = () => {
  const markers = [
    { id: 1, lat: 35.7219, lng: 51.3347, title: 'Origin' },
    { id: 2, lat: 35.7319, lng: 51.3447, title: 'Destination' },
  ];

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 35.7219,
        longitude: 51.3347,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          title={marker.title}
        />
      ))}
      
      <Polyline
        coordinates={markers.map(m => ({ latitude: m.lat, longitude: m.lng }))}
        strokeColor="#007AFF"
        strokeWidth={3}
      />
    </MapView>
  );
};
```

### With Circle Overlay

```javascript
import MapView, { Marker, Circle } from './components/MapView';

const MapWithCircle = () => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 35.7219,
        longitude: 51.3347,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      <Marker
        coordinate={{ latitude: 35.7219, longitude: 51.3347 }}
        title="Center Point"
      />
      
      <Circle
        center={{ latitude: 35.7219, longitude: 51.3347 }}
        radius={500}  // meters
        strokeColor="rgba(0,122,255,0.5)"
        fillColor="rgba(0,122,255,0.2)"
      />
    </MapView>
  );
};
```

### Using Geographic Bounds Validation

```javascript
import { sanitizeToTehran, isWithinTehran } from './utils/tehranBounds';

const validateAndSetLocation = (latitude, longitude) => {
  // Check if coordinates are within Tehran
  if (!isWithinTehran(latitude, longitude)) {
    console.warn('Location is outside Tehran bounds');
    
    // Sanitize to closest valid Tehran coordinates
    const sanitized = sanitizeToTehran(latitude, longitude);
    
    if (sanitized.isFallback) {
      alert('Selected location is outside Tehran. Using default location.');
    }
    
    return sanitized;
  }
  
  return { latitude, longitude, isFallback: false };
};

// Usage in component
const handleLocationSelect = (coordinate) => {
  const validated = validateAndSetLocation(
    coordinate.latitude,
    coordinate.longitude
  );
  
  setRegion({
    latitude: validated.latitude,
    longitude: validated.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
};
```

### Customizing Geographic Bounds

To adapt the bounds for your city/region, edit `utils/tehranBounds.js`:

```javascript
// Example: Change from Tehran to New York
export const CENTER = { latitude: 40.7128, longitude: -74.0060 };

export const BOUNDS = {
    minLatitude: 40.4774,
    maxLatitude: 40.9176,
    minLongitude: -74.2591,
    maxLongitude: -73.7004,
};
```

## 🔧 Advanced Configuration

### Map Providers (Native Only)

```javascript
import MapView, { PROVIDER_GOOGLE } from './components/MapView';

<MapView
  provider={PROVIDER_GOOGLE}  // Use Google Maps on Android
  style={{ flex: 1 }}
  // ... other props
/>
```

### Custom Map Style (Native Only)

```javascript
<MapView
  style={{ flex: 1 }}
  customMapStyle={[
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]}
/>
```

### Tile Server Configuration (Web Only)

To use a different tile server for the web version, edit `MapView.web.js`:

```javascript
<TileLayer
  attribution='&copy; Your Attribution'
  url="https://your-tile-server/{z}/{x}/{y}.png"
/>
```

Popular alternatives:
- **Mapbox**: `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`
- **CartoDB**: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- **Stamen**: `https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg`

## 🎨 Styling

### Map Container Styling

```javascript
<MapView
  style={{
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
  }}
/>
```

### Custom Marker Icons (Native)

```javascript
import MapView, { Marker } from './components/MapView';

<Marker
  coordinate={{ latitude: 35.7219, longitude: 51.3347 }}
  image={require('./assets/custom-marker.png')}
/>
```

## 🐛 Troubleshooting

### Issue: Map not showing on Web

**Solution:** Ensure Leaflet CSS is loaded. The component auto-loads it, but you can manually add:

```html
<!-- Add to your index.html -->
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
/>
```

### Issue: "useLeafletContext" error on Web

**Solution:** This error is caught by `MapErrorBoundary`. If you see it repeatedly:

1. Check that `react-leaflet` version matches `leaflet` version
2. Ensure components are only used inside `<MapView>`:

```javascript
// ❌ Wrong
<Marker coordinate={...} />

// ✅ Correct
<MapView>
  <Marker coordinate={...} />
</MapView>
```

### Issue: Map crashes on native

**Solution:** Check that `react-native-maps` is properly installed:

```bash
# Verify installation
npm list react-native-maps

# Reinstall if needed
npm install react-native-maps
cd ios && pod install && cd ..
```

### Issue: Markers not appearing on Web

**Solution:** Leaflet marker icons need proper paths. The component handles this, but if issues persist:

```javascript
// Add to MapView.web.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;
```

## 📱 Platform-Specific Behaviors

### iOS/Android (Native)
- Full interactive maps with native gestures
- GPU-accelerated rendering
- Offline map support (with proper configuration)
- Native map providers (Google, Apple)

### Web
- Leaflet-based interactive maps
- Touch and mouse support
- Tile-based rendering
- Graceful fallback to static preview if Leaflet fails

## 🔐 API Keys

### Google Maps (Android)

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for Android"
3. Add to `android/app/src/main/AndroidManifest.xml`

### Apple Maps (iOS)

No API key needed - works out of the box.

### Mapbox (Web - Optional)

If using Mapbox tiles on web:

1. Get token from [Mapbox](https://www.mapbox.com/)
2. Add to environment variables:
   ```bash
   REACT_APP_MAPBOX_TOKEN=your_token_here
   ```
3. Update `MapView.web.js` TileLayer URL

## 📚 Component API Reference

### MapView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | ViewStyle | - | Container style |
| `region` | Region | - | Controlled region (lat, lng, deltas) |
| `initialRegion` | Region | Tehran | Initial map center |
| `onRegionChange` | Function | - | Called when region changes |
| `onRegionChangeComplete` | Function | - | Called when region change ends |
| `provider` | String | default | Map provider (native only) |

### Marker Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `coordinate` | {latitude, longitude} | ✅ | Marker position |
| `title` | String | - | Marker title |
| `description` | String | - | Marker description |
| `onPress` | Function | - | Called when marker tapped |
| `zIndex` | Number | 0 | Z-order (higher = on top) |

### Polyline Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `coordinates` | Array<{latitude, longitude}> | ✅ | Line points |
| `strokeColor` | String | #007AFF | Line color |
| `strokeWidth` | Number | 3 | Line width |

### Circle Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `center` | {latitude, longitude} | ✅ | Circle center |
| `radius` | Number | ✅ | Radius in meters |
| `strokeColor` | String | #007AFF | Border color |
| `fillColor` | String | - | Fill color |

## 🎓 Best Practices

1. **Always provide fallback values:**
   ```javascript
   const region = userRegion || DEFAULT_REGION;
   ```

2. **Use controlled components when possible:**
   ```javascript
   <MapView region={region} onRegionChangeComplete={setRegion} />
   ```

3. **Validate coordinates before use:**
   ```javascript
   const validated = sanitizeToTehran(lat, lng);
   if (validated.isFallback) {
     // Handle invalid coordinates
   }
   ```

4. **Memoize complex children:**
   ```javascript
   const markers = useMemo(() => 
     data.map(item => <Marker key={item.id} {...item} />),
     [data]
   );
   ```

5. **Handle loading states:**
   ```javascript
   const [mapReady, setMapReady] = useState(false);
   
   <MapView onMapReady={() => setMapReady(true)}>
     {mapReady && <Markers />}
   </MapView>
   ```

## 🔄 Migration from react-native-maps

If you're migrating from direct `react-native-maps` usage:

1. Change imports:
   ```javascript
   // Before
   import MapView from 'react-native-maps';
   
   // After
   import MapView from './components/MapView';
   ```

2. No code changes needed - API is identical!

3. Your web build now works automatically 🎉

## 📦 Updating the Package

When you make improvements:

1. Test on all platforms (iOS, Android, Web)
2. Update this guide with new features
3. Version your changes:
   ```bash
   # Tag the package version
   git tag map-package-v1.0.0
   ```

## 🤝 Contributing

To improve this package:

1. Test changes across all platforms
2. Update documentation
3. Add usage examples for new features
4. Maintain backward compatibility

## 📄 License

This package uses:
- `react-native-maps` (MIT License)
- `leaflet` (BSD 2-Clause License)
- `react-leaflet` (Hippocratic License)

Ensure compliance with these licenses in your project.

## 🆘 Support

For issues:

1. Check the Troubleshooting section
2. Review platform-specific documentation:
   - [react-native-maps docs](https://github.com/react-native-maps/react-native-maps)
   - [Leaflet docs](https://leafletjs.com/)
   - [React Leaflet docs](https://react-leaflet.js.org/)

## 🎉 Success Checklist

- [ ] Files copied to project
- [ ] Dependencies installed (`react-native-maps` for native, `leaflet`/`react-leaflet` for web)
- [ ] Native setup completed (Pod install for iOS, manifest for Android)
- [ ] Imports updated for your project structure
- [ ] Test on iOS
- [ ] Test on Android  
- [ ] Test on Web
- [ ] Geographic bounds customized for your region (optional)
- [ ] API keys configured (if using Google Maps)

---

**Ready to use!** Import `MapView` and start building cross-platform map features. 🗺️✨
