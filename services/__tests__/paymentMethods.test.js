import { describePayment } from '../paymentMethods';

describe('describePayment', () => {
  it('returns null when the server sends no payment method', () => {
    expect(describePayment({})).toBeNull();
    expect(describePayment(null)).toBeNull();
    expect(describePayment({ payment_method: 'bitcoin' })).toBeNull();
  });

  it('labels every method from the brief', () => {
    const labels = ['cash', 'card_to_card', 'sheba', 'bank_transfer', 'in_app', 'unpaid', 'remaining'].map(
      (payment_method) => describePayment({ payment_method }).method
    );
    expect(labels).toEqual(['نقدی', 'کارت به کارت', 'شبا', 'پرداخت درون‌بانکی', 'پرداخت درون برنامه لوپ', 'پرداخت نشده', 'مانده']);
  });

  it('accepts aliases and adds the channel', () => {
    expect(describePayment({ payment_method: 'Gateway', payment_channel: 'web' }).label).toBe(
      'پرداخت درون برنامه لوپ (سایت)'
    );
    expect(describePayment({ payment_method: 'cash', payment_channel: 'in_person' }).label).toBe('نقدی (حضوری)');
    expect(describePayment({ payment_method: 'iban', payment_channel: '??' }).label).toBe('شبا');
  });

  it('reports a positive remaining amount only', () => {
    expect(describePayment({ payment_method: 'remaining', remaining_amount: '150000' }).remainingAmount).toBe(150000);
    expect(describePayment({ payment_method: 'cash', remaining_amount: 0 }).remainingAmount).toBeNull();
  });
});
