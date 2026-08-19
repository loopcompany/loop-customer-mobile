import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColor0, themeColor3, themeColor4, themeColor5 } from '@theme/Color';
import { NewStyles } from '@styles/NewStyles';
import CustomStatusBar from './CustomStatusBar';

/**
 * کامپوننت نمایش Loading برای بررسی دسترسی کاربران سازمانی
 * 
 * @param {Object} props - props کامپوننت
 * @param {string} props.message - پیام loading (اختیاری)
 * @param {string} props.title - عنوان loading (اختیاری)
 * @returns {React.Component} کامپوننت Loading
 */
const LoadingScreen = ({ 
  message = 'در حال بررسی دسترسی...',
  title = 'لطفا منتظر بمانید'
}) => {
  return (
    <SafeAreaView style={styles.container} edges={{ top: 'additive', bottom: 'off' }}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Loading Spinner */}
        <View style={styles.spinnerContainer}>
          <ActivityIndicator 
            size="large" 
            color={themeColor0.color} 
            style={styles.spinner}
          />
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner} />
          </View>
        </View>
        
        {/* عنوان */}
        <Text style={styles.title}>{title}</Text>
        
        {/* پیام */}
        <Text style={styles.message}>{message}</Text>
        
        {/* نقاط متحرک */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
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
  spinnerContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  spinner: {
    position: 'absolute',
    zIndex: 2,
  },
  pulseOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: themeColor0.bgColor(0.1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColor0.bgColor(0.2),
  },
  title: {
    fontSize: 22,
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
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: themeColor0.color,
    marginHorizontal: 4,
  },
  dot1: {
    // انیمیشن برای نقطه اول (در CSS یا Animated API پیاده‌سازی می‌شود)
  },
  dot2: {
    // انیمیشن برای نقطه دوم
  },
  dot3: {
    // انیمیشن برای نقطه سوم
  },
});

export default LoadingScreen;