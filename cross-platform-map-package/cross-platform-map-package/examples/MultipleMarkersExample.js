import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from '../components/MapView';

/**
 * Multiple Markers with List Example
 * 
 * Demonstrates handling many markers and coordinating with a list view
 */
const MultipleMarkersExample = () => {
  const [locations] = useState([
    { id: '1', name: 'Location A', lat: 35.7219, lng: 51.3347, type: 'restaurant' },
    { id: '2', name: 'Location B', lat: 35.7319, lng: 51.3447, type: 'hotel' },
    { id: '3', name: 'Location C', lat: 35.7119, lng: 51.3247, type: 'restaurant' },
    { id: '4', name: 'Location D', lat: 35.7419, lng: 51.3547, type: 'shop' },
  ]);

  const [selectedId, setSelectedId] = useState(null);

  const handleMarkerPress = (id) => {
    setSelectedId(id);
  };

  const handleListItemPress = (location) => {
    setSelectedId(location.id);
    // In a real app, you might animate the map to center on this location
  };

  const selectedLocation = locations.find(loc => loc.id === selectedId);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.7219,
          longitude: 51.3347,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            title={location.name}
            description={location.type}
            onPress={() => handleMarkerPress(location.id)}
            zIndex={selectedId === location.id ? 1 : 0}
          />
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <FlatList
          data={locations}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.listItem,
                selectedId === item.id && styles.listItemSelected
              ]}
              onPress={() => handleListItemPress(item)}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {selectedLocation && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{selectedLocation.name}</Text>
          <Text style={styles.infoType}>{selectedLocation.type}</Text>
          <Text style={styles.infoCoords}>
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </Text>
        </View>
      )}
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
  listContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listItemSelected: {
    backgroundColor: '#007AFF',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    position: 'absolute',
    top: 20,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoCoords: {
    fontSize: 12,
    color: '#999',
  },
});

export default MultipleMarkersExample;
