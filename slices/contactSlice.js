import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '@services/URL';

export const fetchContacts = createAsyncThunk('contact/fetchContacts', async () => {
    return await axios
        .get(`${uri}/contact/phone`)
        .then(response => {
            return response.data;
        })
        // بلعیده می‌شود چون شماره‌ی تماس اختیاری است و نبودش نباید اپ را متوقف کند —
        // ولی باید معلوم باشد *کدام* درخواست شکست خورده است.
        .catch(error => { console.warn('[contactSlice] GET /contact/phone failed:', error?.message); })
})

const contactSlice = createSlice({
    name: 'contacts',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchContacts.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchContacts.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchContacts.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
});

export default contactSlice.reducer