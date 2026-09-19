import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        userType: null, // 'individual' or 'organization'
        /**
         * آیا نشستِ ذخیره‌شده از AsyncStorage خوانده شده است؟
         *
         * Has the stored session been read back from AsyncStorage yet?
         *
         * `token: null` is ambiguous on a cold start: it means either "signed
         * out" or "not read yet". A guard that cannot tell those apart bounces
         * a signed-in user to the login page on every launch, so anything that
         * acts on the *absence* of a token must wait for this flag.
         * `AuthInitializer` sets it once, pass or fail.
         */
        isRestored: false,
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
            state.authError = null;
        },
        /** Marks the AsyncStorage read as finished — see `isRestored`. */
        setAuthRestored: (state) => {
            state.isRestored = true;
        },
        setUserType: (state, action) => {
            state.userType = action.payload;
        },
        removeToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.authError = null;
            state.userType = null;
        },
        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setAuthError: (state, action) => {
            state.authError = action.payload;
            state.isLoading = false;
        },
        clearAuthError: (state) => {
            state.authError = null;
        },
    }
});

export const { 
    setToken, 
    setAuthRestored,
    setUserType,
    removeToken, 
    setAuthLoading, 
    setAuthError, 
    clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;