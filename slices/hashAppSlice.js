import { createSlice } from '@reduxjs/toolkit';

export const hashAppSlice = createSlice({
    name: 'hashApp',
    initialState: {
        hash: null
    },
    reducers: {
        setHashApp: (state, action) => {
            state.hash = action.payload;
        },
        removeHashApp: (state, action) => {
            state.hash = null;
        },
    }
});

export const { setHashApp, removeHashApp } = hashAppSlice.actions;

export default hashAppSlice.reducer