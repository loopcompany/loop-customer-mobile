// ۷. تأیید شماره موبایل: شماره، وضعیت، ارسال کد (با زمان ارسال، زمان اعتبار،
// ارسال مجدد و محدودیت تعداد درخواست) و تغییر شماره موبایل.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showToastOrAlert, toPersianDigits } from '@helpers/Common';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  CodeInput,
  InfoRow,
  StatusPill,
  TextField,
} from '@components/account/AccountUI';
import { isNotImplemented, sendMobileCode, verifyMobile } from '@services/AccountSecurityApi';

const IR_MOBILE = /^09\d{9}$/;
const toLatinDigits = (text) => String(text || '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const mmss = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function MobileSection({ summary, onChanged, onUnavailable }) {
  const { t } = useTranslation();
  const mobile = summary?.mobile || {};
  const verified = Boolean(mobile.verified);

  const [changing, setChanging] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sentAt, setSentAt] = useState(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [busy, setBusy] = useState(false);

  // شمارش معکوس «ارسال مجدد» و «اعتبار کد».
  useEffect(() => {
    if (!codeSent || (resendIn <= 0 && expiresIn <= 0)) return undefined;
    const timer = setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
      setExpiresIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [codeSent, resendIn, expiresIn]);

  const targetMobile = changing ? toLatinDigits(newMobile).trim() : null;

  const send = async () => {
    if (changing && !IR_MOBILE.test(targetMobile)) {
      showToastOrAlert(t('Please enter a valid mobile number (09xxxxxxxxx).'));
      return;
    }
    setBusy(true);
    const result = await sendMobileCode(targetMobile);
    setBusy(false);
    if (!result.ok) {
      if (isNotImplemented(result)) onUnavailable?.();
      else showToastOrAlert(result.message || t('The operation failed. Please try again.'));
      return;
    }
    setCodeSent(true);
    setCode('');
    setSentAt(new Date());
    setExpiresIn(Number(result.data?.expires_in) || 120);
    setResendIn(Number(result.data?.resend_in) || 60);
    setRemaining(result.data?.remaining_attempts ?? null);
    showToastOrAlert(result.message || t('A verification code has been sent.'));
  };

  const verify = async () => {
    if (code.length < 4) {
      showToastOrAlert(t('Please enter the verification code.'));
      return;
    }
    setBusy(true);
    const result = await verifyMobile({ code: toLatinDigits(code), mobile: targetMobile });
    setBusy(false);
    if (!result.ok) {
      showToastOrAlert(result.message || t('The verification code is not correct.'));
      return;
    }
    showToastOrAlert(result.message || t('Mobile number verified.'));
    setCodeSent(false);
    setChanging(false);
    setNewMobile('');
    onChanged?.();
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <InfoRow label={t('Mobile number')} value={mobile.number ? toPersianDigits(mobile.number) : '-'} />
      <StatusPill
        icon={verified ? 'checkmark-circle' : 'alert-circle'}
        tone={verified ? 'success' : 'warning'}
        label={verified ? t('Verified') : t('Not verified')}
      />

      {changing ? (
        <TextField value={newMobile} onChangeText={setNewMobile} placeholder={t('New mobile number')} keyboardType="phone-pad" />
      ) : null}

      {!codeSent ? (
        <View style={{ gap: spacing.sm }}>
          {(!verified || changing) ? (
            <ActionButton title={t('Send verification code')} loading={busy} onPress={send} />
          ) : null}
          <ActionButton
            title={changing ? t('Cancel') : t('Change mobile number')}
            variant="outline"
            onPress={() => { setChanging((value) => !value); setNewMobile(''); }}
          />
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <BodyText muted>
            {`${t('Code sent at')} ${sentAt ? `${String(sentAt.getHours()).padStart(2, '0')}:${String(sentAt.getMinutes()).padStart(2, '0')}` : ''}`}
            {expiresIn > 0 ? ` — ${t('Valid for')} ${mmss(expiresIn)}` : ` — ${t('The code has expired.')}`}
          </BodyText>
          {remaining != null ? <BodyText muted>{`${t('Remaining requests')}: ${remaining}`}</BodyText> : null}
          <CodeInput value={code} onChangeText={setCode} placeholder="------" />
          <ActionButton title={t('Confirm')} loading={busy} disabled={expiresIn <= 0} onPress={verify} />
          <ActionButton
            title={resendIn > 0 ? `${t('Resend code')} (${mmss(resendIn)})` : t('Resend code')}
            variant="outline"
            disabled={resendIn > 0 || remaining === 0}
            onPress={send}
          />
          <ActionButton title={t('Cancel')} variant="outline" onPress={() => { setCodeSent(false); setCode(''); }} />
        </View>
      )}
    </View>
  );
}
