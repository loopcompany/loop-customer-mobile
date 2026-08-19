import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@services/Api';
import axios from 'axios';
import { uri } from '@services/URL';

export const fetchMinPrice = createAsyncThunk('user/fetchMinPrice', async (token, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${uri}/min-price`);

        return response.data?.data;

    } catch (error) {  
        return rejectWithValue(error.response?.data?.message || 'Network error');
    }
});

const pdfSlice = createSlice({
    name: 'minPrice',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchMinPrice.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchMinPrice.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchMinPrice.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
    reducers: {
         
    }
});
 

export default pdfSlice.reducer