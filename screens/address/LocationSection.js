// بخشِ «موقعیت روی نقشه» در بالای فرمِ آدرس.
//
// قبلاً اینجا فقط یک کارتِ متنی بود که به صفحه‌ی دیگری می‌رفت؛ کاربر تا وقتی
// فرم را ترک نمی‌کرد هیچ نقشه‌ای نمی‌دید. حالا خودِ نقشه اینجاست: پین در مرکز،
// آدرسِ همان نقطه زیرِ آن، دکمه‌ی «موقعیت من» و دکمه‌ی تمام‌صفحه (که انتخابگرِ
// کامل با جست‌وجو را باز می‌کند).
//
// دو نکته‌ی رفتاری که عمدی‌اند:
//
//   • نقشه در حالتِ قفل باز می‌شود. یک نقشه‌ی کشیدنی داخلِ یک فرمِ اسکرول‌شونده
//     ژستِ عمودیِ کاربر را می‌دزدد؛ با یک ضربه باز می‌شود و تا وقتی باز است
//     اسکرولِ فرم خاموش می‌ماند (`onActiveChange`).
//   • باز شدنِ نقشه به‌تنهایی «انتخابِ موقعیت» نیست. مختصات فقط وقتی در Redux
//     می‌نشیند که کاربر نقشه را کشیده باشد، موقعیتِ خودش را گرفته باشد، یا در
//     صفحه‌ی تمام‌صفحه تایید کرده باشد — وگرنه مرکزِ پیش‌فرضِ شهر به‌عنوان
//     آدرسِ خانه‌ی کاربر ثبت می‌شد.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NeshanCanvas from '@components/NeshanCanvas';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import { langIsRTL, showToastOrAlert } from '@helpers/Common';
import { DEFAULT_CENTER, distanceInMeters } from '@services/neshan';
import { isReverseGeocodeAvailable, resolvePoint } from '@services/geocoding';
import { setAddressFields, setLocation } from '@slices/addressSlice';
import { mapFillPatch } from '@utils/addressForm';

const REVERSE_DEBOUNCE_MS = 600;
const MAP_HEIGHT = 230;

/** دو نقطه عملاً یکی‌اند؟ (حدودِ ۱۰ سانتی‌متر) */
const samePoint = (a, b) =>
  !!a &&
  !!b &&
  Math.abs(a.latitude - b.latitude) < 1e-6 &&
  Math.abs(a.longitude - b.longitude) < 1e-6;

/**
 * @param {object} props
 * @param {() => void} props.onOpenFullScreen بازکردنِ انتخابگرِ تمام‌صفحه.
 * @param {(active: boolean) => void} [props.onActiveChange] نقشه باز/قفل شد.
 * @param {string} [props.error] خطای اعتبارسنجیِ «موقعیت».
 */
