import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth?.token;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');

            const response = await axios.get(`${uri}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('Orders API response:', response.data);

            if (response.data?.success) {
                return response.data.data || [];
            }
            
            return [];
        } catch (error) {
            console.error('Fetch orders error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'خطا در دریافت لیست سفارشات');
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        data: [],
        loading: false,
        error: null,
        lastFetch: null,
    },
    reducers: {
        clearOrders: (state) => {
            state.data = [];
            state.error = null;
            state.lastFetch = null;
        },
        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            const order = state.data.find(o => o.id === orderId);
            if (order) {
                order.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.lastFetch = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'خطا در دریافت سفارشات';
            });
    }
});

export const { clearOrders, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
