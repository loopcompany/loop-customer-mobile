/**
 * نگاشتِ انتخاب‌های فرمِ محلیِ سازمانی روی مراحلِ واقعیِ دسته.
 *
 * مسیرهای سازمانی شناسه‌ی فیلدهای بک‌اند را ندارند، پس نگاشت عنوان‌محور است و
 * همین باعث می‌شود قواعدش شکننده باشند — این تست‌ها همان قواعد را قفل می‌کنند:
 * عنوانِ نرمال‌شده باید یکی باشد، عنوانِ مبهم نباید حدس زده شود و یک گزینه
 * نباید دوبار شمرده شود.
 *
 * The rule that matters most: an ambiguous title is skipped, never guessed —
 * a wrong guess here is a wrong amount on a real order.
 */
import {
  applySelectionsToSteps,
  calculateStepsPrice,
  normalizeTitle,
  priceSelections,
} from '../orderPricing';

const detail = (over) => ({
  price: 100000,
  show_price: 1,
  affect_on_price: 1,
  value: 0,
  type: 'radioButton',
  ...over,
});

const STEPS = [
  [
    {
      id: 10,
      title: 'نصب سیستم عامل',
      type: 'radioButton',
      field_details: [
        detail({ id: 101, title: 'ویندوز 11', price: 200000 }),
        detail({ id: 102, title: 'ویندوز 10', price: 150000 }),
      ],
    },
  ],
  [
    {
      id: 11,
      title: 'خدمات سخت‌افزاری',
      type: 'counter',
      field_details: [detail({ id: 103, title: 'لپ تاپ', price: 100000, type: 'counter' })],
    },
  ],
];

const valueOf = (steps, id) =>
  steps
    .flat()
    .flatMap((field) => field.field_details)
    .find((d) => d.id === id)?.value;

describe('normalizeTitle', () => {
  it('نیم‌فاصله، ی/ک عربی و ارقام فارسی را یکدست می‌کند', () => {
    expect(normalizeTitle('لپ‌تاپ')).toBe(normalizeTitle('لپ تاپ'));
    expect(normalizeTitle('ويندوز ۱۱')).toBe(normalizeTitle('ویندوز 11'));
    expect(normalizeTitle('  کیس / پی‌سی ')).toBe(normalizeTitle('کیس پی سی'));
  });
});

