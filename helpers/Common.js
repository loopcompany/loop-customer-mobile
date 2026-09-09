import { Dimensions, Platform, ToastAndroid, Alert } from "react-native";
import Constants from "expo-constants";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toJalaali } from 'jalaali-js';
import i18n from 'i18next';
const jalaali = require("jalaali-js");

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

// Week day translation keys (index 0 = Sunday)
const weekDaysKeys = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Persian month translation keys (index 1 = Farvardin)
const persianMonthsKeys = [
  '',
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
];


export const isLocalUri = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('blob:') ||
    uri.startsWith('data:') // برای بعضی حالت‌های وب
  );
};

const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);
export function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];

  const parseTime = (timeStr) => {
    // Accept formats like 'HH:MM' or 'HH:MM:SS' and tolerate minor whitespace
    if (!timeStr) return [0, 0];
    const parts = String(timeStr).trim().split(':').map(p => p.trim());
    if (parts.length < 2) return [0, 0];
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    return [isNaN(h) ? 0 : h, isNaN(m) ? 0 : m];
  };

  // Validate inputs
  if (!startTime || !endTime || !intervalMinutes || intervalMinutes <= 0) {
    return slots; // Return empty array if invalid inputs
  }

  let [startHour, startMinute] = parseTime(startTime);
  let [endHour, endMinute] = parseTime(endTime);

  let start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  let end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  // Safety: avoid accidental infinite loops by capping iterations
  const durationMs = intervalMinutes * 60000;
  // Estimate needed iterations (ensure at least 1) and add safety margin
  let estimatedCount = 1;
  if (end.getTime() > start.getTime()) {
    estimatedCount = Math.ceil((end.getTime() - start.getTime()) / durationMs) + 2;
  } else {
    estimatedCount = Math.ceil((24 * 60) / (intervalMinutes || 1)) + 2;
  }
  const maxIterations = Math.max(estimatedCount, 2) + 100; // generous cap

  let id = 1;
  let iterations = 0;
  let current = new Date(start.getTime());

  while (current < end && iterations < maxIterations) {
    const startHours = current.getHours();
    const startMinutes = current.getMinutes();

    // Calculate end time for this slot
    const slotEnd = new Date(current.getTime() + durationMs);
    const endHours = slotEnd.getHours();
    const endMinutes = slotEnd.getMinutes();

    // Format the range
    const startTimeStr = startMinutes === 0 ? `${startHours}` : `${startHours}:${startMinutes.toString().padStart(2, '0')}`;
    const endTimeStr = endMinutes === 0 ? `${endHours}` : `${endHours}:${endMinutes.toString().padStart(2, '0')}`;

    slots.push({
      id: id,
      value: `${startTimeStr} - ${endTimeStr}`,
      startTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    });

    current = new Date(current.getTime() + durationMs);
    id++;
    iterations++;
  }

  return slots;
}

export function isMoreThan4HoursFromNow(dateString, timeString) {
  // Parse time range format like "10 الی 12" or single time like "10:00"
  let startTime = timeString;

  if (timeString && timeString.includes('الی')) {
    // Extract start time from range format
    const parts = timeString.split('الی');
    if (parts.length === 2) {
      startTime = parts[0].trim();
    }
  }

  // Parse hour and minute from startTime
  let hour, minute;
  if (startTime && startTime.includes(':')) {
    const timeParts = startTime.split(':');
    hour = parseInt(timeParts[0]);
    minute = parseInt(timeParts[1]);
  } else {
    hour = parseInt(startTime);
    minute = 0;
  }

  // Pad hour and minute to ensure HH:MM format
  const paddedHour = hour.toString().padStart(2, '0');
  const paddedMinute = minute.toString().padStart(2, '0');
  const formattedTime = `${paddedHour}:${paddedMinute}:00`;

  // Create target datetime
  const targetDateTime = new Date(`${dateString}T${formattedTime}`);
  const now = new Date();
  const diffMs = targetDateTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 4;
}


