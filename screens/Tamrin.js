import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'nilo',
    initialState: {
        tok: null
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        removeToken: (state, action) => {
            state.token = null;
        },
    }
});




export const { setToken, removeToken } = authSlice.actions;

export default authSlice.reducer