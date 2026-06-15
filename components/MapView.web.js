import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NESHAN_SDK_JS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js';
const NESHAN_SDK_CSS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css';

const DEFAULT_NESHAN_API_KEY =
  typeof process !== 'undefined'
    ? process.env.EXPO_PUBLIC_NESHAN_API_KEY
    : '';

let neshanScriptPromise = null;
let neshanCssLoaded = false;

function loadCssOnce(href) {
  if (typeof document === 'undefined') return;

  if (neshanCssLoaded) return;

  const existed = document.querySelector(`link[href="${href}"]`);
  if (existed) {
    neshanCssLoaded = true;
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
  neshanCssLoaded = true;
}

function loadScriptOnce(src) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window is undefined'));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (neshanScriptPromise) {
    return neshanScriptPromise;
  }

  neshanScriptPromise = new Promise((resolve, reject) => {
    const existed = document.querySelector(`script[src="${src}"]`);

    if (existed) {
      if (window.L) {
        resolve(window.L);
        return;
      }

      existed.addEventListener('load', () => {
        if (window.L) resolve(window.L);
        else reject(new Error('Neshan SDK loaded but window.L is not available'));
      });

      existed.addEventListener('error', () => {
        reject(new Error(`Failed to load script: ${src}`));
      });

      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Neshan SDK loaded but window.L is not available'));
      }
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.body.appendChild(script);
  });

  return neshanScriptPromise;
}

function getChildTypeName(child) {
  if (!child || !child.type) return '';
  if (typeof child.type === 'string') return child.type;
  return child.type.displayName || child.type.name || '';
}

function collectMapChildren(children) {
  const markers = [];
  const polylines = [];
  const circles = [];

  React.Children.forEach(children, (child) => {
    if (!child || !child.props) return;

    const typeName = getChildTypeName(child);
    const props = child.props;

    if (typeName === 'Marker' || typeName === 'WebMarker') {
      markers.push({
        key: child.key || `marker-${markers.length}`,
        ...props,
      });
    }

    if (typeName === 'Polyline' || typeName === 'WebPolyline') {
      polylines.push({
        key: child.key || `polyline-${polylines.length}`,
        ...props,
      });
    }

    if (typeName === 'Circle' || typeName === 'WebCircle') {
      circles.push({
        key: child.key || `circle-${circles.length}`,
        ...props,
      });
    }
  });

  return { markers, polylines, circles };
}

function getMapCenterRegion(map) {
  if (!map) return null;

  const center = map.getCenter();

  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
}

