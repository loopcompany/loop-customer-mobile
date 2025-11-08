# Cross-Platform MapView Package

A production-ready, unified MapView implementation that works seamlessly across **iOS, Android, and Web** platforms in React Native projects.

## ✨ Quick Start

1. **Copy files to your project:**
   ```bash
   cp -r components/* <your-project>/components/
   cp -r utils/* <your-project>/utils/
   ```

2. **Install dependencies:**
   ```bash
   # For Native
   npm install react-native-maps
   
   # For Web
   npm install leaflet react-leaflet
   ```

3. **Use in your code:**
   ```javascript
   import MapView, { Marker } from './components/MapView';
   
   <MapView
     style={{ flex: 1 }}
     initialRegion={{
       latitude: 35.7219,
       longitude: 51.3347,
       latitudeDelta: 0.01,
       longitudeDelta: 0.01,
     }}
   >
     <Marker
       coordinate={{ latitude: 35.7219, longitude: 51.3347 }}
       title="My Location"
     />
   </MapView>
   ```

## 📦 What's Included

- **MapView.js** - Main component with automatic platform detection
- **MapView.web.js** - Leaflet-based web implementation
- **MapView.simple.js** - Fallback for when Leaflet isn't available
- **MapErrorBoundary.js** - Error handling for graceful failures
- **tehranBounds.js** - Geographic validation utilities (customizable for any region)

## 🎯 Features

- ✅ Single codebase for all platforms
- ✅ Automatic platform detection
- ✅ Native performance on iOS/Android
- ✅ Interactive maps on Web
- ✅ Graceful fallback if dependencies missing
- ✅ Built-in error boundaries
- ✅ Geographic bounds validation
- ✅ Identical API to react-native-maps

## 📚 Documentation

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- Complete installation instructions
- Usage examples
- API reference
- Troubleshooting
- Platform-specific configurations
- Migration guide

## 🚀 Supported Components

- `<MapView>` - Main map container
- `<Marker>` - Location markers
- `<Polyline>` - Lines between coordinates
- `<Circle>` - Circular overlays

## 🔧 Platform Support

| Platform | Implementation | Dependencies |
|----------|----------------|--------------|
| iOS | react-native-maps | ✅ Required |
| Android | react-native-maps | ✅ Required |
| Web | Leaflet + React Leaflet | ⚠️ Optional (fallback available) |

## 📱 Example Screenshot

```
┌─────────────────────────────┐
│  🗺️ Interactive Map         │
│                             │
│    📍 Marker 1              │
│         ↓                   │
│    📍 Marker 2              │
│                             │
│  [Works on iOS/Android/Web] │
└─────────────────────────────┘
```

## 🤝 Integration Checklist

- [ ] Copy files to your project
- [ ] Install platform dependencies
- [ ] Update import paths (if needed)
- [ ] Test on target platforms
- [ ] Customize geographic bounds (optional)
- [ ] Configure API keys (for production)

## 📄 License

Compatible with:
- react-native-maps (MIT)
- Leaflet (BSD 2-Clause)
- react-leaflet (Hippocratic)

## 🆘 Need Help?

Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- Complete setup instructions
- Troubleshooting common issues
- Advanced configurations
- Best practices

---

**Ready to integrate?** Start with the [Integration Guide](./INTEGRATION_GUIDE.md) →
