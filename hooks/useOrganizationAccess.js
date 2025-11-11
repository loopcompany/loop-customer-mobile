import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uri } from '../services/URL';
import { 
  setAccessStatus, 
  setAccessLoading,
  updateProfileStatus,
  updateContractStatus,
  clearAccessData
} from '../slices/organizationSlice';
import { setUserType } from '../slices/authSlice';
import { 
  useDebouncedCallback, 
  organizationAccessCache,
  PERFORMANCE_CONFIGS 
} from '../utils/performanceOptimization';

/**
 * Hook برای کنترل دسترسی کاربران سازمانی
 * 
 * @returns {Object} شامل وضعیت دسترسی، loading، و توابع کمکی
 */
export const useOrganizationAccess = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  
  const { userType, token, isAuthenticated } = useSelector(state => state.auth);
  const { 
    accessStatus, 
    accessLoading,
    profileStatus, 
    contractStatus, 
    hasCompleteAccess,
    blockedMessage,
    nextSteps,
    profileRejectionReason,
    contractRejectionReason,
    lastStatusCheck 
  } = useSelector(state => state.organization);

  // 🔍 DEBUG: Log Redux state
  console.log('🔍 useOrganizationAccess Redux state:', {
    profileStatus,
    contractStatus,
    hasCompleteAccess,
    accessStatus: accessStatus ? 'exists' : 'null',
    userType,
    isAuthenticated,
    token: token ? 'exists' : 'null'
  });

  // 🔒 SECURITY FIX: دسترسی پیش‌فرض باید محدود باشد
  // فقط بعد از تایید، دسترسی داده می‌شود
  const actualHasCompleteAccess = (() => {
    // اگر لاگین نکرده، هیچ دسترسی نداره
    if (!isAuthenticated || !token) {
      return false;
    }
    
    // اگر userType هنوز مشخص نیست، سعی کن از AsyncStorage بخونی
    if (!userType || userType === null) {
      // برای امنیت، در حالی که userType load می‌شه، دسترسی محدود باشد
      return false;
    }
    
    // کاربران فردی دسترسی آزاد دارند
    if (userType === 'individual') {
      return true;
    }
    
    // کاربران سازمانی فقط با تایید کامل
    if (userType === 'organization') {
      return hasCompleteAccess === true;
    }
    
    // در هر حالت دیگر، محدود
    return false;
  })();
  
  /**
   * دریافت وضعیت دسترسی از سرور (با performance optimization)
   */
  const fetchAccessStatus = useDebouncedCallback(async (forceRefresh = false) => {
    // 🔒 SECURITY: فقط کاربران فردی احراز هویت شده دسترسی آزاد دارند
    // اگر token نداریم یا authenticated نیستیم، هیچ دسترسی نمی‌دهیم
    if (!token || !isAuthenticated) {
      // کاربر لاگین نکرده - بدون دسترسی
      return;
    }
    
    // اگر کاربر فردی است (نه سازمانی)، دسترسی آزاد
    if (userType === 'individual') {
      dispatch(setAccessStatus({
        profile_status: 'approved',
        contract_status: 'approved',
        has_complete_access: true
      }));
      return;
    }
    
    // اگر userType هنوز مشخص نیست، منتظر بمانیم
    if (!userType || userType === null) {
      return;
    }
    
    // از اینجا به بعد، فقط کاربران سازمانی می‌رسند
    if (userType !== 'organization') {
      return;
    }

    // بررسی cache با استفاده از performanceOptimization
    const cacheKey = `org_access_${token?.slice(-10)}`;
    if (!forceRefresh) {
      const cachedData = organizationAccessCache.get(cacheKey);
      if (cachedData) {
        console.log('📱 Using cached organization access data');
        dispatch(setAccessStatus(cachedData));
        return cachedData;
      }
    }
    
    try {
      dispatch(setAccessLoading(true));
      setError(null);
      
      const response = await axios.get(`${uri}/organization/profile/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('🌐 API /organization/profile/status response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('📥 Dispatching setAccessStatus with data:', response.data.data);
        dispatch(setAccessStatus(response.data.data));
        
        // Cache the successful result
        organizationAccessCache.set(cacheKey, response.data.data, PERFORMANCE_CONFIGS.CACHE_TTL);
      } else {
        throw new Error(response.data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Error fetching organization access status:', error);
      
      if (error.response?.status === 401) {
        // Token منقضی شده
        setError('لطفا مجدداً وارد شوید');
      } else if (error.response?.status === 403) {
        // دسترسی غیرمجاز
        setError('شما کاربر سازمانی نیستید');
      } else if (error.response?.status === 500) {
        setError('خطای سرور، لطفا دوباره تلاش کنید');
      } else {
        setError(error.message || 'خطا در دریافت اطلاعات دسترسی');
      }
      
      // در صورت خطا، دسترسی محدود قرار دهیم
      dispatch(setAccessStatus({
        profile_status: 'pending',
        contract_status: 'pending',
        has_complete_access: false,
        blocked_message: 'خطا در دریافت اطلاعات دسترسی'
      }));
    } finally {
      dispatch(setAccessLoading(false));
    }
  }, PERFORMANCE_CONFIGS.API_DEBOUNCE_DELAY, [userType, token, isAuthenticated, dispatch]);

  /**
   * Load userType از AsyncStorage اگر null باشه
   */
  useEffect(() => {
    const loadUserType = async () => {
      if (!userType && isAuthenticated && token) {
        try {
          const savedUserType = await AsyncStorage.getItem('accountType');
          if (savedUserType) {
            console.log('📱 Loading userType from AsyncStorage:', savedUserType);
            dispatch(setUserType(savedUserType));
          } else {
            // اگر userType در AsyncStorage نیست، default individual فرض کن
            console.log('📱 No userType in AsyncStorage, defaulting to individual');
            dispatch(setUserType('individual'));
            await AsyncStorage.setItem('accountType', 'individual');
          }
        } catch (error) {
          console.error('📱 Error loading userType from AsyncStorage:', error);
          // در صورت خطا، individual فرض کن
          dispatch(setUserType('individual'));
        }
      }
    };

    loadUserType();
  }, [userType, isAuthenticated, token, dispatch]);

  /**
   * پاک کردن داده‌های دسترسی (برای logout)
   */
  const clearAccess = useCallback(() => {
    dispatch(clearAccessData());
    
    // Clear cache on logout
    const cacheKey = `org_access_${token?.slice(-10)}`;
    organizationAccessCache.delete(cacheKey);
  }, [dispatch, token]);
  
  /**
   * چک کردن دسترسی به صفحه خاص
   */
  const canAccessScreen = useCallback((screenName) => {
    // � اگر لاگین نکرده، اجازه دسترسی بده (صفحه لاگین نشون میده)
    if (!isAuthenticated || !token) {
      return true;
    }
    
    // �🔒 اگر userType هنوز مشخص نیست، دسترسی ندهیم
    if (!userType || userType === null) {
      return false;
    }
    
    // کاربران فردی دسترسی آزاد دارند
    if (userType === 'individual') {
      return true;
    }
    
    // کاربران سازمانی - ادامه چک‌ها
    if (userType !== 'organization') {
      return false;
    }
    
    // اگر دسترسی کامل داره، همه صفحات مجاز
    if (hasCompleteAccess) {
      return true;
    }
    
    // صفحات همیشه مجاز برای کاربران سازمانی
    const alwaysAllowedScreens = [
      // صفحات مربوط به مدیریت حساب سازمانی
      'OrganizationProfile',
      'OrganizationContract', 
      'AccountSettings',
      'Profile',
      'Settings',
      
      // صفحات مربوط به مدیریت حساب شخصی
      'AddressScreen',
      'PaymentScreen',
      'Increase', // افزایش اعتبار
      
      // صفحات عمومی
      'Landing',
      'Welcome',
      
      // صفحات مربوط به احراز هویت
      'Login',
      'LoginScreen', 
      'Register',
      'SignInLanding',
      'MainSignIn',
      'RegistrationVerificationScreen',
      'ForgotPassword',
      'ResetPasswordScreen',
      
      // صفحات resources و اطلاعات
      'PrivacyScreen',
      'LearnMoreScreen',
      'AboutScreen',
      'WarrantyScreen',
      
      // صفحات پشتیبانی
      'ViolationReportScreen',
      'FeedbackSurveyScreen',
      
      // صفحه محدودیت دسترسی خود
      'AccessRestrictedScreen'
    ];
    
    return alwaysAllowedScreens.includes(screenName);
  }, [userType, hasCompleteAccess]);
  
  /**
   * چک کردن امکان ثبت سفارش
   */
  const canPlaceOrder = useCallback(() => {
    // � اگر لاگین نکرده، اجازه دسترسی بده (صفحه لاگین نشون میده)
    if (!isAuthenticated || !token) {
      return true;
    }
    
    // �🔒 اگر userType هنوز مشخص نیست، دسترسی ندهیم
    if (!userType || userType === null) {
      return false;
    }
    
    // کاربران فردی می‌توانند سفارش ثبت کنند
    if (userType === 'individual') {
      return true;
    }
    
    // کاربران سازمانی فقط با دسترسی کامل
    if (userType === 'organization') {
      return actualHasCompleteAccess;
    }
    
    return false;
  }, [userType, actualHasCompleteAccess]);
  
  /**
   * گرفتن پیام محدودیت
   */
  const getBlockedMessage = useCallback(() => {
    // 🔒 اگر userType مشخص نیست
    if (!userType || userType === null) {
      return 'در حال بررسی وضعیت کاربر...';
    }
    
    if (userType === 'individual' || actualHasCompleteAccess) {
      return null;
    }
    
    return blockedMessage || 'لطفا منتظر تایید ادمین باشید';
  }, [userType, actualHasCompleteAccess, blockedMessage]);
  
  /**
   * گرفتن لیست مراحل بعدی
   */
  const getNextSteps = useCallback(() => {
    // 🔒 اگر userType مشخص نیست
    if (!userType || userType === null) {
      return [];
    }
    
    if (userType === 'individual' || actualHasCompleteAccess) {
      return [];
    }
    
    // اگر از API مراحل دریافت کرده‌ایم، استفاده کنیم
    if (nextSteps && nextSteps.length > 0) {
      return nextSteps.map(step => {
        switch (step) {
          case 'upload_contract': return 'آپلود قرارداد امضا شده';
          case 'wait_for_approval': return 'انتظار برای تایید ادمین';
          case 'complete_profile': return 'تکمیل اطلاعات پروفایل';
          default: return step;
        }
      });
    }
    
    // اگر نه، خودمان محاسبه می‌کنیم
    const steps = [];
    
    if (profileStatus === 'rejected') {
      steps.push('ویرایش و اصلاح اطلاعات پروفایل');
    }
    
    if (contractStatus === 'not_uploaded') {
      steps.push('آپلود قرارداد امضا شده');
    } else if (contractStatus === 'rejected') {
      steps.push('آپلود مجدد قرارداد با رفع مشکلات');
    }
    
    if (profileStatus === 'pending' || contractStatus === 'pending') {
      steps.push('انتظار برای تایید ادمین');
    }
    
    return steps;
  }, [userType, actualHasCompleteAccess, profileStatus, contractStatus, nextSteps]);
  
  // 🔧 FIX: فقط یک useEffect برای بارگذاری
  // بارگذاری وقتی userType، token یا isAuthenticated تغییر می‌کند
  useEffect(() => {
    if (isAuthenticated && token && userType) {
      fetchAccessStatus();
    }
  }, [userType, token, isAuthenticated]); // fetchAccessStatus رو حذف کردیم تا dependency loop نداشته باشیم
  
  /**
   * بروزرسانی دستی وضعیت پروفایل
   */
  const updateProfile = useCallback((status) => {
    dispatch(updateProfileStatus(status));
  }, [dispatch]);

  /**
   * بروزرسانی دستی وضعیت قرارداد
   */
  const updateContract = useCallback((status) => {
    dispatch(updateContractStatus(status));
  }, [dispatch]);

  return {
    // وضعیت اصلی
    accessStatus,
    loading: accessLoading,
    error,
    
    // وضعیت‌های محاسبه شده
    hasCompleteAccess: actualHasCompleteAccess,
    isOrganizationUser: isAuthenticated && token && userType === 'organization',
    
    // وضعیت‌های جزئی
    profileStatus,
    contractStatus,
    
    // پیام‌ها و مراحل
    blockedMessage,
    nextSteps,
    
    // توابع کمکی
    canAccessScreen,
    canPlaceOrder,
    getBlockedMessage,
    getNextSteps,
    
    // توابع بارگذاری و بروزرسانی
    refetch: () => fetchAccessStatus(true), // force refresh
    fetchAccessStatus,
    updateProfile,
    updateContract,
    clearAccess,
    
    // پیام‌های خطا و رد (از Redux state)
    profileRejectionReason,
    contractRejectionReason,
    
    // تاریخ‌های تایید
    profileApprovedAt: accessStatus?.profile_approved_at,
    contractApprovedAt: accessStatus?.contract_approved_at,
    
    // Cache info
    lastStatusCheck,
    cacheStats: organizationAccessCache.getStats(),
  };
};

export default useOrganizationAccess;