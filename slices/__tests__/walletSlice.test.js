/**
 * The wallet balance moved out of `state.user.data.wallet` (a snapshot taken at
 * token-validation time) into its own slice, because payment decisions must not
 * be made from a stale number. These tests pin the two rules that make the
 * handover safe: the profile snapshot may only *seed* an unknown balance, and a
 * failed refresh must not blank a balance the user is currently looking at.
 */
import reducer, {
  seedBalance,
  clearWallet,
  fetchWalletBalance,
  payOrderWithWallet,
} from '../walletSlice';

const initial = reducer(undefined, { type: '@@INIT' });

describe('walletSlice', () => {
  it('starts with an unknown balance rather than a misleading zero', () => {
    expect(initial.balance).toBeNull();
  });

  describe('seedBalance', () => {
    it('fills an unknown balance from the profile snapshot', () => {
      expect(reducer(initial, seedBalance(250000)).balance).toBe(250000);
      expect(reducer(initial, seedBalance('250000')).balance).toBe(250000);
    });

    it('never overwrites a balance already fetched from the server', () => {
      const fetched = { ...initial, balance: 50000, fetched: true };
      expect(reducer(fetched, seedBalance(999999)).balance).toBe(50000);
    });

    it('keeps following the profile while the server balance is unavailable', () => {
      // `/wallet/balance` may be missing or failing. Until it answers once, the
      // profile snapshot is the best number there is — pinning to the first
      // seed would freeze the balance and hide a completed top-up.
      const seeded = reducer(initial, seedBalance(100000));
      expect(seeded.balance).toBe(100000);
      expect(reducer(seeded, seedBalance(300000)).balance).toBe(300000);
    });

    it('ignores a missing snapshot', () => {
      expect(reducer(initial, seedBalance(undefined)).balance).toBeNull();
      expect(reducer(initial, seedBalance(null)).balance).toBeNull();
    });
  });

  describe('fetchWalletBalance', () => {
    it('stores the fetched balance', () => {
      const state = reducer(initial, { type: fetchWalletBalance.fulfilled.type, payload: 42000 });
      expect(state.balance).toBe(42000);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('keeps the last known balance when a refresh fails', () => {
      const known = { ...initial, balance: 42000 };
      const state = reducer(known, {
        type: fetchWalletBalance.rejected.type,
        payload: { code: 'FETCH_FAILED' },
      });

      expect(state.balance).toBe(42000);
      expect(state.error).toBe('FETCH_FAILED');
    });
  });

  describe('payOrderWithWallet', () => {
    it('applies remaining_balance without a second round-trip', () => {
      const known = { ...initial, balance: 500000, paying: true };
      const state = reducer(known, {
        type: payOrderWithWallet.fulfilled.type,
        payload: { order_id: 1, paid_amount: 450000, remaining_balance: 50000 },
      });

      expect(state.balance).toBe(50000);
      expect(state.paying).toBe(false);
    });

    it('leaves the balance alone when the response omits it', () => {
      const known = { ...initial, balance: 500000 };
      const state = reducer(known, {
        type: payOrderWithWallet.fulfilled.type,
        payload: { order_id: 1 },
      });
      expect(state.balance).toBe(500000);
    });

    it('records the error code so the screen can name the failure', () => {
      const state = reducer(initial, {
        type: payOrderWithWallet.rejected.type,
        payload: { code: 'INSUFFICIENT_BALANCE' },
      });

      expect(state.paying).toBe(false);
      expect(state.error).toBe('INSUFFICIENT_BALANCE');
    });
  });

  it('clearWallet returns to the unknown state, not to zero', () => {
    const state = reducer(
      { balance: 1000, fetched: true, loading: true, paying: true, error: 'x' },
      clearWallet()
    );
    expect(state).toEqual({
      balance: null,
      fetched: false,
      loading: false,
      paying: false,
      error: null,
    });
  });
});
