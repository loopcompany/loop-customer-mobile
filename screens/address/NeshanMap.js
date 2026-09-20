// انتخاب موقعیت روی نقشه‌ی نشان.
//
// این کامپوننت هیچ چیزی را ذخیره یا ثبت نمی‌کند: نقطه را می‌گیرد و با
// `onConfirm` به والد می‌دهد. همه‌ی کارِ Redux و سرور در صفحه‌ی والد است.
//
// خودِ نقشه در `@components/NeshanCanvas` است (نیتیو: WebView، وب: لِفلِت)،
// پس این صفحه روی هر دو سکو یکی است. قبلاً وب یک صفحه‌ی جداگانه داشت که نه
// جست‌وجو داشت نه ژئوکدینگ.
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
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMenu } from '@contexts/MenuContext';

import Button from '@components/Button';
import NeshanCanvas from '@components/NeshanCanvas';
import MarkerIcon from '@assets/svg/MarkerIcon';
import { langIsRTL, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import {
  DEFAULT_CENTER,
  distanceInMeters,
  hasNeshanServiceKey,
  searchPlaces,
} from '@services/neshan';
import { isReverseGeocodeAvailable, resolvePoint } from '@services/geocoding';

const REVERSE_DEBOUNCE_MS = 500;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * @param {object} props
 * @param {(picked: {latitude: number, longitude: number, resolved: object|null}) => void} props.onConfirm
 *   نقطه‌ی تاییدشده. تا وقتی کاربر دکمه را نزده هیچ چیزی به بیرون نشت نمی‌کند —
 *   نسخه‌ی قبلی روی هر `moveend` (و حتی روی بالا آمدنِ نقشه) مختصات را در Redux
 *   می‌نوشت، پس بازکردن و بستنِ نقشه هم «موقعیت انتخاب شد» حساب می‌شد.
 * @param {boolean} [props.loading]                   وضعیتِ ارسالِ والد
 * @param {object} [props.radii]                      {latitude, longitude, radius} محدوده‌ی سرویس
 * @param {{latitude: number, longitude: number}} [props.initialCoords]
 *   نقطه‌ای که قبلاً انتخاب شده؛ نقشه روی همان باز می‌شود نه روی مرکزِ شهر.
 * @param {string} [props.confirmLabel]
 */
export default function NeshanMap({
  onConfirm,
  loading = false,
  radii,
  initialCoords,
  confirmLabel,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const insets = useSafeAreaInsets();
  // داکِ شناورِ پایین صفحه روی همه‌ی صفحات رندر می‌شود؛ بدون این فاصله،
  // دکمه‌ی «تایید» زیرِ آن پنهان می‌ماند.
  const { footerSpace } = useMenu();
  const canvasRef = useRef(null);

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
  // ژئوکدینگِ معکوس حتی بدونِ کلیدِ نشان هم کار می‌کند (ژئوکدرِ سیستم‌عامل)،
  // ولی جست‌وجو فقط با کلید.
  const reverseEnabled = isReverseGeocodeAvailable();
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

  // اگر کاربر قبلاً نقطه‌ای انتخاب کرده، نقشه همان‌جا باز می‌شود؛ وگرنه مرکزِ
  // محدوده‌ی سرویس و در نهایت مرکزِ پیش‌فرض.
  const pickedLatitude = initialCoords?.latitude;
  const pickedLongitude = initialCoords?.longitude;
  const initialCenter = useMemo(() => {
    if (Number.isFinite(pickedLatitude) && Number.isFinite(pickedLongitude)) {
      return { latitude: pickedLatitude, longitude: pickedLongitude };
    }
    return serviceArea || DEFAULT_CENTER;
  }, [pickedLatitude, pickedLongitude, serviceArea]);

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

  const handleMoveStart = useCallback(() => {
    setMoving(true);
    animatePin(true);
  }, [animatePin]);

  const handleSettled = useCallback(
    ({ latitude, longitude }) => {
      setMoving(false);
      animatePin(false);
      setCoords({ latitude, longitude });
    },
    [animatePin]
  );

  // ژئوکدینگِ معکوس، با تاخیر تا نقشه آرام بگیرد.
  useEffect(() => {
    if (!coords || !reverseEnabled) return undefined;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      setResolving(true);
      const result = await resolvePoint(coords.latitude, coords.longitude);
      if (cancelled) return;
      setResolved(result);
      setResolving(false);
    }, REVERSE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coords, reverseEnabled]);

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
    canvasRef.current?.flyTo(latitude, longitude, zoom);
  }, []);

  // محدوده‌ی سرویس با تاخیر از سرور می‌رسد. اگر نقطه‌ای از قبل انتخاب نشده،
  // نقشه همان لحظه روی مرکزِ محدوده می‌رود — وگرنه کاربر از مرکزِ پیش‌فرضِ
  // کشور شروع می‌کند و باید دستی تا شهرِ خودش بکشد.
  const centredOnService = useRef(false);
  useEffect(() => {
    if (!serviceArea || centredOnService.current) return;
    if (Number.isFinite(pickedLatitude) && Number.isFinite(pickedLongitude)) return;
    centredOnService.current = true;
    flyTo(serviceArea.latitude, serviceArea.longitude, 15);
  }, [flyTo, pickedLatitude, pickedLongitude, serviceArea]);

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
    // `resolved` می‌تواند null باشد (بدونِ کلید/بدونِ اینترنت)؛ والد در آن حالت
    // فقط مختصات را می‌گیرد و کاربر آدرس را خودش می‌نویسد.
    onConfirm?.({ ...coords, resolved });
  }, [coords, inServiceArea, onConfirm, resolved, t]);

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
      <NeshanCanvas
        ref={canvasRef}
        initialCenter={initialCenter}
        zoom={15}
        serviceArea={serviceArea}
        onMoveStart={handleMoveStart}
        onMoveEnd={handleSettled}
        onReady={handleSettled}
        style={styles.map}
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

          {/* وقتی آدرسِ متنی در دسترس نیست کاربر باید بداند که باید خودش
              بنویسد — وگرنه فکر می‌کند صفحه خراب است. */}
          {!reverseEnabled && !!coords && (
            <Text style={styles.hint}>آدرسِ خودکار در دسترس نیست؛ متنِ آدرس را در فرم بنویسید.</Text>
          )}
          {reverseEnabled && !!resolved?.formatted && (
            <Text style={styles.hint}>این آدرس در فرم پر می‌شود و قابل ویرایش است.</Text>
          )}

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
    hint: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
      color: colors.textMuted.color,
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
