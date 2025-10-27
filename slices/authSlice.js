import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
            state.authError = null;
        },
        removeToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.authError = null;
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
    removeToken, 
    setAuthLoading, 
    setAuthError, 
    clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;