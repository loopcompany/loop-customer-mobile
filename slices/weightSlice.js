import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment';
import { uri } from '@services/URL';

export const fetchUserWeights = createAsyncThunk('items/fetchUserWeights', async (token) => {
    return await axios
        .get(`${uri}/fetchUserWeights`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => { console.log(error); })
})

export const weightSlice = createSlice({
    name: 'weight',
    initialState: {
        loading: false,
        items: [],
        error: '',
    },
    extraReducers: builder => {
        builder.addCase(fetchUserWeights.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchUserWeights.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload.map(item => ({
                value: item.weight,
                label: moment(item.created_at).format('DD MMM')
            }));
            state.error = ''
        })
        builder.addCase(fetchUserWeights.rejected, (state, action) => {
            state.loading = false
            state.items = []
            state.error = action.error.message
        })
    },
    reducers: {
        emptyWeight: (state, action) => {
            state.loading = false
            state.items = []
            state.error = ''
        },
    }
})

export const { emptyWeight } = weightSlice.actions;

export default weightSlice.reducer;