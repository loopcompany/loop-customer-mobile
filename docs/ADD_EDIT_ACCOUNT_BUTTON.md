# اضافه کردن دکمه "ویرایش اطلاعات حساب" به AccessRestrictedScreen

## تغییرات انجام شده:

### 1. Navigation Handler
```javascript
const handleNavigation = (action) => {
  switch (action) {
    // ... سایر موارد
    case 'edit_account':
      navigation.navigate('Profile');
      break;
    // ...
  }
};
```

### 2. UI Component
```javascript
{/* دکمه ویرایش اطلاعات حساب - همیشه در بالا نمایش داده شود */}
<TouchableOpacity 
  style={[styles.actionButtonCustom, { backgroundColor: themeColor10.bgColor(1) }]}
  onPress={() => handleNavigation('edit_account')}
>
  <Icon name="account-circle" size={24} color={themeColor4.color} />
  <Text style={[styles.actionButtonText, { color: themeColor4.color }]}>
    ویرایش اطلاعات حساب
  </Text>
</TouchableOpacity>
```

### 3. Styles
```javascript
actionButtonCustom: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 15,
  paddingHorizontal: 20,
  borderRadius: 12,
  marginBottom: 15,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
actionButtonText: {
  fontSize: 16,
  fontFamily: 'Vazir-Bold',
  marginRight: 10,
}
```

## ویژگی‌های دکمه جدید:

1. **موقعیت**: در بالای لیست دکمه‌ها قرار گرفته
2. **آیکون**: account-circle برای نشان دادن حساب کاربری
3. **Navigation**: به صفحه 'Profile' هدایت می‌کند
4. **Style**: دکمه سفارشی با shadow و رنگ متفاوت
5. **نمایش**: همیشه نمایش داده می‌شود (بدون شرط)

## مزایا:

- ✅ کاربر می‌تواند به راحتی اطلاعات حساب خود را ویرایش کند
- ✅ دسترسی آسان از صفحه محدودیت دسترسی
- ✅ UI منطقی و قابل فهم
- ✅ سازگار با طراحی کلی اپلیکیشن