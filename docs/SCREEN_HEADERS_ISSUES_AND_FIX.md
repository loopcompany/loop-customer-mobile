# مشکلات ScreenHeaders و راه‌حل آن

## 🐛 مشکلات موجود

### مشکل 1: عدم سازگاری در نام‌گذاری Props

**فایل `ScreenHeaders.js` Props مورد انتظار:**
```javascript
const ScreenHeaders = ({ title, onPressLeft, onPressRight }) => {
```

**استفاده در پروژه:**
```javascript
// ✅ درست
<ScreenHeaders onPressLeft={() => navigation.goBack()} onPressRight={() => {}} />

// ❌ غلط - prop اشتباه
<ScreenHeaders onBackPress={() => navigation.goBack()} />
```

**فایل‌های دارای مشکل:**
- `screens/NotesScreen.js` (خط 165)
- `screens/notes/AddEditNoteScreen.js` (خط 86)
- `screens/game/GameResultScreen.js` (خط 79)
- `screens/game/GamePlayScreen.js` (خط 143, 158)
- `screens/game/GameMenuScreen.js` (خط 44)
- `org/logreg/Privacy.js` (خط 24)

---

### مشکل 2: ترتیب نمایش اشتباه برای RTL

**کد فعلی:**
```javascript
<View style={header}>
  <TouchableOpacity onPress={onPressRight}>  {/* سمت راست */}
    <Text>بعدی</Text>
    <Image source={next.png} />
  </TouchableOpacity>
  
  <View><Text>{title}</Text></View>
  
  <TouchableOpacity onPress={onPressLeft}>   {/* سمت چپ */}
    <Image source={back.png} />
    <Text>قبلی</Text>
  </TouchableOpacity>
</View>
```

**نمایش نهایی:**
```
┌────────────────────────────────────────┐
│  بعدی →        عنوان        ← قبلی   │
└────────────────────────────────────────┘
```

**مشکل:** در RTL، کاربر انتظار دارد دکمه بازگشت سمت راست باشد!

---

### مشکل 3: عدم وضوح در نام‌گذاری

نام‌های `onPressLeft` و `onPressRight` مبهم هستند:
- آیا منظور سمت **چپ/راست فیزیکی** است؟
- آیا منظور سمت **چپ/راست منطقی (در RTL)** است؟

---

## ✅ راه‌حل پیشنهادی

### گزینه 1: تغییر Props به Back/Next (توصیه می‌شود)

```javascript
const ScreenHeaders = ({ 
  title, 
  onBackPress,    // برای بازگشت
  onNextPress     // برای بعدی
}) => {
  return (
    <View style={header}>
      {/* سمت راست: دکمه بازگشت */}
      <TouchableOpacity onPress={onBackPress}>
        <Image source={back.png} />
        <Text>قبلی</Text>
      </TouchableOpacity>
      
      <View><Text>{title}</Text></View>
      
      {/* سمت چپ: دکمه بعدی */}
      <TouchableOpacity onPress={onNextPress}>
        <Text>بعدی</Text>
        <Image source={next.png} />
      </TouchableOpacity>
    </View>
  );
};
```

**مزایا:**
- ✅ نام‌ها واضح و قابل فهم
- ✅ منطبق با انتظار کاربر RTL
- ✅ سازگار با BackHandler

**معایب:**
- ❌ نیاز به تغییر ~40 فایل در پروژه

---

### گزینه 2: حفظ Props فعلی + تغییر ترتیب (سریع‌تر)

```javascript
const ScreenHeaders = ({ 
  title, 
  onPressLeft,    // برای next (سمت چپ فیزیکی)
  onPressRight    // برای back (سمت راست فیزیکی)
}) => {
  return (
    <View style={header}>
      {/* سمت راست: بازگشت */}
      <TouchableOpacity onPress={onPressRight}>
        <Image source={back.png} />
        <Text>قبلی</Text>
      </TouchableOpacity>
      
      <View><Text>{title}</Text></View>
      
      {/* سمت چپ: بعدی */}
      <TouchableOpacity onPress={onPressLeft}>
        <Text>بعدی</Text>
        <Image source={next.png} />
      </TouchableOpacity>
    </View>
  );
};
```

**مزایا:**
- ✅ نیازی به تغییر فایل‌های دیگر نیست
- ✅ ترتیب نمایش صحیح می‌شود

**معایب:**
- ❌ نام‌ها همچنان گیج‌کننده هستند
- ❌ `onPressLeft` برای بازگشت استفاده می‌شود که غیرمنطقی است

---

### گزینه 3: پشتیبانی از هر دو API (بهترین گزینه)

```javascript
const ScreenHeaders = ({ 
  title, 
  // API قدیمی (برای backward compatibility)
  onPressLeft,    
  onPressRight,
  // API جدید (توصیه می‌شود)
  onBackPress,
  onNextPress
}) => {
  // اگر API جدید استفاده شده، اون رو در اولویت بگیر
  const handleBack = onBackPress || onPressRight || (() => {});
  const handleNext = onNextPress || onPressLeft || (() => {});
  
  return (
    <View style={header}>
      {/* سمت راست: بازگشت */}
      <TouchableOpacity onPress={handleBack}>
        <Image source={back.png} />
        <Text>قبلی</Text>
      </TouchableOpacity>
      
      <View><Text>{title}</Text></View>
      
      {/* سمت چپ: بعدی */}
      <TouchableOpacity onPress={handleNext}>
        <Text>بعدی</Text>
        <Image source={next.png} />
      </TouchableOpacity>
    </View>
  );
};
```

