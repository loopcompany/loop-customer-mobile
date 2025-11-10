# OTP Verification Implementation

## کتابخانه استفاده شده

از کتابخانه `react-native-confirmation-code-field` برای پیاده‌سازی فیلد ورود کد OTP استفاده شده است.

## نصب

```bash
npm install react-native-confirmation-code-field
```

یا

```bash
yarn add react-native-confirmation-code-field
```

## ویژگی‌های کتابخانه

✅ **Auto-focus**: به صورت خودکار روی فیلد بعدی فوکوس می‌شود
✅ **Auto-complete**: پشتیبانی از OneTimeCode برای iOS
✅ **Cursor Animation**: نمایش کرسر متحرک در فیلد فعال
✅ **RTL Support**: پشتیبانی کامل از راست به چپ
✅ **Customizable**: امکان سفارشی‌سازی کامل ظاهر
✅ **Accessible**: دسترسی‌پذیری برای کاربران دارای معلولیت
✅ **Cross-platform**: کار روی iOS و Android

## استفاده در OTPVerification.js

### Import

```javascript
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
```

### State Management

```javascript
const CELL_COUNT = 6;
const [code, setCode] = useState('');

// Auto blur when all cells are filled
const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });

// Clear cell on focus
const [props, getCellOnLayoutHandler] = useClearByFocusCell({
  value: code,
  setValue: setCode,
});
```

### Component

```javascript
<CodeField
  ref={ref}
  {...props}
  value={code}
  onChangeText={setCode}
  cellCount={CELL_COUNT}
  keyboardType="number-pad"
  textContentType="oneTimeCode" // iOS auto-complete
  renderCell={({ index, symbol, isFocused }) => (
    <View
      key={index}
      onLayout={getCellOnLayoutHandler(index)}
      style={{
        width: 45,
        height: 55,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: isFocused ? '#1976d2' : (symbol ? '#1976d2' : '#ccc'),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 22, fontFamily: 'VazirBold', color: '#000' }}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </Text>
    </View>
  )}
/>
```

## مزایای این کتابخانه نسبت به TextInput معمولی

### ❌ روش قبلی (Multiple TextInput)
- نیاز به مدیریت دستی فوکوس
- کد پیچیده‌تر برای handle کردن Backspace
- مدیریت دستی array برای ذخیره مقادیر
- نیاز به ref برای هر input
- مشکلات احتمالی در کپی/پیست کد

### ✅ روش جدید (CodeField)
- مدیریت خودکار فوکوس
- پشتیبانی داخلی از کپی/پیست
- کد تمیزتر و قابل نگهداری‌تر
- انیمیشن کرسر زیبا
- پشتیبانی از iOS auto-complete
- بهبود UX

## تفاوت‌های کلیدی در کد

### State (قبل)
```javascript
const [code, setCode] = useState(['', '', '', '', '', '']);
const inputRefs = useRef([]);
```

### State (بعد)
```javascript
const CELL_COUNT = 6;
const [code, setCode] = useState('');
const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
const [props, getCellOnLayoutHandler] = useClearByFocusCell({
  value: code,
  setValue: setCode,
});
```

### Validation (قبل)
```javascript
const verificationCode = code.join('');
if (verificationCode.length !== 6) { ... }
```

### Validation (بعد)
```javascript
if (code.length !== 6) { ... }
```

## Features خاص iOS

با تنظیم `textContentType="oneTimeCode"`, در iOS 12+ به صورت خودکار کد OTP از پیامک خوانده شده و پیشنهاد می‌شود.

## سفارشی‌سازی

می‌توانید استایل هر cell را به دلخواه تغییر دهید:

```javascript
renderCell={({ index, symbol, isFocused }) => (
  <View
    style={{
      // استایل دلخواه شما
      borderColor: isFocused ? 'blue' : 'gray',
      backgroundColor: symbol ? '#e3f2fd' : '#fff',
    }}
  >
    <Text>{symbol || (isFocused ? <Cursor /> : null)}</Text>
  </View>
)}
```

## مستندات بیشتر

https://github.com/retyui/react-native-confirmation-code-field
