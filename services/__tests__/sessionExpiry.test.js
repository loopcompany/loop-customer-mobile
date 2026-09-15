/**
 * The session-expiry bus is what stops a burst of 401s from stacking prompts,
 * and what carries an expiry raised before the sheet mounted. Both are easy to
 * break and invisible until a user sees five dialogs, so they are pinned here.
 */
import {
  SESSION_EXPIRY_REASON,
  isSessionExpired,
  notifySessionExpired,
  onSessionExpired,
  resetSessionExpiry,
} from '../sessionExpiry';

describe('sessionExpiry', () => {
  /** Subscriptions outlive a test unless dropped — the bus is a module singleton. */
  let unsubscribers = [];
  const subscribe = (listener) => {
    unsubscribers.push(onSessionExpired(listener));
    return listener;
  };

  beforeEach(() => {
    resetSessionExpiry();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    unsubscribers = [];
    resetSessionExpiry();
    jest.restoreAllMocks();
  });

  it('delivers the reason to subscribers', () => {
    const listener = subscribe(jest.fn());

    expect(notifySessionExpired(SESSION_EXPIRY_REASON.UNAUTHORIZED)).toBe(true);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(SESSION_EXPIRY_REASON.UNAUTHORIZED);
    expect(isSessionExpired()).toBe(true);
  });

  it('raises one prompt for a burst of 401s', () => {
    const listener = subscribe(jest.fn());

    notifySessionExpired();
    notifySessionExpired();
    expect(notifySessionExpired()).toBe(false);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('replays an expiry raised before anyone was listening', () => {
    notifySessionExpired(SESSION_EXPIRY_REASON.INVALID_TOKEN);

    const listener = subscribe(jest.fn());

    expect(listener).toHaveBeenCalledWith(SESSION_EXPIRY_REASON.INVALID_TOKEN);
  });

  it('replays only once, to the first subscriber', () => {
    notifySessionExpired();

    const first = subscribe(jest.fn());
    const second = subscribe(jest.fn());

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('re-arms after a reset, so the next expiry still prompts', () => {
    const listener = subscribe(jest.fn());

    notifySessionExpired();
    resetSessionExpiry();
    expect(isSessionExpired()).toBe(false);

    notifySessionExpired();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('keeps notifying when one listener throws', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const broken = jest.fn(() => {
      throw new Error('boom');
    });
    const healthy = jest.fn();
    subscribe(broken);
    subscribe(healthy);

    expect(() => notifySessionExpired()).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
  });

  it('stops delivering after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);
    unsubscribe();

    notifySessionExpired();
    expect(listener).not.toHaveBeenCalled();
  });
});
