// اجزای مشترک صفحه‌های حساب کاربری («امنیت حساب» و بخش‌های تازه‌ی پروفایل سازمانی).
//
// همه از توکن‌های theme/ ساخته شده‌اند. useRemoteResource حالت «endpoint هنوز
// روی سرور نیست» را جدا از «خطا» برمی‌گرداند تا بخش مربوط «به‌زودی فعال
// می‌شود» نشان دهد، نه پیغام خطا.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { langIsRTL } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import { isNotImplemented } from '@services/AccountSecurityApi';

export const RESOURCE_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
};

/**
 * @param {() => Promise<{ok, data, message, status}>} fetcher
 * @param {{ auto?: boolean }} [options] auto=false یعنی تا reload() صدا زده نشود چیزی خوانده نمی‌شود.
 */
export const useRemoteResource = (fetcher, { auto = true } = {}) => {
  const [state, setState] = useState(auto ? RESOURCE_STATE.LOADING : RESOURCE_STATE.IDLE);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // بارگذاری خودکار state را فقط بعد از await تغییر می‌دهد؛ حالت «در حال بارگذاری»
  // اولیه از خودِ auto استنتاج می‌شود (پایین‌تر). reload() اسپینر را صریحاً نشان می‌دهد.
  const load = useCallback(async () => {
    const result = await fetcherRef.current();
    if (!mounted.current) return result;
    if (result?.ok) {
      setData(result.data ?? null);
      setMessage(null);
      setState(RESOURCE_STATE.READY);
    } else if (isNotImplemented(result)) {
      setState(RESOURCE_STATE.UNAVAILABLE);
    } else {
      setMessage(result?.message || null);
      setState(RESOURCE_STATE.ERROR);
    }
    return result;
  }, []);

  const reload = useCallback(() => {
    setState(RESOURCE_STATE.LOADING);
    return load();
  }, [load]);

  useEffect(() => {
    mounted.current = true;
    if (auto) load();
    return () => {
      mounted.current = false;
    };
  }, [auto, load]);

  // بخشی که تازه باز شده (auto=true) ولی هنوز پاسخی نگرفته، «در حال بارگذاری» است.
  const shownState = auto && state === RESOURCE_STATE.IDLE ? RESOURCE_STATE.LOADING : state;

  return { state: shownState, data, setData, message, reload };
};

export const useDir = () => {
  const { i18n } = useTranslation();
  const rtl = langIsRTL(i18n.language);
  return {
    rtl,
    lang: i18n.language,
    row: rtl ? 'row-reverse' : 'row',
    align: rtl ? 'right' : 'left',
  };
};

export const SectionCard = ({ title, icon, subtitle, right, children, style }) => {
  const dir = useDir();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface.bgColor(1),
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border.bgColor(1),
          padding: spacing.lg,
          marginBottom: spacing.md,
          gap: spacing.sm,
          ...shadow.sm,
        },
        style,
      ]}
    >
      {title ? (
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
          {icon ? <Ionicons name={icon} size={20} color={colors.primary.color} /> : null}
          <Text
            style={{
              flex: 1,
              fontFamily: getFontFamily('bold', dir.lang),
              fontSize: fontSize.md,
              color: colors.textPrimary.color,
              textAlign: dir.align,
            }}
          >
            {title}
          </Text>
          {right}
        </View>
      ) : null}
      {subtitle ? <BodyText muted>{subtitle}</BodyText> : null}
      {children}
    </View>
  );
};

export const BodyText = ({ children, muted, bold, center, style, numberOfLines, selectable }) => {
  const dir = useDir();
  return (
    <Text
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={[
        {
          fontFamily: getFontFamily(bold ? 'bold' : 'regular', dir.lang),
          fontSize: muted ? fontSize.xs : fontSize.sm,
          color: muted ? colors.textSecondary.color : colors.textPrimary.color,
          textAlign: center ? 'center' : dir.align,
          lineHeight: muted ? 20 : 22,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const InfoRow = ({ label, value, valueColor }) => {
  const dir = useDir();
  return (
    <View
      style={{
        flexDirection: dir.row,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingVertical: spacing.xs,
      }}
    >
      <BodyText muted>{label}</BodyText>
      <Text
        style={{
          flexShrink: 1,
          fontFamily: getFontFamily('bold', dir.lang),
          fontSize: fontSize.sm,
          color: valueColor || colors.textPrimary.color,
          textAlign: dir.rtl ? 'left' : 'right',
        }}
      >
        {value == null || value === '' ? '-' : String(value)}
      </Text>
    </View>
  );
};

const TONES = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
  muted: colors.textMuted,
};

export const StatusPill = ({ label, tone = 'info', icon }) => {
  const c = TONES[tone] || TONES.info;
  const dir = useDir();
  return (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        alignSelf: dir.rtl ? 'flex-end' : 'flex-start',
        gap: spacing.xs,
        backgroundColor: c.bgColor(0.12),
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={c.color} /> : null}
      <Text style={{ fontFamily: getFontFamily('bold', dir.lang), fontSize: fontSize.xs, color: c.color }}>{label}</Text>
    </View>
  );
};

export const ActionButton = ({ title, onPress, variant = 'primary', loading = false, disabled = false, icon, style }) => {
  const dir = useDir();
  const palette = {
    primary: { bg: colors.primary.bgColor(1), fg: colors.white.color, border: colors.primary.bgColor(1) },
    danger: { bg: colors.error.bgColor(1), fg: colors.white.color, border: colors.error.bgColor(1) },
    outline: { bg: 'transparent', fg: colors.primary.color, border: colors.primary.bgColor(1) },
    dangerOutline: { bg: 'transparent', fg: colors.error.color, border: colors.error.bgColor(1) },
  }[variant];
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: dir.row,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          backgroundColor: palette.bg,
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: radius.sm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          opacity: inactive ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={palette.fg} /> : icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
      <Text style={{ fontFamily: getFontFamily('bold', dir.lang), fontSize: fontSize.sm, color: palette.fg }}>{title}</Text>
    </TouchableOpacity>
  );
};

export const ComingSoonNote = ({ text }) => {
  const { t } = useTranslation();
  const dir = useDir();
  return (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.info.bgColor(0.08),
        borderRadius: radius.sm,
        padding: spacing.md,
      }}
    >
      <Ionicons name="time-outline" size={18} color={colors.info.color} />
      <BodyText muted style={{ flex: 1 }}>
        {text || t('This feature will be available soon.')}
      </BodyText>
    </View>
  );
};

