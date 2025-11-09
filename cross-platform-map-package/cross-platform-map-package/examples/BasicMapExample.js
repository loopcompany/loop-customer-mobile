import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from '../components/MapView';

/**
 * Basic MapView Example
 * 
 * Demonstrates the simplest usage with a single marker
 */
const BasicMapExample = () => {
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

export default BasicMapExample;
