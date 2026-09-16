/**
 * اعتبارسنجی کد ملی / موبایل / ایمیل. دو چیز را قفل می‌کند:
 * - ارقام فارسی و عربی (کیبورد فارسی) باید مثل ارقام انگلیسی پذیرفته شوند؛
 *   قبلاً `\D` آن‌ها را حذف می‌کرد و همیشه «باید ۱۰ رقم باشد» برمی‌گشت.
 * - هر حالتِ نامعتبر پیامِ مخصوص خودش را دارد، نه یک پیام کلی.
 */

import i18n from '@i18n';
import { validateEmail, validateMelicode, validatePhone } from '../Common';

describe('validators', () => {
  beforeAll(() => i18n.changeLanguage('fa'));

  describe('validateMelicode', () => {
    it('accepts a valid national ID in English, Persian and Arabic digits', () => {
      expect(validateMelicode('0010350829').isValid).toBe(true);
      expect(validateMelicode('۰۰۱۰۳۵۰۸۲۹').isValid).toBe(true);
      expect(validateMelicode('٠٠١٠٣٥٠٨٢٩').isValid).toBe(true);
    });

    it('explains which rule failed', () => {
      expect(validateMelicode('')).toEqual({ isValid: false, message: 'کد ملی الزامی است' });
      expect(validateMelicode('12345').message).toBe('کد ملی باید 10 رقم باشد');
      expect(validateMelicode('1111111111').message).toBe('کد ملی وارد شده معتبر نیست');
      expect(validateMelicode('1234567890').message).toBe('کد ملی وارد شده معتبر نیست');
    });
  });

  describe('validatePhone', () => {
    it('accepts English and Persian digits', () => {
      expect(validatePhone('09121234567').isValid).toBe(true);
      expect(validatePhone('۰۹۱۲۱۲۳۴۵۶۷').isValid).toBe(true);
    });

    it('explains which rule failed', () => {
      expect(validatePhone('   ').message).toBe('شماره موبایل الزامی است');
      expect(validatePhone('0912').message).toBe('شماره موبایل باید 11 رقم باشد');
      expect(validatePhone('19121234567').message).toBe('شماره موبایل باید با 09 شروع شود');
    });
  });

  describe('validateEmail', () => {
    it('validates format', () => {
      expect(validateEmail(' a@b.co ').isValid).toBe(true);
      expect(validateEmail('').message).toBe('آدرس ایمیل الزامی است');
      expect(validateEmail('a@b').message).toBe('فرمت ایمیل صحیح نیست');
    });

    it('follows the app language', async () => {
      await i18n.changeLanguage('en');
      expect(validateEmail('a@b').message).toBe('Email format is incorrect');
      await i18n.changeLanguage('fa');
    });
  });
});
