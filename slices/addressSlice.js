import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uri } from '../services/URL';

export const fetchAddresses = createAsyncThunk('addresses/addresses', async (token) => {
    return await axios
        .get(`${uri}/addresses`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => {

            // بر اساس response شما که نشون دادید، data در response.data.data هست
            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            // fallback
            return response.data.data || response.data || [];
        })
        .catch(error => {
            console.log('Fetch addresses error:', error);
            throw new Error(error.response?.data?.message || error.message);
        })
})

export const addressSlice = createSlice({
    name: 'address',
    initialState: {
        loading: false,
        data: [],
        error: '',
        title: '',
        fname: '',
        lname: '',
        unit: '',
        number: '',
        floor: '',
        telephone: '',
        mobile: '',
        city: 'تهران',
        region: '',
        address: '',
        latitude: null,
        longitude: null
    },
    extraReducers: builder => {
        builder.addCase(fetchAddresses.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchAddresses.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchAddresses.rejected, (state, action) => {
            state.loading = false
            state.data = []
            state.error = action.error.message
        })
    },
    reducers: {
        setTitle: (state, action) => {
            state.title = action.payload;
        },
        setFname: (state, action) => {
            state.fname = action.payload;
        },
        setLname: (state, action) => {
            state.lname = action.payload;
        },
        setUnit: (state, action) => {
            state.unit = action.payload;
        },
        setNumber: (state, action) => {
            state.number = action.payload;
        },
        setFloor: (state, action) => {
            state.floor = action.payload;
        },
        setTelephone: (state, action) => {
            state.telephone = action.payload;
        },
        setMobile: (state, action) => {
            state.mobile = action.payload;
        },
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setRegion: (state, action) => {
            state.region = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        setLatitude: (state, action) => {
            state.latitude = action.payload;
        },
        setLongitude: (state, action) => {
            state.longitude = action.payload;
        },
        emptyAddress: (state) => {
            state.title = '';
            state.fname = '';
            state.lname = '';
            state.telephone = '';
            state.mobile = '';
            state.city = '';
            state.region = '';
            state.address = '';
            state.latitude = null;
            state.longitude = null;
        }
    }
})

export const { setTitle, setFname, setLname, setTelephone, setMobile, setCity, setRegion, setAddress, setLatitude, setLongitude, emptyAddress, setUnit, setNumber, setFloor } = addressSlice.actions

export default addressSlice.reducer