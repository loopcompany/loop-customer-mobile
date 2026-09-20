// The wallet home.
//
// Before this screen existed, the "Loop Wallet" menu entry went straight to the
// top-up form: the user could pay money in, but had nowhere to *see* the wallet
// — balance, what it was last used for, whether a charge actually landed. The
// transaction list lived under a separate menu entry with no link between them.
//
// So this is the one place that answers "how much do I have and what happened
// to it": balance from `/wallet/balance` (never the stale profile snapshot),
// the most recent transactions inline, and the two actions that matter.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import ScreenHeaders from '@components/ScreenHeaders';
import FooterSpacer from '@components/FooterSpacer';
import { createStyles } from '@styles/NewStyles';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import { formatPrice, formatDateTime, langIsRTL, showToastOrAlert } from '@helpers/Common';
import {
  getTransactions,
  selectTransactions,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@services/WalletApi';
import { fetchWalletBalance, seedBalance, selectWalletBalance } from '@slices/walletSlice';

/** چند تراکنش آخر روی این صفحه؛ بقیه در صفحه‌ی تراکنش‌ها. */
const RECENT_COUNT = 5;

/**
 * مبالغ آماده‌ی شارژ (تومان).
 *
 * All sit inside the 10,000 .. 50,000,000 range the backend validates, so a
 * quick-charge tap can never produce a request the server rejects.
 */
const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000];

