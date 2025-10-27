import { createSlice } from '@reduxjs/toolkit'

export const categorySlice = createSlice({
    name: 'category',
    initialState: {
        data: {}
    },
    reducers: {
        setCategory: (state, action) => {
            state.data = action.payload;
        },

        emptyCategory: (state) => {
            state.data = {};
        },
    }
})

export const { setCategory, emptyCategory } = categorySlice.actions

export default categorySlice.reducer