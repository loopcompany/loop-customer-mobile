// انتخاب موقعیت روی نقشه‌ی نشان.
//
// نسخه‌ی قبلی فقط یک WebView خام بود: هیچ جست‌وجویی نداشت، آدرسِ نقطه‌ی
// انتخاب‌شده را به کاربر نشان نمی‌داد، و روی هر فریمِ حرکتِ نقشه یک اکشن Redux
// dispatch می‌کرد. این نسخه یک انتخابگرِ کامل است:
//
//   • نوار جست‌وجوی شناور (جست‌وجوی نشان) با نتایج زنده
//   • پینِ مرکزِ ثابت که هنگام حرکت نقشه بالا می‌پرد
//   • ژئوکدینگِ معکوس ⟵ آدرسِ خوانا در کارتِ پایین صفحه
//   • بازخوردِ زنده‌ی «داخل/خارجِ محدوده‌ی سرویس‌دهی»
//   • دکمه‌ی «موقعیت من»
//
// جست‌وجو و ژئوکدینگِ معکوس به کلیدِ service.* نشان نیاز دارند؛ نبودِ آن فقط
// این دو قابلیت را خاموش می‌کند و بقیه‌ی صفحه سالم کار می‌کند (services/neshan.js).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMenu } from '@contexts/MenuContext';

