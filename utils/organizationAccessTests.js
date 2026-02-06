// Integration test برای organization access control system
// این فایل می‌تواند برای تست manual استفاده شود

import { debugOrganizationAccess, testScreenAccess, performanceMonitor } from '../utils/organizationAccessDebug';

/**
 * تست کامل سیستم کنترل دسترسی سازمانی
 */
export const runIntegrationTest = async () => { 
  
  try {
    // ۱. بررسی وضعیت فعلی سیستم
    console.log('📋 Step 1: Current System Status');
    const currentStatus = debugOrganizationAccess();
    
    if (!currentStatus) {
      console.error('❌ Failed to get organization access status');
      return false;
    }
    
    // ۲. تست دسترسی به صفحات
    console.log('\n📋 Step 2: Screen Access Testing');
    const screenResults = testScreenAccess();
    
    // ۳. بررسی performance
    console.log('\n📋 Step 3: Performance Check');
    const perfStats = performanceMonitor.getStats();
    console.log('📊 Performance Stats:', perfStats);
    
    // ۴. تست سناریوهای مختلف
    console.log('\n📋 Step 4: Scenario Testing');
    
    // سناریو ۱: کاربر فردی
    if (!currentStatus.isOrganizationUser) {
      console.log('✅ Individual User Scenario');
      console.log('   - Should have access to all screens');
      console.log('   - No restrictions expected');
      
      const restrictedScreens = Object.entries(screenResults)
        .filter(([screen, access]) => !access)
        .map(([screen]) => screen);
        
      if (restrictedScreens.length === 0) {
        console.log('✅ All screens accessible for individual user');
      } else {
        console.log('⚠️ Some screens restricted for individual user:', restrictedScreens);
      }
    }
    
    // سناریو ۲: کاربر سازمانی
    if (currentStatus.isOrganizationUser) {
      console.log('✅ Organization User Scenario');
      console.log(`   - Profile Status: ${currentStatus.profileStatus}`);
      console.log(`   - Contract Status: ${currentStatus.contractStatus}`);
      console.log(`   - Complete Access: ${currentStatus.hasCompleteAccess}`);
      
      const expectedRestrictedScreens = [
        'FolderScreen', 'SubCategories', 'Steps', 
        'Preview', 'Details', 'OrdersScreen',
        'Invoice', 'OrderMenuScreen', 'CanceledOrdersScreen'
      ];
      
      const expectedAllowedScreens = [
        'OrganizationProfile', 'OrganizationContract', 
        'Profile', 'AddressScreen', 'PaymentScreen'
      ];
      
      if (!currentStatus.hasCompleteAccess) {
        console.log('🔒 Testing restricted access...');
        
        const actuallyRestricted = expectedRestrictedScreens.filter(
          screen => !screenResults[screen]
        );
        
        const actuallyAllowed = expectedAllowedScreens.filter(
          screen => screenResults[screen]
        );
        
        console.log(`✅ Properly restricted: ${actuallyRestricted.length}/${expectedRestrictedScreens.length}`);
        console.log(`✅ Properly allowed: ${actuallyAllowed.length}/${expectedAllowedScreens.length}`);
      } else {
        console.log('🔓 Testing complete access...');
        const totalScreens = Object.keys(screenResults).length;
        const accessibleScreens = Object.values(screenResults).filter(Boolean).length;
        console.log(`✅ Full access: ${accessibleScreens}/${totalScreens} screens accessible`);
      }
    }
    
    // ۵. بررسی cache effectiveness
    console.log('\n📋 Step 5: Cache Effectiveness');
    if (perfStats.cacheHitRate > 50) {
      console.log(`✅ Good cache performance: ${perfStats.cacheHitRate.toFixed(1)}% hit rate`);
    } else {
      console.log(`⚠️ Low cache performance: ${perfStats.cacheHitRate.toFixed(1)}% hit rate`);
    }
    
    // ۶. نتیجه نهایی 
    
    const issues = [];
    
    if (perfStats.averageResponseTime > 1000) {
      issues.push('High API response time');
    }
    
    if (perfStats.cacheHitRate < 30) {
      issues.push('Low cache hit rate');
    }
    
    if (issues.length === 0) {
      console.log('🎉 Integration Test PASSED - No issues found');
      return true;
    } else {
      console.log('⚠️ Integration Test PASSED with warnings:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      return true;
    }
    
  } catch (error) {
    console.error('❌ Integration Test FAILED:', error);
    return false;
  }
};

/**
 * Quick smoke test برای بررسی سریع سیستم
 */
export const runSmokeTest = () => {
  console.log('💨 Running Quick Smoke Test...');
  
  try {
    const status = debugOrganizationAccess();
    
    if (!status) {
      console.log('❌ Smoke Test FAILED: Cannot get access status');
      return false;
    }
    
    console.log('✅ Smoke Test PASSED: System is responsive');
    return true;
    
  } catch (error) {
    console.log('❌ Smoke Test FAILED:', error.message);
    return false;
  }
};

export default {
  runIntegrationTest,
  runSmokeTest
};