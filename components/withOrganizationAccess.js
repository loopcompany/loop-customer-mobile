import React from 'react';
import { useSelector } from 'react-redux';
import { useOrganizationAccess } from '@hooks/useOrganizationAccess';
import AccessRestrictedScreen from '@screens/AccessRestrictedScreen';
import Loader from '@components/Loader';
import LoadingScreen from '@components/LoadingScreen';
import ErrorScreen from '@components/ErrorScreen';
import { useIntersectionObserver } from '@utils/performanceOptimization';
import { useTranslation } from 'react-i18next';

/**
 * Higher-Order Component برای محافظت از صفحات در برابر دسترسی غیرمجاز کاربران سازمانی
 * 
 * @param {React.Component} WrappedComponent کامپوننت مقصد
 * @param {Object} options تنظیمات HOC
 * @returns {React.Component} کامپوننت محافظت شده
 */
export const withOrganizationAccess = (WrappedComponent, options = {}) => {
  const {
    screenName = '',
    allowOrganizationAccess = true, // آیا کاربران سازمانی اجازه دسترسی داشته باشند؟
    requireCompleteAccess = false,  // آیا نیاز به تایید کامل باشد؟
    customAccessCheck = null,       // تابع سفارشی برای چک دسترسی
    loadingComponent = null,        // کامپوننت loading سفارشی
    restrictedComponent = null,     // کامپوننت محدودیت سفارشی
  } = options;

  const EnhancedComponent = (props) => {
    const { t } = useTranslation();
    const {
      accessStatus,
      loading,
      error,
      hasCompleteAccess,
      isOrganizationUser,
      canAccessScreen,
      canPlaceOrder,
      getBlockedMessage,
      getNextSteps,
      profileStatus,
      contractStatus,
      refetch
    } = useOrganizationAccess();
    
    const { userType, isAuthenticated } = useSelector(state => state.auth);

    console.log(`🔒 withOrganizationAccess (${screenName}):`, {
      userType,
      isAuthenticated,
      isOrganizationUser,
      hasCompleteAccess,
      requireCompleteAccess,
      allowOrganizationAccess,
      profileStatus,
      contractStatus,
      loading,
      error
    });

    // 🔒 CRITICAL: اگر کاربر لاگین نکرده و صفحه نیاز به احراز هویت دارد
    if (!isAuthenticated) {
      // اگر صفحه نیاز به دسترسی کامل دارد، باید لاگین کند
      if (requireCompleteAccess) {
        console.log(`🔒 User not authenticated for ${screenName}, redirecting to login`);
        return (
          <AccessRestrictedScreen
            type="login_required"
            title={t('Login required')}
            message={t('To access this section, please log in to your account first.')}
            nextSteps={[
              { text: t('Login to account'), action: "login" }
            ]}
          />
        );
      }
      // برای صفحات عمومی، اجازه دسترسی بده
      console.log(`🔓 User not authenticated for ${screenName}, allowing access to original component`);
      return <WrappedComponent {...props} />;
    }

    // 🔒 SECURITY: اگر userType هنوز مشخص نیست، منتظر بمانیم
    // این شرط مهم است چون بعد از ریلود، userType null است تا از AsyncStorage لود شود
    if (isAuthenticated && (!userType || userType === null)) {
      console.log(`⏳ Waiting for userType to load for ${screenName}`);
      if (loadingComponent) {
        return loadingComponent;
      }
      return (
        <LoadingScreen 
          title={t('Checking account type')}
          message={t('Determining your account type...')}
        />
      );
    }

    // Loading state - فقط برای کاربران سازمانی
    if (loading && isOrganizationUser) {
      if (loadingComponent) {
        return loadingComponent;
      }
      return (
        <LoadingScreen 
          title={t('Checking access status')}
          message={t('Checking your organization account approval status...')}
        />
      );
    }

    // Error state - اگر خطا داریم ولی کاربر فردی است، بگذار صفحه نمایش داده شود
    if (error && isOrganizationUser) {
      // تشخیص نوع خطا برای نمایش مناسب
      let errorType = 'general';
      if (error.includes('شبکه') || error.includes('اینترنت')) {
        errorType = 'network';
      } else if (error.includes('سرور')) {
        errorType = 'server';
      } else if (error.includes('احراز هویت') || error.includes('لاگین')) {
        errorType = 'auth';
      } else if (error.includes('timeout') || error.includes('زمان')) {
        errorType = 'timeout';
      }

      return (
        <ErrorScreen
          title={t('Access check error')}
          message={error}
          errorType={errorType}
          onRetry={refetch}
          showRetryButton={true}
        />
      );
    }

    // 🔒 کاربران فردی - دسترسی آزاد (فقط اگر userType صریحاً 'individual' باشد)
    if (userType === 'individual') {
      return <WrappedComponent {...props} />;
    }

    // چک دسترسی کاربران سازمانی
    if (isOrganizationUser && !allowOrganizationAccess) {
      return (
        <AccessRestrictedScreen
          type="not_allowed"
          title={t('Access not allowed')}
          message={t('This section is only available to individual users.')}
        />
      );
    }

    // **مهم**: کاربر سازمانی بدون دسترسی کامل
    if (isOrganizationUser && requireCompleteAccess && !hasCompleteAccess) {
      return (
        <AccessRestrictedScreen
          type="access_denied"
          title={t('Restricted access')}
          message={t('To access this section, both your profile and contract must be approved.')}
          nextSteps={getNextSteps()}
          profileStatus={profileStatus}
          contractStatus={contractStatus}
          onRetry={refetch}
          showRetryButton={true}
        />
      );
    }

    // چک دسترسی سفارشی
    if (customAccessCheck && typeof customAccessCheck === 'function') {
      const customResult = customAccessCheck({
        accessStatus,
        isOrganizationUser,
        hasCompleteAccess,
        profileStatus,
        contractStatus
      });
      
      if (!customResult.allowed) {
        return (
          <AccessRestrictedScreen
            type="custom"
            title={customResult.title ? t(customResult.title) : t('Restricted access')}
            message={customResult.message ? t(customResult.message) : t('You do not have permission to access this section.')}
            nextSteps={customResult.nextSteps}
            onRetry={customResult.showRetry ? refetch : null}
          />
        );
      }
    }

    // چک دسترسی بر اساس نام صفحه
    if (screenName && !canAccessScreen(screenName)) {
      const nextSteps = getNextSteps();
      const blockedMessage = getBlockedMessage();
      
      let title = t('Restricted access');
      let message = blockedMessage || t('You do not yet have permission to access this section.');
      
      // پیام‌های مخصوص بر اساس وضعیت
      if (profileStatus === 'rejected' || contractStatus === 'rejected') {
        title = t('Needs review');
        message = t('Your information was rejected. Please correct the items below:');
      } else if (profileStatus === 'pending' || contractStatus === 'pending') {
        title = t('Waiting for approval');
        message = t('Your information is under review. Please be patient.');
      } else if (!accessStatus?.profile_complete) {
        title = t('Complete your information');
        message = t('Please complete your profile information first.');
      }
      
      return (
        <AccessRestrictedScreen
          type="access_denied"
          title={title}
          message={message}
          nextSteps={nextSteps}
          profileStatus={profileStatus}
          contractStatus={contractStatus}
          onRetry={refetch}
          showRetryButton={true}
          profileRejectionReason={accessStatus?.profile_rejection_reason}
          contractRejectionReason={accessStatus?.contract_rejection_reason}
        />
      );
    }

    // چک دسترسی کامل (برای صفحاتی که نیاز به تایید کامل دارند)
    if (requireCompleteAccess && isOrganizationUser && !hasCompleteAccess) {
      return (
        <AccessRestrictedScreen
          type="incomplete_access"
          title={t('Full approval required')}
          message={t('To access this section, both your profile and contract must be approved.')}
          nextSteps={getNextSteps()}
          profileStatus={profileStatus}
          contractStatus={contractStatus}
          onRetry={refetch}
          showRetryButton={true}
        />
      );
    }

    // Lazy loading wrapper برای بهبود performance
    const LazyWrapper = ({ children }) => {
      const [ref, isVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '50px'
      });

      return (
        <div ref={ref}>
          {isVisible ? children : <LoadingScreen title={t('Loading...')} />}
        </div>
      );
    };

    // اگر همه چیز مرتب بود، کامپوننت اصلی را نمایش بده
    if (options.enableLazyLoading) {
      return (
        <LazyWrapper>
          <WrappedComponent {...props} />
        </LazyWrapper>
      );
    }
    
    return <WrappedComponent {...props} />;
  };

  // نام کامپوننت برای debugging
  EnhancedComponent.displayName = `withOrganizationAccess(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return EnhancedComponent;
};

/**
 * تنظیمات از پیش تعریف شده برای انواع مختلف صفحات
 */
export const ACCESS_PRESETS = {
  // صفحات عمومی - همه کاربران دسترسی دارند
  PUBLIC: {
    allowOrganizationAccess: true,
    requireCompleteAccess: false
  },
  
  // صفحات سفارش - نیاز به تایید کامل
  ORDER_RELATED: {
    allowOrganizationAccess: true,
    requireCompleteAccess: true,
    customAccessCheck: ({ hasCompleteAccess, isOrganizationUser }) => {
      if (!isOrganizationUser) return { allowed: true };
      
      return {
        allowed: hasCompleteAccess,
        title: "Full approval required",
        message: "To place an order, both your profile and contract must be approved.",
        showRetry: true
      };
    }
  },
  
  // صفحات فقط کاربران فردی
  INDIVIDUAL_ONLY: {
    allowOrganizationAccess: false
  },
  
  // صفحات همیشه مجاز برای کاربران سازمانی
  ORGANIZATION_ALWAYS_ALLOWED: {
    allowOrganizationAccess: true,
    requireCompleteAccess: false,
    customAccessCheck: ({ isOrganizationUser }) => {
      return { allowed: true };
    }
  }
};

export default withOrganizationAccess;
