/**
 * مسیر «انتخاب سیستماتیک» سفارش را روی سرور ثبت نمی‌کند، پس تنها منبع رسید،
 * همین `answers` است. این تست قرارداد بین شکل پاسخ هر نوع مرحله و رسید را
 * قفل می‌کند - جایی که به‌راحتی می‌شکند وقتی مرحله‌ای در systematicFlows.js
 * عوض شود.
 */

import { receiptFromSystematic } from '../fromSystematic';
import { ORDER_KIND, RECEIPT_STATE } from '../receiptModel';

const user = {
  id: 28,
  // همان کدی که داکِ پایین اپ نشان می‌دهد؛ رسید باید همین را چاپ کند نه id.
  code: '211866545',
  fname: 'احمد',
  lname: 'زارعی',
  mobile: '09121234567',
  account_type: 'g_organization',
  national_id: '14009876543',
};

const orgProfile = {
  organization_name: 'شرکت ایده پردازان مبین',
  national_id: '14009876543',
  address: 'تهران، ونک',
  phone: '02188889999',
};

describe('receiptFromSystematic', () => {
  it('برند و مدل را به «مشخصات محصول» می‌برد', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {
        brand: { brand: 'acer' },
        model: { model: 'X555U' },
      },
      user,
    });

    expect(receipt.product).toMatchObject({
      type: 'لپ تاپ',
      brand: 'Acer',
      model: 'X555U',
    });
  });

  it('لوگوی برند را هم برمی‌دارد تا رسید به‌جای متن، تصویر برند را نشان دهد', () => {
    const withLogo = receiptFromSystematic({
      categoryId: 'laptop',
      answers: { brand: { brand: 'acer' } },
      user,
    });
    expect(withLogo.product.brandLogo).toBeTruthy();

    // برندِ دستی («برند دیگر») لوگو ندارد و باید به متن برگردد.
    const typed = receiptFromSystematic({
      categoryId: 'laptop',
      answers: { brand: { other: 'برند ناشناخته' } },
      user,
    });
    expect(typed.product.brandLogo).toBeNull();
  });

  it('برندِ خارج از فهرست از کادر «برند دیگر» خوانده می‌شود', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: { brand: { other: 'برند ناشناخته' } },
      user,
    });
    expect(receipt.product.brand).toBe('برند ناشناخته');
  });

  it('بدون برند و مدل، بخش مشخصات محصول کلاً حذف می‌شود', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'trash',
      answers: {},
      user,
    });
    expect(receipt.product).toBeNull();
  });

  it('مراحل خدماتی در یک ردیفِ «خدمات» با شرحِ جداشده با / جمع می‌شوند', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {
        brand: { brand: 'acer' },
        model: { model: 'X555U' },
        os: 'win10',
        software_install: { selected: ['general_office', 'antivirus'] },
      },
      user,
    });

    expect(receipt.services).toHaveLength(1);
    const [row] = receipt.services;
    expect(row.title).toBe('لپ تاپ');
    expect(row.brand).toBe('Acer');
    expect(row.model).toBe('X555U');
    expect(row.description).toContain('ویندوز 10');
    expect(row.description).toContain('نصب آنتی ویروس');
    expect(row.description).toContain(' / ');
  });

  it('مرحله‌ی «تامین تجهیزات» ردیف‌های اقلام می‌سازد و آکبند/کارکرده را جدا می‌کند', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {
        procurement: {
          laptop: { new: 2, used: 3 },
          accessories: { new: 0, used: 0 },
        },
      },
      user,
    });

    expect(receipt.items).toEqual([
      { title: 'لپ تاپ', condition: 'آکبند', qty: 2 },
      { title: 'لپ تاپ', condition: 'کارکرده', qty: 3 },
    ]);
    // هیچ قیمتی در این مسیر نیست - جمع باید null بماند تا «استعلام» چاپ شود.
    expect(receipt.itemsTotal).toBeNull();
  });

  it('اقلام + خدمات → نوع سفارش «تامین کالا و خدمات»', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {
        os: 'win11',
        procurement: { laptop: { new: 1 } },
      },
      user,
    });
    expect(receipt.order.kind).toBe(ORDER_KIND.BOTH);
  });

  it('کاربر سازمانی نام سازمان و شناسه ملی می‌گیرد', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {},
      user,
      orgProfile,
    });

    expect(receipt.customer.isOrganization).toBe(true);
    expect(receipt.customer.name).toBe('شرکت ایده پردازان مبین');
    expect(receipt.customer.nationalId).toBe('14009876543');
    expect(receipt.order.userStatus).toBe('سازمانی دولتی');
    // توضیحات مهم ۲: آدرس و تلفن ثابت هم باید روی رسید بیاید.
    expect(receipt.customer.address).toBe('تهران، ونک');
    expect(receipt.customer.landline).toBe('02188889999');
  });

  it('کاربر عادی «شماره ملی» می‌گیرد و نام سازمان ندارد', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {},
      user: { ...user, account_type: 'individual', national_code: '0084403507' },
    });

    expect(receipt.customer.isOrganization).toBe(false);
    expect(receipt.customer.name).toBe('احمد زارعی');
    expect(receipt.customer.nationalId).toBe('0084403507');
    expect(receipt.order.userStatus).toBe('کاربر عادی');
  });

  it('کد کاربری، همان کدِ داکِ اپ است نه id دیتابیس', () => {
    const receipt = receiptFromSystematic({ categoryId: 'laptop', answers: {}, user });
    expect(receipt.order.userCode).toBe('211866545');
  });

  it('بدون پروفایل سازمان، آدرس و تلفن ثابت از آدرس‌های ذخیره‌شده می‌آید', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'laptop',
      answers: {},
      user,
      // در عمل همیشه null است: setProfileData هیچ‌جای اپ dispatch نمی‌شود.
      orgProfile: null,
      addresses: [
        { id: 7, city: 'تهران', region: 'ونک', address: 'خیابان گاندی', telephone: '02188889999' },
      ],
      selectedAddressId: 7,
    });

    expect(receipt.customer.address).toBe('تهران، ونک، خیابان گاندی');
    expect(receipt.customer.landline).toBe('02188889999');
  });

  it('پیش‌رسید شماره‌ی سفارش ندارد - بک‌اند موقع ثبت می‌سازدش', () => {
    const receipt = receiptFromSystematic({ categoryId: 'laptop', answers: {}, user });
    expect(receipt.order.number).toBeNull();
  });

  it('پیش‌فرض، حالتِ «جزئیات سفارش» است', () => {
    const receipt = receiptFromSystematic({ categoryId: 'laptop', answers: {}, user });
    expect(receipt.state).toBe(RECEIPT_STATE.PENDING);
  });
});
