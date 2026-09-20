// بومِ نقشه‌ی نشان — نسخه‌ی وب (SDK لِفلِتِ نشان، مستقیم روی DOM).
//
// دوقلوی نیتیو: `NeshanCanvas.js` (WebView). هر دو دقیقاً یک API دارند، پس
// صفحه‌ها یک کد دارند و رفتارِ وب و اپ از هم جدا نمی‌افتد — قبلاً صفحه‌ی نقشه
// روی وب یک پیاده‌سازیِ کاملاً مستقل بود و ویژگی‌های نیتیو را نداشت.
//
// SDK از `MapView.web.js` وام گرفته می‌شود (هر دو فایل فقط روی وب اجرا
// می‌شوند) تا هر دو نقشه یک بارگذاریِ مشترک داشته باشند.
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NESHAN_WEB_KEY } from '@services/neshan';
import { colors } from '@theme/Color';
import { loadNeshanSdk } from './MapView.web';

const NeshanCanvas = forwardRef(function NeshanCanvas(
  {
    initialCenter,
    zoom = 16,
    serviceArea = null,
    interactive = true,
    onMoveStart,
    onMoveEnd,
    onReady,
    style,
  },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const programmatic = useRef(false);
  const startRef = useRef(initialCenter);

  // هندلرها از راهِ ref می‌آیند: نقشه یک‌بار ساخته می‌شود و شنونده‌هایش نباید
  // به نسخه‌ی قدیمیِ توابعِ والد بچسبند.
  const handlers = useRef({ onMoveStart, onMoveEnd, onReady });
  handlers.current = { onMoveStart, onMoveEnd, onReady };

  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  // مثلِ نسخه‌ی نیتیو: حالتِ اولیه‌ی تعامل موقعِ ساختِ نقشه اعمال می‌شود، نه
  // بعد از آماده شدن — وگرنه نقشه در آن فاصله یک لحظه کشیدنی است.
  const [initialInteractive] = useState(() => Boolean(interactive));

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (latitude, longitude, nextZoom) => {
        const map = mapRef.current;
        if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        programmatic.current = true;
        map.setView([latitude, longitude], Number.isFinite(nextZoom) ? nextZoom : map.getZoom(), {
          animate: true,
        });
      },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const L = await loadNeshanSdk();
        if (cancelled || !containerRef.current || mapRef.current) return;

        const start = startRef.current || { latitude: 35.6892, longitude: 51.389 };
        const map = new L.Map(containerRef.current, {
          key: NESHAN_WEB_KEY,
          maptype: 'dreamy',
          poi: true,
          traffic: false,
          zoomControl: false,
          center: [start.latitude, start.longitude],
          zoom,
          dragging: initialInteractive,
          touchZoom: initialInteractive,
          doubleClickZoom: initialInteractive,
          scrollWheelZoom: initialInteractive,
          boxZoom: initialInteractive,
          keyboard: initialInteractive,
        });

        mapRef.current = map;

        map.on('movestart', () => handlers.current.onMoveStart?.());
        map.on('moveend', () => {
          const center = map.getCenter();
          handlers.current.onMoveEnd?.({
            latitude: center.lat,
            longitude: center.lng,
            user: !programmatic.current,
          });
          programmatic.current = false;
        });

        map.whenReady(() => {
          if (cancelled) return;
          setReady(true);
          const center = map.getCenter();
          handlers.current.onReady?.({ latitude: center.lat, longitude: center.lng });
        });
      } catch (err) {
        console.error('[NeshanCanvas] map failed to load:', err);
        if (!cancelled) setError(err?.message || 'map error');
      }
    })();

    return () => {
      cancelled = true;
      try {
        mapRef.current?.remove();
      } catch {
        /* نقشه قبلاً برداشته شده */
      }
      mapRef.current = null;
      circleRef.current = null;
    };
    // فقط یک‌بار؛ زوم و مرکزِ اولیه عمداً وابستگی نیستند.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دایره‌ی محدوده‌ی سرویس با تاخیر از سرور می‌آید.
  useEffect(() => {
    const map = mapRef.current;
    const L = typeof window !== 'undefined' ? window.L : null;
    if (!map || !L || !ready) return;

    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (!serviceArea) return;

    circleRef.current = L.circle([serviceArea.latitude, serviceArea.longitude], {
      color: '#2563eb',
      weight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      radius: serviceArea.radius,
    }).addTo(map);
  }, [ready, serviceArea]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard', 'tap'].forEach(
      (name) => {
        const handler = map[name];
        if (!handler) return;
        if (interactive) handler.enable();
        else handler.disable();
      }
    );
  }, [interactive, ready]);

  return (
    <View style={[styles.root, style]}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!!error && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.errorText}>نقشه بارگذاری نشد</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.background.bgColor(1),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.bgColor(0.9),
  },
  errorText: {
    color: colors.textSecondary.color,
  },
});

export default NeshanCanvas;
