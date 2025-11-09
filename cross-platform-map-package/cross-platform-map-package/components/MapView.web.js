// Web-optimized MapView component using Leaflet
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapErrorBoundary from './MapErrorBoundary';

// Dynamic import for Leaflet to avoid SSR issues
let L = null;
let MapContainer = null;
let TileLayer = null;
let LeafletMarker = null;
let LeafletPolyline = null;
let LeafletCircle = null;
let useMapEvents = null;
let useMap = null;

if (Platform.OS === 'web') {
  try {
    // Dynamically import Leaflet components
    console.log('Attempting to load Leaflet and react-leaflet...');
    L = require('leaflet');
    console.log('Leaflet loaded:', !!L);
    
    const leafletComponents = require('react-leaflet');
    console.log('react-leaflet loaded:', !!leafletComponents);
    
    MapContainer = leafletComponents.MapContainer;
    TileLayer = leafletComponents.TileLayer;
    LeafletMarker = leafletComponents.Marker;
    LeafletPolyline = leafletComponents.Polyline;
    LeafletCircle = leafletComponents.Circle;
    useMapEvents = leafletComponents.useMapEvents;
    useMap = leafletComponents.useMap;
    
    console.log('Leaflet components extracted - MapContainer:', !!MapContainer, 'TileLayer:', !!TileLayer);
    
    // Fix for default markers in Leaflet
    if (L && L.Icon && L.Icon.Default) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      console.log('Leaflet icon defaults configured');
    }
  } catch (error) {
    console.error('Failed to load Leaflet, using fallback:', error);
    // Set to null if import fails
    MapContainer = null;
    TileLayer = null;
    LeafletMarker = null;
    LeafletPolyline = null;
    LeafletCircle = null;
    useMapEvents = null;
    useMap = null;
  }
} else {
  console.log('Not on web platform, skipping Leaflet import');
}

// Map event handler component
const MapEventHandler = ({ onRegionChange, onRegionChangeComplete }) => {
  if (!useMapEvents) return null;
  
  const map = useMapEvents({
    move: () => {
      if (onRegionChange) {
        const center = map.getCenter();
        const bounds = map.getBounds();
        const latitudeDelta = bounds.getNorth() - bounds.getSouth();
        const longitudeDelta = bounds.getEast() - bounds.getWest();
        
        const regionData = {
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta,
          longitudeDelta,
        };
        
        onRegionChange(regionData);
      }
    },
    moveend: () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const latitudeDelta = bounds.getNorth() - bounds.getSouth();
      const longitudeDelta = bounds.getEast() - bounds.getWest();
      
      const regionData = {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta,
        longitudeDelta,
      };
      
      if (onRegionChangeComplete) {
        onRegionChangeComplete(regionData);
      }
      if (onRegionChange) {
        onRegionChange(regionData);
      }
    }
  });
  
  return null;
};

