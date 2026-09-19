import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TokenManager } from '@services/TokenManager';
import {
  isSessionExpired,
  notifySessionExpired,
  SESSION_EXPIRY_REASON,
} from '@services/sessionExpiry';
import { setAuthRestored, setToken, setUserType } from '@slices/authSlice';

/**
 * بازیابی نشست ذخیره‌شده هنگام راه‌اندازی + بررسی اعتبار آن.
 *
 * Restores the stored session on launch, then keeps it honest.
 *
 * Restoring the token from AsyncStorage is what stops a web reload from
 * looking like a logout. Verifying it with the server is what fixes the
 * opposite problem: a token the backend revoked — or that simply expired while
 * the app sat in the background — still *looks* valid in storage, so the user
 * browses a signed-in UI until their first request happens to fail.
 *
 * So the check runs on mount and again whenever the app returns to the
 * foreground, and any failure goes to the session-expiry bus, where
 * `<SessionExpiredSheet />` shows the prompt and clears the credentials.
 * Nothing is cleared here: being offline must not look like being signed out.
 */
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  /**
   * Ask the server whether the stored token is still good.
   * No token at all is not an expiry — the user simply is not signed in.
   */
  const verifyStoredSession = useCallback(async () => {
    // The prompt is already up; a second check would only re-ask.
    if (isSessionExpired()) return;

    const token = await TokenManager.getToken();
    if (!token) return;

    const result = await TokenManager.validateToken(token);
    if (result.valid) return;

    // Couldn't reach the server. Keep the session — the interceptor will still
    // catch a dead token on the first real request. (Same reasoning as
    // `TokenManager.isAuthenticated`.)
    if (result.networkError) return;

    notifySessionExpired(SESSION_EXPIRY_REASON.INVALID_TOKEN);
  }, []);

  useEffect(() => {
    const restoreAuth = async () => {
      let token = null;
      try {
        // بازیابی token
        //
        // از TokenManager می‌خوانیم نه مستقیم از AsyncStorage، تا کلیدِ نشستِ
        // موقت هم دیده شود.
        //
        // Read through `TokenManager`, not the raw `'userToken'` key: it also
        // looks at the session-scoped key, and the route guards decide from the
        // token in Redux. Reading fewer places here than `isAuthenticated()`
        // does would let a signed-in user land on a guarded screen with an
        // empty Redux token and get bounced to the login page.
        token = await TokenManager.getToken();
        if (token) {
          dispatch(setToken(token));
        }

        // بازیابی userType
        const userType = await AsyncStorage.getItem('userType');
        if (userType) {
          dispatch(setUserType(userType));
        }

      } catch (error) {
        console.error('خطا در بازیابی اطلاعات احراز هویت:', error);
      } finally {
        // Announce that storage has been read, whatever the outcome — and do it
        // *before* the server round-trip below. The route guards block on this
        // flag, because until it flips "no token" is indistinguishable from
        // "not looked yet"; making them wait on `verifyStoredSession` too would
        // park every guarded screen behind a spinner for the length of an
        // axios timeout on a slow network.
        dispatch(setAuthRestored());
      }

      // Now that the UI can proceed, check with the server whether the token we
      // just restored is still good. A failure here goes to the session-expiry
      // bus, not to a guard.
      if (token) await verifyStoredSession();
    };

    restoreAuth();
  }, [dispatch, verifyStoredSession]);

  // Sessions die while nobody is looking. Re-check on every foreground return
  // (on web, react-native-web maps this onto the tab's visibility change).
  useEffect(() => {
    // react-native-web returns nothing where the document has no visibility
    // API to hang the listener on, so the subscription is optional.
    const subscription = AppState.addEventListener('change', (nextState) => {
      const returned = appState.current !== 'active' && nextState === 'active';
      appState.current = nextState;
      if (returned) verifyStoredSession();
    });

    return () => subscription?.remove?.();
  }, [verifyStoredSession]);

  return children;
};

export default AuthInitializer;
