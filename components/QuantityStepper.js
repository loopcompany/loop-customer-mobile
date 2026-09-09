import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';

/**
 * شمارشگر مشترک «+ / عدد / −» فیلدهای شمارشی مراحل سفارش.
 *
 * قبلاً همین بلوک سه بار (Counter / CheckBox / RadioButton) کپی شده بود و هر
 * کدام عرض ثابت ۱۲۰ داشت؛ به همین دلیل در ردیف «آیکون + عنوان + شمارشگر» جایی
 * برای عنوان باقی نمی‌ماند. این نسخه به اندازه‌ی محتوایش عرض می‌گیرد.
 *
 * ترتیب داخلی دکمه‌ها در هر دو زبان ثابت است («−» چپ، عدد وسط، «+» راست) —
 * دقیقاً مثل MiniCounter در OrgSelectionKit و همان چیزی که تا امروز در فارسی
 * دیده می‌شد. آنچه با زبان می‌چرخد جای خودِ شمارشگر در ردیف است، نه دکمه‌هایش.
 */
const SIZES = {
  sm: { btn: 24, icon: 16, value: 24 },
  md: { btn: 28, icon: 18, value: 28 },
};

export default function QuantityStepper({
  value = 0,
  onIncrement,
  onDecrement,
  size = 'md',
  style,
}) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;

  const { btn, icon, value: valueWidth } = SIZES[size] ?? SIZES.md;
  const canDecrement = value > 0;

  return (
    <View
      style={[
        {
          flexShrink: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
          borderWidth: 1,
          borderColor: colors.primary.bgColor(1),
          borderRadius: radius.sm,
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        disabled={!canDecrement}
        onPress={() => {
          if (canDecrement) onDecrement?.();
        }}
        style={{
          width: btn,
          height: btn,
          borderRadius: btn / 2,
          borderWidth: 1,
          borderColor: colors.primary.bgColor(1),
          opacity: canDecrement ? 1 : 0.4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="remove" size={icon} color={colors.primary.color} />
      </Pressable>

      <View
        style={{
          minWidth: valueWidth,
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
          borderWidth: 1,
          borderColor: colors.primary.bgColor(1),
          borderRadius: radius.sm,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            textAlign: 'center',
            fontFamily: getFontFamily('bold', lang),
            fontSize: fontSize.sm,
            color: colors.textPrimary.color,
          }}
        >
          {value}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onIncrement}
        style={{
          width: btn,
          height: btn,
          borderRadius: btn / 2,
          backgroundColor: colors.primary.bgColor(1),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="add" size={icon} color={colors.textInverse.color} />
      </Pressable>
    </View>
  );
}