export default function LocationSection({ onOpenFullScreen, onActiveChange, error }) {
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const styles = useMemo(() => createStyles(i18n.language, isRTL), [i18n.language, isRTL]);

  const dispatch = useDispatch();
  const address = useSelector((state) => state?.address);
  const radiusData = useSelector((state) => state?.radius?.data);

  const canvasRef = useRef(null);
  // وقتی خودمان نقشه را جابه‌جا می‌کنیم (موقعیتِ من)، پایانِ همان حرکت باید
  // «انتخابِ کاربر» شمرده شود.
  const claimNextMove = useRef(false);

  const [coords, setCoords] = useState(null);
  const [moving, setMoving] = useState(false);
  const [active, setActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(null);

  const picked = Boolean(address?.locationPicked);

  const radii = useMemo(
    () => (Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData),
    [radiusData]
  );

  const serviceArea = useMemo(() => {
    const latitude = parseFloat(radii?.latitude);
    const longitude = parseFloat(radii?.longitude);
    const rad = parseFloat(radii?.radius);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(rad) ||
      rad <= 0
    ) {
      return null;
    }
    return { latitude, longitude, radius: rad };
  }, [radii]);

  // بدونِ محدوده‌ی تعریف‌شده هر نقطه‌ای مجاز است.
  const inServiceArea = useMemo(() => {
    if (!coords || !serviceArea) return true;
    return (
      distanceInMeters(
        serviceArea.latitude,
        serviceArea.longitude,
        coords.latitude,
        coords.longitude
      ) <= serviceArea.radius
    );
  }, [coords, serviceArea]);

  // مرکزِ اولیه: نقطه‌ی قبلی → مرکزِ محدوده‌ی سرویس → مرکزِ پیش‌فرض. فقط در
  // نخستین رندر خوانده می‌شود؛ بقیه‌ی جابه‌جایی‌ها با `flyTo` انجام می‌شود.
  const [initialCenter] = useState(() =>
    Number.isFinite(address?.latitude) && Number.isFinite(address?.longitude)
      ? { latitude: address.latitude, longitude: address.longitude }
      : DEFAULT_CENTER
  );

  // محدوده‌ی سرویس با تاخیر می‌آید: اگر تا آن لحظه کاربر نقطه‌ای انتخاب نکرده،
  // نقشه روی مرکزِ سرویس می‌رود تا کاربر از وسطِ دریا شروع نکند.
  const centredOnService = useRef(false);
  useEffect(() => {
    if (!serviceArea || centredOnService.current || picked) return;
    centredOnService.current = true;
    canvasRef.current?.flyTo(serviceArea.latitude, serviceArea.longitude, 15);
  }, [picked, serviceArea]);

  // برگشت از انتخابگرِ تمام‌صفحه: نقشه‌ی داخلِ فرم باید همان نقطه را نشان دهد.
  useEffect(() => {
    if (!Number.isFinite(address?.latitude) || !Number.isFinite(address?.longitude)) return;
    const target = { latitude: address.latitude, longitude: address.longitude };
    if (samePoint(target, coords)) return;
    canvasRef.current?.flyTo(target.latitude, target.longitude, 17);
    // `coords` عمداً وابستگی نیست: با هر حرکتِ نقشه عوض می‌شود و این افکت را
    // به یک حلقه‌ی پرواز-به-نقطه تبدیل می‌کند.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address?.latitude, address?.longitude]);

  const setActiveAndReport = useCallback(
    (next) => {
      setActive(next);
      onActiveChange?.(next);
    },
    [onActiveChange]
  );

  const handleMoveEnd = useCallback(
    ({ latitude, longitude, user }) => {
      setMoving(false);
      setCoords({ latitude, longitude });

      if (user || claimNextMove.current) {
        claimNextMove.current = false;
        dispatch(setLocation({ latitude, longitude }));
      }
    },
    [dispatch]
  );

  const handleReady = useCallback(({ latitude, longitude }) => {
    setCoords({ latitude, longitude });
  }, []);

  const handleMoveStart = useCallback(() => setMoving(true), []);

  // ژئوکدینگِ معکوس فقط برای نقطه‌ای که کاربر واقعاً انتخاب کرده.
  useEffect(() => {
    if (!coords || !picked || !isReverseGeocodeAvailable()) return undefined;

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
  }, [coords, picked]);

  // نتیجه‌ی ژئوکدینگ در فرم می‌نشیند (فقط جاهای خالی و متنِ قبلیِ نقشه).
  //
  // فرمِ فعلی از راهِ ref خوانده می‌شود تا وابستگیِ افکت نشود؛ وگرنه هر حرفی که
  // کاربر در فیلدِ آدرس می‌زند این افکت را دوباره اجرا می‌کرد و نوشته‌اش را با
  // نتیجه‌ی ژئوکدینگ عوض می‌کرد.
  const addressRef = useRef(address);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    if (!resolved) return;
    const patch = mapFillPatch(addressRef.current, resolved);
    if (Object.keys(patch).length > 0) dispatch(setAddressFields(patch));
  }, [dispatch, resolved]);

  const locateMe = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToastOrAlert(t('You have denied Loop access to your location!'));
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // این جابه‌جایی به‌حسابِ انتخابِ کاربر نوشته می‌شود.
      claimNextMove.current = true;
      canvasRef.current?.flyTo(position.coords.latitude, position.coords.longitude, 17);
    } catch (locationError) {
      console.warn('[LocationSection] location error:', locationError?.message);
      showToastOrAlert(t('To access your current location, you must turn on your location.'));
    } finally {
      setLocating(false);
    }
  }, [t]);

  const statusLine = (() => {
    if (moving) return 'در حال جابه‌جایی نقشه…';
    if (!picked) return 'نقشه را روی محلِ دقیق ببرید';
    if (resolving) return 'در حال یافتن آدرس…';
    if (resolved?.formatted) return resolved.formatted;
    if (coords) return `${coords.latitude.toFixed(5)} , ${coords.longitude.toFixed(5)}`;
    return 'نقشه را روی محلِ دقیق ببرید';
  })();

  const tone = !picked ? colors.textMuted : inServiceArea ? colors.success : colors.error;

  return (
    <View style={[styles.card, !!error && styles.cardError]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="map" size={16} color={colors.primary.bgColor(1)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('Location on map')}</Text>
          <Text style={styles.subtitle}>آدرس، منطقه و شهر از همین نقطه پر می‌شوند</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: tone.bgColor(0.12) }]}>
          <Ionicons
            name={picked ? (inServiceArea ? 'checkmark-circle' : 'alert-circle') : 'ellipse-outline'}
            size={13}
            color={tone.bgColor(1)}
          />
          <Text style={[styles.badgeText, { color: tone.color }]}>
            {picked ? (inServiceArea ? t('Selected') : t('Out of range')) : t('Not selected')}
          </Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <NeshanCanvas
          ref={canvasRef}
          initialCenter={initialCenter}
          zoom={picked ? 17 : 14}
          serviceArea={serviceArea}
          interactive={active}
          onMoveStart={handleMoveStart}
          onMoveEnd={handleMoveEnd}
          onReady={handleReady}
          style={StyleSheet.absoluteFill}
        />

        {/* پینِ مرکز */}
        <View pointerEvents="none" style={styles.pinWrap}>
          <Ionicons
            name="location"
            size={40}
            color={picked && !inServiceArea ? colors.error.bgColor(1) : colors.primary.bgColor(1)}
            style={moving ? styles.pinLifted : undefined}
          />
          <View style={styles.pinShadow} />
        </View>

        {/* لایه‌ی قفل: تا ضربه نزنی نقشه حرکت نمی‌کند و اسکرولِ فرم سالم می‌ماند */}
        {!active && (
          <Pressable
            testID="map-unlock"
            style={styles.lock}
            onPress={() => setActiveAndReport(true)}
            accessibilityRole="button"
          >
            <View style={styles.lockChip}>
              <Ionicons name="hand-left-outline" size={14} color={colors.textPrimary.color} />
              <Text style={styles.lockChipText}>{t('Tap to move the map')}</Text>
            </View>
          </Pressable>
        )}

        {active && (
          <Pressable
            style={[styles.doneChip, isRTL ? styles.chipStart : styles.chipEnd]}
            onPress={() => setActiveAndReport(false)}
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={14} color={colors.white.bgColor(1)} />
            <Text style={styles.doneChipText}>{t('Done')}</Text>
          </Pressable>
        )}

        {/* دکمه‌های شناور */}
        <View style={[styles.fabColumn, isRTL ? styles.fabStart : styles.fabEnd]}>
          <Pressable
            testID="map-locate-me"
            style={styles.fab}
            onPress={locateMe}
            disabled={locating}
            accessibilityRole="button"
            accessibilityLabel={t('My location')}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary.bgColor(1)} />
            ) : (
              <Ionicons name="locate" size={18} color={colors.primary.bgColor(1)} />
            )}
          </Pressable>

          <Pressable
            testID="map-fullscreen"
            style={styles.fab}
            onPress={onOpenFullScreen}
            accessibilityRole="button"
            accessibilityLabel={t('Search on the map')}
          >
            <Ionicons name="search" size={18} color={colors.primary.bgColor(1)} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusIcon, { backgroundColor: tone.bgColor(1) }]}>
          <Ionicons name="navigate" size={14} color={colors.white.bgColor(1)} />
        </View>
        <Text style={styles.statusText} numberOfLines={2}>
          {statusLine}
        </Text>
      </View>

      {picked && !inServiceArea && (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={15} color={colors.error.bgColor(1)} />
          <Text style={styles.warningText}>
            این نقطه خارج از محدوده‌ی سرویس‌دهی است. نقشه را داخل دایره‌ی آبی ببرید.
          </Text>
        </View>
      )}

      {!!error && (
        <View style={styles.warning}>
          <Ionicons name="alert-circle" size={15} color={colors.error.bgColor(1)} />
          <Text style={styles.warningText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (lang, isRTL) => {
  const align = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface.bgColor(1),
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.bgColor(0.5),
      padding: spacing.md,
      gap: spacing.md,
      ...shadow.sm,
    },
    cardError: {
      borderColor: colors.error.bgColor(0.8),
    },
    header: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerIcon: {
      width: 30,
      height: 30,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.bgColor(0.1),
    },
    title: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      ...align,
    },
    subtitle: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textMuted.color,
      marginTop: 1,
      ...align,
    },
    badge: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: 3,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
    },

    mapWrap: {
      height: MAP_HEIGHT,
      borderRadius: radius.md,
      overflow: 'hidden',
      backgroundColor: colors.background.bgColor(1),
      borderWidth: 1,
      borderColor: colors.border.bgColor(0.6),
    },
    pinWrap: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -38,
      alignItems: 'center',
    },
    pinLifted: {
      transform: [{ translateY: -6 }],
    },
    pinShadow: {
      width: 10,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.black.bgColor(0.25),
      marginTop: -2,
    },

    lock: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: spacing.md,
      backgroundColor: colors.black.bgColor(0.04),
    },
    lockChip: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.surface.bgColor(0.95),
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      ...shadow.sm,
    },
    lockChipText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textPrimary.color,
    },
    doneChip: {
      position: 'absolute',
      top: spacing.sm,
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.success.bgColor(1),
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      ...shadow.sm,
    },
    doneChipText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.white.color,
    },
    chipStart: { left: spacing.sm },
    chipEnd: { right: spacing.sm },

    fabColumn: {
      position: 'absolute',
      bottom: spacing.sm,
      gap: spacing.sm,
    },
    fabStart: { left: spacing.sm },
    fabEnd: { right: spacing.sm },
    fab: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface.bgColor(0.95),
      ...shadow.md,
    },

    statusRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.sm,
    },
    statusIcon: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      ...align,
    },

    warning: {
      flexDirection: rowDir,
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
      fontFamily: getFontFamily('light', lang),
      color: colors.error.color,
      ...align,
    },
  });
};
