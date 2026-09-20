import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uri } from '@services/URL';

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

/** شهرِ پیش‌فرضِ فرم — سرویس فعلاً فقط تهران را پوشش می‌دهد. */
export const DEFAULT_CITY = 'تهران';

/** فیلدهایی که فرمِ آدرس مالکشان است (برخلاف `data`/`loading`/`error`). */
const emptyForm = {
    title: '',
    fname: '',
    lname: '',
    unit: '',
    number: '',
    floor: '',
    telephone: '',
    mobile: '',
    city: '',
    region: '',
    address: '',
    // آخرین متنی که از نقشه در «آدرس» نشست. با آن می‌شود فهمید متنِ فعلی
    // نوشته‌ی کاربر است یا نتیجه‌ی ژئوکدینگ — و نوشته‌ی کاربر را بازنویسی نکرد.
    addressFromMap: '',
    latitude: null,
    longitude: null,
    // نقشه همیشه یک مرکز دارد؛ این پرچم می‌گوید کاربر واقعاً نقطه‌ای را انتخاب
    // کرده یا فقط نقشه باز شده است.
    locationPicked: false,
};

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
        city: DEFAULT_CITY,
        region: '',
        address: '',
        addressFromMap: '',
        latitude: null,
        longitude: null,
        locationPicked: false
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
        /**
         * هر دو مختصات با هم — نقطه‌ی نقشه یک چیز است، نه دو تا.
         * دو dispatchِ جدا یعنی یک رندرِ میانی با عرضِ جغرافیاییِ جدید و طولِ
         * قدیمی، که اعتبارسنجیِ «داخل محدوده» را روی یک نقطه‌ی بی‌معنا اجرا می‌کرد.
         */
        setLocation: (state, action) => {
            const { latitude, longitude } = action.payload || {};
            const valid = Number.isFinite(latitude) && Number.isFinite(longitude);
            state.latitude = valid ? latitude : null;
            state.longitude = valid ? longitude : null;
            // این اکشن فقط از مسیرِ انتخابِ آگاهانه صدا زده می‌شود (کشیدنِ نقشه،
            // دکمه‌ی موقعیتِ من، نتیجه‌ی جست‌وجو، تاییدِ تمام‌صفحه).
            state.locationPicked = valid;
        },
        /**
         * پر کردنِ چند فیلد با یک اکشن — نتیجه‌ی ژئوکدینگِ معکوسِ نقشه از این
         * راه می‌آید. فقط کلیدهای شناخته‌شده پذیرفته می‌شوند تا `data` یا
         * `loading` تصادفاً بازنویسی نشوند.
         */
        setAddressFields: (state, action) => {
            const patch = action.payload || {};
            Object.keys(emptyForm).forEach((key) => {
                if (patch[key] !== undefined) state[key] = patch[key];
            });
        },
        /**
         * فرم را به حالتِ اول برمی‌گرداند.
         *
         * `emptyAddress` این کار را ناقص می‌کرد: «واحد»، «پلاک» و «طبقه» را جا
         * می‌گذاشت، پس آدرسِ بعدی با واحد و طبقه‌ی آدرسِ قبلی شروع می‌شد.
         */
        resetAddressForm: (state) => {
            Object.assign(state, emptyForm, { city: DEFAULT_CITY });
        },
        emptyAddress: (state) => {
            Object.assign(state, emptyForm);
        }
    }
})

export const {
    setTitle,
    setFname,
    setLname,
    setTelephone,
    setMobile,
    setCity,
    setRegion,
    setAddress,
    setLatitude,
    setLongitude,
    setLocation,
    setAddressFields,
    resetAddressForm,
    emptyAddress,
    setUnit,
    setNumber,
    setFloor,
} = addressSlice.actions

export default addressSlice.reducer