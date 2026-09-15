// کشوی «نشست منقضی شد» — وقتی توکن کاربر باطل یا منقضی می‌شود، از پایین صفحه
// بالا می‌آید و کاربر را به صفحه‌ی ورود برمی‌گرداند.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { langIsRTL } from '@helpers/Common';
import { getNavigationRef } from '@services/axiosConfig';
import { TokenManager } from '@services/TokenManager';
import { onSessionExpired, resetSessionExpiry } from '@services/sessionExpiry';
import { removeToken } from '@slices/authSlice';
import { clearOrganizationData } from '@slices/organizationSlice';
import { colors } from '@theme/Color';
import { radius } from '@theme/Radius';
import { shadow } from '@theme/Shadows';
import { spacing } from '@theme/Spacing';
import { fontSize, getFontFamily } from '@theme/Typography';

/**
 * The login screen to land on. Organisation accounts and individual customers
 * have separate login pages, so send each account type back to its own —
 * dropping an organisation user on the customer login is a dead end.
 *
 * @param {string|null} userType - `'organization'` | `'individual'` | null
 * @returns {string} a route name from `navigation/routes.js`
 */
const loginRouteFor = (userType) => (userType === 'organization' ? 'Login' : 'LoginScreen');

/**
 * App-wide "your session ended, sign in again" sheet.
 *
 * Mounted once in `App.js`, inside `NavigationContainer` so it can drive the
 * navigator. It listens on the `services/sessionExpiry` bus, which is fed by
 * the axios 401 interceptor and by the startup/resume token check — those run
 * outside React and cannot show UI themselves.
 *
 * The sheet is deliberately the *only* thing that clears the session: the
 * network layer just reports the expiry, so nothing wipes the user's
 * credentials behind their back before they have been told why.
 */
export default function SessionExpiredSheet() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = langIsRTL(i18n.language);

  const userType = useSelector((state) => state?.auth?.userType);

  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => onSessionExpired(() => setVisible(true)), []);

  /**
   * Drops every trace of the dead session: server-side logout is pointless
   * here (the token is already rejected), so clear storage and Redux directly.
   */
  const clearSession = useCallback(async () => {
    await TokenManager.clearAuthData();
    dispatch(removeToken());
    dispatch(clearOrganizationData());
  }, [dispatch]);

  const close = useCallback(() => {
    setVisible(false);
    // Unlatch so the *next* expiry can raise the sheet again.
    resetSessionExpiry();
  }, []);

  const handleLogin = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    try {
      await clearSession();
    } finally {
      setBusy(false);
      close();

      const navigation = getNavigationRef()?.current;
      // `reset` rather than `navigate`: the stack behind the sheet is full of
      // screens that need a session, and the back button must not return there.
      navigation?.reset({ index: 0, routes: [{ name: loginRouteFor(userType) }] });
    }
  }, [busy, clearSession, close, userType]);

  /** Stay where they are, but signed out — public screens still work. */
  const handleDismiss = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clearSession();
    } finally {
      setBusy(false);
      close();
    }
  }, [busy, clearSession, close]);

  const textAlign = isRTL ? 'right' : 'left';
  const bold = getFontFamily('bold', i18n.language);
  const light = getFontFamily('light', i18n.language);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      {/* The backdrop is inert on purpose: signing back in is not optional, so
          a stray tap outside must not dismiss this the way a normal sheet would. */}
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <Text style={[styles.title, { fontFamily: bold, textAlign }]}>
            {t('Your session has expired')}
          </Text>

          <Text style={[styles.message, { fontFamily: light, textAlign }]}>
            {t('You have been signed out. Please log in again to continue.')}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={handleLogin}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.textInverse.color} />
            ) : (
              <Text style={[styles.primaryLabel, { fontFamily: bold }]}>{t('Log in')}</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={handleDismiss}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={[styles.secondaryLabel, { fontFamily: light }]}>{t('Close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay.bgColor(0.55),
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.surface.bgColor(1),
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    ...shadow.lg,
  },
  grabber: {
    width: 44,
    height: spacing.xs,
    alignSelf: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.border.bgColor(1),
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.textPrimary.color,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.xxl,
    color: colors.textSecondary.color,
    marginBottom: spacing.xl,
  },
  primary: {
    height: 50,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.bgColor(1),
  },
  primaryLabel: {
    fontSize: fontSize.md,
    color: colors.textInverse.color,
  },
  secondary: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  secondaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary.color,
  },
  pressed: {
    opacity: 0.75,
  },
});
