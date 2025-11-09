// Platform-specific MapView component - DO NOT import react-native-maps directly here
import { Platform } from 'react-native';

let MapView, Marker, Polyline, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT;

if (Platform.OS === 'web') {
  // Use Leaflet web implementation for interactive maps
  try {
    const webMapModule = require('./MapView.web');
    MapView = webMapModule.default;
    Marker = webMapModule.Marker;
    Polyline = webMapModule.Polyline;
    Circle = webMapModule.Circle;
    PROVIDER_GOOGLE = webMapModule.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = webMapModule.PROVIDER_DEFAULT;
  } catch (error) {
    console.warn('MapView.web failed to load, using simple fallback:', error);
    // Fallback to simple implementation if Leaflet isn't available
    const simpleMapModule = require('./MapView.simple');
    MapView = simpleMapModule.default;
    Marker = simpleMapModule.Marker;
    Polyline = simpleMapModule.Polyline;
    Circle = simpleMapModule.Circle;
    PROVIDER_GOOGLE = simpleMapModule.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = simpleMapModule.PROVIDER_DEFAULT;
  }
} else {
  // Use native implementation - moved to separate file to avoid Metro bundling issues
  const nativeMapModule = require('./MapView.native');
  MapView = nativeMapModule.default;
  Marker = nativeMapModule.Marker;
  Polyline = nativeMapModule.Polyline;
  Circle = nativeMapModule.Circle;
  PROVIDER_GOOGLE = nativeMapModule.PROVIDER_GOOGLE;
  PROVIDER_DEFAULT = nativeMapModule.PROVIDER_DEFAULT;
}

export default MapView;
export { Marker, Polyline, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT };

