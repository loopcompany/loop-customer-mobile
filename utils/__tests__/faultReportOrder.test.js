import { findOrderByNumber, normalizeOrderNumber, orderProductName } from '../faultReportOrder';

describe('normalizeOrderNumber', () => {
  it('converts Persian/Arabic digits and strips everything else', () => {
    expect(normalizeOrderNumber('#۱۲۳')).toBe('123');
    expect(normalizeOrderNumber(' ٤٥ ')).toBe('45');
    expect(normalizeOrderNumber(78)).toBe('78');
    expect(normalizeOrderNumber(null)).toBe('');
    expect(normalizeOrderNumber('abc')).toBe('');
  });
});

describe('findOrderByNumber', () => {
  const orders = [{ order_id: 12 }, { order_id: 123 }];

  it('matches the exact order number, not a prefix', () => {
    expect(findOrderByNumber(orders, '۱۲۳')).toBe(orders[1]);
    expect(findOrderByNumber(orders, '12')).toBe(orders[0]);
    expect(findOrderByNumber(orders, '1')).toBeNull();
  });

  it('returns null for empty input or a missing list', () => {
    expect(findOrderByNumber(orders, '')).toBeNull();
    expect(findOrderByNumber(undefined, '12')).toBeNull();
  });
});

describe('orderProductName', () => {
  it('prefers product_name, then falls back to the category title', () => {
    expect(orderProductName({ product_name: 'لپ تاپ', category_title: 'x' })).toBe('لپ تاپ');
    expect(orderProductName({ product_name: '  ', category: { title: 'مانیتور' } })).toBe('مانیتور');
    expect(orderProductName({})).toBe('');
  });
});