const WebMapView = ({
  children,
  style,
  initialRegion,
  region,
  onRegionChange,
  onRegionChangeComplete,
  neshanApiKey = DEFAULT_NESHAN_API_KEY,
  neshanMapType = 'dreamy',
  showPoi = true,
  showTraffic = false,
  zoomControl = true,
  ...props
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const initializedRef = useRef(false);

  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const circlesRef = useRef([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const parsedChildren = useMemo(() => collectMapChildren(children), [children]);

  const centerRegion = region || initialRegion || {
    latitude: 35.6892,
    longitude: 51.3890,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const clearShapes = () => {
    markersRef.current.forEach((item) => {
      try {
        item.remove();
      } catch (e) { }
    });

    polylinesRef.current.forEach((item) => {
      try {
        item.remove();
      } catch (e) { }
    });

    circlesRef.current.forEach((item) => {
      try {
        item.remove();
      } catch (e) { }
    });

    markersRef.current = [];
    polylinesRef.current = [];
    circlesRef.current = [];
  };

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      try {
        if (!neshanApiKey) {
          throw new Error('Neshan API key is missing');
        }

        if (!mapContainerRef.current) {
          return;
        }

        if (initializedRef.current) {
          return;
        }

        initializedRef.current = true;

        loadCssOnce(NESHAN_SDK_CSS_URL);
        const L = await loadScriptOnce(NESHAN_SDK_JS_URL);

        if (!mounted || !mapContainerRef.current) return;

        const map = new L.Map(mapContainerRef.current, {
          key: neshanApiKey,
          maptype: neshanMapType,
          poi: showPoi,
          traffic: showTraffic,
          center: [
            Number(centerRegion.latitude),
            Number(centerRegion.longitude),
          ],
          zoom: 14,
          zoomControl: zoomControl
        });

        mapRef.current = map;

        map.whenReady(() => {
          if (!mounted) return;
          setIsLoading(false);
          setError('');
        });

        map.on('move', () => {
          const nextRegion = getMapCenterRegion(map);
          if (nextRegion && onRegionChange) {
            onRegionChange(nextRegion);
          }
        });

        map.on('moveend', () => {
          const nextRegion = getMapCenterRegion(map);
          if (nextRegion && onRegionChangeComplete) {
            onRegionChangeComplete(nextRegion);
          }
        });
      } catch (err) {
        console.error('Failed to initialize Neshan map:', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to initialize map');
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      initMap();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
      clearShapes();

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) { }
        mapRef.current = null;
      }

      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !region) return;

    const currentCenter = map.getCenter();
    const latDiff = Math.abs(currentCenter.lat - Number(region.latitude));
    const lngDiff = Math.abs(currentCenter.lng - Number(region.longitude));

    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      map.setView(
        [Number(region.latitude), Number(region.longitude)],
        map.getZoom(),
        { animate: true }
      );
    }
  }, [region]);

  useEffect(() => {
    const L = typeof window !== 'undefined' ? window.L : null;
    const map = mapRef.current;

    if (!L || !map || isLoading || error) return;

    clearShapes();

    parsedChildren.markers.forEach((marker) => {
      if (!marker.coordinate) return;

      const instance = L.marker([
        Number(marker.coordinate.latitude),
        Number(marker.coordinate.longitude),
      ]).addTo(map);

      if (marker.title || marker.description) {
        instance.bindPopup(`
          <div style="direction: rtl; text-align: right;">
            ${marker.title ? `<strong>${marker.title}</strong>` : ''}
            ${marker.description ? `<div>${marker.description}</div>` : ''}
          </div>
        `);
      }

      if (marker.onPress) {
        instance.on('click', marker.onPress);
      }

      markersRef.current.push(instance);
    });

    parsedChildren.polylines.forEach((polyline) => {
      if (!polyline.coordinates?.length) return;

      const latlngs = polyline.coordinates.map((c) => [
        Number(c.latitude),
        Number(c.longitude),
      ]);

      const instance = L.polyline(latlngs, {
        color: polyline.strokeColor || '#007AFF',
        weight: polyline.strokeWidth || 3,
        opacity: polyline.opacity ?? 1,
      }).addTo(map);

      polylinesRef.current.push(instance);
    });

    parsedChildren.circles.forEach((circle) => {
      if (!circle.center || !circle.radius) return;

      const instance = L.circle(
        [Number(circle.center.latitude), Number(circle.center.longitude)],
        {
          color: circle.strokeColor || 'rgba(52, 152, 219, 0.8)',
          fillColor: circle.fillColor || 'rgba(52, 152, 219, 0.2)',
          fillOpacity: circle.fillOpacity ?? 0.2,
          weight: circle.strokeWidth || 2,
          radius: Number(circle.radius),
        }
      ).addTo(map);

      circlesRef.current.push(instance);
    });
  }, [parsedChildren, isLoading, error]);

  return (
    <View style={[styles.container, style]} {...props}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {isLoading && !error ? (
        <View style={styles.overlay}>
          <Text style={styles.title}>Loading Neshan Map...</Text>
        </View>
      ) : null}

      {!!error ? (
        <View style={styles.overlay}>
          <Text style={styles.title}>Neshan Map Error</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const WebMarker = () => null;
WebMarker.displayName = 'Marker';

const WebPolyline = () => null;
WebPolyline.displayName = 'Polyline';

const WebCircle = () => null;
WebCircle.displayName = 'Circle';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    marginTop: 8,
    color: 'red',
    textAlign: 'center',
  },
});

export default WebMapView;
export { WebMarker as Marker, WebPolyline as Polyline, WebCircle as Circle };
