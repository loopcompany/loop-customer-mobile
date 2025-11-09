import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  BackHandler, 
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * WebViewScreen Component
 * 
 * هدف:
 * - حفظ URL فعلی هنگام reload
 * - مدیریت دکمه Back اندروید
 * - نمایش وب اپلیکیشن در داخل اپ
 */
const WebViewScreen = ({ route }) => {
  // 🔹 URL اولیه از route params یا پیش‌فرض
  const initialUrl = route?.params?.url || 'http://localhost:8081';
  
  // 🔹 State ها
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🔹 Ref به WebView
  const webViewRef = useRef(null);

  /**
   * 🔹 Handle تغییر state در WebView
   * این تابع هر بار که navigation در WebView اتفاق می‌افتد، فراخوانی می‌شود
   */
  const onNavigationStateChange = (navState) => {
    console.log('📍 WebView Navigation State Changed:', {
      url: navState.url,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
    });

    // به‌روزرسانی URL فعلی
    setCurrentUrl(navState.url);
    
    // به‌روزرسانی وضعیت بازگشت
    setCanGoBack(navState.canGoBack);
    
    // Update loading state
    setLoading(navState.loading);
  };

  /**
   * 🔹 Handle دکمه Back اندروید
   */
  useEffect(() => {
    const backAction = () => {
      console.log('🔙 Android Back Button Pressed');
      console.log('Can Go Back:', canGoBack);
      
      if (canGoBack && webViewRef.current) {
        // اگر در WebView history داریم، به صفحه قبلی برگرد
        webViewRef.current.goBack();
        return true; // جلوگیری از خروج از اپ
      }
      
      // اگر history نداریم، اجازه خروج از WebView
      return false;
    };

    // Add event listener
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Cleanup
    return () => backHandler.remove();
  }, [canGoBack]); // وابستگی به canGoBack

  /**
   * 🔹 Handle شروع بارگذاری
   */
  const onLoadStart = () => {
    console.log('⏳ WebView Load Start');
    setLoading(true);
  };

  /**
   * 🔹 Handle پایان بارگذاری
   */
  const onLoadEnd = () => {
    console.log('✅ WebView Load End');
    setLoading(false);
  };

  /**
   * 🔹 Handle خطا
   */
  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView Error:', nativeEvent);
    setLoading(false);
  };

  /**
   * 🔹 Handle پیام از WebView
   */
  const onMessage = (event) => {
    console.log('💬 Message from WebView:', event.nativeEvent.data);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        
        // 🔹 تنظیمات امنیتی
        originWhitelist={['*']}
        
        // 🔹 فعال‌سازی JavaScript
        javaScriptEnabled={true}
        
        // 🔹 فعال‌سازی DOM Storage
        domStorageEnabled={true}
        
        // 🔹 فعال‌سازی Local Storage
        localStorage={true}
        
        // 🔹 Session Storage
        sessionStorage={true}
        
        // 🔹 Allow File Access
        allowFileAccess={true}
        
        // 🔹 Allow Universal Access From File URLs (برای وب محلی)
        allowUniversalAccessFromFileURLs={true}
        
        // 🔹 Mixed Content Mode (برای اندروید)
        mixedContentMode="always"
        
        // 🔹 Cache Mode
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        
        // 🔹 Media Playback
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        
        // 🔹 Zoom
        scalesPageToFit={Platform.OS === 'android'}
        
        // 🔹 User Agent (اختیاری)
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        
        // 🔹 Events
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onMessage={onMessage}
        
        // 🔹 Style
        style={styles.webview}
        
        // 🔹 Pull to Refresh (فقط iOS)
        pullToRefreshEnabled={true}
        
        // 🔹 Bounce (فقط iOS)
        bounces={true}
        
        // 🔹 Scroll
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        
        // 🔹 Android specific
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        
        // 🔹 جلوگیری از باز شدن لینک‌ها در مرورگر خارجی
        onShouldStartLoadWithRequest={(request) => {
          // اگر لینک با http یا https شروع می‌شه، داخل WebView باز کن
          if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
            return true;
          }
          
          // لینک‌های دیگر (مثل tel:, mailto:) رو مجاز نکن
          console.log('🚫 Blocked external link:', request.url);
          return false;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
