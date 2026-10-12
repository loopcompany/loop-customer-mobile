/**
 * «انتخاب جامع»: کاربری که فقط تامین کالا می‌خواهد نباید مجبور به پر کردن
 * بخش‌های خدماتی شود؛ فقط مراحل اجباری سند (بند ۱۱) چک می‌شوند.
 */
import { getMissingComprehensiveStep } from '../comprehensiveValidation';
import { pickOrderExtras, toProcurementItemsPayload } from '../procurementPayload';

const complete = {
  procurementItems: { laptop: { new: 2, used: 0, desc: '' } },
  deliveryMode: ['once_short'],
  onceDate: '1405/07/20',
  startDate: '',
  timeSlot: 'slot_10_12',
  addressId: 7,
  operatorError: null,
  technicianGender: 'male',
};

describe('getMissingComprehensiveStep', () => {
  it('accepts a procurement-only order with just the required steps', () => {
    expect(getMissingComprehensiveStep(complete)).toBeNull();
  });

  it('requires at least one procurement or service item', () => {
    expect(getMissingComprehensiveStep({ ...complete, procurementItems: {} }).section).toBe(
      'procurement'
    );
  });

  it('accepts a service-only order', () => {
    expect(
      getMissingComprehensiveStep({
        ...complete,
        procurementItems: {},
        hardwareItems: { laptop: { count: 1 } },
        deliveryMode: ['monthly_short'],
        startDate: '1405/07/20',
      })
    ).toBeNull();
  });

  it('requires «کوتاه مدت / یکبار» for a procurement-only order', () => {
    expect(getMissingComprehensiveStep({ ...complete, deliveryMode: [] }).section).toBe(
      'delivery_mode'
    );
    expect(
      getMissingComprehensiveStep({ ...complete, deliveryMode: ['monthly_short'], startDate: 'x' })
        .section
    ).toBe('delivery_mode');
  });

  it('walks the remaining required steps in screen order', () => {
    expect(getMissingComprehensiveStep({ ...complete, onceDate: '' }).section).toBe('time_range');
    expect(getMissingComprehensiveStep({ ...complete, timeSlot: null }).section).toBe('time_range');
    expect(getMissingComprehensiveStep({ ...complete, addressId: null }).section).toBe('address');
    expect(getMissingComprehensiveStep({ ...complete, operatorError: 'bad' })).toEqual({
      section: 'operator_info',
      message: 'bad',
    });
    expect(getMissingComprehensiveStep({ ...complete, technicianGender: null }).section).toBe(
      'technician'
    );
  });

  it('accepts address id 0', () => {
    expect(getMissingComprehensiveStep({ ...complete, addressId: 0 })).toBeNull();
  });
});

describe('procurement payload', () => {
  it('sends only chosen items with Persian titles', () => {
    expect(
      toProcurementItemsPayload({
        laptop: { new: 2, used: 1, desc: ' سبک ' },
        monitor: { new: 0, used: 0, desc: 'x' },
      })
    ).toEqual([
      { item_id: 'laptop', title: 'لپ تاپ', new_count: 2, used_count: 1, description: 'سبک' },
    ]);
    expect(toProcurementItemsPayload(undefined)).toEqual([]);
  });

  it('only lets whitelisted, non-empty extras into the order body', () => {
    expect(
      pickOrderExtras({
        procurement_items: [],
        delivery_mode: ['once_short'],
        technician_gender: null,
        total_price: 1,
        address_id: 9,
      })
    ).toEqual({ delivery_mode: ['once_short'] });
    expect(pickOrderExtras(null)).toEqual({});
  });
});