export const getNext20DaysJalaali = () => {
  const days = [];
  const lang = (i18n.language || 'fa').toLowerCase();
  const isFa = lang.startsWith('fa');
  const locale = (i18n.language || 'en-US').replace('_', '-');

  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const weekday = i18n.t(weekDaysKeys[dayOfWeek]);
    const value = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;

    let dateLabel = '';
    if (isFa) {
      const jDate = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const monthName = i18n.t(persianMonthsKeys[jDate.jm]);
      dateLabel = `${jDate.jd} ${monthName}`;
    } else {
      const monthName = date.toLocaleString(locale, { month: 'short' });
      dateLabel = `${date.getDate()} ${monthName}`;
    }

    days.push({
      id: i + 1,
      weekday: weekday,
      date: dateLabel,
      value: value,
    });
  }
  return days;
};

export const appName = () => {
  return Constants?.expoConfig?.name;
};

export const appVersion = () => {
  return Constants?.expoConfig?.version;
};

export const getColumnsCount = () => {
  if (deviceWidth >= 1024) {
    //desktop
    return 4;
  } else if (deviceWidth >= 768) {
    //tablet
    return 3;
  } else {
    //phone
    return 2;
  }
};

export const getImageSize = (height, width) => {
  if (height > width) {
    //portrait
    return 300;
  } else if (height < width) {
    //landscape
    return 250;
  } else {
    //square
    return 200;
  }
};
export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  // برای اضافه کردن صفر جلو
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};
export const generateUniqueCode = () => {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000); // عدد تصادفی بین 0 تا 9999
  const uniqueCode = timestamp + randomPart;
  return uniqueCode.toString().slice(-10); // 10 رقم آخر را برمی‌گرداند
};
export const handleError = (error, t) => {

  try {
    if (error?.response?.status == 409 || error?.response?.status == 400) {
      const message = error?.response?.data?.message || "خطایی رخ داد";
      showToastOrAlert(`${t(message)}`);
    } else if (error?.response?.status == 401) {
      showToastOrAlert(`${t("Unauthorized access!")}`);
    }
    else if (error?.response?.status == 402) {
      showToastOrAlert(`${t("Your wallet balance is not enough.")}`)
    }
    else {
      showToastOrAlert(`${t("An unexpected error occurred!")}`);
    }
  } catch (e) {
    showToastOrAlert(`${t("Network error!")}`);
  }
};
// Helper function to calculate contrast ratio
export const calculateContrastRatio = (bgColor, textColor) => {
  // Convert hex colors to RGB values
  const bgRgb = hexToRgb(bgColor);
  const textRgb = hexToRgb(textColor);
  // Calculate luminance for background and text
  const bgLum = (0.2126 * bgRgb.r + 0.7152 * bgRgb.g + 0.0722 * bgRgb.b) / 255;
  const textLum =
    (0.2126 * textRgb.r + 0.7152 * textRgb.g + 0.0722 * textRgb.b) / 255;
  // Calculate contrast ratio
  const contrastRatio =
    (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
  return contrastRatio;
};

// Helper function to convert hex color to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
};

export const cleanText = (text) => text?.replace(/<br\s*\/?>/gi, "\n")?.replace(/<\/?li>/gi, "\n")?.replace(/(<([^>]+)>)/gi, "")?.replace(/\&nbsp;/g, '')?.replace(/\&ldquo;/g, '')?.replace(/\&rdquo;/g, '')?.replace(/\&hellip;/g, '')?.replace(/\&zwnj;/g, '‌')?.replace(/\&raquo;/g, '')?.replace(/\&laquo;/g, '')?.replace(/\&quot;/g, '');

export const showToastOrAlert = (message) => {
  Platform.OS === "android"
    ? ToastAndroid.show(message, ToastAndroid.SHORT)
    : alert(message);
};

