// Error boundary specifically for MapView components
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a Leaflet context error
    if (error.message && error.message.includes('useLeafletContext')) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('MapView Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI for map errors
      const { region, initialRegion, style } = this.props;
      const center = region || initialRegion || { latitude: 35.7219, longitude: 51.3347 };
      
      return (
        <View style={[styles.container, style]}>
          <View style={styles.errorFallback}>
            <Text style={styles.errorTitle}>🗺️ Map Preview</Text>
            <Text style={styles.errorSubtext}>
              📍 {center.latitude?.toFixed(4)}, {center.longitude?.toFixed(4)}
            </Text>
            <Text style={styles.errorNote}>Interactive map available in native app</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  errorFallback: {
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 130,
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  errorNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default MapErrorBoundary;
