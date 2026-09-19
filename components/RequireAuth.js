import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { AUTH_ROUTE } from '@navigation/routes';
import { colors } from '@theme/Color';

/**
 * نگهبان مسیر: صفحه‌های نیازمند ورود را از دید کاربرِ خارج‌شده پنهان می‌کند.
 *
 * Route guard for screens that need a signed-in user.
 *
 * `RootNavigator` wraps every route that `requiresAuth()` reports as guarded,
 * so this is the layer that holds when the splash screen is bypassed entirely:
 * a web deep link, a push notification opening a screen directly, or a user who
 * signs out while sitting on a guarded screen.
 *
 * Three states, in order:
 *
 *   1. `!isRestored` — AsyncStorage has not been read yet, so we genuinely do
 *      not know. Render a spinner. Redirecting here would throw a signed-in
 *      user out on every cold start.
 *   2. `!token` — known signed out. Replace with the sign-in page.
 *   3. otherwise — render the screen.
 *
 * Note this guards *entry*, not authority: a token being present says the user
 * is signed in, not that they may perform any particular action. Server-side
 * checks and `useOrganizationAccess` remain responsible for the second part.
 */
const RequireAuth = ({ navigation, children }) => {
  const token = useSelector((state) => state.auth.token);
  const isRestored = useSelector((state) => state.auth.isRestored);

  useEffect(() => {
    if (!isRestored || token) return;

    // `replace`, not `navigate`: a guarded screen must not stay on the stack
    // behind the login page, or the Android back button walks straight back
    // into it.
    navigation.replace(AUTH_ROUTE);
  }, [isRestored, token, navigation]);

  if (!isRestored || !token) {
    return (
      <View style={styles.pending}>
        <ActivityIndicator size="large" color={colors.primary.color} />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  pending: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.bgColor(1),
  },
});

export default RequireAuth;
