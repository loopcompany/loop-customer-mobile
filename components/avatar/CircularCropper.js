// برش دایره‌ای عکس پروفایل (بند ۱۲: «برش بصورت گرد باشه و نه مربع»).
//
// برش‌دهنده‌ی خود expo-image-picker (allowsEditing) فقط کادر مربع دارد. این
// صفحه عکس را زیر یک ماسک دایره‌ای نشان می‌دهد؛ کاربر با یک انگشت جابه‌جا و با
// دو انگشت (یا دکمه‌های +/− روی وب) بزرگ‌نمایی می‌کند. خروجی یک تصویر مربع
// ۵۱۲×۵۱۲ است که دایره‌ی انتخابی دقیقاً داخل آن است و همه‌جا گرد نمایش داده می‌شود.
//
// فقط PanResponder هسته‌ی React Native استفاده شده (reanimated/gesture-handler در
// اپ راه‌اندازی نشده‌اند) تا روی وب و موبایل یکسان کار کند.
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  Platform,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clamp,
  clampOffset,
  cropRect,
  displaySize,
  touchDistance,
} from './cropMath';

const OUTPUT_SIZE = 512;
const ZOOM_STEP = 0.25;
// پهنای حاشیه‌ی تیره‌ی دور دایره؛ باید از نصف قطر کادر بزرگ‌تر باشد تا گوشه‌ها را بپوشاند.
const MASK_BORDER = 400;

/**
 * @param {{
 *   visible: boolean,
 *   image: { uri: string, width?: number, height?: number } | null,
 *   onCancel: () => void,
 *   onDone: (result: { uri: string, width: number, height: number }) => void,
 * }} props
 */
const CircularCropper = ({ visible, image, onCancel, onDone }) => {
  const { t, i18n } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const viewport = Math.min(windowWidth - spacing.xxxl, 360);

  // این کامپوننت فقط وقتی عکسی برای برش هست mount می‌شود (ProfilePhotoEditor)،
  // پس هر عکس تازه با حالت صفر شروع می‌شود.
  const knownSize =
    image?.width && image?.height ? { width: image.width, height: image.height } : null;
  const [size, setSize] = useState(knownSize); // ابعاد واقعی عکس
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ tx: 0, ty: 0 });
  const [saving, setSaving] = useState(false);

  // مقادیر لحظه‌ای برای PanResponder (که یک بار ساخته می‌شود).
  const live = useRef({ zoom: MIN_ZOOM, tx: 0, ty: 0 });
  const gestureStart = useRef(null);
  const sizeRef = useRef(knownSize);
  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // ابعاد نامعلوم (مثلاً روی وب): از خود عکس خوانده می‌شود.
  const needsMeasure = !knownSize;
  const imageUri = image?.uri;
  useEffect(() => {
    if (!needsMeasure || !imageUri) return undefined;
    let cancelled = false;
    const apply = (w, h) => {
      if (cancelled || !w || !h) return;
      sizeRef.current = { width: w, height: h };
      setSize({ width: w, height: h });
    };
    Image.getSize(imageUri, apply, () => apply(OUTPUT_SIZE, OUTPUT_SIZE));
    return () => {
      cancelled = true;
    };
  }, [needsMeasure, imageUri]);

  const update = (nextZoom, tx, ty) => {
    const dims = sizeRef.current;
    if (!dims) return;
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const clamped = clampOffset({
      imageWidth: dims.width,
      imageHeight: dims.height,
      viewport: viewportRef.current,
      zoom: z,
      tx,
      ty,
    });
    live.current = { zoom: z, ...clamped };
    setZoom(z);
    setOffset(clamped);
  };

  // یک بار ساخته می‌شود؛ مقادیر لحظه‌ای از ref خوانده می‌شوند.
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const touches = event.nativeEvent.touches;
        gestureStart.current = { ...live.current, distance: touchDistance(touches) };
      },
      onPanResponderMove: (event, gesture) => {
        const start = gestureStart.current;
        if (!start) return;
        const touches = event.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const distance = touchDistance(touches);
          // انگشت دوم وسط حرکت اضافه شد: مبدأ pinch همین لحظه است.
          if (!start.distance) {
            gestureStart.current = { ...live.current, distance, dx: gesture.dx, dy: gesture.dy };
            return;
          }
          update((start.zoom * distance) / start.distance, live.current.tx, live.current.ty);
          return;
        }
        // از pinch به یک انگشت برگشت: حرکت از همین نقطه ادامه پیدا کند، نه از شروع.
        if (start.distance) {
          gestureStart.current = { ...live.current, distance: 0, dx: gesture.dx, dy: gesture.dy };
          return;
        }
        update(
          start.zoom,
          start.tx + gesture.dx - (start.dx || 0),
          start.ty + gesture.dy - (start.dy || 0)
        );
      },
      onPanResponderRelease: () => {
        gestureStart.current = null;
      },
      onPanResponderTerminate: () => {
        gestureStart.current = null;
      },
    })
  );

  const confirm = async () => {
    if (!size || !image?.uri) return;
    setSaving(true);
    try {
      const rect = cropRect({
        imageWidth: size.width,
        imageHeight: size.height,
        viewport,
        zoom,
        tx: offset.tx,
        ty: offset.ty,
      });
      const context = ImageManipulator.manipulate(image.uri);
      context.crop(rect).resize({ width: OUTPUT_SIZE, height: OUTPUT_SIZE });
      const rendered = await context.renderAsync();
      const result = await rendered.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
      onDone({ uri: result.uri, width: result.width, height: result.height });
    } catch (error) {
      console.warn('[CircularCropper] crop failed', error?.message);
      // اگر برش ممکن نشد، همان عکس اصلی برگردانده می‌شود (باز هم گرد نمایش داده می‌شود).
      onDone({ uri: image.uri, width: size.width, height: size.height });
    } finally {
      setSaving(false);
    }
  };

  const display = size
    ? displaySize({ imageWidth: size.width, imageHeight: size.height, viewport, zoom })
    : null;
  const font = (weight) => getFontFamily(weight, i18n.language);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.black.color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: colors.white.color,
            fontFamily: font('bold'),
            fontSize: fontSize.md,
            marginBottom: spacing.lg,
          }}
        >
          {t('Move and zoom to fit the circle')}
        </Text>

        <View
          {...responder.panHandlers}
          style={{
            width: viewport,
            height: viewport,
            overflow: 'hidden',
            backgroundColor: colors.black.color,
          }}
        >
          {display ? (
            <Image
              source={{ uri: image.uri }}
              style={{
                position: 'absolute',
                width: display.width,
                height: display.height,
                left: (viewport - display.width) / 2 + offset.tx,
                top: (viewport - display.height) / 2 + offset.ty,
              }}
            />
          ) : (
            <ActivityIndicator
              color={colors.white.color}
              style={{ marginTop: viewport / 2 - 10 }}
            />
          )}
          {/* ماسک دایره‌ای: گوشه‌های بیرون دایره تیره می‌شوند. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: -MASK_BORDER,
              top: -MASK_BORDER,
              width: viewport + MASK_BORDER * 2,
              height: viewport + MASK_BORDER * 2,
              borderRadius: (viewport + MASK_BORDER * 2) / 2,
              borderWidth: MASK_BORDER,
              borderColor: colors.overlay.bgColor(0.65),
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: viewport,
              height: viewport,
              borderRadius: viewport / 2,
              borderWidth: 2,
              borderColor: colors.white.bgColor(0.9),
            }}
          />
        </View>

        {/* بزرگ‌نمایی با دکمه - روی وب pinch در دسترس نیست. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xl,
            marginTop: spacing.lg,
          }}
        >
          <TouchableOpacity
            accessibilityLabel={t('Zoom out')}
            onPress={() => update(zoom - ZOOM_STEP, offset.tx, offset.ty)}
            disabled={zoom <= MIN_ZOOM}
            style={{ opacity: zoom <= MIN_ZOOM ? 0.4 : 1 }}
          >
            <Ionicons name="remove-circle-outline" size={36} color={colors.white.color} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.white.color,
              fontFamily: font('regular'),
              fontSize: fontSize.sm,
              minWidth: 48,
              textAlign: 'center',
            }}
          >
            {`${Math.round(zoom * 100)}%`}
          </Text>
          <TouchableOpacity
            accessibilityLabel={t('Zoom in')}
            onPress={() => update(zoom + ZOOM_STEP, offset.tx, offset.ty)}
            disabled={zoom >= MAX_ZOOM}
            style={{ opacity: zoom >= MAX_ZOOM ? 0.4 : 1 }}
          >
            <Ionicons name="add-circle-outline" size={36} color={colors.white.color} />
          </TouchableOpacity>
        </View>

        <View
          style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl, width: viewport }}
        >
          <TouchableOpacity
            onPress={onCancel}
            disabled={saving}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: colors.white.bgColor(0.6),
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: colors.white.color, fontFamily: font('bold'), fontSize: fontSize.sm }}
            >
              {t('Cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirm}
            disabled={saving || !size}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              borderRadius: radius.sm,
              backgroundColor: colors.primary.bgColor(1),
              alignItems: 'center',
              opacity: saving || !size ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={colors.white.color} />
            ) : (
              <Text
                style={{
                  color: colors.white.color,
                  fontFamily: font('bold'),
                  fontSize: fontSize.sm,
                }}
              >
                {t('Confirm')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {Platform.OS === 'web' ? (
          <Text
            style={{
              color: colors.white.bgColor(0.6),
              fontFamily: font('regular'),
              fontSize: fontSize.xs,
              marginTop: spacing.md,
            }}
          >
            {t('Drag the photo to move it; use + and − to zoom.')}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
};

export default CircularCropper;
