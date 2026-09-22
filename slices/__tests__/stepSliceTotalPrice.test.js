/**
 * `total_price` است که مستقیماً در `orders.pakar_price` می‌نشیند — بک‌اند آن را
 * از روی `steps` بازمحاسبه نمی‌کند (FRONTEND_SERVICE_RATES.md §۶). پس هر اشتباهِ
 * این سلکتور یعنی سفارشی که با مبلغ غلط (یا صفر) ثبت شده است.
 *
 * These pin the arithmetic against the contract doc's rules: only selected
 * options count, counters multiply, `affect_on_price == 0` is excluded, a null
 * price means "not priced yet" rather than free, and the result is an integer.
 */
import { selectTotalPrice } from '../stepSlice';

const detail = (over = {}) => ({
  id: 101,
  title: 'گزینه',
  price: 200000,
  show_price: 1,
  affect_on_price: 1,
  value: 0,
  type: 'radioButton',
  ...over,
});

const state = (data) => ({ step: { data } });

// createSelector حافظه‌ی یک‌خانه‌ای دارد؛ هر تست داده‌ی تازه می‌سازد پس
// نتیجه‌ی تستِ قبلی به تستِ بعدی نشت نمی‌کند.
const priceOf = (data) => selectTotalPrice(state(data));

describe('selectTotalPrice', () => {
  it('فقط گزینه‌های انتخاب‌شده را جمع می‌زند', () => {
    expect(
      priceOf([
        [
          {
            id: 10,
            type: 'radioButton',
            field_details: [
              detail({ id: 101, price: 200000, value: 1 }),
              detail({ id: 102, price: 350000, value: 0 }),
            ],
          },
        ],
      ]).total
    ).toBe(200000);
  });

  it('مثالِ سند: سرویس معمولی + دو دستگاه = ۴۰۰٬۰۰۰', () => {
    expect(
      priceOf([
        [
          {
            id: 10,
            type: 'radioButton',
            field_details: [
              detail({ id: 101, price: 200000, value: 1 }),
              detail({ id: 102, price: 350000, value: 0 }),
            ],
          },
        ],
        [
          {
            id: 11,
            type: 'counter',
            field_details: [detail({ id: 103, type: 'counter', price: 100000, value: 2 })],
          },
        ],
      ]).total
    ).toBe(400000);
  });

  it('مقدارهای رشته‌ای را مثل عدد می‌خواند و "0" را انتخاب‌نشده می‌گیرد', () => {
    // بک‌اند لاراول مقدارها را می‌تواند رشته بفرستد؛ قبلاً هر رشته‌ای
    // «انتخاب‌شده» حساب می‌شد و قیمتِ گزینه‌های خاموش هم جمع می‌شد.
    const data = [
      [
        {
          id: 10,
          type: 'radioButton',
          field_details: [
            detail({ id: 101, price: '200000.00', value: '1' }),
            detail({ id: 102, price: '350000.00', value: '0' }),
          ],
        },
      ],
    ];
    expect(priceOf(data).total).toBe(200000);
  });

  it('گزینه‌ی شمارنده‌دار را در تعداد ضرب می‌کند', () => {
    const data = [
      [
        {
          id: 10,
          type: 'checkbox',
          field_details: [
            detail({ id: 101, type: 'checkbox', has_counter: 1, price: 50000, value: 3 }),
          ],
        },
      ],
    ];
    expect(priceOf(data).total).toBe(150000);
  });

  it('متنِ فیلد input قیمت را چند برابر نمی‌کند', () => {
    const data = [
      [
        {
          id: 12,
          type: 'input',
          field_details: [
            detail({ id: 104, type: 'input', has_counter: 1, price: 50000, value: '5' }),
          ],
        },
      ],
    ];
    expect(priceOf(data).total).toBe(50000);
  });

  it('گزینه‌ی affect_on_price = 0 را در جمع نمی‌آورد', () => {
    const data = [
      [
        {
          id: 10,
          type: 'checkbox',
          field_details: [
            detail({ id: 101, price: 200000, value: 1, affect_on_price: 0 }),
            detail({ id: 102, price: 300000, value: 1, affect_on_price: 1 }),
          ],
        },
      ],
    ];
    expect(priceOf(data).total).toBe(300000);
  });

  it('نبودِ affect_on_price در پاسخ به معنی «اثر ندارد» نیست', () => {
    const data = [
      [
        {
          id: 10,
          type: 'checkbox',
          field_details: [{ id: 101, type: 'checkbox', price: 120000, value: 1 }],
        },
      ],
    ];
    expect(priceOf(data).total).toBe(120000);
  });

  it('قیمتِ تعیین‌نشده مبلغ را «نیاز به بررسی» می‌کند، نه رایگان', () => {
    const data = [
      [
        {
          id: 10,
          type: 'checkbox',
          field_details: [
            detail({ id: 101, price: null, value: 1 }),
            detail({ id: 102, price: 150000, value: 1, type: 'checkbox' }),
          ],
        },
      ],
    ];
    const { total, showPrice } = priceOf(data);
    expect(total).toBe(150000);
    expect(showPrice).toBe(false);
  });

  it('وقتی همه‌ی نرخ‌ها معلوم‌اند مبلغ نمایش داده می‌شود', () => {
    const data = [
      [
        {
          id: 10,
          type: 'radioButton',
          field_details: [detail({ id: 101, price: 200000, value: 1 })],
        },
      ],
    ];
    expect(priceOf(data).showPrice).toBe(true);
  });

  it('مبلغ را صحیح و غیرمنفی برمی‌گرداند', () => {
    const data = [
      [
        {
          id: 10,
          type: 'counter',
          field_details: [detail({ id: 101, type: 'counter', price: '1500.75', value: 2 })],
        },
      ],
    ];
    expect(Number.isInteger(priceOf(data).total)).toBe(true);
    expect(priceOf(data).total).toBe(3002);
  });

  it('با سبدِ خالی صفر برمی‌گرداند و خطا نمی‌دهد', () => {
    expect(priceOf([]).total).toBe(0);
    expect(priceOf([[{ id: 10, type: 'date', value: null }]]).total).toBe(0);
  });
});
