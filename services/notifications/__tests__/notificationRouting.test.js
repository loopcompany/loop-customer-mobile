import {
  extractData,
  resolveNotificationTarget,
} from '@services/notifications/notificationRouting';

describe('resolveNotificationTarget', () => {
  it('returns null for missing / non-object data', () => {
    expect(resolveNotificationTarget(undefined)).toBeNull();
    expect(resolveNotificationTarget(null)).toBeNull();
    expect(resolveNotificationTarget('nope')).toBeNull();
    expect(resolveNotificationTarget({})).toBeNull();
  });

  it('maps the documented order_status payload to the order detail screen', () => {
    // straight from FIREBASE_NOTIFICATIONS.md
    const data = { type: 'order_status', order_id: '123', screen: 'order-detail' };
    expect(resolveNotificationTarget(data)).toEqual({
      name: 'Details',
      params: { orderId: '123' },
    });
  });

  it('prefers data.screen over data.type', () => {
    const data = { type: 'order_status', screen: 'order-tracking', order_id: 55 };
    expect(resolveNotificationTarget(data)).toEqual({
      name: 'OrderTrackingScreen',
      params: { orderId: '55' },
    });
  });

  it('falls back to data.type when screen is unknown', () => {
    expect(resolveNotificationTarget({ type: 'payment_status' })).toEqual({
      name: 'TransactionsScreen',
      params: {},
    });
  });

  it('is case / whitespace tolerant', () => {
    expect(resolveNotificationTarget({ screen: '  Order-Detail  ', order_id: '9' })).toEqual({
      name: 'Details',
      params: { orderId: '9' },
    });
  });

  it('never forwards unknown keys as params', () => {
    const data = { screen: 'order-detail', order_id: '1', secret: 'x', admin: 'true' };
    const target = resolveNotificationTarget(data);
    expect(target.params).toEqual({ orderId: '1' });
  });

  it('returns null when nothing matches', () => {
    expect(resolveNotificationTarget({ type: 'totally_unknown', screen: 'nope' })).toBeNull();
  });

  it('coerces numeric ids to strings', () => {
    const target = resolveNotificationTarget({ screen: 'order-detail', order_id: 42 });
    expect(target.params.orderId).toBe('42');
  });
});

describe('extractData', () => {
  it('reads data off an RNFirebase remote message', () => {
    expect(extractData({ data: { a: '1' }, notification: { title: 't' } })).toEqual({ a: '1' });
  });

  it('reads data off an expo-notifications response', () => {
    const response = { notification: { request: { content: { data: { b: '2' } } } } };
    expect(extractData(response)).toEqual({ b: '2' });
  });

  it('returns null when there is no data', () => {
    expect(extractData({ notification: { title: 't' } })).toBeNull();
    expect(extractData(null)).toBeNull();
  });
});
