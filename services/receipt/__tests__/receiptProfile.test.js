/**
 * پروفایل حساب، آخرین حلقه‌ی زنجیره‌ی «مشخصات کاربر» است.
 *
 * باگی که این تست نگه می‌دارد: `state.user.data` از `validate-token` می‌آید و
 * آدرس / تلفن ثابت / کد ملی ندارد، پس ردیف‌های رسید «نامشخص» چاپ می‌شدند حتی
 * وقتی کاربر همه‌شان را در صفحه‌ی پروفایل پر کرده بود.
 */

import { normalizeUserProfile, normalizeOrganizationProfile } from '../receiptProfile';
import { resolveCustomer } from '../receiptCustomer';

describe('normalizeUserProfile', () => {
  const user = {
    name: 'احمد',
    last_name: 'زارعی',
    melicode: '0084403507',
    mobile_number: '09121234567',
    phone_number: '02188889999',
    city: 'تهران',
    home_address: 'خیابان گاندی، پلاک ۱۲',
  };

  it('فیلدهای صفحه‌ی پروفایل را به شکل رسید درمی‌آورد', () => {
    expect(normalizeUserProfile(user)).toEqual({
      name: 'احمد زارعی',
      nationalId: '0084403507',
      mobile: '09121234567',
      landline: '02188889999',
      address: 'تهران، خیابان گاندی، پلاک ۱۲',
    });
  });

  it('شهر را دوبار تکرار نمی‌کند', () => {
    const profile = normalizeUserProfile({ ...user, home_address: 'تهران، ونک' });
    expect(profile.address).toBe('تهران، ونک');
  });

  it('در نبود آدرس خانه، آدرس محل کار را می‌گیرد', () => {
    const profile = normalizeUserProfile({ ...user, home_address: '', work_address: 'ونک' });
    expect(profile.address).toBe('تهران، ونک');
  });

  it('فیلدهای خالی null می‌شوند، نه رشته‌ی خالی', () => {
    const profile = normalizeUserProfile({ name: '  ', melicode: '' });
    expect(profile.name).toBeNull();
    expect(profile.nationalId).toBeNull();
    expect(profile.address).toBeNull();
  });
});

describe('normalizeOrganizationProfile', () => {
  it('نام‌های فیلدِ پروفایل سازمان را می‌شناسد', () => {
    // این نام‌ها با آنچه رسید قبلاً دنبالش بود (`address` / `phone` /
    // `national_id`) فرق دارند - دلیل دیگرِ «نامشخص» شدن رسیدهای سازمانی.
    expect(
      normalizeOrganizationProfile({
        organization_name: 'وزارت آموزش و پرورش',
        melicode: '14009876543',
        organization_phone: '02112345678',
        manager_mobile: '09120000000',
        city: 'تهران',
        organization_address: 'خیابان انقلاب',
      })
    ).toEqual({
      name: 'وزارت آموزش و پرورش',
      nationalId: '14009876543',
      mobile: '09120000000',
      landline: '02112345678',
      address: 'تهران، خیابان انقلاب',
    });
  });
});

describe('resolveCustomer با پروفایل', () => {
  // همان چیزی که validate-token برمی‌گرداند: هیچ‌کدام از فیلدهای رسید را ندارد.
  const tokenUser = { id: 123, phone: '09121234567', account_type: 'individual' };

  it('بدون پروفایل، آدرس و تلفن ثابت خالی می‌مانند', () => {
    const customer = resolveCustomer({ isOrganization: false, user: tokenUser });
    expect(customer.address).toBeNull();
    expect(customer.landline).toBeNull();
    expect(customer.nationalId).toBeNull();
  });

  it('پروفایل، همان ردیف‌ها را پر می‌کند', () => {
    const customer = resolveCustomer({
      isOrganization: false,
      user: tokenUser,
      profile: {
        name: 'احمد زارعی',
        nationalId: '0084403507',
        mobile: '09121234567',
        landline: '02188889999',
        address: 'تهران، خیابان گاندی',
      },
    });
    expect(customer.address).toBe('تهران، خیابان گاندی');
    expect(customer.landline).toBe('02188889999');
    expect(customer.nationalId).toBe('0084403507');
    expect(customer.name).toBe('احمد زارعی');
  });

  it('آدرسِ خودِ سفارش بر پروفایل مقدم است', () => {
    const customer = resolveCustomer({
      isOrganization: false,
      user: tokenUser,
      addressEntry: { city: 'کرج', address: 'عظیمیه', telephone: '02634567890' },
      profile: { address: 'تهران، خیابان گاندی', landline: '02188889999' },
    });
    expect(customer.address).toBe('کرج، عظیمیه');
    expect(customer.landline).toBe('02634567890');
  });

  it('پیش‌شماره‌ی تنهای فرم آدرس، جلوی تلفنِ پروفایل را نمی‌گیرد', () => {
    // AddNewAddress برای فیلدِ خالی رشته‌ی «۰۲۱» می‌گذارد؛ آن شماره نیست.
    const customer = resolveCustomer({
      isOrganization: false,
      user: tokenUser,
      addressEntry: { city: 'تهران', address: 'ونک', telephone: '021' },
      profile: { landline: '02188889999' },
    });
    expect(customer.landline).toBe('02188889999');
  });

  it('حساب سازمانی شناسه ملی و آدرس را از پروفایل سازمان می‌گیرد', () => {
    const customer = resolveCustomer({
      isOrganization: true,
      user: { id: 1, account_type: 'g_organization' },
      profile: {
        name: 'وزارت آموزش و پرورش',
        nationalId: '14009876543',
        landline: '02112345678',
        address: 'تهران، خیابان انقلاب',
      },
    });
    expect(customer.name).toBe('وزارت آموزش و پرورش');
    expect(customer.nationalId).toBe('14009876543');
    expect(customer.address).toBe('تهران، خیابان انقلاب');
    expect(customer.landline).toBe('02112345678');
  });
});
