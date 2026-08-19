// screens/MapPickerScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from '@components/MapView';

export default function MapPickerScreen({ navigation }) {
  const [marker, setMarker] = useState({
    latitude: 35.6892,
    longitude: 51.3890,
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => setMarker(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={marker} />
      </MapView>
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={() => {
          navigation.navigate('AddressScreen', { selectedLocation: marker });
        }}
      >
        <Text style={styles.confirmText}>✔ انتخاب این موقعیت</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#005b9f',
    padding: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
