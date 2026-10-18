import {
  CANCELLED_BY,
  ORDER_STATUS_KIND,
  cancelledByOf,
  isCancelledOrder,
  onlyCancelledOrders,
  orderStatusKind,
  withoutCancelledOrders,
} from '../orderStatus';

describe('orderStatusKind', () => {
  it.each([
    [0, ORDER_STATUS_KIND.PENDING],
    [1, ORDER_STATUS_KIND.IN_PROGRESS],
    [2, ORDER_STATUS_KIND.DONE],
    [3, ORDER_STATUS_KIND.CANCELLED],
    [4, ORDER_STATUS_KIND.CANCELLED],
    [5, ORDER_STATUS_KIND.CANCELLED],
    [6, ORDER_STATUS_KIND.CANCELLED],
    ['2', ORDER_STATUS_KIND.DONE],
    [undefined, ORDER_STATUS_KIND.PENDING],
  ])('status %p → %p', (status, kind) => {
    expect(orderStatusKind({ status })).toBe(kind);
  });
});

describe('cancelledByOf', () => {
  it('derives the source from the status code', () => {
    expect(cancelledByOf({ status: 3 })).toBe(CANCELLED_BY.USER);
    expect(cancelledByOf({ status: 4 })).toBe(CANCELLED_BY.TECHNICIAN);
    expect(cancelledByOf({ status: 5 })).toBe(CANCELLED_BY.ADMIN);
    expect(cancelledByOf({ status: 6 })).toBe(CANCELLED_BY.SYSTEM);
  });

  it('prefers an explicit cancelled_by from the server', () => {
    expect(cancelledByOf({ status: 5, cancelled_by: 'technician' })).toBe(CANCELLED_BY.TECHNICIAN);
    expect(cancelledByOf({ status: 3, cancelled_by: 'panel' })).toBe(CANCELLED_BY.ADMIN);
    expect(cancelledByOf({ status: 3, cancelled_by: 'nonsense' })).toBe(CANCELLED_BY.USER);
  });

  it('is null for an order that is not cancelled', () => {
    expect(cancelledByOf({ status: 0 })).toBeNull();
    expect(cancelledByOf({ status: 2 })).toBeNull();
  });

  it('treats a cancelled_by on a non-cancelled status code as cancelled', () => {
    expect(isCancelledOrder({ status: 1, cancelled_by: 'admin' })).toBe(true);
    expect(cancelledByOf({ status: 1, cancelled_by: 'admin' })).toBe(CANCELLED_BY.ADMIN);
  });
});

describe('order list split', () => {
  const orders = [{ id: 1, status: 0 }, { id: 2, status: 3 }, { id: 3, status: 2 }, { id: 4, status: 6 }];

  it('keeps cancelled orders out of «سفارشات»', () => {
    expect(withoutCancelledOrders(orders).map((o) => o.id)).toEqual([1, 3]);
  });

  it('lists only cancelled orders in «سفارش‌های لغوشده»', () => {
    expect(onlyCancelledOrders(orders).map((o) => o.id)).toEqual([2, 4]);
  });

  it('tolerates a missing list', () => {
    expect(withoutCancelledOrders(undefined)).toEqual([]);
    expect(onlyCancelledOrders(null)).toEqual([]);
  });
});
