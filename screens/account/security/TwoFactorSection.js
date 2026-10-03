// ۱. تأیید دومرحله‌ای: وضعیت، روش (پیامک / اپ احراز هویت)، شماره‌ی تأییدشده،
// فعال‌سازی / غیرفعال‌سازی با کد، و کدهای بازیابی اضطراری.
import React, { useState } from 'react';
import { View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { showAlert, showToastOrAlert } from '@helpers/Common';
import { spacing } from '@theme/Spacing';
import { SelectableOptions } from '@components/OrgSelectionKit';
import { ActionButton, BodyText, CodeInput, InfoRow, StatusPill } from '@components/account/AccountUI';
import {
  disableTwoFactor,
  enableTwoFactor,
  isNotImplemented,
  regenerateRecoveryCodes,
  sendTwoFactorCode,
} from '@services/AccountSecurityApi';
import { TWO_FACTOR_METHODS } from '@services/accountSecurityLabels';

// مرحله‌ی جاری فرم: هیچ / منتظر کد برای فعال‌سازی / غیرفعال‌سازی / کدهای بازیابی
const FLOW = { NONE: null, ENABLE: 'enable', DISABLE: 'disable', RECOVERY: 'recovery_codes' };

export default function TwoFactorSection({ summary, onChanged, onUnavailable }) {
  const { t } = useTranslation();
  const twoFactor = summary?.two_factor || {};
  const enabled = Boolean(twoFactor.enabled);

  const [method, setMethod] = useState(twoFactor.method || 'sms');
  const [flow, setFlow] = useState(FLOW.NONE);
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [busy, setBusy] = useState(false);

  const fail = (result) => {
    if (isNotImplemented(result)) {
      onUnavailable?.();
      return;
    }
    showToastOrAlert(result?.message || t('The operation failed. Please try again.'));
  };

  const startFlow = async (nextFlow) => {
    setBusy(true);
    const result = await sendTwoFactorCode(nextFlow, method);
    setBusy(false);
    if (!result.ok) return fail(result);
    setFlow(nextFlow);
    setCode('');
    // برای «اپ احراز هویت» سرور کلید/لینک otpauth را برمی‌گرداند.
    setSecret(nextFlow === FLOW.ENABLE && method === 'app' ? result.data?.secret || null : null);
    showToastOrAlert(result.message || t('A verification code has been sent.'));
    return undefined;
  };

  const confirm = async () => {
    if (code.length < 4) {
      showToastOrAlert(t('Please enter the verification code.'));
      return;
    }
    setBusy(true);
    const action = { [FLOW.ENABLE]: enableTwoFactor, [FLOW.DISABLE]: disableTwoFactor, [FLOW.RECOVERY]: regenerateRecoveryCodes }[flow];
    const result = await action({ method, code });
    setBusy(false);
    if (!result.ok) {
      fail(result);
      return;
    }
    const codes = result.data?.recovery_codes;
    setRecoveryCodes(Array.isArray(codes) && codes.length ? codes : null);
    setFlow(FLOW.NONE);
    setCode('');
    setSecret(null);
    showToastOrAlert(result.message || t('Done.'));
    onChanged?.();
  };

  const copyRecoveryCodes = async () => {
    await Clipboard.setStringAsync(recoveryCodes.join('\n'));
    showToastOrAlert(t('Recovery codes copied.'));
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <StatusPill
        icon={enabled ? 'checkmark-circle' : 'close-circle'}
        tone={enabled ? 'success' : 'muted'}
        label={`${t('Two-step verification')}: ${enabled ? t('Active status') : t('Inactive')}`}
      />
      <InfoRow label={t('Verification method')} value={enabled ? TWO_FACTOR_METHODS[twoFactor.method] || twoFactor.method : '-'} />
      <InfoRow label={t('Verified mobile number')} value={twoFactor.verified_mobile || summary?.mobile?.number} />

      {!enabled && flow === FLOW.NONE ? (
        <>
          <BodyText muted>{t('Choose how you want to receive the second-step code:')}</BodyText>
          <SelectableOptions
            options={[
              { id: 'sms', title: TWO_FACTOR_METHODS.sms },
              { id: 'app', title: TWO_FACTOR_METHODS.app },
            ]}
            value={method}
            onChange={(next) => next && setMethod(next)}
            columns={2}
          />
          <ActionButton title={t('Enable')} icon="shield-checkmark-outline" loading={busy} onPress={() => startFlow(FLOW.ENABLE)} />
        </>
      ) : null}

      {enabled && flow === FLOW.NONE ? (
        <View style={{ gap: spacing.sm }}>
          <ActionButton title={t('New recovery codes')} variant="outline" loading={busy} onPress={() => startFlow(FLOW.RECOVERY)} />
          <ActionButton
            title={t('Disable')}
            variant="dangerOutline"
            loading={busy}
            onPress={() =>
              showAlert(t('Disable two-step verification'), t('Your account will be less protected. Continue?'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Disable'), style: 'destructive', onPress: () => startFlow(FLOW.DISABLE) },
              ])
            }
          />
        </View>
      ) : null}

      {flow !== FLOW.NONE ? (
        <View style={{ gap: spacing.sm }}>
          {secret ? (
            <>
              <BodyText muted>{t('Add this key to your authenticator app, then enter the code it shows:')}</BodyText>
              <BodyText bold center selectable>{secret}</BodyText>
            </>
          ) : (
            <BodyText muted>{t('Enter the verification code:')}</BodyText>
          )}
          <CodeInput value={code} onChangeText={setCode} placeholder="------" />
          <ActionButton title={t('Confirm')} loading={busy} onPress={confirm} />
          <ActionButton title={t('Cancel')} variant="outline" onPress={() => { setFlow(FLOW.NONE); setCode(''); setSecret(null); }} />
        </View>
      ) : null}

      {recoveryCodes ? (
        <View style={{ gap: spacing.xs }}>
          <BodyText bold>{t('Emergency recovery codes')}</BodyText>
          <BodyText muted>{t('Keep these codes somewhere safe. Each code works only once if you lose access to your phone.')}</BodyText>
          {recoveryCodes.map((item) => (
            <BodyText key={item} center bold>{item}</BodyText>
          ))}
          <ActionButton title={t('Copy codes')} variant="outline" icon="copy-outline" onPress={copyRecoveryCodes} />
        </View>
      ) : null}
    </View>
  );
}
