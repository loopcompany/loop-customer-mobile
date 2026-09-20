/**
 * The two code-entry hooks encode rules that are invisible until money is
 * involved, so they are pinned here rather than trusted to review:
 *
 *   - a displayed discount percentage must always belong to the code currently
 *     in the box (editing or a failed re-check drops it). The bug this replaces
 *     let a user validate a 20% code, type a different one, and submit an order
 *     while the screen still promised 20%;
 *   - `useReferralCode` must never call the check endpoint on its own, because
 *     that endpoint *consumes* the code;
 *   - a typed-but-unverified code reports `needsCheck`, which is what stops the
 *     order screen from silently dropping or silently sending it.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import usePromoCode from '../usePromoCode';
import useReferralCode from '../useReferralCode';
import { checkPromoCode } from '@services/PromoApi';
import { checkReferralCode } from '@services/ReferralApi';

jest.mock('@services/PromoApi', () => ({
  ...jest.requireActual('@services/PromoApi'),
  checkPromoCode: jest.fn(),
}));

jest.mock('@services/ReferralApi', () => ({
  ...jest.requireActual('@services/ReferralApi'),
  checkReferralCode: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

/**
 * Renders a hook and hands back a live view of its latest return value.
 * `react-test-renderer` is what this repo already has; there is no
 * testing-library dependency to lean on.
 */
const renderHook = (useHook, args) => {
  const box = { current: null };

  const Probe = () => {
    box.current = useHook(args);
    return null;
  };

  act(() => {
    TestRenderer.create(<Probe />);
  });

  return box;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePromoCode', () => {
  const args = { token: 'tok' };

  it('applies a percentage returned by the backend', async () => {
    checkPromoCode.mockResolvedValue({
      ok: true,
      data: { code: 'SUMMER20', discount_percent: 20, expires_at: null },
      message: 'applied',
    });

    const hook = renderHook(usePromoCode, args);
    act(() => hook.current.onChangeText(' summer20 '));
    await act(async () => {
      await hook.current.check();
    });

    expect(hook.current.percent).toBe(20);
    expect(hook.current.applied).toBe(true);
    // The code the backend echoed is what the order must carry, not the raw input.
    expect(hook.current.appliedCode).toBe('SUMMER20');
    expect(hook.current.needsCheck).toBe(false);
    // A code with no expiry date is a valid state, not missing data.
    expect(hook.current.expiresAt).toBeNull();
  });

  it('drops a validated percentage as soon as the code is edited', async () => {
    checkPromoCode.mockResolvedValue({ ok: true, data: { discount_percent: 20 } });

    const hook = renderHook(usePromoCode, args);
    act(() => hook.current.onChangeText('CODE-A'));
    await act(async () => {
      await hook.current.check();
    });
    expect(hook.current.percent).toBe(20);

    act(() => hook.current.onChangeText('CODE-B'));

    expect(hook.current.percent).toBeNull();
    expect(hook.current.appliedCode).toBeNull();
    expect(hook.current.applied).toBe(false);
    expect(hook.current.needsCheck).toBe(true);
  });

  it('drops a validated percentage when a later check fails', async () => {
    checkPromoCode.mockResolvedValueOnce({ ok: true, data: { discount_percent: 20 } });
    checkPromoCode.mockResolvedValueOnce({ ok: false, message: 'nope' });

    const hook = renderHook(usePromoCode, args);
    act(() => hook.current.onChangeText('CODE-A'));
    await act(async () => {
      await hook.current.check();
    });
    act(() => hook.current.onChangeText('CODE-B'));
    await act(async () => {
      await hook.current.check();
    });

    expect(hook.current.percent).toBeNull();
    expect(hook.current.status).toBe('error');
    expect(hook.current.message).toBe('nope');
  });

  it('refuses a 2xx success that carries no percentage', async () => {
    checkPromoCode.mockResolvedValue({ ok: true, data: {} });

    const hook = renderHook(usePromoCode, args);
    act(() => hook.current.onChangeText('CODE'));
    await act(async () => {
      await hook.current.check();
    });

    expect(hook.current.applied).toBe(false);
    expect(hook.current.status).toBe('error');
  });

  it('does not call the endpoint for an empty code', async () => {
    const hook = renderHook(usePromoCode, args);
    await act(async () => {
      await hook.current.check();
    });

    expect(checkPromoCode).not.toHaveBeenCalled();
    expect(hook.current.needsCheck).toBe(false);
  });

  it('reject() clears an applied code when the order endpoint refuses it', async () => {
    // The order submit re-validates atomically: a code can expire or be spent
    // between the check and the submit, and the field must stop promising it.
    checkPromoCode.mockResolvedValue({
      ok: true,
      data: { code: 'SUMMER20', discount_percent: 20 },
    });

    const hook = renderHook(usePromoCode, args);
    act(() => hook.current.onChangeText('SUMMER20'));
    await act(async () => {
      await hook.current.check();
    });
    expect(hook.current.applied).toBe(true);

    act(() => hook.current.reject('کد تخفیف معتبر نیست.'));

    expect(hook.current.applied).toBe(false);
    expect(hook.current.appliedCode).toBeNull();
    expect(hook.current.percent).toBeNull();
    expect(hook.current.status).toBe('error');
  });
});