**مزایا:**
- ✅ کدهای قدیمی کار می‌کنند (backward compatible)
- ✅ می‌توان تدریجی فایل‌ها را migrate کرد
- ✅ نام‌های جدید واضح و قابل فهم

**معایب:**
- ❌ کمی پیچیده‌تر
- ❌ نیاز به مستندسازی دقیق

---

## 🔧 پیاده‌سازی گزینه 3 (توصیه شده)

### مرحله 1: بروزرسانی ScreenHeaders.js

```javascript
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, StatusBar, Platform } from "react-native";
import React from "react";
import NewStyles from "../styles/NewStyles";
import { themeColor4 } from "../theme/Color";

const ScreenHeaders = ({ 
  title, 
  // Old API (deprecated but still supported)
  onPressLeft,    
  onPressRight,
  // New API (recommended)
  onBackPress,
  onNextPress
}) => {
  const { width } = Dimensions.get('window');
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  
  // Priority: new API > old API > empty function
  // For RTL apps: back button should be on the right side
  const handleBack = onBackPress || onPressRight || (() => {});
  const handleNext = onNextPress || onPressLeft || (() => {});
  
  return (
    <View style={[styles.header, NewStyles.rowWrapper, { 
      width: width,
      paddingTop: statusBarHeight,
      height: 50 + statusBarHeight
    }]}>
      {/* Right side: Back button (RTL) */}
      <TouchableOpacity 
        onPress={handleBack} 
        style={[styles.iconContainer, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Image source={require("../assets/back.png")} style={styles.arrow} />
        <Text style={styles.titleText}>قبلی</Text>
      </TouchableOpacity>
      
      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={[NewStyles.title, NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>
      
      {/* Left side: Next button (RTL) */}
      <TouchableOpacity 
        onPress={handleNext} 
        style={[styles.iconContainer, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text style={styles.titleText}>بعدی</Text>
        <Image source={require("../assets/next.png")} style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
};

export default ScreenHeaders;

const styles = StyleSheet.create({
  header: {
    backgroundColor: themeColor4.bgColor(1),
    height: 50,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  iconContainer: {
    minWidth: 60,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  arrow: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  titleText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: 'VazirBold',
  },
});
```

### مرحله 2: فایل‌های نیازمند تغییر فوری

فایل‌هایی که `onBackPress` استفاده می‌کنند (الان کار نمی‌کنند):

```javascript
// ❌ قبل
<ScreenHeaders title="یادداشت‌ها" onBackPress={() => navigation.goBack()} />

// ✅ بعد - اصلاح خودکار می‌شود با API جدید
// هیچ تغییری لازم نیست!
```

### مرحله 3: Migration تدریجی (اختیاری)

می‌توانید تدریجی فایل‌ها را به API جدید migrate کنید:

```javascript
// قبل (API قدیمی)
<ScreenHeaders
  title="عنوان"
  onPressLeft={() => navigation.goBack()}
  onPressRight={() => {}}
/>

// بعد (API جدید - توصیه می‌شود)
<ScreenHeaders
  title="عنوان"
  onBackPress={() => navigation.goBack()}
  onNextPress={() => {}}
/>
```

---

## 📊 لیست فایل‌های نیازمند بررسی

### 🔴 اولویت بالا (کار نمی‌کنند)

فایل‌هایی که `onBackPress` دارند اما ScreenHeaders آن را support نمی‌کند:

1. `screens/NotesScreen.js` (خط 165)
2. `screens/notes/AddEditNoteScreen.js` (خط 86)
3. `screens/game/GameResultScreen.js` (خط 79)
4. `screens/game/GamePlayScreen.js` (خط 143, 158)
5. `screens/game/GameMenuScreen.js` (خط 44)
6. `org/logreg/Privacy.js` (خط 24)

**بعد از پیاده‌سازی گزینه 3، این فایل‌ها خودکار کار می‌کنند!**

### 🟡 اولویت متوسط (کار می‌کنند اما نام‌گذاری مبهم)

فایل‌هایی که `onPressLeft` برای back استفاده می‌کنند:

- تمام فایل‌های org/logreg/*
- تمام فایل‌های screens/*

**توصیه:** تدریجی به API جدید migrate شوند.

---

## 🎯 نتیجه نهایی

با پیاده‌سازی گزینه 3:

### در ScreenHeaders:
```
┌───────────────────────────────────────────┐
│  ← قبلی        عنوان        بعدی →      │
└───────────────────────────────────────────┘
```

### API:
```javascript
// ✅ هر دو کار می‌کنند
<ScreenHeaders onBackPress={...} onNextPress={...} />  // جدید
<ScreenHeaders onPressLeft={...} onPressRight={...} /> // قدیمی
```

### رفتار:
- ✅ دکمه بازگشت در **سمت راست** (مناسب RTL)
- ✅ دکمه بعدی در **سمت چپ** (مناسب RTL)
- ✅ تمام کدهای قدیمی کار می‌کنند
- ✅ API جدید واضح و قابل فهم

---

## 📝 تست

بعد از اعمال تغییرات:

1. ✅ تست فایل‌های با `onBackPress`
2. ✅ تست فایل‌های با `onPressLeft/Right`
3. ✅ بررسی ترتیب نمایش دکمه‌ها
4. ✅ تست در iOS و Android
5. ✅ تست در وب

---

**تاریخ:** 2025-11-09  
**وضعیت:** 🔨 منتظر تایید برای اعمال  
**گزینه پیشنهادی:** گزینه 3 (پشتیبانی از هر دو API)
