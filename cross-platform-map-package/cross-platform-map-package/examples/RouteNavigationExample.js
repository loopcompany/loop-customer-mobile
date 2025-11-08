import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Marker, Polyline } from '../components/MapView';

/**
 * Route Navigation Example
 * 
 * Shows origin, destination, and route between them
 */
const RouteNavigationExample = () => {
  const [origin] = useState({ latitude: 35.7219, longitude: 51.3347 });
  const [destination] = useState({ latitude: 35.7319, longitude: 51.3547 });
  const [showRoute, setShowRoute] = useState(true);

  // Calculate center point between origin and destination
  const region = useMemo(() => ({
    latitude: (origin.latitude + destination.latitude) / 2,
    longitude: (origin.longitude + destination.longitude) / 2,
    latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 2,
    longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 2,
  }), [origin, destination]);

  const routeCoordinates = [origin, destination];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
      >
        <Marker
          coordinate={origin}
          title="Origin"
          description="Start point"
        />
        
        <Marker
          coordinate={destination}
          title="Destination"
          description="End point"
        />
        
        {showRoute && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      <View style={styles.controls}>
        <Button
          title={showRoute ? "Hide Route" : "Show Route"}
          onPress={() => setShowRoute(!showRoute)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default RouteNavigationExample;