describe('useReferralCode', () => {
  const args = { token: 'tok' };

  it('never contacts the consuming endpoint without an explicit register', () => {
    const hook = renderHook(useReferralCode, args);
    act(() => hook.current.onChangeText('LOOP-AB7K92'));

    expect(checkReferralCode).not.toHaveBeenCalled();
    expect(hook.current.needsCheck).toBe(true);
  });

  it('stores the code the backend echoes back, not the raw input', async () => {
    checkReferralCode.mockResolvedValue({
      ok: true,
      data: {
        code: 'LOOP-AB7K92',
        discount_percent: 10,
        referrer: { name: 'نام', last_name: 'خانوادگی' },
      },
      message: 'registered',
    });

    const hook = renderHook(useReferralCode, args);
    act(() => hook.current.onChangeText(' loop-ab7k92 '));
    await act(async () => {
      await hook.current.register();
    });

    expect(hook.current.appliedCode).toBe('LOOP-AB7K92');
    expect(hook.current.percent).toBe(10);
    expect(hook.current.referrerName).toBe('نام خانوادگی');
    expect(hook.current.applied).toBe(true);
  });

  it('surfaces a 200-with-success:false rejection as an error', async () => {
    checkReferralCode.mockResolvedValue({ ok: false, code: 'REFERRAL_CODE_USED' });

    const hook = renderHook(useReferralCode, args);
    act(() => hook.current.onChangeText('LOOP-AB7K92'));
    await act(async () => {
      await hook.current.register();
    });

    expect(hook.current.applied).toBe(false);
    expect(hook.current.message).toBe(
      'This referral code has already been used by another account.'
    );
  });

  it('refuses to register without a token instead of firing a doomed request', async () => {
    const hook = renderHook(useReferralCode, { token: null });
    act(() => hook.current.onChangeText('LOOP-AB7K92'));
    await act(async () => {
      await hook.current.register();
    });

    expect(checkReferralCode).not.toHaveBeenCalled();
    expect(hook.current.status).toBe('error');
  });

  it('reject() clears an applied code when the order endpoint refuses it', async () => {
    checkReferralCode.mockResolvedValue({
      ok: true,
      data: { code: 'LOOP-AB7K92', discount_percent: 10 },
    });

    const hook = renderHook(useReferralCode, args);
    act(() => hook.current.onChangeText('LOOP-AB7K92'));
    await act(async () => {
      await hook.current.register();
    });
    expect(hook.current.applied).toBe(true);

    act(() => hook.current.reject('Referral code is invalid.'));

    expect(hook.current.applied).toBe(false);
    expect(hook.current.appliedCode).toBeNull();
    expect(hook.current.percent).toBeNull();
    expect(hook.current.status).toBe('error');
  });
});
