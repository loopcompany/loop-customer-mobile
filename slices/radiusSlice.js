import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uri } from '@services/URL';

export const fetchRadii = createAsyncThunk('radii/radii', async (token) => {
    return await axios
        .get(`${uri}/locations/radii`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => {
            
            // بر اساس response شما که نشون دادید، data در response.data.data هست
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            
            // fallback
            return response.data.data || response.data || [];
        })
        .catch(error => {
            console.log('Fetch radii error:', error);
            throw new Error(error.response?.data?.message || error.message);
        })
})

export const radiusSlice = createSlice({
    name: 'radius',
    initialState: {
        loading: false,
        data: [],
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchRadii.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchRadii.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchRadii.rejected, (state, action) => {
            state.loading = false
            state.data = []
            state.error = action.error.message
        })
    }
    
})


export default radiusSlice.reducer