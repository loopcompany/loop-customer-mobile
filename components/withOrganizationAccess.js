import React from 'react';
import { useSelector } from 'react-redux';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import AccessRestrictedScreen from '../components/AccessRestrictedScreen';
import Loader from '../components/Loader';

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

    // 🔒 SECURITY: اگر userType هنوز مشخص نیست، منتظر بمانیم
    if (isAuthenticated && (!userType || userType === null)) {
      if (loadingComponent) {
        return loadingComponent;
      }
      return <Loader />;
    }

    // Loading state - فقط برای کاربران سازمانی
    if (loading && isOrganizationUser) {
      if (loadingComponent) {
        return loadingComponent;
      }
      return <Loader />;
    }

    // Error state - اگر خطا داریم ولی کاربر فردی است، بگذار صفحه نمایش داده شود
    if (error && isOrganizationUser) {
      return (
        <AccessRestrictedScreen
          type="error"
          title="خطا در دریافت اطلاعات"
          message={error}
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

    // اگر همه چیز مرتب بود، کامپوننت اصلی را نمایش بده
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