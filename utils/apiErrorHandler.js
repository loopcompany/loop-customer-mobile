import { Alert } from 'react-native';

/**
 * مدیریت خطاهای API مربوط به کنترل دسترسی کاربران سازمانی
 * 
 * @param {Object} error - خطای axios
 * @param {Object} navigation - navigation object از React Navigation
 * @returns {boolean} - آیا خطا handle شد یا نه
 */
export const handleApiError = (error, navigation) => {
  console.log('🚨 API Error Handler called:', {
    status: error?.response?.status,
    errorCode: error?.response?.data?.error_code,
    message: error?.response?.data?.message,
    hasNavigation: !!navigation
  });

  if (!error?.response) {
    // خطای شبکه یا عدم دسترسی به سرور
    Alert.alert(
      'خطای ارتباط',
      'اتصال به سرور برقرار نیست. لطفا اتصال اینترنت خود را بررسی کنید.',
      [{ text: 'متوجه شدم', style: 'default' }]
    );
    return true;
  }

  const { status, data } = error.response;
  
  switch (status) {
    case 403: {
      // دسترسی محدود - کاربران سازمانی غیرفعال
      if (data.error_code === 'ACCESS_RESTRICTED') {
        console.log('🚫 Access restricted detected, redirecting to AccessRestrictedScreen');
        
        if (navigation) {
          // هدایت به صفحه محدودیت دسترسی با اطلاعات کامل
          navigation.navigate('AccessRestrictedScreen', {
            type: 'access_denied',
            title: 'دسترسی محدود',
            message: data.message || 'لطفا منتظر تایید ادمین باشید',
            profileStatus: data.data?.profile_status || 'pending',
            contractStatus: data.data?.contract_status || 'pending', 
            profileRejectionReason: data.data?.profile_rejection_reason,
            contractRejectionReason: data.data?.contract_rejection_reason,
            nextSteps: data.data?.next_steps || [],
            allowedScreens: data.data?.allowed_screens || [],
            blockedMessage: data.data?.blocked_message
          });
        } else {
          // اگر navigation نداریم، فقط alert نشون بدیم
          Alert.alert(
            'دسترسی محدود',
            data.message || 'لطفا منتظر تایید ادمین باشید',
            [{ text: 'متوجه شدم', style: 'default' }]
          );
        }
        return true; // خطا handle شد
      }
      
      // سایر خطاهای 403
      Alert.alert(
        'عدم دسترسی',
        'شما مجوز انجام این عمل را ندارید',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
    
    case 401: {
      // خطای احراز هویت - token منقضی شده
      console.log('🔐 Authentication error detected');
      
      Alert.alert(
        'خطای احراز هویت',
        'نشست شما منقضی شده است. لطفا مجددا وارد شوید.',
        [
          {
            text: 'ورود مجدد',
            style: 'default',
            onPress: () => {
              if (navigation) {
                // پاک کردن navigation stack و رفتن به login
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          }
        ]
      );
      return true;
    }
    
    case 422: {
      // خطای validation
      const validationErrors = data.errors || {};
      const firstError = Object.values(validationErrors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      
      Alert.alert(
        'خطای اعتبارسنجی',
        errorMessage || data.message || 'اطلاعات وارد شده نامعتبر است',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
    
    case 429: {
      // خطای محدودیت درخواست
      Alert.alert(
        'درخواست‌های زیاد',
        'شما درخواست‌های زیادی ارسال کرده‌اید. لطفا کمی صبر کنید.',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
    
    case 500: {
      // خطای سرور
      Alert.alert(
        'خطای سرور',
        'مشکلی در سرور پیش آمده است. لطفا چند دقیقه دیگر مجددا تلاش کنید.',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
    
    case 503: {
      // سرویس در دسترس نیست
      Alert.alert(
        'سرویس در دسترس نیست',
        'سرویس موقتاً در دسترس نیست. لطفا بعداً مجددا تلاش کنید.',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
    
    default: {
      // سایر خطاها
      const message = data.message || 'خطای غیرمنتظره‌ای رخ داده است';
      Alert.alert(
        'خطا',
        message,
        [{ text: 'متوجه شدم', style: 'default' }]
      );
      return true;
    }
  }
};

/**
 * مدیریت خطاهای مخصوص کاربران سازمانی
 * 
 * @param {Object} error - خطای axios
 * @param {Object} navigation - navigation object
 * @param {Object} options - تنظیمات اضافی
 * @returns {boolean} - آیا خطا handle شد یا نه
 */
export const handleOrganizationApiError = (error, navigation, options = {}) => {
  const {
    showGenericErrorAlert = true,
    customErrorHandler = null,
    fallbackScreen = 'Home'
  } = options;
  
  console.log('🏢 Organization API Error Handler called:', {
    status: error?.response?.status,
    errorCode: error?.response?.data?.error_code,
    hasCustomHandler: !!customErrorHandler
  });
  
  // اول چک کنیم اگر custom handler داریم
  if (customErrorHandler && typeof customErrorHandler === 'function') {
    const handled = customErrorHandler(error, navigation);
    if (handled) return true;
  }
  
  // اگر خطای دسترسی کاربران سازمانی باشه
  if (error?.response?.status === 403 && error?.response?.data?.error_code === 'ACCESS_RESTRICTED') {
    const { data } = error.response;
    
    if (navigation) {
      navigation.navigate('AccessRestrictedScreen', {
        type: 'access_denied',
        title: 'دسترسی محدود برای کاربران سازمانی',
        message: data.message || 'حساب سازمانی شما هنوز تایید نشده است',
        profileStatus: data.data?.profile_status,
        contractStatus: data.data?.contract_status,
        profileRejectionReason: data.data?.profile_rejection_reason,
        contractRejectionReason: data.data?.contract_rejection_reason,
        nextSteps: data.data?.next_steps || [],
        blockedMessage: data.data?.blocked_message,
        allowedScreens: data.data?.allowed_screens || []
      });
    }
    return true;
  }
  
  // برای سایر خطاها از handler کلی استفاده کن
  return handleApiError(error, navigation);
};

/**
 * Helper function برای تشخیص نوع خطا
 * 
 * @param {Object} error - خطای axios
 * @returns {string} - نوع خطا
 */
export const getErrorType = (error) => {
  if (!error?.response) return 'network';
  
  const { status, data } = error.response;
  
  switch (status) {
    case 401: return 'authentication';
    case 403: 
      return data.error_code === 'ACCESS_RESTRICTED' ? 'access_restricted' : 'forbidden';
    case 422: return 'validation';
    case 429: return 'rate_limit';
    case 500: return 'server_error';
    case 503: return 'service_unavailable';
    default: return 'unknown';
  }
};

/**
 * تولید پیام خطای کاربرپسند
 * 
 * @param {Object} error - خطای axios
 * @returns {Object} - شامل title و message
 */
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const data = error?.response?.data || {};
  
  switch (errorType) {
    case 'network':
      return {
        title: 'خطای ارتباط',
        message: 'اتصال به سرور برقرار نیست. لطفا اتصال اینترنت خود را بررسی کنید.'
      };
      
    case 'authentication':
      return {
        title: 'خطای احراز هویت',
        message: 'نشست شما منقضی شده است. لطفا مجددا وارد شوید.'
      };
      
    case 'access_restricted':
      return {
        title: 'دسترسی محدود',
        message: data.message || 'لطفا منتظر تایید ادمین باشید'
      };
      
    case 'forbidden':
      return {
        title: 'عدم دسترسی',
        message: 'شما مجوز انجام این عمل را ندارید'
      };
      
    case 'validation':
      const validationErrors = data.errors || {};
      const firstError = Object.values(validationErrors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      
      return {
        title: 'خطای اعتبارسنجی',
        message: errorMessage || data.message || 'اطلاعات وارد شده نامعتبر است'
      };
      
    case 'rate_limit':
      return {
        title: 'درخواست‌های زیاد',
        message: 'شما درخواست‌های زیادی ارسال کرده‌اید. لطفا کمی صبر کنید.'
      };
      
    case 'server_error':
      return {
        title: 'خطای سرور',
        message: 'مشکلی در سرور پیش آمده است. لطفا چند دقیقه دیگر مجددا تلاش کنید.'
      };
      
    case 'service_unavailable':
      return {
        title: 'سرویس در دسترس نیست',
        message: 'سرویس موقتاً در دسترس نیست. لطفا بعداً مجددا تلاش کنید.'
      };
      
    default:
      return {
        title: 'خطا',
        message: data.message || 'خطای غیرمنتظره‌ای رخ داده است'
      };
  }
};

export default {
  handleApiError,
  handleOrganizationApiError,
  getErrorType,
  getErrorMessage
};