// Map instance handler component
const MapInstanceHandler = ({ setMapInstance }) => {
  if (!useMap) return null;
  
  const map = useMap();
  
  useEffect(() => {
    console.log('MapInstanceHandler: Setting map instance', !!map);
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);
  
  return null;
};

// Region updater component
const RegionUpdater = ({ region, zoom }) => {
  if (!useMap) return null;
  
  const map = useMap();
  
  useEffect(() => {
    console.log('RegionUpdater effect triggered. map:', !!map, 'region:', region);
    
    if (map && region) {
      const newCenter = [region.latitude, region.longitude];
      
      // Check if the new position is significantly different to avoid unnecessary updates
      const currentCenter = map.getCenter();
      const distanceThreshold = 0.0001; // Small threshold to prevent continuous updates
      
      const latDiff = Math.abs(currentCenter.lat - region.latitude);
      const lngDiff = Math.abs(currentCenter.lng - region.longitude);
      
      console.log('Current center:', currentCenter.lat.toFixed(4), currentCenter.lng.toFixed(4));
      console.log('New center:', region.latitude.toFixed(4), region.longitude.toFixed(4));
      console.log('Distance differences - lat:', latDiff.toFixed(6), 'lng:', lngDiff.toFixed(6));
      
      if (latDiff > distanceThreshold || lngDiff > distanceThreshold) {
        console.log('Moving map to new coordinates:', region.latitude.toFixed(4), region.longitude.toFixed(4));
        // Use flyTo for smooth animation
        map.flyTo(newCenter, zoom, {
          duration: 1.5, // Animation duration in seconds
          easeLinearity: 0.25
        });
      } else {
        console.log('Distance too small, not moving map');
      }
    } else {
      console.log('Cannot move map - map:', !!map, 'region:', !!region);
    }
  }, [region, map, zoom]);
  
  return null;
};

const WebMapView = ({ children, region, initialRegion, onRegionChange, onRegionChangeComplete, style, provider, ...props }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  
  // Use region or initialRegion for map center
  const center = region || initialRegion || { latitude: 35.7219, longitude: 51.3347 };
  const mapCenter = [center.latitude, center.longitude];
  const zoom = 13;

  // Check if Leaflet components are available and load CSS
  useEffect(() => {
    const initLeaflet = async () => {
      // Check if components loaded
      if (MapContainer && TileLayer && LeafletMarker) {
        console.log('Leaflet components detected, marking as ready');
        setIsLeafletReady(true);
      } else {
        console.warn('Leaflet components not available');
        setIsLeafletReady(false);
        setIsLoaded(true);
        return;
      }

      // Load Leaflet CSS
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.onload = () => {
            console.log('Leaflet CSS loaded successfully');
            setIsLoaded(true);
          };
          link.onerror = () => {
            console.warn('Failed to load Leaflet CSS');
            setHasError(true);
            setIsLoaded(true);
          };
          document.head.appendChild(link);
        } else {
          console.log('Leaflet CSS already present');
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    };

    initLeaflet();
  }, []);

  // Enhanced fallback for when Leaflet is not available or has errors
  if (!isLeafletReady || !MapContainer || !TileLayer || !isLoaded) {
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

    console.log('Showing fallback - isLeafletReady:', isLeafletReady, 'MapContainer:', !!MapContainer, 'TileLayer:', !!TileLayer, 'isLoaded:', isLoaded, 'hasError:', hasError);
    return (
      <View style={[styles.container, style]} {...props}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>🗺️ {hasError ? 'Map Preview' : 'Loading Map...'}</Text>
          <Text style={styles.fallbackSubtext}>
            {center ? `📍 ${center.latitude?.toFixed(4)}, ${center.longitude?.toFixed(4)}` : 'Location not set'}
          </Text>
          <Text style={styles.webNote}>
            {hasError ? 'Interactive map available in native app' : 'Preparing interactive map...'}
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
  }

  console.log('Rendering interactive Leaflet map - center:', mapCenter, 'zoom:', zoom);
  return (
    <MapErrorBoundary region={region} initialRegion={initialRegion} style={style}>
      <View style={[styles.container, style]} {...props}>
        <div style={{ height: '100%', width: '100%' }}>
          <style>
            {`
              .leaflet-control-zoom {
                z-index: 800 !important;
              }
              .leaflet-control-container {
                z-index: 800 !important;
              }
              .leaflet-container {
                height: 100%;
                width: 100%;
              }
            `}
          </style>
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Map instance handler */}
            <MapInstanceHandler setMapInstance={setMapInstance} />
            
            {/* Region updater */}
            <RegionUpdater region={region} zoom={zoom} />
            
            {/* Event handler component */}
            <MapEventHandler 
              onRegionChange={onRegionChange} 
              onRegionChangeComplete={onRegionChangeComplete} 
            />
            
            {/* Render children */}
            {children}
          </MapContainer>
        </div>
      </View>
    </MapErrorBoundary>
  );
};

// Web Marker component
const WebMarker = ({ coordinate, title, description, children, onPress, zIndex, ...props }) => {
  // Early return with null if no coordinate to prevent Leaflet context errors
  if (!coordinate) return null;
  
  // If Leaflet components are not available, return fallback
  if (!LeafletMarker) {
    return (
      <View style={[styles.fallbackMarker, { zIndex: zIndex || 1 }]}>
        <Text style={styles.markerEmoji}>📍</Text>
        {title && <Text style={styles.markerTitle}>{title}</Text>}
      </View>
    );
  }

  const position = [coordinate.latitude, coordinate.longitude];

  return (
    <LeafletMarker
      position={position}
      eventHandlers={{
        click: () => onPress && onPress(),
      }}
      zIndexOffset={zIndex || 0}
      {...props}
    >
      {children}
    </LeafletMarker>
  );
};

// Web Polyline component
const WebPolyline = ({ coordinates, strokeColor = '#007AFF', strokeWidth = 3, ...props }) => {
  if (!LeafletPolyline || !coordinates || coordinates.length === 0) {
    return (
      <View style={styles.fallbackPolyline}>
        <Text style={styles.polylineText}>
          🛣️ Route ({coordinates?.length || 0} points)
        </Text>
      </View>
    );
  }

  const positions = coordinates.map(coord => [coord.latitude, coord.longitude]);

  return (
    <LeafletPolyline
      positions={positions}
      color={strokeColor}
      weight={strokeWidth}
      {...props}
    />
  );
};

// Web Circle component
const WebCircle = ({ center, radius, strokeColor = '#007AFF', fillColor, ...props }) => {
  if (!LeafletCircle || !center) {
    return (
      <View style={styles.fallbackCircle}>
        <Text style={styles.circleText}>⭕ Area</Text>
      </View>
    );
  }

  const position = [center.latitude, center.longitude];

  return (
    <LeafletCircle
      center={position}
      radius={radius}
      color={strokeColor}
      fillColor={fillColor}
      {...props}
    />
  );
};

const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  fallback: {
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    position: 'relative',
  },
  fallbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  webNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  childrenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  fallbackMarker: {
    position: 'absolute',
    alignItems: 'center',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markerEmoji: {
    fontSize: 24,
  },
  markerTitle: {
    fontSize: 12,
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 4,
    marginTop: 2,
    textAlign: 'center',
  },
  fallbackPolyline: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 6,
    borderRadius: 6,
    zIndex: 2,
  },
  polylineText: {
    color: 'white',
    fontSize: 12,
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

export default WebMapView;
export { WebMarker as Marker, WebPolyline as Polyline, WebCircle as Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT };
