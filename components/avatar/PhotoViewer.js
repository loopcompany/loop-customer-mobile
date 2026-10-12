// نمایش تمام‌صفحه‌ی عکس پروفایل، مثل تلگرام (بند ۱۲).
//
// زمینه‌ی سیاه، عکس کامل؛ دو انگشت = بزرگ‌نمایی، دو ضربه = بزرگ/کوچک، کشیدن به
// پایین (وقتی بزرگ‌نمایی نشده) = بستن. روی وب دکمه‌ی بستن و کلید Esc هم هست.
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { clamp, touchDistance } from './cropMath';

const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 280;
const CLOSE_DISTANCE = 120;

const PhotoViewer = ({ visible, uri, onClose }) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dismissY] = useState(() => new Animated.Value(0));

  const live = useRef({ scale: 1, x: 0, y: 0 });
  const start = useRef(null);
  const lastTap = useRef(0);
  // این کامپوننت فقط وقتی باز است mount می‌شود، پس همیشه از حالت بزرگ‌نمایی‌نشده شروع می‌کند.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Esc روی وب
  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const apply = (nextScale, x, y) => {
    const s = clamp(nextScale, 1, MAX_SCALE);
    // جابه‌جایی فقط در حدی که عکس بزرگ‌شده از صفحه بیرون نزند.
    const maxX = ((s - 1) * width) / 2;
    const maxY = ((s - 1) * height) / 2;
    const next = {
      scale: s,
      x: s === 1 ? 0 : clamp(x, -maxX, maxX),
      y: s === 1 ? 0 : clamp(y, -maxY, maxY),
    };
    live.current = next;
    setScale(next.scale);
    setOffset({ x: next.x, y: next.y });
  };
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  // یک بار ساخته می‌شود؛ مقادیر لحظه‌ای از ref خوانده می‌شوند.
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        start.current = {
          ...live.current,
          distance: touchDistance(event.nativeEvent.touches),
          moved: false,
        };
      },
      onPanResponderMove: (event, gesture) => {
        const s0 = start.current;
        if (!s0) return;
        if (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4) s0.moved = true;
        const touches = event.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const distance = touchDistance(touches);
          if (!s0.distance) {
            start.current = { ...live.current, distance, moved: true };
            return;
          }
          applyRef.current((s0.scale * distance) / s0.distance, live.current.x, live.current.y);
          return;
        }
        if (live.current.scale > 1) {
          applyRef.current(live.current.scale, s0.x + gesture.dx, s0.y + gesture.dy);
        } else if (gesture.dy > 0) {
          dismissY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (event, gesture) => {
        const s0 = start.current;
        start.current = null;
        if (live.current.scale === 1 && gesture.dy > CLOSE_DISTANCE) {
          closeRef.current?.();
          return;
        }
        Animated.spring(dismissY, { toValue: 0, useNativeDriver: Platform.OS !== 'web' }).start();
        if (s0 && !s0.moved) {
          const now = Date.now();
          if (now - lastTap.current < DOUBLE_TAP_MS) {
            lastTap.current = 0;
            applyRef.current(live.current.scale > 1 ? 1 : 2.5, 0, 0);
          } else {
            lastTap.current = now;
          }
        }
      },
      onPanResponderTerminate: () => {
        start.current = null;
        Animated.spring(dismissY, { toValue: 0, useNativeDriver: Platform.OS !== 'web' }).start();
      },
    })
  );

  const backdrop = dismissY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={{ flex: 1, backgroundColor: colors.black.color, opacity: backdrop }}>
        <Animated.View
          {...responder.panHandlers}
          style={{ flex: 1, transform: [{ translateY: dismissY }] }}
        >
          {uri ? (
            <Image
              source={{ uri }}
              resizeMode="contain"
              style={{
                width,
                height,
                transform: [{ translateX: offset.x }, { translateY: offset.y }, { scale }],
              }}
            />
          ) : null}
        </Animated.View>
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel={t('Close')}
          hitSlop={12}
          style={{
            position: 'absolute',
            top: spacing.huge,
            right: spacing.lg,
            backgroundColor: colors.black.bgColor(0.5),
            borderRadius: 22,
            padding: spacing.sm,
          }}
        >
          <Ionicons name="close" size={26} color={colors.white.color} />
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default PhotoViewer;
