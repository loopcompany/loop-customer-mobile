/**
 * Pure code-handling rules for the two promo systems.
 *
 * `getCodeState` decides whether a user's discount code renders as usable, and
 * it parses a date format ("2026-10-19 12:00:00") that is not valid ISO
 * everywhere — getting that wrong greys out every code the user owns. The
 * error mappers exist so a raw `error_code` never reaches a Persian-speaking
 * user, and `INSUFFICIENT_GEMS` in particular used to be mapped to an
 * unrelated "not authorized" message.
 */
import { getCodeState, normalizeDiscountCode, describeDiscountError } from '../DiscountApi';
import { normalizeReferralCode, formatReferrerName, describeReferralError } from '../ReferralApi';

/** The translator is identity here: assertions read as the English source strings. */
const t = (key) => key;

describe('getCodeState', () => {
  const future = '2999-01-01 12:00:00';
  const past = '2000-01-01 12:00:00';

  it('is usable with uses left and an expiry in the future', () => {
    expect(getCodeState({ count: 2, expiry_date: future })).toBe('usable');
  });

  it('is used_up once the usage count is exhausted, whatever the expiry says', () => {
    expect(getCodeState({ count: 0, expiry_date: future })).toBe('used_up');
    expect(getCodeState({ count: '0', expiry_date: future })).toBe('used_up');
  });

  it('is expired when the date has passed', () => {
    expect(getCodeState({ count: 5, expiry_date: past })).toBe('expired');
  });

  it('parses the space-separated backend date rather than reading it as NaN', () => {
    // A naive `new Date("2999-01-01 12:00:00")` returns NaN on some engines,
    // which would make a perfectly good code look expired.
    expect(getCodeState({ count: 1, expiry_date: '2999-01-01 12:00:00' })).toBe('usable');
  });

  it('treats a missing or unparseable expiry as no expiry, not as expired', () => {
    expect(getCodeState({ count: 1 })).toBe('usable');
    expect(getCodeState({ count: 1, expiry_date: 'not a date' })).toBe('usable');
  });
});

describe('code normalization', () => {
  it('trims and upper-cases a pasted discount code', () => {
    expect(normalizeDiscountCode('  abc-123456 ')).toBe('ABC-123456');
    expect(normalizeDiscountCode(null)).toBe('');
  });

  it('also strips inner whitespace from a referral code', () => {
    expect(normalizeReferralCode(' loop-ab7k92 ')).toBe('LOOP-AB7K92');
    expect(normalizeReferralCode('LOOP - AB7K92')).toBe('LOOP-AB7K92');
  });

  it('never invents a LOOP- prefix the admin panel did not issue', () => {
    expect(normalizeReferralCode('ab7k92')).toBe('AB7K92');
  });
});

describe('error mapping', () => {
  it('prefers the backend message when it sends one', () => {
    expect(describeDiscountError({ message: 'سفارشی', code: 'ALREADY_CLAIMED' }, t)).toBe('سفارشی');
    expect(describeReferralError({ message: 'سفارشی' }, t)).toBe('سفارشی');
  });

  it('maps INSUFFICIENT_GEMS to the points message, not an authorization one', () => {
    expect(describeDiscountError({ code: 'INSUFFICIENT_GEMS' }, t)).toBe(
      "You don't have enough points to claim this discount"
    );
  });

  it('distinguishes the documented referral failures', () => {
    expect(describeReferralError({ code: 'REFERRAL_CODE_NOT_FOUND' }, t)).toBe(
      'This referral code does not exist.'
    );
    expect(describeReferralError({ code: 'REFERRAL_CODE_USED' }, t)).toBe(
      'This referral code has already been used by another account.'
    );
  });

  it('falls back to a generic message for an unknown code', () => {
    expect(describeDiscountError({ code: 'WAT' }, t)).toBe('Invalid discount code.');
    expect(describeReferralError({}, t)).toBe('Referral code is invalid.');
  });
});

describe('formatReferrerName', () => {
  it('joins the parts it has and tolerates the ones it does not', () => {
    expect(formatReferrerName({ name: 'نام', last_name: 'خانوادگی' })).toBe('نام خانوادگی');
    expect(formatReferrerName({ name: 'نام' })).toBe('نام');
    expect(formatReferrerName(undefined)).toBe('');
  });
});
