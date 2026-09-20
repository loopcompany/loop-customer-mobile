// بومِ نقشه‌ی نشان — نسخه‌ی نیتیو (WebView + SDK لِفلِتِ نشان).
//
// تنها کارِ این کامپوننت نمایشِ نقشه و گزارشِ مرکزِ آن است. نه پین دارد، نه
// دکمه، نه Redux: هرکسی که نقشه می‌خواهد (بخشِ بالای فرمِ آدرس، انتخابگرِ
// تمام‌صفحه) روی همین بوم UI خودش را می‌گذارد. قبلاً HTML نقشه داخلِ
// `screens/address/NeshanMap.js` بود و نسخه‌ی وب یک پیاده‌سازیِ کاملاً جدا —
// دو نقشه‌ی متفاوت با دو رفتارِ متفاوت.
//
// دوقلوی وب: `NeshanCanvas.web.js`. همیشه `@components/NeshanCanvas` را
// ایمپورت کنید تا Metro خودش نسخه‌ی درست را بردارد.
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { NESHAN_WEB_KEY } from '@services/neshan';
import { colors } from '@theme/Color';

/**
 * @param {object} props
 * @param {{latitude: number, longitude: number}} props.initialCenter مرکزِ اولیه؛
 *   تغییرِ بعدیِ آن نقشه را جابه‌جا نمی‌کند (برای آن `flyTo` هست) تا WebView
 *   دوباره بارگذاری نشود.
 * @param {number} [props.zoom]
 * @param {{latitude: number, longitude: number, radius: number}|null} [props.serviceArea]
 *   دایره‌ی محدوده‌ی سرویس. چون با تاخیر از سرور می‌آید، به‌جای ساختنِ دوباره‌ی
 *   HTML با تزریقِ JS اضافه می‌شود.
 * @param {boolean} [props.interactive] اجازه‌ی کشیدن/زوم.
 * @param {() => void} [props.onMoveStart]
 * @param {(p: {latitude: number, longitude: number, user: boolean}) => void} [props.onMoveEnd]
 *   `user` یعنی حرکت را کاربر انجام داده، نه `flyTo`.
 * @param {(p: {latitude: number, longitude: number}) => void} [props.onReady]
 */
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
  const webViewRef = useRef(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  // حالتِ اولیه‌ی تعامل داخلِ خودِ HTML اعمال می‌شود؛ اگر منتظرِ تزریقِ بعد از
  // READY بمانیم، نقشه در آن فاصله‌ی کوتاه زیرِ انگشت حرکت می‌کند.
  const [initialInteractive] = useState(() => Boolean(interactive));

  // مرکزِ اولیه فقط یک‌بار خوانده می‌شود؛ وگرنه هر رندرِ والد HTML تازه می‌سازد
  // و نقشه از صفر بارگذاری می‌شود.
  const startRef = useRef(initialCenter);
  const start = startRef.current || initialCenter;

  const inject = useCallback((script) => {
    webViewRef.current?.injectJavaScript(`${script} true;`);
  }, []);

  const flyTo = useCallback(
    (latitude, longitude, nextZoom) => {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      inject(
        `window.__loopMap && window.__loopMap.flyTo(${latitude}, ${longitude}, ${
          Number.isFinite(nextZoom) ? nextZoom : 'null'
        });`
      );
    },
    [inject]
  );

  useImperativeHandle(ref, () => ({ flyTo }), [flyTo]);

  // محدوده‌ی سرویس بعد از آماده شدنِ نقشه (و هر بار که عوض شود) کشیده می‌شود.
  useEffect(() => {
    if (!readyRef.current) return;
    if (!serviceArea) {
      inject('window.__loopMap && window.__loopMap.clearServiceArea();');
      return;
    }
    inject(
      `window.__loopMap && window.__loopMap.setServiceArea(${serviceArea.latitude}, ${serviceArea.longitude}, ${serviceArea.radius});`
    );
  }, [inject, serviceArea]);

  useEffect(() => {
    inject(`window.__loopMap && window.__loopMap.setInteractive(${interactive ? 'true' : 'false'});`);
  }, [inject, interactive]);

  const html = useMemo(
    () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css" rel="stylesheet" type="text/css">
  <script src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js" type="text/javascript"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #e9eef3; overflow: hidden; }
    #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { font-size: 9px; opacity: .6; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var send = function (payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    };

    var map = new L.Map('map', {
      key: '${NESHAN_WEB_KEY}',
      maptype: 'dreamy',
      poi: true,
      traffic: false,
      zoomControl: false,
      center: [${start.latitude}, ${start.longitude}],
      zoom: ${zoom}
    });

    // حرکتی که خودمان شروع کرده‌ایم نباید «انتخابِ کاربر» شمرده شود.
    var programmatic = false;
    var circle = null;

    map.on('movestart', function () { send({ type: 'MOVE_START' }); });

    map.on('moveend', function () {
      var c = map.getCenter();
      send({ type: 'MOVE_END', lat: c.lat, lng: c.lng, user: !programmatic });
      programmatic = false;
    });

    map.whenReady(function () {
      var c = map.getCenter();
      send({ type: 'READY', lat: c.lat, lng: c.lng });
    });

    window.__loopMap = {
      flyTo: function (lat, lng, z) {
        programmatic = true;
        map.setView([lat, lng], z === null ? map.getZoom() : z, { animate: true });
      },
      setServiceArea: function (lat, lng, radius) {
        if (circle) { map.removeLayer(circle); }
        circle = L.circle([lat, lng], {
          color: '#2563eb',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          radius: radius
        }).addTo(map);
      },
      clearServiceArea: function () {
        if (circle) { map.removeLayer(circle); circle = null; }
      },
      setInteractive: function (on) {
        ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard', 'tap']
          .forEach(function (name) {
            var handler = map[name];
            if (!handler) return;
            if (on) { handler.enable(); } else { handler.disable(); }
          });
      }
    };

    window.__loopMap.setInteractive(${initialInteractive});
    true;
  </script>
</body>
</html>`,
    // فقط مقادیرِ اولیه — عمداً به prop های متغیر وابسته نیست.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleMessage = useCallback(
    (event) => {
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (data.type === 'MOVE_START') {
        onMoveStart?.();
        return;
      }

      if (data.type === 'READY') {
        readyRef.current = true;
        setReady(true);
        // وضعیتی که قبل از آماده شدنِ نقشه ست شده بود، حالا اعمال می‌شود.
        if (serviceArea) {
          inject(
            `window.__loopMap && window.__loopMap.setServiceArea(${serviceArea.latitude}, ${serviceArea.longitude}, ${serviceArea.radius});`
          );
        }
        inject(
          `window.__loopMap && window.__loopMap.setInteractive(${interactive ? 'true' : 'false'});`
        );
        onReady?.({ latitude: data.lat, longitude: data.lng });
        return;
      }

      if (data.type === 'MOVE_END') {
        onMoveEnd?.({ latitude: data.lat, longitude: data.lng, user: !!data.user });
      }
    },
    [inject, interactive, onMoveEnd, onMoveStart, onReady, serviceArea]
  );

  return (
    <View style={[styles.root, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      {!ready && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.primary.bgColor(1)} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background.bgColor(1),
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.bgColor(1),
  },
});

export default NeshanCanvas;
