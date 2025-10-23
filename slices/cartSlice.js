import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchCart = createAsyncThunk('items/fetchCart', async (token) => {
    return await axios
        .get(`${uri}/fetchCart`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => { console.log(error); })
})

export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        loading: false,
        items: [],
        error: '',
        totalPrice: 0,
        totalDiscountedPrice: 0,
    },
    extraReducers: builder => {
        builder.addCase(fetchCart.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload
            state.error = ''
            state.totalPrice = state.items.reduce((total, item) => {
                const price = item.product_variety.price || 0;
                return total + (price * item.quantity);
            }, 0)
            state.totalDiscountedPrice = state.items.reduce((total, item) => {
                const price = item.product_variety.discounted_price > 0 ? item.product_variety.discounted_price : item.product_variety.price;
                return total + (price * item.quantity);
            }, 0)
        })
        builder.addCase(fetchCart.rejected, (state, action) => {
            state.loading = false
            state.items = []
            state.error = action.error.message
            state.totalPrice = 0
            state.totalDiscountedPrice = 0
        })
    },
    reducers: {
        emptyCart: (state, action) => {
            state.loading = false
            state.items = []
            state.error = ''
            state.totalPrice = 0
            state.totalDiscountedPrice = 0
        },
    }
})

export const { emptyCart } = cartSlice.actions;

export const selectCartItemById = (state, productVarietyId) => state.cart.items.find(item => item?.product_variety_id == productVarietyId);

export default cartSlice.reducer;