/** بدنه‌ی استاندارد یک بخش وابسته به سرور: بارگذاری / به‌زودی / خطا / محتوا. */
export const ResourceBody = ({ resource, children, emptyText, isEmpty }) => {
  const { t } = useTranslation();
  switch (resource.state) {
    case RESOURCE_STATE.LOADING:
      return <ActivityIndicator color={colors.primary.color} style={{ marginVertical: spacing.md }} />;
    case RESOURCE_STATE.UNAVAILABLE:
      return <ComingSoonNote />;
    case RESOURCE_STATE.ERROR:
      return (
        <View style={{ gap: spacing.sm }}>
          <BodyText muted>{resource.message || t('Could not load this section. Please try again.')}</BodyText>
          <ActionButton title={t('Try again')} variant="outline" onPress={resource.reload} />
        </View>
      );
    case RESOURCE_STATE.READY:
      if (isEmpty && emptyText) return <BodyText muted>{emptyText}</BodyText>;
      return children;
    default:
      return null;
  }
};

export const CodeInput = ({ value, onChangeText, placeholder, maxLength = 6 }) => {
  const dir = useDir();
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onChangeText(text.replace(/[^0-9۰-۹]/g, ''))}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted.color}
      keyboardType="number-pad"
      maxLength={maxLength}
      style={{
        borderWidth: 1,
        borderColor: colors.border.bgColor(1),
        borderRadius: radius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontFamily: getFontFamily('bold', dir.lang),
        fontSize: fontSize.lg,
        letterSpacing: 4,
        textAlign: 'center',
        color: colors.textPrimary.color,
        backgroundColor: colors.background.bgColor(1),
      }}
    />
  );
};

export const TextField = ({ value, onChangeText, placeholder, keyboardType, multiline, editable = true }) => {
  const dir = useDir();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted.color}
      keyboardType={keyboardType}
      multiline={multiline}
      editable={editable}
      style={{
        borderWidth: 1,
        borderColor: colors.border.bgColor(1),
        borderRadius: radius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: multiline ? 90 : undefined,
        textAlignVertical: multiline ? 'top' : 'center',
        fontFamily: getFontFamily('regular', dir.lang),
        fontSize: fontSize.sm,
        textAlign: dir.align,
        writingDirection: dir.rtl ? 'rtl' : 'ltr',
        color: colors.textPrimary.color,
        backgroundColor: editable ? colors.background.bgColor(1) : colors.disabled.bgColor(0.1),
      }}
    />
  );
};

/** ردیف قابل‌لمس فهرست (مثل منوی بخش‌ها). */
export const NavRow = ({ icon, title, subtitle, onPress, badge, danger }) => {
  const dir = useDir();
  const tint = danger ? colors.error : colors.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider.bgColor(1),
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.pill,
          backgroundColor: tint.bgColor(0.1),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={tint.color} />
      </View>
      <View style={{ flex: 1 }}>
        <BodyText bold style={danger ? { color: colors.error.color } : null}>{title}</BodyText>
        {subtitle ? <BodyText muted>{subtitle}</BodyText> : null}
      </View>
      {badge ? <StatusPill label={badge.label} tone={badge.tone} /> : null}
      <Ionicons name={dir.rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted.color} />
    </TouchableOpacity>
  );
};

/**
 * گزینه‌ی انتخابی - رادیو (پیش‌فرض) یا چک‌باکس (`multi`)، برای فرم‌های کوتاه مثل
 * «تحویل‌گیرنده»، «روش ارسال» یا فیلدهای درخواست ویرایش.
 */
export const ChoiceRow = ({ label, subtitle, selected, onPress, disabled, multi = false }) => {
  const dir = useDir();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.sm,
        borderColor: selected ? colors.primary.bgColor(1) : colors.border.bgColor(1),
        backgroundColor: selected ? colors.primary.bgColor(0.06) : colors.background.bgColor(1),
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Ionicons
        name={
          multi
            ? selected ? 'checkbox' : 'square-outline'
            : selected ? 'radio-button-on' : 'radio-button-off'
        }
        size={20}
        color={selected ? colors.primary.color : colors.textMuted.color}
      />
      <View style={{ flex: 1 }}>
        <BodyText bold={selected}>{label}</BodyText>
        {subtitle ? <BodyText muted>{subtitle}</BodyText> : null}
      </View>
    </TouchableOpacity>
  );
};
