/**
 * تامین کالا (استعلام، پیش‌پرداخت ۶۰٪، باقی‌مانده) و مشخصات تحویل - بند ۱۱ و ۱۵.
 * این توابع تنها تفسیرِ اپ از پاسخ سرورند؛ صفحه‌ی جزئیات سفارش و رسید هر دو از
 * همین‌ها می‌خوانند.
 */
import {
  DEFAULT_PREPAYMENT_PERCENT,
  PAYMENT_STAGE,
  PROCUREMENT_STATUS,
  readDelivery,
  readPrepaymentPercent,
  readProcurement,
  validateDeliveryForm,
} from '../OrderFulfillmentApi';
import { deliveryOf } from '../receipt/fromOrderApi';
import { DELIVERY_STATUS, RECEIPT_STATE } from '../receipt/receiptModel';

const NOW = new Date('2026-10-12T10:00:00+03:30');

const quoted = (overrides = {}) => ({
  procurement: {
    status: 'quoted',
    items: [
      { item_id: 'laptop', title: 'لپ تاپ', condition: 'new', quantity: 2, unit_price: 50_000_000 },
      {
        item_id: 'monitor',
        title: 'مانیتور',
        condition: 'used',
        quantity: 1,
        unit_price: 10_000_000,
      },
    ],
    valid_until: '2026-10-12T17:00:00+03:30',
    ...overrides,
  },
});

describe('readProcurement', () => {
  it('is null when the order has no procurement block', () => {
    expect(readProcurement({})).toBeNull();
    expect(readProcurement({ procurement: null })).toBeNull();
  });

  it('derives totals and the default 60% prepayment when the server omits them', () => {
    const quote = readProcurement(quoted(), NOW);
    expect(quote.totalAmount).toBe(110_000_000);
    expect(quote.payment.percent).toBe(DEFAULT_PREPAYMENT_PERCENT);
    expect(quote.payment.prepaymentAmount).toBe(66_000_000);
    expect(quote.payment.remainingAmount).toBe(44_000_000);
    expect(quote.canDecide).toBe(true);
    expect(quote.payableStage).toBeNull();
  });

  it('uses the percentage configured in the panel', () => {
    const quote = readProcurement(
      quoted({ total_amount: 1000, payment: { prepayment_percent: 30 } }),
      NOW
    );
    expect(quote.payment.percent).toBe(30);
    expect(quote.payment.prepaymentAmount).toBe(300);
    expect(quote.payment.remainingAmount).toBe(700);
  });

  it('falls back to 60% for an invalid percentage', () => {
    expect(readPrepaymentPercent(0)).toBe(60);
    expect(readPrepaymentPercent(150)).toBe(60);
    expect(readPrepaymentPercent('abc')).toBe(60);
    expect(readPrepaymentPercent('45')).toBe(45);
  });

  it('treats a quote past the end of the working day as expired', () => {
    const late = new Date('2026-10-12T18:00:00+03:30');
    const quote = readProcurement(quoted(), late);
    expect(quote.status).toBe(PROCUREMENT_STATUS.EXPIRED);
    expect(quote.canDecide).toBe(false);
    expect(quote.canRequote).toBe(true);
  });

  it('asks for the prepayment after acceptance and the remainder once ready', () => {
    expect(readProcurement(quoted({ status: 'accepted' }), NOW).payableStage).toBe(
      PAYMENT_STAGE.PREPAYMENT
    );
    expect(
      readProcurement(quoted({ status: 'preparing', payment: { prepayment_paid: true } }), NOW)
        .payableStage
    ).toBeNull();
    expect(
      readProcurement(quoted({ status: 'ready', payment: { prepayment_paid: 1 } }), NOW)
        .payableStage
    ).toBe(PAYMENT_STAGE.REMAINING);
    expect(
      readProcurement(
        quoted({ status: 'ready', payment: { prepayment_paid: 1, remaining_paid: 1 } }),
        NOW
      ).payableStage
    ).toBeNull();
  });

  it('defaults an unknown status to awaiting a quote', () => {
    expect(readProcurement({ procurement: { status: 'weird' } }, NOW).status).toBe(
      PROCUREMENT_STATUS.AWAITING_QUOTE
    );
  });
});

