import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

/**
 * Helper function برای دیباگ کردن وضعیت access control system
 * این تابع می‌تواند در development mode استفاده شود
 */
export const debugOrganizationAccess = () => { 
  
  // Debug info از hook
  const hookData = useOrganizationAccess();
  
  console.log('📊 Hook Data:', {
    isOrganizationUser: hookData.isOrganizationUser,
    hasCompleteAccess: hookData.hasCompleteAccess,
    profileStatus: hookData.profileStatus,
    contractStatus: hookData.contractStatus,
    loading: hookData.loading,
    error: hookData.error
  });
  
  console.log('📈 Cache Stats:', hookData.cacheStats);
  
  console.log('🎯 Next Steps:', hookData.nextSteps);
  
  return hookData;
};

/**
 * Performance monitoring برای access control operations
 */
export const performanceMonitor = {
  apiCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageResponseTime: 0,
  
  reset() {
    this.apiCalls = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.averageResponseTime = 0;
  },
  
  logApiCall(duration) {
    this.apiCalls++;
    this.averageResponseTime = ((this.averageResponseTime * (this.apiCalls - 1)) + duration) / this.apiCalls;
  },
  
  logCacheHit() {
    this.cacheHits++;
  },
  
  logCacheMiss() {
    this.cacheMisses++;
  },
  
  getStats() {
    return {
      totalApiCalls: this.apiCalls,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) * 100,
      averageResponseTime: this.averageResponseTime,
      totalCacheOperations: this.cacheHits + this.cacheMisses
    };
  }
};

/**
 * تابع کمکی برای تست کردن دسترسی به صفحات مختلف
 */
export const testScreenAccess = (screenList = []) => {
  const { canAccessScreen } = useOrganizationAccess();
  
  const results = {};
  
  const defaultScreens = [
    'FolderScreen',
    'SubCategories', 
    'Steps',
    'Preview',
    'Details',
    'OrdersScreen',
    'Invoice',
    'OrderMenuScreen',
    'CanceledOrdersScreen',
    'OrganizationProfile',
    'OrganizationContract',
    'Profile',
    'AddressScreen',
    'PaymentScreen'
  ];
  
  const screensToTest = screenList.length > 0 ? screenList : defaultScreens;
  
  screensToTest.forEach(screen => {
    results[screen] = canAccessScreen(screen);
  });
  
  console.log('🧪 Screen Access Test Results:', results);
  return results;
};

export default {
  debugOrganizationAccess,
  performanceMonitor,
  testScreenAccess
};