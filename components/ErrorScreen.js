import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6 } from '@theme/Color';
import { NewStyles } from '@styles/NewStyles';
import CustomStatusBar from './CustomStatusBar';
import Button from './Button';

/**
 * کامپوننت نمایش Error برای خطاهای بررسی دسترسی کاربران سازمانی
 * 
 * @param {Object} props - props کامپوننت
 * @param {string} props.title - عنوان خطا
 * @param {string} props.message - پیام خطا
 * @param {Function} props.onRetry - تابع تلاش مجدد
 * @param {Function} props.onGoBack - تابع بازگشت
 * @param {boolean} props.showRetryButton - نمایش دکمه تلاش مجدد
 * @param {string} props.errorType - نوع خطا (network, server, auth, etc.)
 * @returns {React.Component} کامپوننت Error
 */
const ErrorScreen = ({ 
  title = 'خطا در دریافت اطلاعات',
  message = 'مشکلی در بررسی وضعیت دسترسی پیش آمده است',
  onRetry,
  onGoBack,
  showRetryButton = true,
  errorType = 'general'
}) => {

  /**
   * آیکون مناسب بر اساس نوع خطا
   */
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return { name: 'wifi-outline', color: themeColor6.color };
      case 'server':
        return { name: 'server-outline', color: themeColor6.color };
      case 'auth':
        return { name: 'key-outline', color: themeColor6.color };
      case 'timeout':
        return { name: 'time-outline', color: themeColor6.color };
      default:
        return { name: 'alert-circle-outline', color: themeColor6.color };
    }
  };

  /**
   * پیام کمکی بر اساس نوع خطا
   */
  const getHelpMessage = () => {
    switch (errorType) {
      case 'network':
        return 'لطفا اتصال اینترنت خود را بررسی کنید';
      case 'server':
        return 'سرور موقتاً در دسترس نیست. چند دقیقه بعد تلاش کنید';
      case 'auth':
        return 'نشست شما منقضی شده است. لطفا مجددا وارد شوید';
      case 'timeout':
        return 'درخواست زمان زیادی طول کشید. مجددا تلاش کنید';
      default:
        return 'اگر مشکل ادامه دارد، با پشتیبانی تماس بگیرید';
    }
  };

  const icon = getErrorIcon();
  const helpMessage = getHelpMessage();

  return (
    <SafeAreaView style={styles.container} edges={{ top: 'additive', bottom: 'off' }}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* آیکون خطا */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon.name} 
            size={80} 
            color={icon.color} 
          />
        </View>
        
        {/* عنوان */}
        <Text style={styles.title}>{title}</Text>
        
        {/* پیام اصلی */}
        <Text style={styles.message}>{message}</Text>
        
        {/* پیام کمکی */}
        <Text style={styles.helpMessage}>{helpMessage}</Text>
        
        {/* دکمه‌های عملیاتی */}
        <View style={styles.buttonContainer}>
          {showRetryButton && onRetry && (
            <Button
              title="تلاش مجدد"
              onPress={onRetry}
              style={styles.retryButton}
              backgroundColor={themeColor0.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
            />
          )}
          
          {onGoBack && (
            <Button
              title="بازگشت"
              onPress={onGoBack}
              style={styles.backButton}
              backgroundColor={themeColor5.bgColor(1)}
              textColor={themeColor3.color}
            />
          )}
        </View>
        
        {/* اطلاعات تماس پشتیبانی */}
        <View style={styles.supportContainer}>
          <View style={styles.supportHeader}>
            <Ionicons name="headset-outline" size={20} color={themeColor3.bgColor(0.6)} />
            <Text style={styles.supportTitle}>نیاز به کمک دارید؟</Text>
          </View>
          <Text style={styles.supportText}>
            با تیم پشتیبانی در ارتباط باشید
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => {
              // اینجا می‌توان شماره پشتیبانی را اضافه کرد
              console.log('تماس با پشتیبانی');
            }}
          >
            <Ionicons name="call-outline" size={16} color={themeColor0.color} />
            <Text style={styles.supportButtonText}>تماس با پشتیبانی</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: themeColor6.bgColor(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'VazirBold',
    color: themeColor3.color,
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: themeColor3.bgColor(0.8),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  helpMessage: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor3.bgColor(0.6),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  retryButton: {
    width: '100%',
  },
  backButton: {
    width: '100%',
  },
  supportContainer: {
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: themeColor5.bgColor(1),
    alignItems: 'center',
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: themeColor3.bgColor(0.8),
    marginRight: 8,
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor3.bgColor(0.6),
    textAlign: 'center',
    marginBottom: 15,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor0.color,
  },
  supportButtonText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor0.color,
    marginRight: 8,
  },
});

export default ErrorScreen;