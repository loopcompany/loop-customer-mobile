import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        userType: null, // 'individual' or 'organization'
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
            state.authError = null;
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
    setUserType,
    removeToken, 
    setAuthLoading, 
    setAuthError, 
    clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;