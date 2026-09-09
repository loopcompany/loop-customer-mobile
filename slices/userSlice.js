import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@services/Api';

export const fetchUser = createAsyncThunk('user/fetchUser', async (token, { rejectWithValue }) => {
    try {
        const response = await authAPI.validateToken(token);
        
        if (response.success && response.valid) {
            return response.data.user;
        } else {
            return rejectWithValue(response.message || 'Token validation failed');
        }
    } catch (error) {
        console.error('fetchUser error:', error);
        return rejectWithValue(error.response?.data?.message || 'Network error');
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchUser.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchUser.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
    reducers: {
        emptyUser: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
        }
    }
});

export const { emptyUser } = userSlice.actions;

export default userSlice.reducer