export default function Wallet({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const isRTL = langIsRTL(i18n.language);
  const styles = useMemo(() => createLocalStyles(i18n.language, isRTL), [i18n.language, isRTL]);

  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.user?.data);
  const balance = useSelector(selectWalletBalance);
  const balanceLoading = useSelector((state) => state.wallet?.loading);

  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hidden, setHidden] = useState(false);

  // مقادیری که فقط *خوانده* می‌شوند، از طریق ref به تابع بارگذاری می‌رسند و
  // در وابستگی‌ها نمی‌آیند.
  //
  // `t` and the profile snapshot must stay out of the dependency chain of the
  // focus effect. `useTranslation()` may hand back a fresh `t` on a re-render;
  // with `t` in the deps, `refresh` changed identity every render, the focus
  // effect re-ran, its setState triggered another render, and the screen span
  // in a loop — firing a request per frame and never settling. That is what
  // made this page look frozen and empty.
  const latest = useRef({ t, wallet: user?.wallet });
  latest.current = { t, wallet: user?.wallet };

  const refresh = useCallback(async () => {
    if (!token) return;

    // مقدار پروفایل فقط تا رسیدن پاسخ سرور نمایش داده می‌شود.
    dispatch(seedBalance(latest.current.wallet));

    const [, transactionsResult] = await Promise.all([
      dispatch(fetchWalletBalance(token)),
      getTransactions(token, { per_page: RECENT_COUNT }),
    ]);

    if (transactionsResult.ok) {
      // `per_page` is accepted but not always honoured, so slice locally too.
      setRecent(selectTransactions(transactionsResult.data).slice(0, RECENT_COUNT));
    } else {
      showToastOrAlert(
        transactionsResult.message || latest.current.t('Error retrieving transactions')
      );
    }

    setLoadingRecent(false);
  }, [dispatch, token]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const typeLabel = (type) => {
    switch (Number(type)) {
      case TRANSACTION_TYPE.CHARGE:
        return t('Wallet recharge');
      case TRANSACTION_TYPE.ORDER_GATEWAY:
        return t('Online Payment');
      case TRANSACTION_TYPE.ORDER_WALLET:
        return t('Wallet Deduction');
      default:
        return t('Unknown');
    }
  };

  /**
   * شارژ مثبت است و پرداخت منفی — علامت از روی نوع تراکنش می‌آید، نه از مبلغ.
   *
   * The API sends every amount as a positive decimal string, so direction has
   * to be derived from `type` or a payment reads as money coming in.
   */
  const isCredit = (type) => Number(type) === TRANSACTION_TYPE.CHARGE;

  const statusStyle = (status) => {
    switch (Number(status)) {
      case TRANSACTION_STATUS.SUCCESS:
        return { label: t('Successful'), color: colors.success.bgColor(1) };
      case TRANSACTION_STATUS.FAILED:
        return { label: t('Failed'), color: colors.error.bgColor(1) };
      case TRANSACTION_STATUS.PENDING:
        return { label: t('Pending'), color: colors.warning.bgColor(1) };
      default:
        return { label: t('Unknown'), color: colors.textMuted.bgColor(1) };
    }
  };

  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Loop Wallet')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.bgColor(1)]}
            tintColor={colors.primary.bgColor(1)}
          />
        }
      >
        {/* موجودی */}
        <LinearGradient
          colors={[colors.primary.bgColor(1), colors.info.bgColor(1)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View pointerEvents="none" style={styles.decorLarge} />
          <View pointerEvents="none" style={styles.decorSmall} />

          <View style={[styles.balanceHeader, { flexDirection: rowDir }]}>
            <View style={[styles.balanceLabelWrap, { flexDirection: rowDir }]}>
              <View style={styles.balanceIcon}>
                <Ionicons name="wallet" size={18} color={colors.textInverse.bgColor(1)} />
              </View>
              <Text style={styles.balanceLabel}>{t('Your current wallet balance:')}</Text>
            </View>

            <Pressable
              hitSlop={12}
              onPress={() => setHidden((v) => !v)}
              style={styles.eyeButton}
              accessibilityRole="button"
            >
              <Ionicons
                name={hidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textInverse.bgColor(0.9)}
              />
            </Pressable>
          </View>

          {balanceLoading && balance === 0 ? (
            <ActivityIndicator
              color={colors.textInverse.bgColor(1)}
              style={styles.balanceSpinner}
            />
          ) : (
            <View style={[styles.balanceRow, { flexDirection: rowDir }]}>
              <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
                {hidden ? '••••••' : formatPrice(balance)}
              </Text>
              <Text style={styles.balanceUnit}>{t('Tomans')}</Text>
            </View>
          )}

          <View style={[styles.heroActions, { flexDirection: rowDir }]}>
            <Pressable
              style={({ pressed }) => [
                styles.heroButton,
                styles.heroButtonPrimary,
                { flexDirection: rowDir },
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('Increase')}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary.bgColor(1)} />
              <Text style={styles.heroButtonText}>{t('Wallet recharge')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.heroButton,
                styles.heroButtonGhost,
                { flexDirection: rowDir },
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('TransactionsScreen')}
            >
              <Ionicons name="receipt-outline" size={20} color={colors.textInverse.bgColor(1)} />
              <Text style={styles.heroButtonGhostText}>{t('Transactions')}</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* شارژ سریع */}
        <View style={styles.card}>
          <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
            <View style={[styles.sectionTitleWrap, { flexDirection: rowDir }]}>
              <Ionicons name="flash" size={18} color={colors.warning.bgColor(1)} />
              <Text style={styles.sectionTitle}>{t('Quick recharge')}</Text>
            </View>
          </View>

          <View style={[styles.quickRow, { flexDirection: rowDir }]}>
            {QUICK_AMOUNTS.map((amount) => (
              <Pressable
                key={amount}
                style={({ pressed }) => [styles.quickChip, pressed && styles.pressed]}
                onPress={() => navigation.navigate('Increase', { amount })}
              >
                <Text style={styles.quickChipText}>{formatPrice(amount)}</Text>
                <Text style={styles.quickChipUnit}>{t('Tomans')}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* تراکنش‌های اخیر */}
        <View style={styles.card}>
          <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
            <View style={[styles.sectionTitleWrap, { flexDirection: rowDir }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary.bgColor(1)} />
              <Text style={styles.sectionTitle}>{t('Recent transactions')}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => navigation.navigate('TransactionsScreen')}
              style={[styles.linkWrap, { flexDirection: rowDir }]}
            >
              <Text style={styles.link}>{t('View all')}</Text>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={14}
                color={colors.primary.bgColor(1)}
              />
            </Pressable>
          </View>

          {loadingRecent ? (
            <View style={styles.skeletonList}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.row, { flexDirection: rowDir }]}>
                  <View style={[styles.rowIcon, styles.skeleton]} />
                  <View style={styles.rowBody}>
                    <View style={[styles.skeleton, styles.skeletonLine]} />
                    <View style={[styles.skeleton, styles.skeletonLineShort]} />
                  </View>
                </View>
              ))}
            </View>
          ) : recent.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={28} color={colors.primary.bgColor(1)} />
              </View>
              <Text style={styles.empty}>{t('No transactions yet.')}</Text>
            </View>
          ) : (
            recent.map((item, index) => {
              const status = statusStyle(item?.status);
              const credit = isCredit(item?.type);
              const tone = credit ? colors.success : colors.error;

              return (
                <View
                  key={String(item?.id)}
                  style={[
                    styles.row,
                    { flexDirection: rowDir },
                    index > 0 && styles.rowDivider,
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: tone.bgColor(0.12) }]}>
                    <Ionicons
                      name={credit ? 'arrow-down' : 'arrow-up'}
                      size={18}
                      color={tone.bgColor(1)}
                    />
                  </View>

                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {item?.description || typeLabel(item?.type)}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {formatDateTime(item?.created_at)}
                    </Text>
                  </View>

                  <View style={styles.rowEnd}>
                    <Text
                      style={[
                        styles.rowAmount,
                        { color: credit ? colors.success.color : colors.textPrimary.color },
                      ]}
                    >
                      {credit ? '+' : '−'}
                      {formatPrice(Number(item?.price))}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: status.color + '1F' }]}>
                      <View style={[styles.badgeDot, { backgroundColor: status.color }]} />
                      <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <FooterSpacer />
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (lang, isRTL) => {
  const align = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
  const endAlign = { alignItems: isRTL ? 'flex-start' : 'flex-end' };

  return StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.lg,
    },
    pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },

    balanceCard: {
      borderRadius: radius.lg,
      padding: spacing.xl,
      gap: spacing.lg,
      overflow: 'hidden',
      ...shadow.lg,
    },
    decorLarge: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: radius.pill,
      top: -60,
      right: -50,
      backgroundColor: colors.white.bgColor(0.08),
    },
    decorSmall: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: radius.pill,
      bottom: -40,
      left: -30,
      backgroundColor: colors.white.bgColor(0.06),
    },
    balanceHeader: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    balanceLabelWrap: {
      alignItems: 'center',
      gap: spacing.sm,
      flexShrink: 1,
    },
    balanceIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white.bgColor(0.18),
    },
    balanceLabel: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textInverse.bgColor(0.85),
      ...align,
    },
    eyeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceRow: {
      alignItems: 'baseline',
      gap: spacing.sm,
    },
    balanceValue: {
      flexShrink: 1,
      fontSize: fontSize.display,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textInverse.color,
    },
    balanceUnit: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textInverse.bgColor(0.85),
    },
    balanceSpinner: {
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      marginVertical: spacing.md,
    },
    heroActions: { gap: spacing.sm },
    heroButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    heroButtonPrimary: { backgroundColor: colors.white.bgColor(1) },
    heroButtonGhost: {
      backgroundColor: colors.white.bgColor(0.16),
      borderWidth: 1,
      borderColor: colors.white.bgColor(0.35),
    },
    heroButtonGhostText: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textInverse.color,
    },
    heroButtonText: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.color,
    },

    card: {
      backgroundColor: colors.surface.bgColor(1),
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.bgColor(0.5),
      ...shadow.sm,
    },
    sectionHeader: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitleWrap: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      ...align,
    },
    linkWrap: {
      alignItems: 'center',
      gap: 2,
    },
    link: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.color,
    },

    quickRow: {
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    quickChip: {
      flexBasis: '48%',
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.primary.bgColor(0.2),
      backgroundColor: colors.primary.bgColor(0.06),
    },
    quickChipText: {
      fontSize: fontSize.md,
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.color,
    },
    quickChipUnit: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
    },

    row: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border.bgColor(1),
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBody: {
      flex: 1,
      gap: spacing.xs,
    },
    rowTitle: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      ...align,
    },
    rowMeta: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      ...align,
    },
    rowEnd: {
      gap: spacing.xs,
      ...endAlign,
    },
    rowAmount: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.pill,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: radius.pill,
    },
    badgeText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
    },

    skeletonList: { gap: spacing.xs },
    skeleton: { backgroundColor: colors.border.bgColor(0.5) },
    skeletonLine: { height: 12, width: '70%', borderRadius: radius.sm },
    skeletonLineShort: { height: 10, width: '40%', borderRadius: radius.sm },

    emptyWrap: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xxl,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.bgColor(0.08),
    },
    empty: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
      textAlign: 'center',
    },
  });
};
