/**
 * The promo-code validator, pinned where it is easy to get wrong.
 *
 * `/promo-codes/check` answers 404/409 with an `error_code` *and* carries a
 * top-level `valid` flag on the success path. A body of
 * `{ success: true, valid: false }` is a rejection; reading only `success` (or
 * only the HTTP status) would show the user a discount the order will not
 * honour. `apiResponse.request` cannot be used here for exactly that reason —
 * it keeps `data` and drops `valid` — so this is the guard that the hand-rolled
 * replacement still behaves like the rest of the API layer.
 */
import http from '@services/axiosConfig';
import { checkPromoCode, describePromoError, normalizePromoCode } from '../PromoApi';

jest.mock('@services/axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

/** The translator is identity here: assertions read as the English source strings. */
const t = (key) => key;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('normalizePromoCode', () => {
  it('trims, upper-cases and strips inner whitespace', () => {
    expect(normalizePromoCode('  summer20 ')).toBe('SUMMER20');
    expect(normalizePromoCode('SUM MER20')).toBe('SUMMER20');
    expect(normalizePromoCode(null)).toBe('');
  });
});

describe('checkPromoCode', () => {
  it('sends the normalized code and unwraps the discount', async () => {
    http.post.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        valid: true,
        message: 'کد تخفیف معتبر است.',
        data: { code: 'SUMMER20', discount_percent: 20, expires_at: null },
      },
    });

    const result = await checkPromoCode('tok', ' summer20 ');

    expect(http.post).toHaveBeenCalledWith(
      expect.stringContaining('/promo-codes/check'),
      { code: 'SUMMER20' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      })
    );
    expect(result.ok).toBe(true);
    expect(result.data.discount_percent).toBe(20);
  });

  it('treats a 2xx with valid:false as a rejection, not a discount', async () => {
    http.post.mockResolvedValue({
      status: 200,
      data: { success: true, valid: false, message: 'کد معتبر نیست.' },
    });

    const result = await checkPromoCode('tok', 'SUMMER20');

    expect(result.ok).toBe(false);
  });

  it('maps a 409 rejection onto the same shape instead of throwing', async () => {
    http.post.mockRejectedValue({
      response: {
        status: 409,
        data: { success: false, error_code: 'PROMO_CODE_ALREADY_USED', message: undefined },
      },
    });

    const result = await checkPromoCode('tok', 'SUMMER20');

    expect(result.ok).toBe(false);
    expect(result.code).toBe('PROMO_CODE_ALREADY_USED');
  });

  it('survives a network failure with no response at all', async () => {
    http.post.mockRejectedValue(new Error('Network Error'));

    const result = await checkPromoCode('tok', 'SUMMER20');

    expect(result.ok).toBe(false);
    expect(result.code).toBeUndefined();
  });
});

describe('describePromoError', () => {
  it('prefers the backend message when it sends one', () => {
    expect(describePromoError({ message: 'سفارشی', code: 'PROMO_CODE_EXPIRED' }, t)).toBe('سفارشی');
  });

  it('distinguishes the documented failures', () => {
    expect(describePromoError({ code: 'PROMO_CODE_NOT_FOUND' }, t)).toBe(
      'This discount code does not exist.'
    );
    expect(describePromoError({ code: 'PROMO_CODE_INACTIVE' }, t)).toBe(
      'This discount code is no longer active.'
    );
    expect(describePromoError({ code: 'PROMO_CODE_EXPIRED' }, t)).toBe(
      'This discount code has expired.'
    );
    // Single use is *per account*: a code a friend used is still spendable here.
    expect(describePromoError({ code: 'PROMO_CODE_ALREADY_USED' }, t)).toBe(
      'You have already used this discount code.'
    );
  });

  it('falls back to the generic message for the submit-time rejection', () => {
    expect(describePromoError({ code: 'INVALID_PROMO_CODE' }, t)).toBe('Invalid discount code.');
    expect(describePromoError({}, t)).toBe('Invalid discount code.');
  });
});
