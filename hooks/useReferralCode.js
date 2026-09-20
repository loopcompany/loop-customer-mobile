// Referral-code entry state for the order form.
//
// Unlike the discount code, registering a referral code is a *side effect*:
// `/referral-codes/check` consumes it and binds it to the signed-in user. Two
// consequences shape this hook:
//
//   - `register` runs only from an explicit press. There is no validate-as-you-
//     type, no blur handler, no effect. A keystroke must never burn a code.
//   - Editing the text after a successful registration does not un-register
//     anything on the server, so `clear` only drops it from *this order*. The
//     code stays bound to the user and can be re-entered later — re-checking as
//     the same user is idempotent.
//
// The code sent with the order is the backend's echoed `data.code`, not the raw
// input, so the order carries exactly the string the server recognised.
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  checkReferralCode,
  describeReferralError,
  formatReferrerName,
  normalizeReferralCode,
} from '@services/ReferralApi';

/**
 * @param {{token: string}} params
 * @returns {{
 *   code: string, percent: number|null, referrerName: string,
 *   pending: boolean, status: 'idle'|'success'|'error', message: string,
 *   applied: boolean, needsCheck: boolean, appliedCode: string|null,
 *   onChangeText: function, register: function, clear: function, reject: function
 * }}
 */
export function useReferralCode({ token }) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(null);
  const [referrerName, setReferrerName] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const onChangeText = useCallback((text) => {
    setCode(text);
    setPercent(null);
    setReferrerName('');
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  const clear = useCallback(() => {
    setCode('');
    setPercent(null);
    setReferrerName('');
    setAppliedCode(null);
    setStatus('idle');
    setMessage('');
  }, []);

  /**
   * رد شدن کد از سمت سرور هنگام ثبت سفارش
   *
   * `/orders/submit` answers 409 INVALID_REFERRAL_CODE when the code does not
   * belong to this consumer. The order screen calls this so the field shows the
   * rejection instead of the stale "registered" state it was holding.
   */
  const reject = useCallback(
    (serverMessage) => {
      setPercent(null);
      setAppliedCode(null);
      setStatus('error');
      setMessage(serverMessage || t('Referral code is invalid.'));
    },
    [t]
  );

  const register = useCallback(async () => {
    const normalized = normalizeReferralCode(code);

    if (!normalized) {
      setStatus('error');
      setMessage(t('Please enter a referral code!'));
      return false;
    }

    // The endpoint identifies the consumer by token; without one it can only
    // answer 401, and the generic session handling would be misleading here.
    if (!token) {
      setStatus('error');
      setMessage(t('Please sign in before registering a referral code.'));
      return false;
    }

    setPending(true);
    const result = await checkReferralCode(token, normalized);
    setPending(false);

    if (!result.ok) {
      setPercent(null);
      setReferrerName('');
      setAppliedCode(null);
      setStatus('error');
      setMessage(describeReferralError(result, t));
      return false;
    }

    const confirmed = result.data?.code || normalized;
    const discount = result.data?.discount_percent;

    setAppliedCode(confirmed);
    setCode(confirmed);
    setPercent(discount == null ? null : Number(discount));
    setReferrerName(formatReferrerName(result.data?.referrer));
    setStatus('success');
    setMessage(result.message || t('Referral code registered successfully.'));
    return true;
  }, [code, token, t]);

  const applied = status === 'success' && appliedCode != null;

  const needsCheck = useMemo(
    () => Boolean(normalizeReferralCode(code)) && !applied,
    [code, applied]
  );

  return {
    code,
    percent,
    referrerName,
    pending,
    status,
    message,
    applied,
    needsCheck,
    appliedCode,
    onChangeText,
    register,
    clear,
    reject,
  };
}

export default useReferralCode;
