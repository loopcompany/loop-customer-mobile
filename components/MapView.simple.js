// Simple fallback MapView component for web without Leaflet dependencies
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const SimpleWebMapView = ({ children, region, initialRegion, style, ...props }) => {
  const center = region || initialRegion || { latitude: 35.7219, longitude: 51.3347 };
  
  // Process children to extract marker information for fallback display
  const markers = [];
  if (children) {
    React.Children.forEach(children, (child) => {
      if (child && child.props && child.props.coordinate) {
        markers.push({
          coordinate: child.props.coordinate,
          title: child.props.title,
          key: child.key || Math.random()
        });
      }
    });
  }

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>🗺️ Map Preview</Text>
        <Text style={styles.fallbackSubtext}>
          📍 {center.latitude?.toFixed(4)}, {center.longitude?.toFixed(4)}
        </Text>
        <Text style={styles.webNote}>
          Interactive map available in native app
        </Text>
        
        {/* Render fallback markers */}
        {markers.map((marker, index) => (
          <View key={marker.key || index} style={[styles.fallbackMarker, { top: 50 + (index * 30) }]}>
            <Text style={styles.markerEmoji}>📍</Text>
            {marker.title && <Text style={styles.markerTitle}>{marker.title}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

// Simple fallback components
const SimpleMarker = ({ coordinate, title, children, ...props }) => {
  return (
    <View style={styles.fallbackMarker}>
      <Text style={styles.markerEmoji}>📍</Text>
      {title && <Text style={styles.markerTitle}>{title}</Text>}
    </View>
  );
};

const SimplePolyline = ({ coordinates, ...props }) => {
  return (
    <View style={styles.fallbackPolyline}>
      <Text style={styles.polylineText}>
        🛣️ Route ({coordinates?.length || 0} points)
      </Text>
    </View>
  );
};

const SimpleCircle = ({ center, radius, ...props }) => {
  return (
    <View style={styles.fallbackCircle}>
      <Text style={styles.circleText}>⭕ Area</Text>
    </View>
  );
};

const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  webNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fallbackMarker: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerTitle: {
    fontSize: 10,
    color: '#333',
    marginTop: 2,
  },
  fallbackPolyline: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  polylineText: {
    fontSize: 12,
    color: '#007AFF',
  },
  fallbackCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
  circleText: {
    fontSize: 10,
    color: '#007AFF',
  },
});

export default SimpleWebMapView;
export { SimpleMarker as Marker, SimplePolyline as Polyline, SimpleCircle as Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT };
