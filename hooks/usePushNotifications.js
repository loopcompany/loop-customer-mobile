/**
 * Drives the push-notification lifecycle from React:
 *   - registers the device token with the backend when the user is logged in,
 *     and re-registers whenever the auth token changes (new login / account
 *     switch)
 *   - attaches foreground-display + tap-routing listeners once
 *   - routes a notification tap to the right screen, queuing the navigation if
 *     the navigator isn't mounted yet (cold start from a tap)
 *
 * Mount it once, high in the tree, via `PushNotificationProvider`.
 */
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { getNavigationRef } from '@services/axiosConfig';
import {
  attachNotificationListeners,
  isPushSupported,
  registerForPushNotifications,
  resolveNotificationTarget,
} from '@services/notifications';

const READY_RETRY_MS = 250;
const READY_MAX_RETRIES = 40; // ~10s

function navigateWhenReady(target, attempt = 0) {
  const nav = getNavigationRef()?.current;
  if (nav?.isReady?.()) {
    nav.navigate(target.name, target.params);
    return;
  }
  if (attempt < READY_MAX_RETRIES) {
    setTimeout(() => navigateWhenReady(target, attempt + 1), READY_RETRY_MS);
  }
}

export default function usePushNotifications() {
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Listeners: attach once for the lifetime of the app.
  useEffect(() => {
    if (!isPushSupported()) return undefined;

    const detach = attachNotificationListeners({
      onOpen: (data) => {
        const target = resolveNotificationTarget(data);
        if (target) navigateWhenReady(target);
      },
    });
    return detach;
  }, []);

  // Registration: (re)run whenever the user becomes authenticated or the token
  // rotates. The backend attaches the device token to the current account.
  const registeredForToken = useRef(null);
  useEffect(() => {
    if (!isPushSupported()) return;
    if (!isAuthenticated || !token) {
      registeredForToken.current = null;
      return;
    }
    if (registeredForToken.current === token) return;

    registeredForToken.current = token;
    registerForPushNotifications().catch((e) => {
      registeredForToken.current = null;
      console.warn('[push] registration failed', e?.message ?? e);
    });
  }, [isAuthenticated, token]);
}