describe('readDelivery / validateDeliveryForm', () => {
  it('reads the receiver, method and delivery time', () => {
    const delivery = readDelivery({
      delivery: {
        receiver_type: 'representative',
        receiver_name: 'علی رضایی',
        receiver_mobile: '09120000000',
        method: 'courier',
        delivered_at: '2026-10-12T17:53:00+03:30',
      },
    });
    expect(delivery.receiverType).toBe('representative');
    expect(delivery.method).toBe('courier');
    expect(delivery.status).toBe('delivered');
    expect(delivery.editable).toBe(false);
  });

  it('ignores values outside the contract', () => {
    const delivery = readDelivery({ delivery: { receiver_type: 'robot', method: 'drone' } });
    expect(delivery.receiverType).toBeNull();
    expect(delivery.method).toBeNull();
    expect(delivery.editable).toBe(true);
  });

  it('validates the representative form', () => {
    expect(validateDeliveryForm({})).toMatch('تحویل‌گیرنده');
    expect(validateDeliveryForm({ receiverType: 'self' })).toMatch('روش ارسال');
    expect(validateDeliveryForm({ receiverType: 'self', method: 'user' })).toBeNull();
    expect(
      validateDeliveryForm({
        receiverType: 'representative',
        receiverName: 'x',
        receiverMobile: '0912',
        method: 'user',
      })
    ).toMatch('موبایل');
    expect(
      validateDeliveryForm({
        receiverType: 'representative',
        receiverName: 'x',
        receiverMobile: '09120000000',
        receiverNationalId: '123',
        method: 'user',
      })
    ).toMatch('کد ملی');
    expect(
      validateDeliveryForm({
        receiverType: 'representative',
        receiverName: 'x',
        receiverMobile: '09120000000',
        method: 'courier',
      })
    ).toBeNull();
  });
});

describe('receipt delivery block (deliveryOf)', () => {
  it('shows the representative, the delivery time and the method', () => {
    const result = deliveryOf(
      {
        delivery: {
          receiver_type: 'representative',
          receiver_name: 'علی رضایی',
          method: 'loop_technician',
          delivered_at: new Date(2026, 9, 12, 17, 53).toISOString(),
          confirmed_at: '2026-10-12T18:00:00Z',
        },
      },
      { state: RECEIPT_STATE.DONE }
    );
    expect(result.receiverName).toBe('علی رضایی');
    expect(result.time).toBe('‎17 : 53');
    expect(result.status).toBe(DELIVERY_STATUS.BY_LOOP_TECHNICIAN);
  });

  it('uses the account holder for «self» and marks a chosen-but-pending method', () => {
    const result = deliveryOf(
      { delivery: { receiver_type: 'self', method: 'courier', confirmed_at: '2026-10-12T18:00:00Z' } },
      { state: RECEIPT_STATE.PENDING, user: { name: 'مریم', last_name: 'احمدی' } }
    );
    expect(result.receiverName).toBe('مریم احمدی');
    expect(result.time).toBeNull();
    expect(result.status).toBe(`${DELIVERY_STATUS.PENDING} (${DELIVERY_STATUS.BY_COURIER})`);
  });

  it('stays «نامشخص» until the admin panel confirms the delivery details', () => {
    const unconfirmed = deliveryOf(
      {
        finished_at: '2026-10-01T10:00:00Z',
        delivery: {
          receiver_type: 'representative',
          receiver_name: 'علی رضایی',
          method: 'courier',
          delivered_at: '2026-10-01T10:00:00Z',
        },
      },
      { state: RECEIPT_STATE.DONE, addressName: 'خانه' }
    );
    expect(unconfirmed).toEqual({
      receiverName: null,
      date: null,
      time: null,
      status: DELIVERY_STATUS.UNKNOWN,
    });
    expect(
      deliveryOf({ finished_at: '2026-10-01T10:00:00Z' }, { state: RECEIPT_STATE.DONE }).status
    ).toBe(DELIVERY_STATUS.UNKNOWN);
  });

  it('a cancelled order is «لغو شده», confirmed or not', () => {
    expect(deliveryOf({}, { state: RECEIPT_STATE.FAILED }).status).toBe(DELIVERY_STATUS.CANCELLED);
    expect(
      deliveryOf(
        { delivery: { confirmed_at: '2026-10-01T10:00:00Z', receiver_name: 'x' } },
        { state: RECEIPT_STATE.FAILED }
      ).receiverName
    ).toBeNull();
  });

  it('reads confirmed_at in readDelivery', () => {
    expect(readDelivery({ delivery: {} }).confirmed).toBe(false);
    expect(readDelivery({ delivery: { confirmed_at: 'not a date' } }).confirmed).toBe(false);
    const confirmed = readDelivery({ delivery: { confirmed_at: '2026-10-01 10:00:00' } });
    expect(confirmed.confirmed).toBe(true);
    expect(confirmed.confirmedAt).toBeInstanceOf(Date);
  });
});
