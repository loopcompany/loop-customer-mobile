// Promo-code + referral-code entry for any screen that submits an order.
//
// The «کد تخفیف» box collects an admin-generated promo code (`promo_code`,
// validated by `/promo-codes/check`), not the club/gem code it used to —
// see `services/PromoApi.js`.
//
// Shape: a compact summary row on the order screen, and a bottom drawer for the
// actual typing. Two text inputs, two buttons and two paragraphs of explanation
// are a lot of noise on a confirmation screen, and a TextInput halfway down a
// long ScrollView fights the keyboard. What the order screen needs to show is
// the *result* — which codes are on this order and for how much — so that is
// what stays inline; entry is transient and lives in the drawer.
//
// The applied state is therefore deliberately visible without opening anything:
// a drawer that hides the fact that a code was applied is worse than the inline
// version it replaced. `needsCheck` (typed but never verified) surfaces on the
// row too, because submitting is blocked on it and the field that explains why
// is behind a tap.
//
// Purely presentational: the screen owns `usePromoCode` / `useReferralCode`
// (it needs `needsCheck` before submitting, `appliedCode` for the payload and
// `reject` on a 409) and passes the two hook results in. Shared by
// `screens/category/Preview.js` and `screens/orders/OrderSummaryScreen.js` so
// every "ثبت سفارش" path offers the same two fields.
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import PromoCodeField from '@components/PromoCodeField';
import { langIsRTL } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { shadow } from '@theme/Shadows';
import { fontSize, getFontFamily } from '@theme/Typography';

/**
 * @param {object} promo - result of usePromoCode
 * @param {object} referral - result of useReferralCode
 * @param {boolean} [available] - false shows the "not available" notice instead
 */
