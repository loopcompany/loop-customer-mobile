/**
 * Which endpoints are allowed to end the user's session.
 *
 * The axios response interceptor raises the session-expiry sheet on a 401, and
 * that sheet navigates to the login page. So any request that runs *on its own*
 * — without the user asking for it — must be on the silent list, or a failing
 * background refresh logs people out mid-task.
 *
 * This regressed once: moving the wallet calls onto the shared axios instance
 * and adding a `/wallet/balance` refresh on screen focus meant that opening the
 * wallet, an invoice or an order could bounce a signed-in user to the login
 * screen. These assertions are the guard against a repeat.
 */
import { isSilentAPI } from '../axiosConfig';

describe('isSilentAPI', () => {
  it('silences background reads that run without the user asking', () => {
    // Fire on screen focus, with no user intent behind them.
    expect(isSilentAPI('http://api.test/api/wallet/balance')).toBe(true);
    expect(isSilentAPI('http://api.test/api/wallet/transactions?per_page=5')).toBe(true);
    // Best-effort push registration, silent since before the wallet work.
    expect(isSilentAPI('http://api.test/api/notifications/device-token')).toBe(true);
  });

  it('leaves money actions loud, because a dead session there must be reported', () => {
    expect(isSilentAPI('http://api.test/api/wallet/charge')).toBe(false);
    expect(isSilentAPI('http://api.test/api/wallet/pay-order')).toBe(false);
    expect(isSilentAPI('http://api.test/api/orders/gateway-payment')).toBe(false);
  });

  it('leaves ordinary endpoints alone', () => {
    expect(isSilentAPI('http://api.test/api/orders/submit')).toBe(false);
    expect(isSilentAPI('http://api.test/api/profile')).toBe(false);
    expect(isSilentAPI(undefined)).toBe(false);
    expect(isSilentAPI('')).toBe(false);
  });
});