describe('applySelectionsToSteps', () => {
  it('گزینه‌ی انتخابی را با عنوانش پیدا و مقدارش را یک می‌کند', () => {
    const { steps, matched } = applySelectionsToSteps(STEPS, [
      { label: 'نصب سیستم عامل', value: 'ویندوز 11' },
    ]);
    expect(valueOf(steps, 101)).toBe(1);
    expect(valueOf(steps, 102)).toBe(0);
    expect(matched).toHaveLength(1);
  });

  it('خطِ شمارنده تعدادش را روی گزینه می‌نشاند', () => {
    const { steps } = applySelectionsToSteps(STEPS, [{ label: 'لپ تاپ', value: 3 }]);
    expect(valueOf(steps, 103)).toBe(3);
  });

  it('مراحلِ ورودی را تغییر نمی‌دهد (کپی برمی‌گرداند)', () => {
    applySelectionsToSteps(STEPS, [{ label: 'لپ تاپ', value: 3 }]);
    expect(valueOf(STEPS, 103)).toBe(0);
  });

  it('عنوانی که به دو گزینه می‌خورد را حدس نمی‌زند', () => {
    const twins = [
      [
        {
          id: 10,
          title: 'خدمات',
          type: 'checkbox',
          field_details: [
            detail({ id: 101, title: 'لپ تاپ', price: 200000 }),
            detail({ id: 102, title: 'لپ تاپ', price: 900000 }),
          ],
        },
      ],
    ];
    const { steps, matched, ambiguous } = applySelectionsToSteps(twins, [
      { label: 'لپ تاپ', value: 1 },
    ]);
    expect(matched).toHaveLength(0);
    expect(ambiguous).toEqual(['لپ تاپ']);
    expect(valueOf(steps, 101)).toBe(0);
    expect(valueOf(steps, 102)).toBe(0);
  });

  it('عنوانِ فیلد، برخوردِ دو گزینه‌ی هم‌نام را حل می‌کند', () => {
    const twins = [
      [
        {
          id: 10,
          title: 'خدمات سخت‌افزاری',
          type: 'counter',
          field_details: [detail({ id: 101, title: 'لپ تاپ', price: 200000, type: 'counter' })],
        },
        {
          id: 11,
          title: 'تامین کالا',
          type: 'counter',
          field_details: [detail({ id: 102, title: 'لپ تاپ', price: 900000, type: 'counter' })],
        },
      ],
    ];
    const { steps } = applySelectionsToSteps(twins, [{ label: 'تامین کالا / لپ تاپ', value: 2 }]);
    expect(valueOf(steps, 101)).toBe(0);
    expect(valueOf(steps, 102)).toBe(2);
  });

  it('خطی که معادلی ندارد را گزارش می‌کند، نه اینکه بی‌صدا رد شود', () => {
    const { matched, unmatched } = applySelectionsToSteps(STEPS, [
      { label: 'تاریخ مراجعه', value: 'شنبه ۳ مهر' },
    ]);
    expect(matched).toHaveLength(0);
    expect(unmatched).toEqual(['تاریخ مراجعه']);
  });

  it('یک گزینه را دوبار نمی‌شمارد', () => {
    const { steps, matched } = applySelectionsToSteps(STEPS, [
      { label: 'لپ تاپ', value: 2 },
      { label: 'لپ تاپ', value: 5 },
    ]);
    expect(valueOf(steps, 103)).toBe(2);
    expect(matched).toHaveLength(1);
  });

  it('با مراحلِ خالی یا ورودی نامعتبر نمی‌ترکد', () => {
    expect(applySelectionsToSteps(null, null).steps).toEqual([]);
    expect(applySelectionsToSteps([], [{ label: 'x', value: 1 }]).unmatched).toEqual(['x']);
  });
});

describe('priceSelections', () => {
  it('مبلغ را از نرخ‌های همان دسته می‌سازد', () => {
    const { total, showPrice, steps } = priceSelections(STEPS, [
      { label: 'نصب سیستم عامل', value: 'ویندوز 11' },
      { label: 'لپ تاپ', value: 2 },
      { label: 'تاریخ مراجعه', value: 'شنبه ۳ مهر' },
    ]);
    // ۲۰۰٬۰۰۰ (ویندوز ۱۱) + ۲ × ۱۰۰٬۰۰۰ (لپ تاپ)
    expect(total).toBe(400000);
    expect(showPrice).toBe(true);
    // همان steps باید قابل ارسال باشد: مقدارها پر، ساختار دست‌نخورده.
    expect(calculateStepsPrice(steps).total).toBe(400000);
  });

  it('وقتی هیچ گزینه‌ای نمی‌خورد، صفر می‌دهد تا سفارش استعلامی بماند', () => {
    const { total, matched } = priceSelections(STEPS, [
      { label: 'تاریخ مراجعه', value: 'شنبه ۳ مهر' },
      { label: 'بازه ساعتی', value: '۱۰ الی ۱۲' },
    ]);
    expect(total).toBe(0);
    expect(matched).toHaveLength(0);
  });

  it('گزینه‌ی بدون نرخ، مبلغ را «نیاز به بررسی» می‌کند', () => {
    const unpriced = [
      [
        {
          id: 10,
          title: 'نصب سیستم عامل',
          type: 'radioButton',
          field_details: [detail({ id: 101, title: 'ویندوز 11', price: null })],
        },
      ],
    ];
    const { total, showPrice } = priceSelections(unpriced, [
      { label: 'نصب سیستم عامل', value: 'ویندوز 11' },
    ]);
    expect(total).toBe(0);
    expect(showPrice).toBe(false);
  });
});
