import React from 'react';
import { useSelector } from 'react-redux';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import AccessRestrictedScreen from '../components/AccessRestrictedScreen';
import Loader from '../components/Loader';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { useIntersectionObserver } from '../utils/performanceOptimization';

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
            title="نیاز به ورود"
            message="برای دسترسی به این بخش، ابتدا باید وارد حساب کاربری خود شوید"
            nextSteps={[
              { text: "ورود به حساب کاربری", action: "login" }
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
          title="بررسی نوع حساب کاربری"
          message="در حال تشخیص نوع حساب کاربری شما..."
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
          title="بررسی وضعیت دسترسی"
          message="در حال بررسی وضعیت تایید حساب سازمانی شما..."
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
          title="خطا در بررسی دسترسی"
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
          title="دسترسی غیرمجاز"
          message="این بخش فقط برای کاربران فردی در دسترس است"
        />
      );
    }

    // **مهم**: کاربر سازمانی بدون دسترسی کامل
    if (isOrganizationUser && requireCompleteAccess && !hasCompleteAccess) {
      return (
        <AccessRestrictedScreen
          type="access_denied"
          title="دسترسی محدود"
          message="برای دسترسی به این بخش، باید هم پروفایل و هم قرارداد شما تایید شده باشد"
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
            title={customResult.title || "دسترسی محدود"}
            message={customResult.message || "شما مجوز دسترسی به این بخش را ندارید"}
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
      
      let title = "دسترسی محدود";
      let message = blockedMessage || "شما هنوز مجوز دسترسی به این بخش را ندارید";
      
      // پیام‌های مخصوص بر اساس وضعیت
      if (profileStatus === 'rejected' || contractStatus === 'rejected') {
        title = "نیاز به بازنگری";
        message = "اطلاعات شما رد شده است. لطفا موارد زیر را اصلاح کنید:";
      } else if (profileStatus === 'pending' || contractStatus === 'pending') {
        title = "در انتظار تایید";
        message = "اطلاعات شما در حال بررسی است. لطفا صبور باشید.";
      } else if (!accessStatus?.profile_complete) {
        title = "تکمیل اطلاعات";
        message = "لطفا ابتدا اطلاعات پروفایل خود را تکمیل کنید.";
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
          title="نیاز به تایید کامل"
          message="برای دسترسی به این بخش، باید هم پروفایل و هم قرارداد شما تایید شده باشد"
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
          {isVisible ? children : <LoadingScreen title="در حال بارگذاری..." />}
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
        title: "نیاز به تایید کامل",
        message: "برای ثبت سفارش، باید هم پروفایل و هم قرارداد شما تایید شده باشد",
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