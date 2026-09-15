/**
 * قواعدی که در طرحِ رسید «قانون» هستند و به‌راحتی پس‌رفت می‌کنند:
 * نوع سفارش از سبدها مشتق می‌شود، کاربر عادی «شماره ملی» می‌گیرد و بقیه
 * «شناسه ملی»، و نبودِ قیمت هرگز نباید به صفر تبدیل شود.
 */

import {
  ORDER_KIND,
  deriveOrderKind,
  accountTypeLabel,
  isOrganizationAccount,
  sumPrices,
  buildReceipt,
  RECEIPT_STATE,
} from '../receiptModel';

describe('deriveOrderKind', () => {
  it('فقط اقلام → تامین کالا', () => {
    expect(deriveOrderKind({ items: [{}], services: [] })).toBe(ORDER_KIND.GOODS);
  });

  it('فقط خدمات → خدمات', () => {
    expect(deriveOrderKind({ items: [], services: [{}] })).toBe(ORDER_KIND.SERVICES);
  });

  it('هر دو → تامین کالا و خدمات', () => {
    expect(deriveOrderKind({ items: [{}], services: [{}] })).toBe(ORDER_KIND.BOTH);
  });

  it('هیچ‌کدام → null، تا کامپوننت جدول خالی رندر نکند', () => {
    expect(deriveOrderKind({ items: [], services: [] })).toBeNull();
    expect(deriveOrderKind({})).toBeNull();
  });
});

describe('تفکیک کاربران', () => {
  it.each([
    ['g_organization', 'سازمانی دولتی', true],
    ['s_g_organization', 'سازمانی نیمه دولتی', true],
    ['company', 'شرکتی خصوصی', true],
    ['individual', 'کاربر عادی', false],
    // املای غلطِ موجود در داده‌ی قدیمی سرور
    ['indiviual', 'کاربر عادی', false],
  ])('%s → «%s»', (accountType, label, isOrg) => {
    expect(accountTypeLabel(accountType)).toBe(label);
    expect(isOrganizationAccount(accountType)).toBe(isOrg);
  });

  it('نوع حساب ناشناخته به کاربر عادی برمی‌گردد، نه سازمانی', () => {
    expect(accountTypeLabel(undefined)).toBe('کاربر عادی');
    expect(isOrganizationAccount(undefined)).toBe(false);
  });
});

describe('sumPrices', () => {
  it('ردیف‌های بی‌قیمت جمع را صفر نمی‌کنند - null می‌ماند', () => {
    expect(sumPrices([{ qty: 2 }, { qty: 1 }])).toBeNull();
  });

  it('فقط ردیف‌های قیمت‌دار جمع می‌شوند', () => {
    expect(sumPrices([{ totalPrice: 100 }, { qty: 1 }, { totalPrice: 50 }])).toBe(150);
  });

  it('فهرست خالی → null', () => {
    expect(sumPrices([])).toBeNull();
  });
});

describe('buildReceipt', () => {
  it('مبلغ کل = جمع اقلام + جمع خدمات', () => {
    const receipt = buildReceipt({
      state: RECEIPT_STATE.DONE,
      items: [{ totalPrice: 800 }],
      services: [{ totalPrice: 200 }],
    });
    expect(receipt.itemsTotal).toBe(800);
    expect(receipt.servicesTotal).toBe(200);
    expect(receipt.payment.total).toBe(1000);
  });

  it('کد تخفیف از مبلغ کل کسر می‌شود', () => {
    const receipt = buildReceipt({
      state: RECEIPT_STATE.DONE,
      items: [{ totalPrice: 1000 }],
      payment: { discountCode: 'LOOP20', discountAmount: 250 },
    });
    expect(receipt.payment.payable).toBe(750);
  });

  it('سفارش بی‌قیمت (مسیر سازمانی) مبلغ null می‌دهد، نه صفر', () => {
    const receipt = buildReceipt({
      state: RECEIPT_STATE.PENDING,
      services: [{ title: 'لپ تاپ', qty: 1 }],
    });
    expect(receipt.payment.total).toBeNull();
    expect(receipt.payment.payable).toBeNull();
  });

  it('نوع سفارش خودکار از سبدها مشتق می‌شود', () => {
    const receipt = buildReceipt({
      state: RECEIPT_STATE.PENDING,
      items: [{ title: 'مانیتور' }],
      services: [{ title: 'نصب' }],
    });
    expect(receipt.order.kind).toBe(ORDER_KIND.BOTH);
  });

  it('بدون product بخش مشخصات محصول null می‌ماند', () => {
    expect(buildReceipt({ state: RECEIPT_STATE.PENDING }).product).toBeNull();
  });
});
