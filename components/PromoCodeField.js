// A code box with a submit button and an inline result line.
//
// Shared by the promo code and the referral code on the order preview so the
// two read as one feature rather than two bolted-on inputs. Purely
// presentational: it owns no request and no validity rules. The screen (via
// `usePromoCode` / `useReferralCode`) decides what submitting means, which
// matters because the two are not symmetric — checking a promo code is free,
// while checking a referral code consumes it.
//
// Styled from `theme/*` tokens rather than the literals used elsewhere in
// `screens/category/`, per the design-token rule in CLAUDE.md.
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { langIsRTL } from '@helpers/Common';

/**
 * @param {string} [icon] - نام آیکون Ionicons
 * @param {string} label - عنوان بالای فیلد
 * @param {string} [placeholder]
 * @param {string} value
 * @param {function} onChangeText
 * @param {function} onSubmit
 * @param {string} submitLabel - متن دکمه
 * @param {boolean} [pending] - در حال ارسال
 * @param {boolean} [disabled] - غیرفعال (مثلاً کد قبلاً تأیید شده)
 * @param {'idle'|'success'|'error'} [status] - وضعیت نتیجه
 * @param {string} [statusMessage] - پیام نتیجه
 * @param {string} [note] - توضیح ثابت زیر فیلد
 * @param {function} [onClear] - اگر داده شود، دکمه‌ی حذف کد نمایش داده می‌شود
 */
export default function PromoCodeField({
  icon = 'pricetag-outline',
  label,
  placeholder,
  value,
  onChangeText,
  onSubmit,
  submitLabel,
  pending = false,
  disabled = false,
  status = 'idle',
  statusMessage,
  note,
  onClear,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const styles = useMemo(() => createStyles(i18n.language, isRTL), [i18n.language, isRTL]);

  const statusColor =
    status === 'success'
      ? colors.success.bgColor(1)
      : status === 'error'
        ? colors.error.bgColor(1)
        : undefined;

  // An empty box is not a failure the user needs flagged in red before they
  // have typed anything, so the border only reacts once there is a result.
  const borderColor = statusColor || colors.border.bgColor(1);

  return (
    // The frost is on the whole field — label, box, result line and note — so
    // the section reads as one surface. Blurring only the box left the sentence
    // that explains the result sitting outside the panel it belongs to.
    <BlurView intensity={40} tint="light" style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputRow, disabled && styles.inputRowApplied, { borderColor }]}>
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? colors.success.bgColor(1) : colors.primary.bgColor(1)}
        />

        {disabled ? (
          // A non-editable TextInput renders its value dimmed (and on web the
          // browser dims it again), which is the one moment the code most needs
          // to be readable. Plain text instead, so nothing fades it.
          <Text style={styles.appliedValue} numberOfLines={1} selectable>
            {value}
          </Text>
        ) : (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted.bgColor(1)}
            editable={!pending}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
          />
        )}

        {disabled && onClear ? (
          <Pressable onPress={onClear} hitSlop={spacing.sm} accessibilityRole="button">
            <Ionicons name="close-circle" size={22} color={colors.textMuted.bgColor(1)} />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submit, (pending || disabled) && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={pending || disabled}
            accessibilityRole="button"
          >
            {pending ? (
              <ActivityIndicator size="small" color={colors.textInverse.bgColor(1)} />
            ) : (
              <Text style={styles.submitText}>{submitLabel || t('Check Code')}</Text>
            )}
          </Pressable>
        )}
      </View>

      {!!statusMessage && (
        <View style={styles.statusRow}>
          <Ionicons
            name={status === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
        </View>
      )}

      {!!note && <Text style={styles.note}>{note}</Text>}
    </BlurView>
  );
}

const createStyles = (lang, isRTL) =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      // Translucent, or the blur behind it has nothing to show through.
      backgroundColor: colors.surface.bgColor(0.4),
      // BlurView has to clip to its own radius or the blur squares off the
      // rounded corners.
      overflow: 'hidden',
    },
    label: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderRadius: radius.md,
      // More opaque than the card it sits on, so the box still reads as the
      // thing you type into rather than dissolving into the frosted panel.
      backgroundColor: colors.surface.bgColor(0.75),
    },
    // Translucent so the blur behind it actually shows through; BlurView has to
    // clip to its own radius or the blur squares off the rounded corners.
    inputRowApplied: {
      backgroundColor: colors.success.bgColor(0.08),
    },
    appliedValue: {
      flex: 1,
      minHeight: 44,
      lineHeight: 44,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      textAlign: isRTL ? 'right' : 'left',
      // Codes are always Latin (LOOP-AB7K92), so they stay LTR in a Persian
      // layout even though the label above them does not.
      writingDirection: 'ltr',
    },
    input: {
      flex: 1,
      minHeight: 44,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textPrimary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
      // Android's TextInput keeps its own vertical padding on top of the row's.
      paddingVertical: 0,
    },
    submit: {
      minWidth: 84,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.primary.bgColor(1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitDisabled: {
      backgroundColor: colors.disabled.bgColor(1),
    },
    submitText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textInverse.color,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    note: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
  });
