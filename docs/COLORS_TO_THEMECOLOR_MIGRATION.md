# راهنمای تبدیل Colors به themeColor

## 🔄 Mapping جایگزینی

```javascript
// ❌ قدیمی -> ✅ جدید

Colors.white        → themeColor4.bgColor(1)
Colors.lightGray    → themeColor5.bgColor(1)
Colors.gray         → themeColor3.bgColor(1)
Colors.red          → themeColor6.bgColor(1)
Colors.green        → themeColor7.bgColor(1)
Colors.orange       → themeColor11.bgColor(1)
Colors.blue         → themeColor2.bgColor(1)
Colors.lightBlue    → themeColor8.bgColor(1)
Colors.primary      → themeColor0.bgColor(1)
Colors.secondary    → themeColor1.bgColor(1)
Colors.purple       → themeColor9.bgColor(1)
Colors.black        → themeColor10.bgColor(1)
Colors.darkGray     → themeColor12.bgColor(1)
Colors.darkBlue     → themeColor13.bgColor(1)
```

## 📝 فایل‌های نیازمند تغییر

### کامل شده:
- ✅ `theme/Color.js` - حذف object Colors

### نیازمند تغییر:
این فایل‌ها استفاده زیادی از Colors دارند:
1. `components/AccessRestrictedScreen.js` (~40 استفاده)
2. `components/ProtectedOrderButton.js` (~10 استفاده)
3. `screens/organization/OrganizationProfileScreen.js` (~15 استفاده)
4. `screens/organization/OrganizationContractScreen.js` (~35 استفاده)

## ⚠️ نکته مهم

برخی فایل‌ها ممکن است از Colors برای **color** prop استفاده کنند (مثل icon ها).
در این حالت باید از `.color` استفاده کنیم نه `.bgColor(1)`:

```javascript
// برای backgroundColor
backgroundColor: themeColor4.bgColor(1)

// برای color (icon, text)
color: themeColor4.color
```

## 🔍 پیدا کردن همه استفاده‌ها

```bash
# در VS Code
Ctrl+Shift+F
جستجو: Colors\.

# یا در terminal
grep -r "Colors\." --include="*.js" --include="*.jsx" .
```

---

**تاریخ:** 2025-11-09  
**وضعیت:** 🔨 در حال انجام
