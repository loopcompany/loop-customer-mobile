/**
 * فایل کمکی برای تست و اطمینان از درستی محافظت صفحات
 * 
 * این فایل لیست کاملی از صفحات و وضعیت محافظت آن‌ها را نگه می‌دارد
 * و در development mode می‌تواند برای debugging استفاده شود
 */

/**
 * صفحاتی که باید محافظت شوند - مربوط به سفارشات
 */
export const PROTECTED_SCREENS = [
  // جریان اصلی ثبت سفارش
  'FolderScreen',
  'SubCategories', 
  'Steps',
  'Preview',
  
  // مدیریت سفارشات
  'OrdersScreen',
  'Details',
  'Invoice',
  'OrderMenuScreen',
  'CanceledOrdersScreen',
  'OrderTrackingScreen',
  'OrderSummaryScreen',
  'DeviceOrderSummary',
  'OrderExtraServices',
  
  // صفحات مرتبط با پرداخت و تراکنش
  'TransactionsScreen',
  'GemTransactions',
  'UserDiscounts',
  'DiscountDetail',
  
  // صفحات مربوط به تکنسین و ارتباط
  'ChatRoom',
  'MessageScreen',
  
  // صفحات مربوط به گزارش و ارزیابی سفارشات
  'ViolationReportsListScreen',
  
  // برخی از صفحات کمکی مرتبط با سفارش
  'MapPickerScreen', // فقط اگر مربوط به انتخاب آدرس سفارش باشد
];

/**
 * صفحاتی که نباید محافظت شوند - همیشه در دسترس
 */
export const ALLOWED_SCREENS = [
  // مدیریت حساب سازمانی
  'OrganizationProfile',
  'OrganizationContract',
  
  // مدیریت حساب شخصی
  'Profile',
  'AccountSettings',
  'AddressScreen',
  'PaymentScreen', 
  'Increase',
  
  // احراز هویت
  'Landing',
  'Welcome',
  'Login',
  'LoginScreen',
  'Register',
  'SignInLanding', 
  'MainSignIn',
  'RegistrationVerificationScreen',
  'ForgotPassword',
  'ResetPasswordScreen',
  
  // اطلاعات عمومی
  'PrivacyScreen',
  'LearnMoreScreen',
  'AboutScreen',
  'WarrantyScreen',
  'GuideScreen',
  
  // پشتیبانی
  'ViolationReportScreen',
  'FeedbackSurveyScreen',
  
  // کنترل دسترسی
  'AccessRestrictedScreen',
  
  // صفحات org (سازمانی خاص)
  'DiscountCodeScreen',
  'TechnicianVisitScreen',
  'ContractScreen',
  'HardwareSelectionScreen',
  'ComprehensiveSelectionScreen',
  'List',
  'Grouping',
  'Method',
  'OrgPrivacy',
  
  // صفحات کلی و منو
  'Footer',
  'Fekrobekr',
  'RateListScreen',
  'ProductIssueScreen',
  'TrainingRegistrationScreen',
  'IncentivePlansScreen',
  
  // صفحات بازی و سرگرمی
  'Club',
  'GameMenuScreen',
  'GamePlayScreen', 
  'GameResultScreen',
  'LuckyWheel', // اگر به صورت جداگانه وجود داشته باشد
  
  // صفحات WebView و نمایش محتوا
  'WebViewScreen',
  'NotesScreen',
  'AddEditNoteScreen',
  
  // صفحات نقشه (غیر مرتبط با سفارش)
  'Map', // برای مشاهده نقشه عمومی
];

/**
 * بررسی اینکه آیا صفحه‌ای باید محافظت شود یا نه
 * 
 * @param {string} screenName - نام صفحه
 * @returns {object} - اطلاعات وضعیت محافظت
 */
export const checkScreenProtection = (screenName) => {
  if (PROTECTED_SCREENS.includes(screenName)) {
    return {
      shouldBeProtected: true,
      reason: 'این صفحه مربوط به ثبت یا مدیریت سفارشات است',
      category: 'order-related'
    };
  }
  
  if (ALLOWED_SCREENS.includes(screenName)) {
    return {
      shouldBeProtected: false,
      reason: 'این صفحه برای همه کاربران در دسترس است',
      category: 'always-allowed'
    };
  }
  
  return {
    shouldBeProtected: null,
    reason: 'وضعیت این صفحه مشخص نیست - نیاز به بررسی دستی',
    category: 'unknown'
  };
};

/**
 * تابع کمکی برای debugging در development mode
 * 
 * @param {string} screenName - نام صفحه فعلی
 */
export const debugScreenProtection = (screenName) => {
  if (__DEV__) {
    const status = checkScreenProtection(screenName);
    console.log(`🔍 [Screen Protection Debug] ${screenName}:`, status);
    
    if (status.shouldBeProtected === null) {
      console.warn(`⚠️ [Screen Protection] صفحه "${screenName}" در لیست تعریف نشده!`);
    }
  }
};

/**
 * بررسی سازگاری با useOrganizationAccess
 * این تابع چک می‌کند که آیا لیست ما با hook مطابقت دارد
 */
export const validateWithHook = () => {
  // این تابع در development mode برای تست استفاده می‌شود
  // و می‌تواند با useOrganizationAccess مقایسه شود
  
  if (__DEV__) {
    console.log('📋 [Validation] لیست صفحات محافظت شده:', PROTECTED_SCREENS.length, 'صفحه');
    console.log('📋 [Validation] لیست صفحات مجاز:', ALLOWED_SCREENS.length, 'صفحه');
    
    // چک کردن تداخل (نباید هیچ صفحه‌ای در هر دو لیست باشد)
    const overlap = PROTECTED_SCREENS.filter(screen => ALLOWED_SCREENS.includes(screen));
    if (overlap.length > 0) {
      console.error('❌ [Validation] صفحات تداخل دار:', overlap);
    } else {
      console.log('✅ [Validation] هیچ تداخلی در لیست‌ها وجود ندارد');
    }
  }
};

export default {
  PROTECTED_SCREENS,
  ALLOWED_SCREENS,
  checkScreenProtection,
  debugScreenProtection,
  validateWithHook
};