import { setLatitude, setLongitude } from '@slices/addressSlice';
import Button from '@components/Button';
import MarkerIcon from '@assets/svg/MarkerIcon';
import { langIsRTL, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import {
  DEFAULT_CENTER,
  NESHAN_WEB_KEY,
  distanceInMeters,
  hasNeshanServiceKey,
  reverseGeocode,
  searchPlaces,
} from '@services/neshan';

const REVERSE_DEBOUNCE_MS = 500;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * @param {object} props
 * @param {() => void} props.submitAddress            تاییدِ نهایی (ثبت آدرس)
 * @param {boolean} [props.loading]                   وضعیتِ ارسالِ فرم
 * @param {object} [props.radii]                      {latitude, longitude, radius} محدوده‌ی سرویس
 * @param {(r: object) => void} [props.onResolvedAddress] آدرسِ ژئوکدشده به والد
 */
export default function NeshanMap({
  submitAddress,
  loading = false,
  radii,
  onResolvedAddress,
  confirmLabel,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  // داکِ شناورِ پایین صفحه روی همه‌ی صفحات رندر می‌شود؛ بدون این فاصله،
  // دکمه‌ی «تایید» زیرِ آن پنهان می‌ماند.
  const { footerSpace } = useMenu();
  const webViewRef = useRef(null);

  const storeRadii = useSelector((state) => state.radius?.data);
  const effectiveRadii = useMemo(() => {
    if (radii) return radii;
    return Array.isArray(storeRadii) && storeRadii.length > 0 ? storeRadii[0] : storeRadii;
  }, [radii, storeRadii]);

  const [moving, setMoving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // useMemo (not useRef().current) so the value is never read during render.
  const pinLift = useMemo(() => new Animated.Value(0), []);
  const styles = useMemo(() => createStyles(isRTL), [isRTL]);
  const searchEnabled = hasNeshanServiceKey();
  // «جست‌وجوی معنادار» — هم نمایشِ نتایج و هم اسپینر به این وابسته‌اند.
  const hasQuery = searchTerm.trim().length >= 2;

  // ---------------------------------------------------------------------------
  // محدوده‌ی سرویس‌دهی
  // ---------------------------------------------------------------------------
  const serviceArea = useMemo(() => {
    const lat = parseFloat(effectiveRadii?.latitude);
    const lng = parseFloat(effectiveRadii?.longitude);
    const rad = parseFloat(effectiveRadii?.radius);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(rad) || rad <= 0) {
      return null;
    }
    return { latitude: lat, longitude: lng, radius: rad };
  }, [effectiveRadii]);

  // بدونِ محدوده‌ی تعریف‌شده هر نقطه‌ای مجاز است (همان رفتارِ قبلی).
  const inServiceArea = useMemo(() => {
    if (!coords) return false;
    if (!serviceArea) return true;
    return (
      distanceInMeters(
        serviceArea.latitude,
        serviceArea.longitude,
        coords.latitude,
        coords.longitude
      ) <= serviceArea.radius
    );
  }, [coords, serviceArea]);

  const initialCenter = serviceArea || DEFAULT_CENTER;

  // ---------------------------------------------------------------------------
  // نقشه (WebView + SDK لِـفلِتِ نشان)
  //
  // با useMemo ساخته می‌شود تا هر رندر باعثِ ری‌لودِ کاملِ نقشه نشود.
  // ---------------------------------------------------------------------------
  const mapHtml = useMemo(
    () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css" rel="stylesheet" type="text/css">
  <script src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js" type="text/javascript"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #e9eef3; }
    #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { font-size: 9px; opacity: .65; }
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

    var myMap = new L.Map('map', {
      key: '${NESHAN_WEB_KEY}',
      maptype: 'dreamy',
      poi: true,
      traffic: false,
      zoomControl: false,
      center: [${initialCenter.latitude}, ${initialCenter.longitude}],
      zoom: 15
    });

    ${
      serviceArea
        ? `L.circle([${serviceArea.latitude}, ${serviceArea.longitude}], {
             color: '#2563eb',
             weight: 2,
             fillColor: '#3b82f6',
             fillOpacity: 0.12,
             radius: ${serviceArea.radius}
           }).addTo(myMap);`
        : ''
    }

    // فقط شروع و پایانِ حرکت گزارش می‌شود، نه تک‌تکِ فریم‌ها.
    myMap.on('movestart', function () { send({ type: 'MOVE_START' }); });
    myMap.on('moveend', function () {
      var c = myMap.getCenter();
      send({ type: 'MOVE_END', lat: c.lat, lng: c.lng });
    });

    myMap.whenReady(function () {
      var c = myMap.getCenter();
      send({ type: 'READY', lat: c.lat, lng: c.lng });
    });

    window.moveToLocation = function (lat, lng, zoom) {
      myMap.setView([lat, lng], zoom || 17);
    };
    true;
  </script>
</body>
</html>`,
    [initialCenter.latitude, initialCenter.longitude, serviceArea]
  );

  const animatePin = useCallback(
    (up) => {
      Animated.spring(pinLift, {
        toValue: up ? -14 : 0,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }).start();
    },
    [pinLift]
  );

  const onMessage = useCallback(
    (event) => {
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (data.type === 'MOVE_START') {
        setMoving(true);
        animatePin(true);
        return;
      }

      if (data.type === 'MOVE_END' || data.type === 'READY') {
        setMoving(false);
        animatePin(false);
        setCoords({ latitude: data.lat, longitude: data.lng });
        dispatch(setLatitude(data.lat));
        dispatch(setLongitude(data.lng));
      }
    },
    [animatePin, dispatch]
  );

  // ژئوکدینگِ معکوس، با تاخیر تا نقشه آرام بگیرد.
  useEffect(() => {
    if (!coords || !searchEnabled) return undefined;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      setResolving(true);
      const result = await reverseGeocode(coords.latitude, coords.longitude);
      if (cancelled) return;
      setResolved(result);
      setResolving(false);
      if (result && typeof onResolvedAddress === 'function') {
        onResolvedAddress({ ...result, ...coords });
      }
    }, REVERSE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coords, searchEnabled, onResolvedAddress]);

  // جست‌وجو، با تاخیر تا هر حرف یک درخواست نسازد.
  useEffect(() => {
    if (!searchEnabled) return undefined;
    const term = searchTerm.trim();

    // زیرِ دو حرف اصلاً درخواستی نمی‌رود. پاک کردنِ نتایج اینجا لازم نیست —
    // رندر خودش روی `hasQuery` گیت شده است، پس setState در بدنه‌ی افکت نداریم.
    if (term.length < 2) return undefined;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      setSearching(true);
      const items = await searchPlaces(term, coords || initialCenter);
      if (cancelled) return;
      setResults(items);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, searchEnabled, coords, initialCenter]);

  const flyTo = useCallback((latitude, longitude, zoom = 17) => {
    webViewRef.current?.injectJavaScript(
      `window.moveToLocation && window.moveToLocation(${latitude}, ${longitude}, ${zoom}); true;`
    );
  }, []);

  const pickResult = useCallback(
    (item) => {
      Keyboard.dismiss();
      setSearchOpen(false);
      setSearchTerm(item.title);
      setResults([]);
      flyTo(item.latitude, item.longitude);
    },
    [flyTo]
  );

  const getLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToastOrAlert(t('You have denied Loop access to your location!'));
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      flyTo(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.warn('[NeshanMap] location error:', error?.message);
      showToastOrAlert(t('To access your current location, you must turn on your location.'));
    } finally {
      setLocating(false);
    }
  }, [flyTo, t]);

  const handleConfirm = useCallback(() => {
    if (!coords) {
      showToastOrAlert(t('Please find your desired location correctly on the map.'));
      return;
    }
    if (!inServiceArea) {
      showToastOrAlert(t('Please select a location within the specified area!'));
      return;
    }
    submitAddress?.();
  }, [coords, inServiceArea, submitAddress, t]);

  // متنِ کارتِ پایین: آدرسِ ژئوکدشده، وگرنه مختصات.
  const addressLine = (() => {
    if (moving) return 'در حال جابه‌جایی نقشه…';
    if (resolving) return 'در حال یافتن آدرس…';
    if (resolved?.formatted) return resolved.formatted;
    if (coords) {
      return `${coords.latitude.toFixed(5)} , ${coords.longitude.toFixed(5)}`;
    }
    return 'نقشه را حرکت دهید تا موقعیت انتخاب شود';
  })();

  return (
    <View style={styles.root}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        onMessage={onMessage}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={colors.primary.bgColor(1)} />
          </View>
        )}
      />

      {/* ---------- نوار جست‌وجو ----------
          مسیرِ «Map» در routes.js هدرِ خودش را دارد، پس ناحیه‌ی امنِ بالا
          قبلاً مصرف شده و نباید دوباره به searchWrap اضافه شود. */}
      {searchEnabled && (
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={18}
              color={colors.textSecondary.bgColor(1)}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              onFocus={() => setSearchOpen(true)}
              placeholder="جست‌وجوی خیابان، محله یا مرکز خرید"
              placeholderTextColor={colors.textMuted.bgColor(1)}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searching && hasQuery ? (
              <ActivityIndicator size="small" color={colors.primary.bgColor(1)} />
            ) : searchTerm.length > 0 ? (
              <Pressable
                onPress={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted.bgColor(1)} />
              </Pressable>
            ) : null}
          </View>

          {searchOpen && hasQuery && results.length > 0 && (
            <View style={styles.resultsCard}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <Pressable style={styles.resultRow} onPress={() => pickResult(item)}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={colors.primary.bgColor(1)}
                    />
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!!item.subtitle && (
                        <Text style={styles.resultSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>
      )}

      {/* ---------- پینِ مرکز ---------- */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <Animated.View style={{ transform: [{ translateY: pinLift }] }}>
          <MarkerIcon />
        </Animated.View>
        <View style={styles.pinShadow} />
      </View>

      {/* ---------- کارتِ پایین ---------- */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(footerSpace || 0, insets.bottom, spacing.lg) },
        ]}
      >
        <Pressable
          style={[styles.locateBtn, locating && styles.locateBtnBusy]}
          onPress={getLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary.bgColor(1)} />
          ) : (
            <Ionicons name="locate" size={22} color={colors.primary.bgColor(1)} />
          )}
        </Pressable>

        <View style={styles.sheetCard}>
          <View style={styles.grabber} />

          <View style={styles.addressRow}>
            <View style={[styles.addressBadge, !inServiceArea && styles.addressBadgeError]}>
              <Ionicons
                name={inServiceArea ? 'location' : 'alert-circle'}
                size={18}
                color={colors.white.bgColor(1)}
              />
            </View>
            <View style={styles.addressTextWrap}>
              <Text style={styles.addressLabel}>موقعیت انتخاب‌شده</Text>
              <Text style={styles.addressValue} numberOfLines={2}>
                {addressLine}
              </Text>
            </View>
          </View>

          {!!serviceArea && !inServiceArea && coords && (
            <View style={styles.warning}>
              <Ionicons name="warning-outline" size={15} color={colors.error.bgColor(1)} />
              <Text style={styles.warningText}>
                این نقطه خارج از محدوده‌ی سرویس‌دهی است. نقشه را داخل دایره‌ی آبی ببرید.
              </Text>
            </View>
          )}

          <Button
            title={confirmLabel || t('Confirm')}
            loading={loading}
            disabled={loading || moving || !coords || !inServiceArea}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (isRTL) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background.bgColor(1),
    },
    map: {
      flex: 1,
    },
    mapLoading: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.bgColor(1),
    },

    // ---- جست‌وجو ----
    searchWrap: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.lg,
      right: spacing.lg,
    },
    searchBar: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface.bgColor(1),
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      height: 48,
      ...shadow.md,
    },
    searchIcon: {
      opacity: 0.9,
    },
    searchInput: {
      flex: 1,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
      color: colors.textPrimary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
      // اندروید به‌طور پیش‌فرض padding عمودی به TextInput می‌دهد و متن را کج می‌کند.
      paddingVertical: 0,
    },
    resultsCard: {
      marginTop: spacing.sm,
      backgroundColor: colors.surface.bgColor(1),
      borderRadius: radius.md,
      maxHeight: 260,
      overflow: 'hidden',
      ...shadow.md,
    },
    resultRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    resultText: {
      flex: 1,
    },
    resultTitle: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', isRTL ? 'fa' : 'en'),
      color: colors.textPrimary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    resultSubtitle: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
      color: colors.textSecondary.color,
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    separator: {
      height: 1,
      backgroundColor: colors.divider.bgColor(1),
      marginHorizontal: spacing.lg,
    },

    // ---- پین ----
    pinWrap: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -24,
      marginTop: -48,
      alignItems: 'center',
    },
    pinShadow: {
      width: 12,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.black.bgColor(0.25),
      marginTop: 2,
    },

    // ---- کارتِ پایین ----
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.lg,
    },
    locateBtn: {
      alignSelf: isRTL ? 'flex-start' : 'flex-end',
      width: 46,
      height: 46,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface.bgColor(1),
      marginBottom: spacing.md,
      ...shadow.md,
    },
    locateBtnBusy: {
      opacity: 0.7,
    },
    sheetCard: {
      backgroundColor: colors.surface.bgColor(1),
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      gap: spacing.md,
      ...shadow.lg,
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.divider.bgColor(1),
      marginBottom: spacing.xs,
    },
    addressRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    addressBadge: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.bgColor(1),
    },
    addressBadgeError: {
      backgroundColor: colors.error.bgColor(1),
    },
    addressTextWrap: {
      flex: 1,
    },
    addressLabel: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
      color: colors.textSecondary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    addressValue: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', isRTL ? 'fa' : 'en'),
      color: colors.textPrimary.color,
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    warning: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.error.bgColor(0.1),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    warningText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
      color: colors.error.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
  });
