# Quick Reference Card

## 🚀 One-Minute Setup

```bash
# 1. Copy files
cp -r cross-platform-map-package/components/* your-app/components/
cp -r cross-platform-map-package/utils/* your-app/utils/

# 2. Install dependencies
npm install react-native-maps leaflet react-leaflet

# 3. Done! Use it:
```

```javascript
import MapView, { Marker } from './components/MapView';

<MapView style={{ flex: 1 }} initialRegion={{ latitude: 35.7219, longitude: 51.3347, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
  <Marker coordinate={{ latitude: 35.7219, longitude: 51.3347 }} title="Location" />
</MapView>
```

---

## 📦 Package Files

```
components/
├── MapView.js              # Import this
├── MapView.web.js          # Auto-loaded on web
├── MapView.simple.js       # Fallback
└── MapErrorBoundary.js     # Error handling

utils/
└── tehranBounds.js         # Location validation
```

---

## 🎯 Common Imports

```javascript
// Basic
import MapView from './components/MapView';

// With components
import MapView, { Marker, Polyline, Circle } from './components/MapView';

// With utilities
import { sanitizeToTehran, isWithinTehran } from './utils/tehranBounds';

// Providers (native only)
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from './components/MapView';
```

---

## 📍 Essential Props

### MapView
```javascript
<MapView
  style={{ flex: 1 }}                    // Required
  region={region}                         // Controlled
  initialRegion={initialRegion}          // Uncontrolled
  onRegionChange={handleChange}          // Callback
  onRegionChangeComplete={handleComplete} // Callback
  provider={PROVIDER_GOOGLE}             // Native only
/>
```

### Marker
```javascript
<Marker
  coordinate={{ latitude: 35.7, longitude: 51.3 }} // Required
  title="Title"                                      // Optional
  description="Description"                          // Optional
  onPress={() => {}}                                 // Optional
  zIndex={1}                                         // Optional
/>
```

### Polyline
```javascript
<Polyline
  coordinates={[                         // Required
    { latitude: 35.7, longitude: 51.3 },
    { latitude: 35.8, longitude: 51.4 }
  ]}
  strokeColor="#007AFF"                  // Optional
  strokeWidth={3}                        // Optional
/>
```

### Circle
```javascript
<Circle
  center={{ latitude: 35.7, longitude: 51.3 }} // Required
  radius={500}                                   // Required (meters)
  strokeColor="#007AFF"                          // Optional
  fillColor="rgba(0,122,255,0.2)"               // Optional
/>
```

---

## 🔧 Region Object

```javascript
{
  latitude: 35.7219,      // Center latitude
  longitude: 51.3347,     // Center longitude
  latitudeDelta: 0.01,    // Vertical span
  longitudeDelta: 0.01    // Horizontal span
}
```

---

## 🛠️ Utility Functions

```javascript
// Check if location is in bounds
const isValid = isWithinTehran(35.7219, 51.3347); // true/false

// Sanitize to valid bounds
const { latitude, longitude, isFallback } = sanitizeToTehran(lat, lng);

if (isFallback) {
  alert('Location adjusted to valid bounds');
}
```

---

## 🎨 Common Patterns

### Controlled Map
```javascript
const [region, setRegion] = useState(initialRegion);

<MapView region={region} onRegionChangeComplete={setRegion} />
```

### Multiple Markers
```javascript
{markers.map(m => (
  <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
))}
```

### Map with Route
```javascript
<MapView>
  <Marker coordinate={origin} title="Start" />
  <Marker coordinate={destination} title="End" />
  <Polyline coordinates={[origin, destination]} strokeColor="blue" />
</MapView>
```

---

## ⚡ Performance Tips

```javascript
// ✅ Memoize markers
const markers = useMemo(() => 
  data.map(item => <Marker key={item.id} {...item} />),
  [data]
);

// ✅ Limit region updates
const onRegionChange = useCallback(
  debounce(handleRegionChange, 200),
  []
);

// ✅ Conditional rendering
{mapReady && markers}
```

---

## 🐛 Quick Fixes

### Map not showing
```javascript
// Check style prop
<MapView style={{ width: '100%', height: 400 }} />
```

### Web showing fallback
```bash
# Install Leaflet
npm install leaflet react-leaflet

# Add CSS to index.html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
```

### Native crash
```bash
# Reinstall maps
npm install react-native-maps
cd ios && pod install && cd ..
```

---

## 📱 Platform Detection

```javascript
import { Platform } from 'react-native';

// The component handles this automatically, but you can check:
if (Platform.OS === 'web') {
  // Web-specific code
} else {
  // Native code
}
```

---

## 🎓 Learning Path

1. **Start**: Copy files + install deps
2. **Basic**: Single map with one marker
3. **Intermediate**: Multiple markers + polylines
4. **Advanced**: Custom bounds + validation
5. **Expert**: Custom styling + providers

---

## 📚 Full Documentation

- **INTEGRATION_GUIDE.md** - Complete setup & API reference
- **README.md** - Overview & quick start
- **CHANGELOG.md** - Version history

---

## 💡 Pro Tips

1. Always validate coordinates before use
2. Use controlled components when possible
3. Memoize marker arrays for performance
4. Test on all target platforms
5. Customize bounds for your region

---

## ✅ Checklist for New Project

- [ ] Files copied
- [ ] Dependencies installed
- [ ] iOS pods installed (`cd ios && pod install`)
- [ ] Android manifest updated (if using Google Maps)
- [ ] Import paths verified
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web
- [ ] Bounds customized (if needed)

---

**Need more help?** See INTEGRATION_GUIDE.md for detailed documentation.
