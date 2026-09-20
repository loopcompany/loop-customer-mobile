// Wallet balance — the single source of truth for what the user can spend.
//
// The balance used to be read from `state.user.data.wallet`, which is a
// snapshot taken when the token was last validated. It goes stale the moment
// an order is paid or a charge is verified, and FRONTEND_WALLET.md is explicit
// that payment decisions must not be made from a stale client-side balance.
//
// So: `GET /wallet/balance` owns the number, and every screen that can change
// it (`Increase`, `Invoice`, `Details`) refreshes afterwards. `user.wallet`
// remains as the initial value until the first fetch lands, so nothing renders
// an empty balance on a cold open.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWalletBalance, payOrderFromWallet, describeWalletError } from '@services/WalletApi';

/**
 * خواندن موجودی از سرور
 *
 * Rejects with the normalised `{ message, code }` so the caller can tell an
 * expired session from a network blip without re-parsing an axios error.
 */
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (token, { rejectWithValue }) => {
    const result = await getWalletBalance(token);

    if (!result.ok) {
      return rejectWithValue({ message: result.message, code: result.code });
    }

    return Number(result.data?.wallet_balance ?? 0);
  }
);

/**
 * پرداخت سفارش از کیف پول
 *
 * The backend returns `remaining_balance`, so a successful payment updates the
 * balance without a second round-trip. Failures carry `error_code`
 * (INSUFFICIENT_BALANCE, ALREADY_PAID, ...) which the caller turns into a
 * message with `describeWalletError`.
 */
export const payOrderWithWallet = createAsyncThunk(
  'wallet/payOrder',
  async ({ token, orderId }, { rejectWithValue }) => {
    const result = await payOrderFromWallet(token, orderId);

    if (!result.ok) {
      return rejectWithValue({ message: result.message, code: result.code });
    }

    return result.data;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    /** موجودی به تومان. `null` یعنی هنوز هیچ مقداری نداریم. */
    balance: null,
    /** آیا `/wallet/balance` تا حالا یک بار موفق پاسخ داده است؟ */
    fetched: false,
    loading: false,
    paying: false,
    error: null,
  },
  reducers: {
    /**
     * مقدار از `user.wallet` تا وقتی سرور موجودی واقعی را بدهد.
     *
     * Feeds the balance from the profile snapshot until `/wallet/balance` has
     * answered successfully at least once, and stops the moment it has.
     *
     * The `fetched` flag rather than a `balance === null` check matters when
     * that endpoint is unavailable: with the null check, the very first seed
     * won, every later one was ignored, and the balance froze at whatever it
     * was when the screen first opened — a top-up would never show. While the
     * server number is missing, the profile snapshot is the best value there
     * is, so keep taking it.
     */
    seedBalance: (state, action) => {
      if (!state.fetched && action.payload != null) {
        state.balance = Number(action.payload);
      }
    },
    clearWallet: (state) => {
      state.balance = null;
      state.fetched = false;
      state.loading = false;
      state.paying = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
        state.fetched = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        // Keep the last known balance rather than blanking the UI on a failed
        // refresh — a stale number reads better than a missing one, and no
        // payment decision is made from it on the client anyway.
        state.error = action.payload?.code || action.payload?.message || 'FETCH_FAILED';
      })
      .addCase(payOrderWithWallet.pending, (state) => {
        state.paying = true;
      })
      .addCase(payOrderWithWallet.fulfilled, (state, action) => {
        state.paying = false;
        state.error = null;
        if (action.payload?.remaining_balance != null) {
          state.balance = Number(action.payload.remaining_balance);
        }
      })
      .addCase(payOrderWithWallet.rejected, (state, action) => {
        state.paying = false;
        state.error = action.payload?.code || 'PAYMENT_ERROR';
      });
  },
});

export const { seedBalance, clearWallet } = walletSlice.actions;

/** موجودی قابل نمایش — تا وقتی از سرور نیامده، `0` نه `null`. */
export const selectWalletBalance = (state) => state.wallet?.balance ?? 0;

export { describeWalletError };

export default walletSlice.reducer;