export default function OrderCodesSection({ promo, referral, available = true }) {
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const styles = useMemo(() => createStyles(i18n.language, isRTL), [i18n.language, isRTL]);

  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const applied = [
    promo.applied && {
      key: 'promo',
      icon: 'ticket-outline',
      label: t('Discount Code'),
      code: promo.appliedCode,
      percent: promo.percent,
    },
    referral.applied && {
      key: 'referral',
      icon: 'people-outline',
      label: t('Referral code'),
      code: referral.appliedCode,
      percent: referral.percent,
    },
  ].filter(Boolean);

  // A typed-but-unverified code blocks submission, so it has to be visible from
  // the outside — otherwise the user is stopped by a toast about a field they
  // cannot see.
  const unverified = promo.needsCheck || referral.needsCheck;

  if (!available) {
    return (
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={20} color={colors.warning.bgColor(1)} />
        <Text style={styles.noticeText}>
          {t('Discount and referral codes are not available on this account.')}
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* The whole card is the frosted surface, not a panel inside it: the
          header row, the applied codes and the unverified warning all sit on
          one blur, so every line in the section reads against the same
          backdrop instead of one block standing out from the rest. */}
      <BlurView
        intensity={40}
        tint="light"
        style={[
          styles.trigger,
          applied.length > 0 && styles.triggerApplied,
          unverified && styles.triggerUnverified,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.triggerInner, pressed && styles.pressed]}
        >
          <View style={styles.triggerRow}>
            <Ionicons
              name={applied.length > 0 ? 'pricetag' : 'pricetag-outline'}
              size={20}
              color={applied.length > 0 ? colors.success.bgColor(1) : colors.primary.bgColor(1)}
            />
            <Text style={styles.triggerLabel}>{t('Discount & referral codes')}</Text>
            <Text style={styles.triggerAction}>
              {applied.length > 0 ? t('Edit') : t('Add code')}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color={colors.textMuted.bgColor(1)}
            />
          </View>

          {applied.map((item) => (
            <View key={item.key} style={styles.appliedRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success.bgColor(1)} />
              <Text style={styles.appliedLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.appliedCode} numberOfLines={1}>
                {item.code}
              </Text>
              {item.percent != null && (
                <Text style={styles.appliedPercent}>{item.percent + t(' percent')}</Text>
              )}
            </View>
          ))}

          {unverified && (
            <View style={styles.appliedRow}>
              <Ionicons name="alert-circle" size={16} color={colors.warning.bgColor(1)} />
              <Text style={styles.unverifiedText}>
                {t('A code has been entered but not verified.')}
              </Text>
            </View>
          )}
        </Pressable>
      </BlurView>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Unlike the session sheet, this one is optional — tapping away is a
            normal way to leave it, and nothing is lost by doing so. */}
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.sheet}>
            <View style={styles.grabber} />

            <View style={styles.sheetHeader}>
              {/* The illustration used to head this section inline on the order
                  preview; it moved in here when the row replaced the banner. */}
              <Image source={require('@assets/images/discount.png')} style={styles.sheetIcon} />
              <Text style={styles.sheetTitle}>{t('Discount & referral codes')}</Text>
              <Pressable onPress={close} hitSlop={spacing.md} accessibilityRole="button">
                <Ionicons name="close" size={22} color={colors.textSecondary.color} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.sheetBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <PromoCodeField
                icon="ticket-outline"
                label={t('Discount Code')}
                placeholder={t('Enter your discount code.')}
                value={promo.code}
                onChangeText={promo.onChangeText}
                onSubmit={promo.check}
                onClear={promo.clear}
                submitLabel={t('Check Code')}
                pending={promo.pending}
                disabled={promo.applied}
                status={promo.status}
                statusMessage={promo.message}
                note={t(
                  'Each discount code can be used only once per account, and the discount is applied when the order is submitted.'
                )}
              />

              <PromoCodeField
                icon="people-outline"
                label={t('Referral code')}
                placeholder={t('Example: LOOP-AB7K92')}
                value={referral.code}
                onChangeText={referral.onChangeText}
                onSubmit={referral.register}
                onClear={referral.clear}
                submitLabel={t('Register code')}
                pending={referral.pending}
                disabled={referral.applied}
                status={referral.status}
                statusMessage={
                  referral.applied && referral.referrerName
                    ? `${referral.message} (${t('Referrer')}: ${referral.referrerName})`
                    : referral.message
                }
                note={t(
                  'A referral code is registered to your account the first time you submit it, and cannot then be used by anyone else.'
                )}
              />

              {(promo.percent != null || referral.percent != null) && (
                <View style={styles.summary}>
                  {promo.percent != null && (
                    <SummaryRow
                      styles={styles}
                      label={t('Your Final Discount Percentage')}
                      value={promo.percent + t(' percent')}
                    />
                  )}
                  {referral.percent != null && (
                    <SummaryRow
                      styles={styles}
                      label={t('Referral discount')}
                      value={referral.percent + t(' percent')}
                    />
                  )}
                </View>
              )}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [styles.done, pressed && styles.pressed]}
            >
              <Text style={styles.doneLabel}>{t('Confirm')}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const SummaryRow = ({ styles, label, value }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const createStyles = (lang, isRTL) => {
  const row = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';
  const writingDirection = isRTL ? 'rtl' : 'ltr';

  return StyleSheet.create({
    // ── trigger ──────────────────────────────────────────────────────────────
    trigger: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border.bgColor(1),
      borderRadius: radius.md,
      // Translucent, or the blur behind it has nothing to show through.
      backgroundColor: colors.surface.bgColor(0.45),
      // BlurView has to clip to its own radius or the blur squares off the
      // rounded corners.
      overflow: 'hidden',
    },
    // Padding lives on the pressable inside so the press target fills the card.
    triggerInner: {
      gap: spacing.sm,
      padding: spacing.md,
    },
    // Once a code is on the order this stops being a call to action and becomes
    // a statement of fact, so it loses the dashed "empty slot" look.
    triggerApplied: {
      borderStyle: 'solid',
      borderColor: colors.success.bgColor(0.5),
      backgroundColor: colors.success.bgColor(0.1),
    },
    triggerUnverified: {
      borderStyle: 'solid',
      borderColor: colors.warning.bgColor(0.6),
      backgroundColor: colors.warning.bgColor(0.1),
    },
    triggerRow: {
      flexDirection: row,
      alignItems: 'center',
      gap: spacing.sm,
    },
    triggerLabel: {
      flex: 1,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      textAlign,
      writingDirection,
    },
    triggerAction: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.bgColor(1),
    },
    appliedRow: {
      flexDirection: row,
      alignItems: 'center',
      gap: spacing.xs,
    },
    appliedLabel: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      textAlign,
      writingDirection,
    },
    appliedCode: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      // The code itself is always Latin (LOOP-AB7K92), so it stays LTR even in
      // a Persian layout.
      writingDirection: 'ltr',
      textAlign,
    },
    appliedPercent: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.success.bgColor(1),
    },
    unverifiedText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.warning.bgColor(1),
      textAlign,
      writingDirection,
    },

    // ── "not available on this account" ──────────────────────────────────────
    // A statement of state, not a warning the user can act on, so it is quiet.
    notice: {
      flexDirection: row,
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.warning.bgColor(0.4),
      borderRadius: radius.md,
      backgroundColor: colors.warning.bgColor(0.08),
    },
    noticeText: {
      flex: 1,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      textAlign,
      writingDirection,
    },

    // ── drawer ───────────────────────────────────────────────────────────────
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay.bgColor(0.55),
    },
    sheetWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      width: '100%',
      maxWidth: 520,
      // Leaves the backdrop reachable above the drawer on a small screen, so
      // there is always somewhere to tap to dismiss.
      maxHeight: '85%',
      alignSelf: 'center',
      backgroundColor: colors.background.bgColor(1),
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
      ...shadow.lg,
    },
    grabber: {
      width: 44,
      height: spacing.xs,
      alignSelf: 'center',
      borderRadius: radius.pill,
      backgroundColor: colors.border.bgColor(1),
      marginBottom: spacing.lg,
    },
    sheetHeader: {
      flexDirection: row,
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    sheetIcon: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    sheetTitle: {
      flex: 1,
      fontSize: fontSize.lg,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      textAlign,
      writingDirection,
    },
    sheetBody: {
      gap: spacing.lg,
      paddingBottom: spacing.lg,
    },
    summary: {
      borderTopWidth: 1,
      borderTopColor: colors.border.bgColor(1),
      paddingTop: spacing.md,
      gap: spacing.xs,
    },
    summaryRow: {
      flexDirection: row,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      textAlign,
      writingDirection,
    },
    summaryValue: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
    },
    done: {
      height: 48,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.bgColor(1),
      marginTop: spacing.sm,
    },
    doneLabel: {
      fontSize: fontSize.md,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textInverse.color,
    },
    pressed: {
      opacity: 0.75,
    },
  });
};
