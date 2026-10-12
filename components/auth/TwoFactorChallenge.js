// مرحله‌ی دوم ورود (تأیید دومرحله‌ای) - مشترک بین ورود کاربر عادی و سازمانی.
//
// صفحه‌ی ورود این مودال را وقتی باز می‌کند که پاسخ ورود `requires_two_factor`
// داشته باشد. مودال فقط کد را می‌گیرد و `onSubmit(code)` را صدا می‌زند؛ تکمیل
// ورود (ذخیره‌ی توکن، Redux، ناوبری) کار همان صفحه است تا دو مسیر ورود یکسان
// بمانند. کد بازیابی اضطراری (XXXX-XXXX) هم پذیرفته می‌شود.
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { ActionButton, BodyText, CodeInput, TextField } from '@components/account/AccountUI';
import { isNotImplemented } from '@services/AccountSecurityApi';

const RESEND_SECONDS = 60;

/**
 * @param {{
 *   visible: boolean,
 *   method: 'sms'|'app',
 *   onSubmit: (code: string) => Promise<{ ok: boolean, message?: string, status?: number }>,
 *   onResend?: () => Promise<{ ok: boolean, message?: string, status?: number }>,
 *   onCancel: () => void,
 * }} props
 */
const TwoFactorChallenge = ({ visible, method = 'sms', onSubmit, onResend, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!visible || resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [visible, resendIn]);

  const fail = (result) =>
    showToastOrAlert(
      isNotImplemented(result)
        ? t('This feature will be available soon.')
        : result?.message || t('The code is not correct.')
    );

  const submit = async () => {
    const value = code.trim();
    if (useRecovery ? value.length < 6 : value.length < 4) {
      showToastOrAlert(t('Enter the verification code.'));
      return;
    }
    setBusy(true);
    const result = await onSubmit(value);
    setBusy(false);
    if (!result?.ok) fail(result);
  };

  const resend = async () => {
    if (!onResend) return;
    setBusy(true);
    const result = await onResend();
    setBusy(false);
    if (!result?.ok) {
      fail(result);
      return;
    }
    setResendIn(RESEND_SECONDS);
    showToastOrAlert(result.message || t('A new code was sent.'));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: colors.overlay.bgColor(0.5),
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface.bgColor(1),
            borderRadius: radius.md,
            padding: spacing.xl,
            gap: spacing.md,
            maxWidth: 420,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: getFontFamily('bold', i18n.language),
              fontSize: fontSize.lg,
              color: colors.textPrimary.color,
              textAlign: 'center',
            }}
          >
            {t('Two-step verification')}
          </Text>
          <BodyText muted center>
            {useRecovery
              ? t('Enter one of your emergency recovery codes.')
              : method === 'app'
                ? t('Enter the code shown in your authenticator app.')
                : t('Enter the code sent to your mobile by SMS.')}
          </BodyText>

          {useRecovery ? (
            <TextField
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              placeholder="XXXX-XXXX"
            />
          ) : (
            <CodeInput value={code} onChangeText={setCode} placeholder="------" maxLength={6} />
          )}

          <ActionButton title={t('Verify and log in')} loading={busy} onPress={submit} />

          {method === 'sms' && !useRecovery && onResend ? (
            <TouchableOpacity onPress={resend} disabled={busy || resendIn > 0}>
              <BodyText
                center
                muted={resendIn > 0}
                style={resendIn > 0 ? null : { color: colors.primary.color }}
              >
                {resendIn > 0
                  ? t('Resend code in {{seconds}} seconds', { seconds: resendIn })
                  : t('Resend code')}
              </BodyText>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => {
              setUseRecovery((value) => !value);
              setCode('');
            }}
          >
            <BodyText center style={{ color: colors.primary.color }}>
              {useRecovery ? t('Use the verification code') : t('Use a recovery code')}
            </BodyText>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.divider.bgColor(1) }} />
          <ActionButton title={t('Cancel')} variant="outline" disabled={busy} onPress={onCancel} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default TwoFactorChallenge;
