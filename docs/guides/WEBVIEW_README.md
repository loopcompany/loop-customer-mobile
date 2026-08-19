# راهنمای استفاده از WebView Screen

## 📱 نحوه استفاده

### 1. Navigate کردن به WebView

از هر جای اپ می‌تونید به WebView navigate کنید:

```javascript
// با URL پیش‌فرض (localhost:8081)
navigation.navigate(screen: 'WebView');

// با URL سفارشی
navigation.navigate('WebView',{
    url: 'http://localhost:8081/rates'}
);
```

### 2. مثال: اضافه کردن دکمه به Menu

اگر می‌خواهید یک دکمه در منو اضافه کنید که به WebView برود:

```javascript
// در فایل MenuContext.js یا هر فایل منو

const menuItems = [
  // ... سایر آیتم‌های منو
  {
    id: 'webview',
    title: 'نمایش وب اپ',
    icon: 'globe',
    onPress: () => {
      navigation.navigate( 'WebView',{
          url: 'http://localhost:8081'
        }
      );
    }
  }
];
```

### 3. ویژگی‌های WebView Screen

✅ **حفظ URL هنگام Reload**
- وقتی اپ را reload می‌کنید، URL فعلی حفظ می‌شود
- نیازی نیست دوباره از صفحه اول شروع کنید

✅ **مدیریت دکمه Back اندروید**
- اگر در WebView سابقه داشته باشید، به صفحه قبلی در WebView برمی‌گردد
- اگر سابقه نداشته باشید، از WebView خارج می‌شود

✅ **JavaScript فعال**
- تمام قابلیت‌های JavaScript فعال است
- LocalStorage و SessionStorage کار می‌کنند

✅ **Cache فعال**
- برای بهبود سرعت، cache فعال است

✅ **Pull to Refresh (فقط iOS)**
- کاربران iOS می‌توانند با کشیدن به پایین، صفحه را reload کنند

✅ **Loading Indicator**
- در حین بارگذاری صفحه، یک loading نشان داده می‌شود

## 🔧 تنظیمات پیشرفته

### تغییر URL پیش‌فرض

در فایل `WebViewScreen.js`:

```javascript
const initialUrl = route?.params?.url || 'http://your-url-here.com';
```

### افزودن JavaScript Injection

برای اجرای کد JavaScript در WebView:

```javascript
<WebView
  injectedJavaScript={`
    // کد JavaScript شما
    console.log('Hello from WebView!');
    true; // باید true برگردانید
  `}
  onMessage={(event) => {
    console.log('Message from WebView:', event.nativeEvent.data);
  }}
/>
```

### ارتباط بین React Native و WebView

از WebView به React Native پیام بفرستید:

```javascript
// در WebView (JavaScript)
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'navigation',
  screen: 'Profile'
}));
```

در React Native دریافت کنید:

```javascript
const onMessage = (event) => {
  const data = JSON.parse(event.nativeEvent.data);
  if (data.type === 'navigation') {
    navigation.navigate(data.screen);
  }
};
```

## 🐛 عیب‌یابی

### مشکل: WebView سفید است یا چیزی نمایش نمی‌دهد

1. مطمئن شوید سرور در حال اجراست:
   ```bash
   npx expo start --web
   ```

2. URL را چک کنید - باید با `http://` یا `https://` شروع شود

3. در کنسول لاگ‌ها را بررسی کنید

### مشکل: دکمه Back کار نمی‌کند

- مطمئن شوید که در `AndroidManifest.xml` دسترسی‌های لازم را اضافه کرده‌اید
- `BackHandler` باید به درستی setup شده باشد (در کد فعلی OK است)

### مشکل: JavaScript کار نمی‌کند

- بررسی کنید که `javaScriptEnabled={true}` است
- بررسی کنید که `domStorageEnabled={true}` است

## 📊 لاگ‌های مفید

در کنسول React Native این لاگ‌ها را خواهید دید:

- `📍 WebView Navigation State Changed` - هر بار که URL تغییر می‌کند
- `🔙 Android Back Button Pressed` - وقتی دکمه Back زده می‌شود
- `⏳ WebView Load Start` - شروع بارگذاری
- `✅ WebView Load End` - پایان بارگذاری
- `❌ WebView Error` - اگر خطایی رخ دهد

## 🌐 استفاده برای Production

برای استفاده در production، URL را به سرور واقعی تغییر دهید:

```javascript
const PRODUCTION_URL = 'https://your-domain.com';
const DEVELOPMENT_URL = 'http://localhost:8081';

const initialUrl = route?.params?.url || 
  (__DEV__ ? DEVELOPMENT_URL : PRODUCTION_URL);
```

## 🔒 امنیت

- `originWhitelist` روی `['*']` است - برای production محدود کنید
- از HTTPS استفاده کنید
- کد JavaScript injection را با دقت بنویسید

## 📚 منابع بیشتر

- [React Native WebView Docs](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md)
- [React Navigation Docs](https://reactnavigation.org/)
