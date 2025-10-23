import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchWishlist = createAsyncThunk('items/fetchWishlist', async (token) => {
    return await axios
        .get(`${uri}/fetchWishlist`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => { console.log(error); })
})

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        loading: false,
        items: [],
        error: '',
    },
    extraReducers: builder => {
        builder.addCase(fetchWishlist.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchWishlist.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload
            state.error = ''
        })
        builder.addCase(fetchWishlist.rejected, (state, action) => {
            state.loading = false
            state.items = []
            state.error = action.error.message
        })
    },
    reducers: {
        emptyWishlist: (state, action) => {
            state.loading = false
            state.items = []
            state.error = ''
        },
    }
})

export const { emptyWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;