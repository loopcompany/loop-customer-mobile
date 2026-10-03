// ۹. حذف حساب کاربری: درخواست حذف، توضیح پیامدها، دلیل (اختیاری)، تأیید شماره
// موبایل با کد، تأیید نهایی، وضعیت درخواست (در انتظار / تأیید شده / انجام شده /
// لغو شده)، تاریخ درخواست و تاریخ اجرای حذف.
//
// حذف حساب سازمانی / شرکتی فقط پس از تأیید پنل ادمین اجرا می‌شود؛ حذف حساب
// لزوماً به معنی حذف فوری سوابق سفارش‌ها و خدمات نیست (بخش ۱۳ حریم خصوصی).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDateTime, showAlert, showToastOrAlert } from '@helpers/Common';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  CodeInput,
  InfoRow,
  ResourceBody,
  StatusPill,
  TextField,
} from '@components/account/AccountUI';
import {
  cancelDeletionRequest,
  createDeletionRequest,
  isNotImplemented,
  sendDeletionCode,
} from '@services/AccountSecurityApi';
import { deletionStatusOf } from '@services/accountSecurityLabels';

const OPEN_STATUSES = ['pending', 'approved'];

export default function DeleteAccountSection({ deletion, isOrganization }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const current = deletion.data && deletion.data.status ? deletion.data : null;
  const status = deletionStatusOf(current?.status);
  const isOpen = current && OPEN_STATUSES.includes(String(current.status).toLowerCase());

  const fail = (result) =>
    showToastOrAlert(
      isNotImplemented(result)
        ? t('This feature will be available soon.')
        : result?.message || t('The operation failed. Please try again.')
    );

  const sendCode = async () => {
    setBusy(true);
    const result = await sendDeletionCode();
    setBusy(false);
    if (!result.ok) return fail(result);
    setCodeSent(true);
    setCode('');
    showToastOrAlert(result.message || t('A verification code has been sent.'));
    return undefined;
  };

  const submit = () => {
    if (code.length < 4) {
      showToastOrAlert(t('Please enter the verification code.'));
      return;
    }
    showAlert(
      t('Final confirmation'),
      isOrganization
        ? t('Your deletion request will be sent to the Loop admin panel and carried out after approval. Continue?')
        : t('Are you sure you want to delete your account?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete account'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const result = await createDeletionRequest({ code, reason: reason.trim() || undefined });
            setBusy(false);
            if (!result.ok) {
              fail(result);
              return;
            }
            setCodeSent(false);
            setCode('');
            showToastOrAlert(result.message || t('Your deletion request has been registered.'));
            deletion.reload();
          },
        },
      ]
    );
  };

  const cancelRequest = async () => {
    setBusy(true);
    const result = await cancelDeletionRequest();
    setBusy(false);
    if (!result.ok) {
      fail(result);
      return;
    }
    showToastOrAlert(result.message || t('Your deletion request was canceled.'));
    deletion.reload();
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <BodyText bold>{t('What happens when you delete your account')}</BodyText>
      <BodyText muted>
        {t('Deleting the account does not necessarily mean your order and service records are deleted immediately; depending on legal requirements and the records the company must keep, some information is kept for a set period.')}
      </BodyText>
      {isOrganization ? (
        <BodyText muted>{t('Deleting an organization / company account requires approval from the Loop admin panel.')}</BodyText>
      ) : null}

      <ResourceBody resource={deletion}>
        {current ? (
          <View style={{ gap: spacing.xs }}>
            {status ? <StatusPill tone={status.tone} label={`${t('Request status')}: ${status.label}`} /> : null}
            <InfoRow label={t('Request date')} value={formatDateTime(current.requested_at)} />
            <InfoRow label={t('Deletion date')} value={formatDateTime(current.scheduled_at || current.executed_at)} />
            {current.reason ? <InfoRow label={t('Reason')} value={current.reason} /> : null}
            {isOpen ? (
              <ActionButton title={t('Cancel deletion request')} variant="outline" loading={busy} onPress={cancelRequest} />
            ) : null}
          </View>
        ) : null}

        {!isOpen ? (
          <View style={{ gap: spacing.sm }}>
            <TextField value={reason} onChangeText={setReason} placeholder={t('Reason for deleting (optional)')} multiline />
            {!codeSent ? (
              <ActionButton title={t('Request account deletion')} variant="dangerOutline" loading={busy} onPress={sendCode} />
            ) : (
              <>
                <BodyText muted>{t('Enter the code sent to your mobile number to confirm:')}</BodyText>
                <CodeInput value={code} onChangeText={setCode} placeholder="------" />
                <ActionButton title={t('Delete account')} variant="danger" loading={busy} onPress={submit} />
                <ActionButton title={t('Cancel')} variant="outline" onPress={() => { setCodeSent(false); setCode(''); }} />
              </>
            )}
          </View>
        ) : null}
      </ResourceBody>
    </View>
  );
}