// Validation functions for forgot password
export const validateMelicode = (melicode) => {
  if (!melicode) {
    return { isValid: false, message: 'کد ملی الزامی است' };
  }

  const cleanMelicode = melicode.toString().replace(/\D/g, '');

  if (cleanMelicode.length !== 10) {
    return { isValid: false, message: 'کد ملی باید 10 رقم باشد' };
  }

  // Check for invalid patterns
  const invalidPatterns = [
    '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
    '5555555555', '6666666666', '7777777777', '8888888888', '9999999999'
  ];

  if (invalidPatterns.includes(cleanMelicode)) {
    return { isValid: false, message: 'کد ملی وارد شده معتبر نیست' };
  }

  // Check sum validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanMelicode.charAt(i)) * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = parseInt(cleanMelicode.charAt(9));

  if (remainder < 2) {
    if (checkDigit === remainder) {
      return { isValid: true, message: '' };
    }
  } else {
    if (checkDigit === 11 - remainder) {
      return { isValid: true, message: '' };
    }
  }

  return { isValid: false, message: 'کد ملی وارد شده معتبر نیست' };
};

export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'شماره موبایل الزامی است' };
  }

  const cleanPhone = phone.toString().replace(/\D/g, '');

  if (cleanPhone.length !== 11) {
    return { isValid: false, message: 'شماره موبایل باید 11 رقم باشد' };
  }

  if (!cleanPhone.startsWith('09')) {
    return { isValid: false, message: 'شماره موبایل باید با 09 شروع شود' };
  }

  return { isValid: true, message: '' };
};

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'آدرس ایمیل الزامی است' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'فرمت ایمیل صحیح نیست' };
  }

  return { isValid: true, message: '' };
};

export const formatPrice = (text) =>
  text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatJalaaliDate = (isoDate) => {
  const date = new Date(isoDate);
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  // گرفتن ساعت و دقیقه
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${jy}/${jm}/${jd} - ${hours}:${minutes}`;
};

export const formatDate = (isoDate, fa = i18n.language === 'fa') => {
  if (!isoDate) return '';
  if (!fa) {
    return isoDate.replace('T', ' ').split(' ')[0];
  }
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jy}/${jm}/${jd}`;
};

export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const isDateValid = (date, daysToAdd) => {
  const today = dayjs(); // تاریخ امروز بدون ساعت
  const targetDate = dayjs(date).add(daysToAdd, "day"); // اضافه کردن روزها

  return targetDate.isBefore(today);
};

// Order status helpers
export const getOrderStatusText = (status) => {
  const statusMap = {
    0: 'در انتظار',
    1: 'در حال انجام',
    2: 'انجام شده',
    3: 'لغو شده توسط کاربر',
    4: 'لغو شده توسط تکنسین',
    5: 'لغو شده توسط ادمین',
    6: 'منقضی شده'
  };
  return statusMap[status] || 'نامشخص';
};

export const getOrderStatusColor = (status) => {
  const colorMap = {
    0: '#FFA500', // نارنجی - در انتظار
    1: '#2196F3', // آبی - در حال انجام
    2: '#4CAF50', // سبز - انجام شده
    3: '#F44336', // قرمز - لغو شده توسط کاربر
    4: '#F44336', // قرمز - لغو شده توسط تکنسین
    5: '#F44336', // قرمز - لغو شده توسط ادمین
    6: '#9E9E9E'  // خاکستری - منقضی شده
  };
  return colorMap[status] || '#9E9E9E';
};

const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur', 'ps', 'ckb']);
export const langIsRTL = (lang) => (lang || '').toLowerCase().split('-')[0] && RTL_LANGS.has((lang || '').toLowerCase().split('-')[0]);

