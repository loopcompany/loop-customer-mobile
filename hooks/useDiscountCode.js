// Discount-code entry state for the order form.
//
// Checking a discount code is free — `/orders/check-discount` does not consume
// it, the usage count only drops when the order is submitted — so this hook is
// free to re-validate as often as the user presses the button.
//
// The one rule it enforces is that a *shown* percentage always belongs to the
// code currently in the box. Editing the text drops the previous result, and a
// failed check clears it too. Without that, validating a 20% code and then
// typing a different one left "20%" on screen while the order carried the new,
// unvalidated code.
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  checkOrderDiscount,
  describeDiscountError,
  normalizeDiscountCode,
} from '@services/DiscountApi';

/**
 * @param {{token: string, categoryId: number}} params
 * @returns {{
 *   code: string, percent: number|null, pending: boolean,
 *   status: 'idle'|'success'|'error', message: string,
 *   applied: boolean, needsCheck: boolean, appliedCode: string|null,
 *   onChangeText: function, check: function, clear: function
 * }}
 */
export function useDiscountCode({ token, categoryId }) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(null);
  const [appliedCode, setAppliedCode] = useState(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  /** پاک کردن نتیجه‌ی قبلی هنگام تغییر متن */
  const onChangeText = useCallback((text) => {
    setCode(text);
    setPercent(null);
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  const clear = useCallback(() => {
    setCode('');
    setPercent(null);
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  const check = useCallback(async () => {
    const normalized = normalizeDiscountCode(code);

    if (!normalized) {
      setStatus('error');
      setMessage(t('Please enter a discount code!'));
      return false;
    }

    setPending(true);
    const result = await checkOrderDiscount(token, { code: normalized, categoryId });
    setPending(false);

    if (!result.ok) {
      setPercent(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(describeDiscountError(result, t));
      return false;
    }

    const applied = result.data?.discount_percent;

    // A 2xx with `success:true` but no percentage is not something to celebrate
    // with "applied" — treat the missing number as a rejection rather than
    // showing a discount of `undefined`.
    if (applied == null) {
      setPercent(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(result.message || t('Invalid discount code.'));
      return false;
    }

    setPercent(Number(applied));
    setAppliedCode(normalized);
    setStatus('success');
    setMessage(result.message || t('Discount code applied.'));
    return true;
  }, [code, categoryId, token, t]);

  const applied = status === 'success' && appliedCode != null;

  // Typed something but never validated it. The order screen blocks submission
  // on this rather than quietly dropping the code (the user would lose their
  // discount without being told) or quietly sending it (the backend may reject
  // the whole order over it).
  const needsCheck = useMemo(
    () => Boolean(normalizeDiscountCode(code)) && !applied,
    [code, applied]
  );

  return {
    code,
    percent,
    pending,
    status,
    message,
    applied,
    needsCheck,
    appliedCode,
    onChangeText,
    check,
    clear,
  };
}

export default useDiscountCode;
