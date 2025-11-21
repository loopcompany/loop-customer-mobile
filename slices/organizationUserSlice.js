import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

// Async thunk برای دریافت اطلاعات کاربر سازمانی از API
export const fetchOrganizationUser = createAsyncThunk(
  'organizationUser/fetchOrganizationUser',
  async (token, { rejectWithValue }) => {
    try {
      console.log('🔄 [fetchOrganizationUser] شروع دریافت اطلاعات کاربر سازمانی...');
      
      const response = await axios.get(`${uri}/organization/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      console.log('✅ [fetchOrganizationUser] پاسخ دریافت شد:', response.data);

      if (response.data.status === 'success') {
        const userData = response.data.data;
        console.log('✅ [fetchOrganizationUser] اطلاعات کاربر سازمانی دریافت شد');
        return userData;
      } else {
        console.log('❌ [fetchOrganizationUser] وضعیت پاسخ success نیست');
        return rejectWithValue(response.data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('❌ [fetchOrganizationUser] خطا:', error);
      return rejectWithValue(
        error.response?.data?.message || 'خطا در دریافت اطلاعات کاربر سازمانی'
      );
    }
  }
);

// Async thunk برای به‌روزرسانی پروفایل کاربر سازمانی
export const updateOrganizationProfile = createAsyncThunk(
  'organizationUser/updateOrganizationProfile',
  async ({ token, profileData, hasImage }, { rejectWithValue }) => {
    try {
      console.log('🔄 [updateOrganizationProfile] شروع به‌روزرسانی پروفایل...');
      
      let requestData;
      let requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      if (hasImage) {
        // استفاده از FormData برای آپلود تصویر
        const formData = new FormData();
        
        Object.keys(profileData).forEach(key => {
          if (profileData[key] !== null && profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
          }
        });
        
        requestData = formData;
        requestHeaders['Content-Type'] = 'multipart/form-data';
      } else {
        // استفاده از JSON برای داده‌های بدون تصویر
        requestData = profileData;
        requestHeaders['Content-Type'] = 'application/json';
      }

      const response = await axios.put(
        `${uri}/organization/profile`,
        requestData,
        { headers: requestHeaders }
      );

      console.log('✅ [updateOrganizationProfile] پاسخ دریافت شد:', response.data);

      if (response.data.status === 'success') {
        console.log('✅ [updateOrganizationProfile] پروفایل با موفقیت به‌روزرسانی شد');
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      console.error('❌ [updateOrganizationProfile] خطا:', error);
      return rejectWithValue(
        error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل'
      );
    }
  }
);

const organizationUserSlice = createSlice({
  name: 'organizationUser',
  initialState: {
    loading: false,
    data: null,
    error: '',
    updating: false,
    updateError: '',
  },
  reducers: {
    // پاک کردن اطلاعات کاربر سازمانی (برای logout)
    clearOrganizationUser: (state) => {
      state.loading = false;
      state.data = null;
      state.error = '';
      state.updating = false;
      state.updateError = '';
    },
    // به‌روزرسانی مستقیم فیلدهای خاص (برای UI responsive)
    updateOrganizationUserField: (state, action) => {
      if (state.data) {
        state.data = {
          ...state.data,
          ...action.payload
        };
      }
    },
  },
  extraReducers: (builder) => {
    // fetchOrganizationUser
    builder
      .addCase(fetchOrganizationUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchOrganizationUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = '';
      })
      .addCase(fetchOrganizationUser.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload || 'خطا در دریافت اطلاعات';
      })
      
    // updateOrganizationProfile
      .addCase(updateOrganizationProfile.pending, (state) => {
        state.updating = true;
        state.updateError = '';
      })
      .addCase(updateOrganizationProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.data = action.payload; // به‌روزرسانی با داده‌های جدید از سرور
        state.updateError = '';
      })
      .addCase(updateOrganizationProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || 'خطا در به‌روزرسانی';
      });
  },
});

export const { clearOrganizationUser, updateOrganizationUserField } = organizationUserSlice.actions;

export default organizationUserSlice.reducer;
