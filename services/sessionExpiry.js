/**
 * نشست منقضی‌شده — گذرگاه رویداد بین لایه‌ی شبکه و رابط کاربری.
 *
 * Session-expiry event bus.
 *
 * The axios interceptor, `TokenManager` and the startup auth check all live
 * outside React, so none of them can render the "please sign in again" sheet
 * themselves. They call `notifySessionExpired()`; `<SessionExpiredSheet />`
 * subscribes with `onSessionExpired()` and takes it from there.
 *
 * The expired flag **latches**. A screen that fires five requests in parallel
 * gets five 401s back, and the user must see one sheet, not five. It is
 * released by `resetSessionExpiry()` — called once the user has been sent back
 * to the login page, and again whenever a fresh token is stored.
 */

/** Why the session ended. Only used for logging/telemetry today. */
export const SESSION_EXPIRY_REASON = {
  /** The server answered 401 to a real request. */
  UNAUTHORIZED: 'unauthorized',
  /** The stored token failed validation at startup / on resume. */
  INVALID_TOKEN: 'invalid_token',
};

/** @type {Set<(reason: string) => void>} */
const listeners = new Set();

let expired = false;
let pendingReason = null;

/**
 * Subscribe to session expiry.
 *
 * @param {(reason: string) => void} listener
 * @returns {() => void} unsubscribe
 */
export const onSessionExpired = (listener) => {
  listeners.add(listener);

  // A 401 can land before the sheet has mounted (the startup token check races
  // the first render). Replay it to the first subscriber instead of dropping it.
  if (expired && pendingReason !== null) {
    const reason = pendingReason;
    pendingReason = null;
    listener(reason);
  }

  return () => {
    listeners.delete(listener);
  };
};

/**
 * Announce that the session is no longer usable. Safe to call from anywhere,
 * as often as you like — only the first call in a session gets through.
 *
 * @param {string} [reason] - one of `SESSION_EXPIRY_REASON`
 * @returns {boolean} whether this call was the one that raised the prompt
 */
export const notifySessionExpired = (reason = SESSION_EXPIRY_REASON.UNAUTHORIZED) => {
  if (expired) return false;
  expired = true;

  console.warn(`🔐 Session expired (${reason}) — asking the user to sign in again`);

  if (listeners.size === 0) {
    pendingReason = reason;
    return true;
  }

  listeners.forEach((listener) => {
    try {
      listener(reason);
    } catch (error) {
      console.error('❌ Session-expiry listener failed:', error);
    }
  });

  return true;
};

/** Release the latch so a future expiry can raise the prompt again. */
export const resetSessionExpiry = () => {
  expired = false;
  pendingReason = null;
};

/** @returns {boolean} whether the prompt is currently raised/pending. */
export const isSessionExpired = () => expired;

export default {
  SESSION_EXPIRY_REASON,
  onSessionExpired,
  notifySessionExpired,
  resetSessionExpiry,
  isSessionExpired,
};
