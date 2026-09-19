/**
 * زنجیره‌ی fallbackِ «مشخصات کاربر».
 *
 * این تست همان باگی را قفل می‌کند که رسیدهای سازمانی را پر از «نامشخص» کرده
 * بود: تنها منبعِ آدرس و تلفن ثابت `organization.profileData` بود و آن state
 * هیچ‌جای اپ dispatch نمی‌شود، پس همیشه null بود.
 */

import {
  formatAddressEntry,
  pickSavedAddress,
  resolveCustomer,
  resolveUserCode,
} from '../receiptCustomer';

const savedAddress = {
  id: 7,
  fname: 'احمد',
  lname: 'زارعی',
  city: 'تهران',
  region: 'ونک',
  address: 'خیابان گاندی',
  number: '12',
  unit: '3',
  telephone: '02188889999',
  mobile: '09121234567',
};

describe('formatAddressEntry', () => {
  it('اجزای آدرس را به یک خط خوانا می‌چسباند', () => {
    expect(formatAddressEntry(savedAddress)).toBe('تهران، ونک، خیابان گاندی، پلاک 12، واحد 3');
  });

  it('رکورد خالی، رشته‌ی خالی تولید نمی‌کند', () => {
    expect(formatAddressEntry(null)).toBeNull();
    expect(formatAddressEntry({ city: '  ' })).toBeNull();
  });
});

describe('pickSavedAddress', () => {
  const addresses = [{ id: 1, city: 'کرج' }, savedAddress];

  it('آدرس انتخاب‌شده را برمی‌دارد', () => {
    expect(pickSavedAddress(addresses, 7)).toBe(savedAddress);
    // شناسه ممکن است رشته باشد و ممکن است عدد.
    expect(pickSavedAddress(addresses, '7')).toBe(savedAddress);
  });

  it('بدون انتخاب، اولین آدرس - همان چیزی که موقع ثبت هم فرستاده می‌شود', () => {
    expect(pickSavedAddress(addresses, null)).toBe(addresses[0]);
  });

  it('بدون هیچ آدرسی null', () => {
    expect(pickSavedAddress([], 7)).toBeNull();
    expect(pickSavedAddress(undefined, 7)).toBeNull();
  });
});

describe('resolveCustomer', () => {
  it('آدرس و تلفن ثابت را از آدرس‌های ذخیره‌شده می‌گیرد، نه فقط از پروفایل سازمان', () => {
    const customer = resolveCustomer({
      isOrganization: true,
      addresses: [savedAddress],
      selectedAddressId: 7,
      // همان state ای که در عمل همیشه null است.
      orgProfile: null,
      user: { account_type: 'g_organization', name: 'شرکت الف' },
    });

    expect(customer.address).toBe('تهران، ونک، خیابان گاندی، پلاک 12، واحد 3');
    expect(customer.landline).toBe('02188889999');
  });

  it('آدرسِ خودِ سفارش بر آدرس‌های ذخیره‌شده مقدم است', () => {
    const customer = resolveCustomer({
      isOrganization: false,
      addressEntry: { city: 'اصفهان', address: 'چهارباغ', telephone: '03133334444' },
      addresses: [savedAddress],
      selectedAddressId: 7,
      user: {},
    });

    expect(customer.address).toBe('اصفهان، چهارباغ');
    expect(customer.landline).toBe('03133334444');
  });

  it('«۰۲۱»ِ تنها - باقی‌مانده‌ی پیش‌شماره در فرم - تلفن ثابت نیست', () => {
    const customer = resolveCustomer({
      isOrganization: false,
      addressDraft: { telephone: '021', city: 'تهران', address: 'ونک' },
      user: {},
    });

    expect(customer.landline).toBeNull();
  });

  it('به فیلدهای پروفایل کاربر هم برمی‌گردد', () => {
    const customer = resolveCustomer({
      isOrganization: false,
      user: {
        home_address: 'تهران، سعادت آباد',
        phone_number: '02144445555',
        melicode: '0084403507',
        mobile_number: '09121112233',
      },
    });

    expect(customer.address).toBe('تهران، سعادت آباد');
    expect(customer.landline).toBe('02144445555');
    expect(customer.nationalId).toBe('0084403507');
    expect(customer.phone).toBe('09121112233');
  });

  it('کاربر سازمانی شناسه ملیِ سازمان می‌گیرد و کاربر عادی کد ملیِ خودش', () => {
    const user = { national_id: '14009876543', national_code: '0084403507' };
    expect(resolveCustomer({ isOrganization: true, user }).nationalId).toBe('14009876543');
    expect(resolveCustomer({ isOrganization: false, user }).nationalId).toBe('0084403507');
  });
});

describe('resolveUserCode', () => {
  it('کد کاربری همان کدی است که داکِ پایین اپ نشان می‌دهد، نه id دیتابیس', () => {
    expect(resolveUserCode({ id: 28, code: '211866545' })).toBe('211866545');
  });

  it('بدون code، به id برمی‌گردد', () => {
    expect(resolveUserCode({ id: 28 })).toBe(28);
    expect(resolveUserCode({ id: 28, code: '   ' })).toBe(28);
  });

  it('بدون کاربر، null', () => {
    expect(resolveUserCode(null)).toBeNull();
  });
});
