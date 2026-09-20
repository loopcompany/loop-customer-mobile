/**
 * نگاشت کدهای وضعیت سفارش به سه گروه رسید. کدها بین ۰ تا ۶ هستند (نه ۰ تا ۳
 * که فیلتر OrdersScreen نشان می‌دهد) و هر چهار کدِ لغو باید به یک رسیدِ
 * «ناموفق» برسند.
 */

import { receiptFromOrderApi, receiptStateForStatus } from '../fromOrderApi';
import { RECEIPT_STATE } from '../receiptModel';

describe('receiptStateForStatus', () => {
  it.each([
    [0, RECEIPT_STATE.PENDING], // در انتظار بررسی
    [1, RECEIPT_STATE.PENDING], // در حال انجام
    [2, RECEIPT_STATE.DONE], // انجام شده
    [3, RECEIPT_STATE.FAILED], // لغو توسط کاربر
    [4, RECEIPT_STATE.FAILED], // لغو توسط تکنسین
    [5, RECEIPT_STATE.FAILED], // لغو توسط لوپ
    [6, RECEIPT_STATE.FAILED], // لغو به‌دلیل انقضای زمان
  ])('وضعیت %i → %s', (status, expected) => {
    expect(receiptStateForStatus(status)).toBe(expected);
  });

  it('وضعیتِ غایب، رسید را «انجام شد» نشان نمی‌دهد', () => {
    expect(receiptStateForStatus(undefined)).toBe(RECEIPT_STATE.PENDING);
    expect(receiptStateForStatus(null)).toBe(RECEIPT_STATE.PENDING);
  });
});

describe('receiptFromOrderApi', () => {
  const order = {
    id: 55689965,
    status: 2,
    created_at: '2025-10-27T16:45:00',
    technician_price: 800000,
    extra_price: 12500,
    discount_price: 20000,
    payment_status: 'پرداخت کامل',
    category: { title: 'تعمیر لپ تاپ' },
    user_address: {
      fname: 'احمد',
      lname: 'زارعی',
      city: 'تهران',
      region: 'ونک',
      address: 'خیابان گاندی',
      number: '12',
      telephone: '02188889999',
    },
    order_details: [
      {
        title: 'خدمات نرم‌افزاری',
        data: [
          { type: 'select', field_detail: { title: 'نصب ویندوز', has_counter: 1 }, value: 2 },
          { type: 'select', field_detail: { title: 'نصب آنتی ویروس', has_counter: 0 } },
        ],
      },
    ],
  };

  it('قیمت‌ها را از فیلدهای سفارش جمع می‌بندد و تخفیف را کسر می‌کند', () => {
    const receipt = receiptFromOrderApi(order, { user: { account_type: 'individual' } });
    expect(receipt.payment.total).toBe(812500);
    expect(receipt.payment.discountAmount).toBe(20000);
    expect(receipt.payment.payable).toBe(792500);
  });

  it('بخش‌های order_details به ردیف خدمات تبدیل می‌شوند', () => {
    const receipt = receiptFromOrderApi(order, { user: { account_type: 'individual' } });
    expect(receipt.services).toHaveLength(1);
    expect(receipt.services[0].title).toBe('خدمات نرم‌افزاری');
    // فقط فیلدهای شمارنده‌دار عدد می‌گیرند.
    expect(receipt.services[0].description).toBe('نصب ویندوز × 2 / نصب آنتی ویروس');
  });

  it('آدرس کاربر یک‌جا و خوانا ساخته می‌شود', () => {
    const receipt = receiptFromOrderApi(order, { user: { account_type: 'individual' } });
    expect(receipt.customer.address).toBe('تهران، ونک، خیابان گاندی، پلاک 12');
    expect(receipt.customer.landline).toBe('02188889999');
  });

  it('سفارشِ بی‌قیمت مبلغ null می‌گیرد، نه صفر', () => {
    const receipt = receiptFromOrderApi(
      { ...order, technician_price: null, pakar_price: null, extra_price: '' },
      { user: { account_type: 'individual' } }
    );
    expect(receipt.payment.total).toBeNull();
  });

  it('payment_status عددی به برچسب تبدیل می‌شود، نه «۰» خام', () => {
    // Details.js این فیلد را با `> 0` می‌سنجد، یعنی سرور عدد می‌فرستد؛ رسید
    // همان عدد را خام چاپ می‌کرد.
    const paid = receiptFromOrderApi({ ...order, payment_status: 1 }, {});
    expect(paid.payment.status).toBe('پرداخت شده');
    expect(paid.payment.method).toBe('پرداخت آنلاین');

    const unpaid = receiptFromOrderApi({ ...order, payment_status: 0 }, {});
    expect(unpaid.payment.status).toBe('پرداخت نشده');
    expect(unpaid.payment.method).toBe('در انتظار پرداخت');
  });

  it('متنِ آماده‌ی سرور دست‌نخورده می‌ماند', () => {
    const receipt = receiptFromOrderApi(order, {});
    expect(receipt.payment.status).toBe('پرداخت کامل');
  });

  it('سفارشِ بی‌تخفیف کدِ null می‌گیرد (کامپوننت «ندارد» چاپ می‌کند)', () => {
    const receipt = receiptFromOrderApi({ ...order, discount_price: null }, {});
    expect(receipt.payment.discountCode).toBeNull();
    expect(receipt.payment.discountAmount).toBeNull();
  });

  it('کد تخفیفِ سفارش روی رسید می‌آید', () => {
    const receipt = receiptFromOrderApi({ ...order, discount_code: 'LOOP10' }, {});
    expect(receipt.payment.discountCode).toBe('LOOP10');
  });

  it('وضعیت تحویلِ سفارشِ در جریان «در انتظار تحویل» است، نه «نامشخص»', () => {
    const pending = receiptFromOrderApi({ ...order, status: 1, finished_at: null }, {});
    expect(pending.delivery.status).toBe('در انتظار تحویل');

    const cancelled = receiptFromOrderApi({ ...order, status: 3, finished_at: null }, {});
    expect(cancelled.delivery.status).toBe('لغو شده');

    const done = receiptFromOrderApi({ ...order, finished_at: '2025-10-28T10:00:00' }, {});
    expect(done.delivery.status).toBe('توسط لوپ');
  });

  it('تاریخ ثبت به شمسیِ صفرپرشده تبدیل می‌شود', () => {
    const receipt = receiptFromOrderApi(order, { user: { account_type: 'individual' } });
    expect(receipt.order.registeredDate).toMatch(/^\d{4} \/ \d{2} \/ \d{2}$/);
    expect(receipt.order.registeredTime).toMatch(/^\d{2} : \d{2}$/);
  });
});
