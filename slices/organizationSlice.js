import { createSlice } from '@reduxjs/toolkit';

const organizationSlice = createSlice({
    name: 'organization',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    reducers: {
        setOrganizationData: (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = '';
        },
        setOrganizationLoading: (state, action) => {
            state.loading = action.payload;
        },
        setOrganizationError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearOrganizationData: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
        }
    }
});

export const { 
    setOrganizationData, 
    setOrganizationLoading, 
    setOrganizationError, 
    clearOrganizationData 
} = organizationSlice.actions;

export default organizationSlice.reducer;
