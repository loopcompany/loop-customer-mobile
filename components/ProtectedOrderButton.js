import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import { showAlert } from '../helpers/Common';
import { 
  themeColor0, themeColor1, themeColor3, themeColor4, 
  themeColor5, themeColor7, themeColor10, themeColor11 
} from '../theme/Color';

/**
 * کامپوننت دکمه محافظت شده برای سفارشات
 * این دکمه بررسی می‌کند که آیا کاربر سازمانی مجوز ثبت سفارش دارد یا نه
 */
const ProtectedOrderButton = ({
  title = 'ثبت سفارش',
  subtitle = null,
  iconName = 'add-circle',
  onPress = null,
  targetScreen = null,
  style = {},
  textStyle = {},
  disabled = false,
  showIcon = true,
  ...props
}) => {
  const navigation = useNavigation();
  const { userType } = useSelector(state => state.auth);
  const {
    canPlaceOrder,
    isOrganizationUser,
    hasCompleteAccess,
    getBlockedMessage,
    getNextSteps,
    profileStatus,
    contractStatus,
    loading
  } = useOrganizationAccess();

  /**
   * هندل کردن کلیک روی دکمه
   */
  const handlePress = () => {
    // 🔒 SECURITY: اگر userType هنوز مشخص نیست، اجازه ندهیم
    if (!userType || userType === null) {
      showAlert('لطفا صبر کنید', 'در حال بررسی وضعیت کاربر...');
      return;
    }
    
    // اگر کاربر فردی است یا دسترسی کامل دارد
    if (userType === 'individual' || canPlaceOrder()) {
      if (onPress) {
        onPress();
      } else if (targetScreen) {
        navigation.navigate(targetScreen);
      }
      return;
    }

    // کاربر سازمانی بدون دسترسی کامل
    const blockedMessage = getBlockedMessage();
    const nextSteps = getNextSteps();
    
    let alertTitle = 'دسترسی محدود';
    let alertMessage = blockedMessage || 'شما هنوز مجوز ثبت سفارش ندارید';
    
    // ایجاد پیام مفصل بر اساس وضعیت
    if (profileStatus === 'rejected' || contractStatus === 'rejected') {
      alertTitle = 'نیاز به بازنگری';
      alertMessage = 'اطلاعات شما رد شده است. ';
    } else if (profileStatus === 'pending' || contractStatus === 'pending') {
      alertTitle = 'در انتظار تایید';
      alertMessage = 'اطلاعات شما در حال بررسی است. ';
    } else if (!profileStatus || profileStatus === 'not_uploaded') {
      alertTitle = 'تکمیل اطلاعات';
      alertMessage = 'لطفا ابتدا اطلاعات پروفایل خود را تکمیل کنید. ';
    } else if (!contractStatus || contractStatus === 'not_uploaded') {
      alertTitle = 'آپلود قرارداد';
      alertMessage = 'لطفا ابتدا قرارداد خود را آپلود کنید. ';
    }

    // اضافه کردن مراحل بعدی
    if (nextSteps.length > 0) {
      alertMessage += '\n\nمراحل مورد نیاز:\n' + nextSteps.map(step => `• ${step}`).join('\n');
    }

    // دکمه‌های عملیاتی
    const buttons = [
      {
        text: 'متوجه شدم',
        style: 'cancel'
      }
    ];

    // اضافه کردن دکمه‌های مرتبط
    if (profileStatus === 'rejected' || profileStatus === 'not_uploaded' || profileStatus === null) {
      buttons.unshift({
        text: 'ویرایش پروفایل',
        onPress: () => navigation.navigate('OrganizationProfile')
      });
    }

    if (contractStatus === 'rejected' || contractStatus === 'not_uploaded' || contractStatus === null) {
      buttons.unshift({
        text: 'مدیریت قرارداد',
        onPress: () => navigation.navigate('OrganizationContract')
      });
    }

    showAlert(alertTitle, alertMessage, buttons);
  };

  /**
   * تعیین وضعیت ظاهری دکمه
   */
  const getButtonStyle = () => {
    // 🔒 اگر userType مشخص نیست، disabled باشه
    if (!userType || userType === null || disabled || loading) {
      return [styles.button, styles.disabledButton, style];
    }

    if (isOrganizationUser && !hasCompleteAccess) {
      return [styles.button, styles.restrictedButton, style];
    }

    return [styles.button, styles.enabledButton, style];
  };

  /**
   * تعیین رنگ متن
   */
  const getTextColor = () => {
    if (!userType || userType === null || disabled || loading) {
      return styles.disabledText;
    }

    if (isOrganizationUser && !hasCompleteAccess) {
      return styles.restrictedText;
    }

    return styles.enabledText;
  };

  /**
   * تعیین آیکون وضعیت
   */
  const getStatusIcon = () => {
    if (loading) {
      return 'hourglass-empty';
    }

    if (isOrganizationUser && !hasCompleteAccess) {
      return 'lock';
    }

    return iconName;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={!userType || userType === null || disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {showIcon && (
        <Icon
          name={getStatusIcon()}
          size={24}
          color={getTextColor().color}
          style={styles.icon}
        />
      )}
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, getTextColor(), textStyle]}>
          {loading ? 'بررسی دسترسی...' : title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, getTextColor()]}>
            {subtitle}
          </Text>
        )}
        
        {/* نمایش وضعیت برای کاربران سازمانی */}
        {isOrganizationUser && !hasCompleteAccess && !loading && (
          <Text style={styles.statusText}>
            {profileStatus !== 'approved' ? '⚠️ پروفایل نیاز به تایید' : ''}
            {contractStatus !== 'approved' ? '⚠️ قرارداد نیاز به تایید' : ''}
          </Text>
        )}
      </View>

      {/* نمایش آیکون تایید برای کاربران سازمانی با دسترسی کامل */}
      {isOrganizationUser && hasCompleteAccess && (
        <Icon
          name="verified"
          size={20}
          color={themeColor7.color}
          style={styles.verifiedIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  enabledButton: {
    backgroundColor: themeColor0.bgColor(1),
  },
  restrictedButton: {
    backgroundColor: themeColor5.bgColor(1),
    borderWidth: 2,
    borderColor: themeColor11.bgColor(1),
  },
  disabledButton: {
    backgroundColor: themeColor5.bgColor(1),
    elevation: 0,
    shadowOpacity: 0,
  },
  icon: {
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    textAlign: 'right',
    marginTop: 4,
    opacity: 0.8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Vazir-Light',
    textAlign: 'right',
    marginTop: 6,
    color: themeColor11.color,
  },
  enabledText: {
    color: themeColor4.bgColor(1),
  },
  restrictedText: {
    color: themeColor10.bgColor(1),
  },
  disabledText: {
    color: themeColor3.color,
  },
  verifiedIcon: {
    marginLeft: 8,
  },
});

export default ProtectedOrderButton;