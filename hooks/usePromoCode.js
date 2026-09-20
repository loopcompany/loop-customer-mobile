// Promo-code entry state for the order form.
//
// Replaces `useDiscountCode` (club/gem codes via `/orders/check-discount`).
// The order screen's «کد تخفیف» field now validates admin-generated promo
// codes against `/promo-codes/check` and submits them as `promo_code` — see
// `services/PromoApi.js` for why the three code systems stay separate.
//
// Checking is free: the endpoint does not consume the code, and the single use
// per account is only recorded when the order is submitted. So this hook is
// free to re-validate as often as the user presses the button, and a successful
// check is never treated as "spent".
//
// The one rule it enforces is that a *shown* percentage always belongs to the
// code currently in the box. Editing the text drops the previous result, and a
// failed check clears it too. Without that, validating a 20% code and then
// typing a different one left "20%" on screen while the order carried the new,
// unvalidated code.
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkPromoCode, describePromoError, normalizePromoCode } from '@services/PromoApi';

/**
 * @param {{token: string}} params
 * @returns {{
 *   code: string, percent: number|null, expiresAt: string|null, pending: boolean,
 *   status: 'idle'|'success'|'error', message: string,
 *   applied: boolean, needsCheck: boolean, appliedCode: string|null,
 *   onChangeText: function, check: function, clear: function, reject: function
 * }}
 */
export function usePromoCode({ token }) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [appliedCode, setAppliedCode] = useState(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  /** پاک کردن نتیجه‌ی قبلی هنگام تغییر متن */
  const onChangeText = useCallback((text) => {
    setCode(text);
    setPercent(null);
    setExpiresAt(null);
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  const clear = useCallback(() => {
    setCode('');
    setPercent(null);
    setExpiresAt(null);
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  /**
   * رد شدن کد از سمت سرور هنگام ثبت سفارش
   *
   * `/orders/submit` re-validates the code atomically and answers 409
   * INVALID_PROMO_CODE when it no longer holds — it may have expired or been
   * used on another order between the check and the submit. The order screen
   * calls this so the field shows the rejection instead of the stale "applied"
   * state it was holding.
   */
  const reject = useCallback(
    (serverMessage) => {
      setPercent(null);
      setExpiresAt(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(serverMessage || t('Invalid discount code.'));
    },
    [t]
  );

  const check = useCallback(async () => {
    const normalized = normalizePromoCode(code);

    if (!normalized) {
      setStatus('error');
      setMessage(t('Please enter a discount code!'));
      return false;
    }

    setPending(true);
    const result = await checkPromoCode(token, normalized);
    setPending(false);

    if (!result.ok) {
      setPercent(null);
      setExpiresAt(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(describePromoError(result, t));
      return false;
    }

    const applied = result.data?.discount_percent;

    // A 2xx with `success:true` but no percentage is not something to celebrate
    // with "applied" — treat the missing number as a rejection rather than
    // showing a discount of `undefined`.
    if (applied == null) {
      setPercent(null);
      setExpiresAt(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(result.message || t('Invalid discount code.'));
      return false;
    }

    // The backend echoes the code it recognised; that string is what the order
    // must carry, not the raw input.
    setAppliedCode(result.data?.code || normalized);
    setCode(result.data?.code || normalized);
    setPercent(Number(applied));
    // `null` on a code with no expiry date, which is a valid state, not missing
    // data.
    setExpiresAt(result.data?.expires_at ?? null);
    setStatus('success');
    setMessage(result.message || t('Discount code applied.'));
    return true;
  }, [code, token, t]);

  const applied = status === 'success' && appliedCode != null;

  // Typed something but never validated it. The order screen blocks submission
  // on this rather than quietly dropping the code (the user would lose their
  // discount without being told) or quietly sending it (the backend may reject
  // the whole order over it).
  const needsCheck = useMemo(() => Boolean(normalizePromoCode(code)) && !applied, [code, applied]);

  return {
    code,
    percent,
    expiresAt,
    pending,
    status,
    message,
    applied,
    needsCheck,
    appliedCode,
    onChangeText,
    check,
    clear,
    reject,
  };
}

export default usePromoCode;