export const formatDateTime = (isoDate, fa = i18n.language === 'fa') => {
  if (!isoDate) return '';
  if (!fa) {
    return isoDate.replace('T', ' ').split('.')[0];
  }
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());

  // گرفتن ساعت و دقیقه
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${jy}/${jm}/${jd} - ${hours}:${minutes}`;
};
export const calculateDaysDifference = (targetDate) => {
  const now = dayjs();
  const givenDate = dayjs(targetDate);
  const diffInDays = now.diff(givenDate, 'day');
  return diffInDays;
};

export const getPaymentStatusText = (status) => {
  return status === 0 ? 'پرداخت نشده' : 'پرداخت شده';
};

export const getPaymentStatusColor = (status) => {
  return status === 0 ? '#F44336' : '#4CAF50';
};

export function convertToEnglish(str) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return str.toString()
    .replace(/[۰-۹]/g, (char) => persianNumbers.indexOf(char))
    .replace(/[٠-٩]/g, (char) => arabicNumbers.indexOf(char));
}

////////////////////////////////////////////////////////////////////////////////

// function generateCode(id){
//     const codeElement = document.getElementById('code-'+id);
//     const copyElement = document.getElementById('copyBtn-'+id);
//     const generateElement = document.getElementById('generateBtn-'+id);

//     const randomLetters = generateRandomLetters(3);
//     const randomNumbers = generateRandomNumbers(8);
//     const code = ${randomLetters}-${randomNumbers};

//     generateElement.style.display = 'none';
//     copyElement.style.display = 'block';
//     codeElement.textContent = code;

//     useCode(id, code);
// }

// function generateRandomLetters(length) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
// }

// function generateRandomNumbers(length)
// {
//     return Math.floor(10 ** length * Math.random()).toString().padStart(length, '0');
// }

/**
 * تبدیل تاریخ شمسی به میلادی با استفاده از کتابخانه jalaali-js
 * @param {string} jDate - تاریخ شمسی به فرمت YYYY/MM/DD (مثال: 1402/08/17)
 * @returns {string} - تاریخ میلادی به فرمت YYYY-MM-DD (مثال: 2023-11-08) یا رشته خالی در صورت خطا
 */
export function jalaliToGregorian(jDate) {
  if (!jDate) return '';

  try {
    // فرمت ورودی: 1402/08/17
    const parts = jDate.split('/');
    if (parts.length !== 3) return '';

    const jy = parseInt(parts[0]);
    const jm = parseInt(parts[1]);
    const jd = parseInt(parts[2]);

    // بررسی اعتبار مقادیر
    if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return '';
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return '';

    // استفاده از کتابخانه jalaali-js برای تبدیل دقیق
    const gregorian = jalaali.toGregorian(jy, jm, jd);

    // فرمت خروجی: YYYY-MM-DD
    const year = gregorian.gy;
    const month = gregorian.gm < 10 ? `0${gregorian.gm}` : `${gregorian.gm}`;
    const day = gregorian.gd < 10 ? `0${gregorian.gd}` : `${gregorian.gd}`;

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting Jalali to Gregorian:', error);
    return '';
  }
}

/**
 * Cross-platform Alert function
 * Works with both web and native platforms
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Array of button objects (optional)
 * 
 * @example
 * // Simple alert
 * showAlert('خطا', 'لطفا فیلدها را پر کنید');
 * 
 * // Confirmation dialog
 * showAlert('حذف', 'آیا مطمئن هستید؟', [
 *   { text: 'انصراف', style: 'cancel' },
 *   { text: 'حذف', style: 'destructive', onPress: () => deleteItem() }
 * ]);
 */
export const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      console.warn('showAlert called on web but window is undefined');
      return;
    }

    if (buttons && buttons.length > 0) {
      // For confirmation dialogs with buttons
      const confirmMessage = title ? `${title}\n\n${message}` : message;
      const confirmed = window.confirm(confirmMessage);

      if (confirmed) {
        // Find and execute the positive/destructive button
        const positiveButton = buttons.find(btn =>
          btn.style === 'destructive' ||
          btn.style === 'default' ||
          btn.text?.includes('بله') ||
          btn.text?.includes('تایید') ||
          btn.text?.includes('خروج') ||
          btn.text?.includes('حذف') ||
          btn.text?.includes('ارسال') ||
          btn.text?.includes('ذخیره') ||
          btn.text?.includes('OK')
        ) || buttons[buttons.length - 1]; // Default to last button

        if (positiveButton && positiveButton.onPress) {
          positiveButton.onPress();
        }
      } else {
        // Find and execute the cancel button
        const cancelButton = buttons.find(btn =>
          btn.style === 'cancel' ||
          btn.text?.includes('انصراف') ||
          btn.text?.includes('خیر') ||
          btn.text?.includes('Cancel')
        );

        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // Simple alert without buttons
      const alertMessage = title ? `${title}\n\n${message}` : message;
      window.alert(alertMessage);
    }
  } else {
    // Native platform (iOS/Android). This wrapper is the one sanctioned place
    // in the app that may call Alert.alert directly — everywhere else must go
    // through showAlert() so the web path is not silently a no-op.
    /* eslint-disable no-restricted-properties */
    if (!buttons || buttons.length === 0) {
      // Add default "OK" button for simple alerts
      Alert.alert(title, message, [{ text: 'باشه', style: 'default' }]);
    } else {
      Alert.alert(title, message, buttons);
    }
    /* eslint-enable no-restricted-properties */
  }
};

// ---------------------------------------------------------------------------
// «بازه زمانی / رزرو» - کمک‌تابع‌های تاریخِ رزرو
//
// DatePickerModal بسته به زبان دو قالب متفاوت برمی‌گرداند: «jYYYY/jMM/jDD»
// برای فارسی و «YYYY-MM-DD» برای انگلیسی. تابع‌های زیر هر دو قالب را
// می‌فهمند تا نوار انتخاب سریع تاریخ و تقویم دقیقاً یک مقدار مشترک بسازند.
// ---------------------------------------------------------------------------

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// «fa-IR» هم باید فارسی حساب شود - مقایسه‌ی برابری ساده با 'fa' کافی نیست.
const isFaLang = () => (i18n.language || 'fa').toLowerCase().startsWith('fa');

export const toPersianDigits = (input) =>
  String(input ?? '').replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);

// قالب خروجی را با چیزی که DatePickerModal تولید می‌کند یکسان نگه می‌دارد.
export const formatDateForPicker = (date, fa = isFaLang()) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  if (fa) {
    const { jy, jm, jd } = jalaali.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return `${jy}/${padZero(jm)}/${padZero(jd)}`;
  }
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
};

// رشته‌ی تاریخ (هر کدام از دو قالب) را به Date میلادی تبدیل می‌کند.
export const parsePickerDate = (value) => {
  if (!value) return null;
  const text = convertToEnglish(value).trim();
  const parts = text.split(/[/-]/).map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  const [y, m, d] = parts;
  // تاریخ شمسی با «/» و سال کمتر از ۱۷۰۰ شناخته می‌شود.
  const isJalaali = text.includes('/') && y < 1700;
  const g = isJalaali ? jalaali.toGregorian(y, m, d) : { gy: y, gm: m, gd: d };
  const date = new Date(g.gy, g.gm - 1, g.gd);
  return isNaN(date.getTime()) ? null : date;
};

// برچسب خوانا برای یک تاریخ انتخاب‌شده - مثلاً «چهارشنبه» / «۸ شهریور».
export const describePickerDate = (value) => {
  const date = parsePickerDate(value);
  if (!date) return null;
  const fa = isFaLang();
  const weekday = i18n.t(weekDaysKeys[date.getDay()]);
  let dayLabel;
  if (fa) {
    const { jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    dayLabel = `${toPersianDigits(jd)} ${i18n.t(persianMonthsKeys[jm])}`;
  } else {
    const locale = (i18n.language || 'en-US').replace('_', '-');
    dayLabel = `${date.getDate()} ${date.toLocaleString(locale, { month: 'short' })}`;
  }
  return { date, weekday, dayLabel };
};

// n روز آینده برای نوار انتخاب سریع تاریخ در «بازه زمانی / رزرو».
// برخلاف getNext20DaysJalaali، مقدارِ هر روز هم‌قالب با DatePickerModal است
// تا انتخاب از نوار و انتخاب از تقویم یکدیگر را بازتاب دهند.
export const getBookingDays = (count = 14) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const described = describePickerDate(formatDateForPicker(date));
    days.push({
      id: `day_${i}`,
      value: formatDateForPicker(date),
      weekday: described?.weekday || '',
      dayLabel: described?.dayLabel || '',
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }
  return days;
};
