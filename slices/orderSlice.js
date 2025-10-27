import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchOrders = createAsyncThunk('orders/orders', async (token) => {
    return await axios
        .get(`${uri}/orders`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => {
            console.log(error);
            throw new Error(error.response?.data?.message || error.message);
        })
})

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchOrders.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchOrders.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchOrders.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
    reducers: {
        emptyOrders: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
        }
    }
});

export const { emptyOrders } = orderSlice.actions;

export default orderSlice.reducer