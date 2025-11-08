/**
 * تست تابع تبدیل تاریخ شمسی به میلادی
 * استفاده: node helpers/testDateConversion.js
 */

const jalaali = require('jalaali-js');

function jalaliToGregorian(jDate) {
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

// تست‌ها
console.log('\n🧪 تست تبدیل تاریخ شمسی به میلادی\n');
console.log('═'.repeat(50));

const testCases = [
  { jalali: '1402/08/17', expected: '2023-11-08', description: 'امروز (۱۷ آبان ۱۴۰۲)' },
  { jalali: '1370/01/15', expected: '1991-04-04', description: 'تاریخ قدیمی (۱۵ فروردین ۱۳۷۰)' },
  { jalali: '1400/12/29', expected: '2022-03-20', description: 'آخرین روز سال (۲۹ اسفند ۱۴۰۰)' },
  { jalali: '1401/01/01', expected: '2022-03-21', description: 'اول سال (۱ فروردین ۱۴۰۱)' },
  { jalali: '1403/01/01', expected: '2024-03-20', description: 'سال کبیسه (۱ فروردین ۱۴۰۳)' },
  { jalali: '1380/06/31', expected: '2001-09-22', description: 'آخرین روز شهریور (۳۱ شهریور ۱۳۸۰)' },
  { jalali: '1399/11/30', expected: '2021-02-18', description: 'سال کبیسه شمسی (۳۰ بهمن ۱۳۹۹)' },
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  const result = jalaliToGregorian(test.jalali);
  const isPassed = result === test.expected;
  
  if (isPassed) {
    console.log(`✅ تست ${index + 1}: ${test.description}`);
    console.log(`   شمسی: ${test.jalali} → میلادی: ${result}`);
    passedTests++;
  } else {
    console.log(`❌ تست ${index + 1}: ${test.description}`);
    console.log(`   شمسی: ${test.jalali}`);
    console.log(`   انتظار: ${test.expected}`);
    console.log(`   نتیجه: ${result}`);
    failedTests++;
  }
  console.log('─'.repeat(50));
});

// تست موارد خطا
console.log('\n🔍 تست مدیریت خطاها:\n');
const errorCases = [
  { input: '', description: 'رشته خالی' },
  { input: '1402/13/01', description: 'ماه نامعتبر' },
  { input: '1402/01/32', description: 'روز نامعتبر' },
  { input: '1402-08-17', description: 'فرمت اشتباه (با خط تیره)' },
  { input: '1402/08', description: 'ناقص (بدون روز)' },
  { input: null, description: 'null' },
];

errorCases.forEach((test, index) => {
  const result = jalaliToGregorian(test.input);
  const isPassed = result === '';
  
  if (isPassed) {
    console.log(`✅ خطا ${index + 1}: ${test.description} → برگشت رشته خالی`);
    passedTests++;
  } else {
    console.log(`❌ خطا ${index + 1}: ${test.description} → نتیجه: ${result}`);
    failedTests++;
  }
});

// خلاصه
console.log('\n' + '═'.repeat(50));
console.log(`\n📊 خلاصه نتایج:`);
console.log(`   ✅ موفق: ${passedTests}`);
console.log(`   ❌ ناموفق: ${failedTests}`);
console.log(`   📈 درصد موفقیت: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);

if (failedTests === 0) {
  console.log('🎉 همه تست‌ها با موفقیت انجام شد!\n');
} else {
  console.log('⚠️  برخی تست‌ها ناموفق بودند. لطفا الگوریتم را بررسی کنید.\n');
  process.exit(1);
}
