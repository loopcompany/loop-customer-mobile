# Changelog

All notable changes to the Cross-Platform MapView package will be documented in this file.

## [1.0.0] - 2025-10-22

### Added
- Initial release of cross-platform MapView package
- Native iOS/Android support via react-native-maps
- Web support via Leaflet and react-leaflet
- MapView.js - Main entry point with automatic platform detection
- MapView.web.js - Leaflet-based web implementation with dynamic loading
- MapView.simple.js - Simple fallback for web without Leaflet
- MapErrorBoundary.js - Error boundary for graceful map failure handling
- tehranBounds.js - Geographic bounds validation utilities
  - `isWithinTehran()` - Check if coordinates are within bounds
  - `sanitizeToTehran()` - Clamp coordinates to valid bounds
  - Customizable for any geographic region

### Features
- Unified API matching react-native-maps
- Marker component with platform-specific rendering
- Polyline component for drawing routes
- Circle component for area overlays
- Region change callbacks
- Map event handling
- Error boundaries prevent app crashes
- Graceful fallback to static preview if dependencies fail
- Automatic Leaflet CSS loading for web
- Dynamic map centering with smooth animations
- Z-index support for overlapping markers

### Platform Support
- iOS: Native maps via react-native-maps
- Android: Native maps via react-native-maps
- Web: Interactive Leaflet maps with fallback

### Documentation
- Comprehensive INTEGRATION_GUIDE.md with:
  - Installation instructions for all platforms
  - Usage examples
  - API reference
  - Troubleshooting guide
  - Platform-specific configurations
  - Best practices
- README.md with quick start guide
- Inline code comments and examples

### Developer Experience
- Zero configuration for basic usage
- Automatic platform detection
- Hot reload support
- TypeScript-ready (types can be added)
- Minimal dependencies
- Works with Expo and bare React Native

## [Unreleased]

### Planned
- TypeScript type definitions
- Callout/InfoWindow components
- Clustering support for many markers
- Heatmap overlay
- GeoJSON support
- Custom tile providers configuration
- Offline map support
- Animation utilities
- Distance calculation helpers
- Route direction APIs integration

---

## Version History Notes

### Versioning
This package follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality additions  
- PATCH version for backwards-compatible bug fixes

### Upgrade Guide
When upgrading between versions, check this changelog for:
- Breaking changes (MAJOR versions)
- New features (MINOR versions)
- Bug fixes (PATCH versions)

### Contributing
When contributing changes:
1. Update this CHANGELOG.md
2. Document new features in INTEGRATION_GUIDE.md
3. Add usage examples
4. Test on all platforms
5. Update version in package.json
