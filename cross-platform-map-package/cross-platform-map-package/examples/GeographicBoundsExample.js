import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, Platform, ToastAndroid } from 'react-native';
import MapView, { Marker, Circle } from '../components/MapView';
import { sanitizeToTehran, isWithinTehran } from '../utils/tehranBounds';

/**
 * Geographic Bounds Validation Example
 * 
 * Demonstrates validating coordinates within defined bounds
 */
const GeographicBoundsExample = () => {
  const [region, setRegion] = useState({
    latitude: 35.7219,
    longitude: 51.3347,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 35.7219,
    longitude: 51.3347,
  });

  const handleRegionChange = (newRegion) => {
    // Validate the new region center
    const validated = sanitizeToTehran(newRegion.latitude, newRegion.longitude);
    
    if (validated.isFallback) {
      const message = 'Location outside Tehran bounds! Adjusted to valid area.';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Location Adjusted', message);
      }
    }

    setRegion({
      ...newRegion,
      latitude: validated.latitude,
      longitude: validated.longitude,
    });
  };

  const testLocation = (lat, lng, name) => {
    const isValid = isWithinTehran(lat, lng);
    const sanitized = sanitizeToTehran(lat, lng);
    
    let message = `${name}:\n`;
    message += `Original: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n`;
    message += `Valid: ${isValid ? 'Yes' : 'No'}\n`;
    
    if (sanitized.isFallback) {
      message += `Adjusted to: ${sanitized.latitude.toFixed(4)}, ${sanitized.longitude.toFixed(4)}`;
    } else {
      message += 'No adjustment needed';
    }

    Alert.alert('Location Test', message);
    
    // Move marker to the sanitized location
    setMarkerPosition({
      latitude: sanitized.latitude,
      longitude: sanitized.longitude,
    });
    
    setRegion({
      ...region,
      latitude: sanitized.latitude,
      longitude: sanitized.longitude,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        <Marker
          coordinate={markerPosition}
          title="Test Location"
          description="This location is validated"
        />
        
        {/* Visual representation of the bounds */}
        <Circle
          center={markerPosition}
          radius={1000}
          strokeColor="rgba(0,122,255,0.5)"
          fillColor="rgba(0,122,255,0.1)"
        />
      </MapView>

      <View style={styles.controls}>
        <Button
          title="Test: Valid Location (Tehran Center)"
          onPress={() => testLocation(35.7219, 51.3347, 'Tehran Center')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Test: North Boundary"
          onPress={() => testLocation(35.85, 51.3347, 'North Edge')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Test: Invalid Location (Outside)"
          onPress={() => testLocation(36.5, 50.0, 'Outside Tehran')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Test: Near Boundary"
          onPress={() => testLocation(35.89, 51.85, 'Near Edge')}
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
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonSpacer: {
    height: 10,
  },
});

export default GeographicBoundsExample;
