import { orderPaidAmount } from '../orderPaidAmount';

describe('orderPaidAmount', () => {
  it('prefers final_paid_amount when present', () => {
    expect(orderPaidAmount({ final_paid_amount: 2800000, total_price: 3000000 })).toBe('2800000');
  });

  it('falls back when final_paid_amount is empty or zero', () => {
    expect(orderPaidAmount({ final_paid_amount: 0, paid_amount: 150000 })).toBe('150000');
    expect(orderPaidAmount({ final_paid_amount: null, total_price: '1,200,000' })).toBe('1200000');
    expect(orderPaidAmount({ pakar_price: '۴۵۰۰۰۰' })).toBe('450000');
  });

  it('returns an empty string when the order has no amount at all', () => {
    expect(orderPaidAmount({ final_paid_amount: 0 })).toBe('');
    expect(orderPaidAmount({})).toBe('');
    expect(orderPaidAmount(null)).toBe('');
  });
});
