// بخش‌های تازه‌ی حساب کاربری سازمانی / شرکتی / نیمه‌دولتی (طبق «توضیحات اپ کاربر»):
//   وضعیت احراز هویت سازمان، بارگذاری مدارک (اختیاری)، کاربران مجاز سازمان،
//   و ردیف‌های امنیت / نسخه‌ی اپ / حذف حساب.
import React, { useState } from 'react';
import { View, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { formatDateTime, showAlert, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  ChoiceRow,
  InfoRow,
  NavRow,
  ResourceBody,
  SectionCard,
  StatusPill,
  TextField,
  useRemoteResource,
} from './AccountUI';
import {
  EDIT_REQUEST_STATUS,
  LOCKED_PROFILE_FIELDS,
  VERIFICATION_STATUS,
  addAuthorizedUser,
  deleteDocument,
  listAuthorizedUsers,
  listDocuments,
  removeAuthorizedUser,
  resolveVerificationStatus,
  submitEditRequest,
  uploadDocument,
} from '@services/OrganizationAccountApi';
import { checkAppVersion, isNotImplemented } from '@services/AccountSecurityApi';
import { getAppVersion } from '@services/notifications/deviceInfo';

const failMessage = (t, result) =>
  isNotImplemented(result)
    ? t('This feature will be available soon.')
    : result?.message || t('The operation failed. Please try again.');

// ---------------------------------------------------------------------------
// وضعیت احراز هویت
// ---------------------------------------------------------------------------
const STATUS_VIEW = {
  [VERIFICATION_STATUS.PENDING]: { label: 'Under review by the admin panel', tone: 'warning', icon: 'hourglass-outline' },
  [VERIFICATION_STATUS.APPROVED]: { label: 'Approved', tone: 'success', icon: 'checkmark-circle' },
  [VERIFICATION_STATUS.SUSPENDED]: { label: 'Suspended', tone: 'error', icon: 'pause-circle' },
  [VERIFICATION_STATUS.DELETED]: { label: 'Deleted', tone: 'muted', icon: 'trash' },
  [VERIFICATION_STATUS.REJECTED]: { label: 'Rejected', tone: 'error', icon: 'close-circle' },
};

export function VerificationStatusCard({ profileData }) {
  const { t } = useTranslation();
  const accessProfileStatus = useSelector((state) => state?.organization?.profileStatus);
  const status = resolveVerificationStatus(profileData, accessProfileStatus);
  const view = STATUS_VIEW[status];
  const reason = profileData?.verification_reason || profileData?.rejection_reason;

  return (
    <SectionCard title={t('Organization verification status')} icon="ribbon-outline">
      {view ? (
        <StatusPill tone={view.tone} icon={view.icon} label={t(view.label)} />
      ) : (
        <BodyText muted>{t('Not determined yet')}</BodyText>
      )}
      {reason && status !== VERIFICATION_STATUS.APPROVED ? <BodyText muted>{reason}</BodyText> : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// مدارک سازمان (اختیاری)
// ---------------------------------------------------------------------------
export function OrganizationDocumentsSection() {
  const { t } = useTranslation();
  const documents = useRemoteResource(listDocuments);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const list = Array.isArray(documents.data) ? documents.data : [];

  const pickAndUpload = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets?.length) return;
      setUploading(true);
      const result = await uploadDocument(picked.assets[0], picked.assets[0].name);
      setUploading(false);
      if (!result.ok) {
        showToastOrAlert(failMessage(t, result));
        return;
      }
      showToastOrAlert(result.message || t('The document was uploaded.'));
      documents.reload();
    } catch {
      setUploading(false);
      showToastOrAlert(t('The operation failed. Please try again.'));
    }
  };

  const remove = (doc) =>
    showAlert(t('Delete document'), t('Are you sure you want to delete this document?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          setBusyId(doc.id);
          const result = await deleteDocument(doc.id);
          setBusyId(null);
          if (!result.ok) {
            showToastOrAlert(failMessage(t, result));
            return;
          }
          documents.setData(list.filter((item) => item.id !== doc.id));
        },
      },
    ]);

  return (
    <SectionCard
      title={t('Organization documents')}
      icon="document-attach-outline"
      subtitle={t('Optional: upload the registration notice, latest changes or other documents (PDF or image).')}
    >
      <ResourceBody resource={documents} isEmpty={false}>
        <View style={{ gap: spacing.sm }}>
          {list.length === 0 ? <BodyText muted>{t('No document uploaded yet.')}</BodyText> : null}
          {list.map((doc) => (
            <View key={String(doc.id)} style={{ gap: spacing.xs }}>
              <InfoRow label={doc.title || t('Document')} value={formatDateTime(doc.uploaded_at || doc.created_at)} />
              {doc.status ? <BodyText muted>{`${t('Status')}: ${doc.status_label || doc.status}`}</BodyText> : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {doc.url ? (
                  <ActionButton title={t('View')} variant="outline" style={{ flex: 1 }} onPress={() => Linking.openURL(doc.url)} />
                ) : null}
                <ActionButton
                  title={t('Delete')}
                  variant="dangerOutline"
                  style={{ flex: 1 }}
                  loading={busyId === doc.id}
                  onPress={() => remove(doc)}
                />
              </View>
            </View>
          ))}
          <ActionButton title={t('Upload document')} icon="cloud-upload-outline" loading={uploading} onPress={pickAndUpload} />
        </View>
      </ResourceBody>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// کاربران مجاز سازمان
// ---------------------------------------------------------------------------
const IR_MOBILE = /^09\d{9}$/;
const toLatinDigits = (text) => String(text || '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export function AuthorizedUsersSection() {
  const { t } = useTranslation();
  const users = useRemoteResource(listAuthorizedUsers);
  const [adding, setAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const list = Array.isArray(users.data) ? users.data : [];

  const add = async () => {
    const normalizedMobile = toLatinDigits(mobile).trim();
    if (fullName.trim().length < 3) {
      showToastOrAlert(t('Please enter the full name.'));
      return;
    }
    if (!IR_MOBILE.test(normalizedMobile)) {
      showToastOrAlert(t('Please enter a valid mobile number (09xxxxxxxxx).'));
      return;
    }
    setBusy(true);
    const result = await addAuthorizedUser({
      full_name: fullName.trim(),
      mobile: normalizedMobile,
      ...(role.trim() ? { role: role.trim() } : {}),
    });
    setBusy(false);
    if (!result.ok) {
      showToastOrAlert(failMessage(t, result));
      return;
    }
    setAdding(false);
    setFullName('');
    setMobile('');
    setRole('');
    showToastOrAlert(result.message || t('The user was added.'));
    users.reload();
  };

  const remove = (user) =>
    showAlert(t('Remove user'), t('This user will no longer be able to act on behalf of the organization. Continue?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: async () => {
          setBusyId(user.id);
          const result = await removeAuthorizedUser(user.id);
          setBusyId(null);
          if (!result.ok) {
            showToastOrAlert(failMessage(t, result));
            return;
          }
          users.setData(list.filter((item) => item.id !== user.id));
        },
      },
    ]);

  return (
    <SectionCard title={t('Authorized organization users')} icon="people-outline">
      <ResourceBody resource={users}>
        <View style={{ gap: spacing.sm }}>
          {list.length === 0 ? <BodyText muted>{t('No authorized user has been added.')}</BodyText> : null}
          {list.map((user) => (
            <View key={String(user.id)} style={{ gap: spacing.xs }}>
              <InfoRow label={user.full_name || user.name || '-'} value={user.mobile} />
              {user.role ? <BodyText muted>{`${t('Role')}: ${user.role}`}</BodyText> : null}
              <ActionButton title={t('Remove')} variant="dangerOutline" loading={busyId === user.id} onPress={() => remove(user)} />
            </View>
          ))}
          {adding ? (
            <View style={{ gap: spacing.sm }}>
              <TextField value={fullName} onChangeText={setFullName} placeholder={t('Full name')} />
              <TextField value={mobile} onChangeText={setMobile} placeholder={t('Mobile number')} keyboardType="phone-pad" />
              <TextField value={role} onChangeText={setRole} placeholder={t('Role / job title (optional)')} />
              <ActionButton title={t('Add')} loading={busy} onPress={add} />
              <ActionButton title={t('Cancel')} variant="outline" onPress={() => setAdding(false)} />
            </View>
          ) : (
            <ActionButton title={t('Add authorized user')} variant="outline" icon="person-add-outline" onPress={() => setAdding(true)} />
          )}
        </View>
      </ResourceBody>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// درخواست ویرایش اطلاعات قفل‌شده (بند ۱۰)
// ---------------------------------------------------------------------------
// برچسب فیلدهای قفل؛ همان کلیدهای فرم پروفایل سازمانی.
export const LOCKED_FIELD_LABELS = {
  organization_name: 'Organization name',
  manager_mobile: 'Registered account mobile (manager mobile)',
  manager_national_code: 'Manager national ID',
  manager_full_name: 'CEO full name',
  business_name: 'Business name',
  melicode: 'Organization national ID',
  registration_number: 'Company registration number',
  economic_code: 'Economic code',
  manager_birthdate: 'Manager date of birth',
};

const EDIT_REQUEST_VIEW = {
  [EDIT_REQUEST_STATUS.PENDING]: { label: 'Awaiting admin review', tone: 'warning', icon: 'hourglass-outline' },
  [EDIT_REQUEST_STATUS.APPROVED]: { label: 'Approved - editing allowed', tone: 'success', icon: 'lock-open-outline' },
  [EDIT_REQUEST_STATUS.REJECTED]: { label: 'Rejected', tone: 'error', icon: 'close-circle' },
  [EDIT_REQUEST_STATUS.USED]: { label: 'Applied and locked again', tone: 'muted', icon: 'lock-closed-outline' },
};

/**
 * وضعیت آخرین «درخواست تغییر اطلاعات حساب کاربری» و فرم ثبت درخواست تازه.
 * نامه‌ی مهر و امضادار و توضیحات اجباری‌اند.
 *
 * @param {{ editState: ReturnType<import('@services/OrganizationAccountApi').readEditRequestState>, formOpen: boolean, onCloseForm: () => void, onSubmitted: () => void }} props
 */
export function OrganizationEditRequestCard({ editState, formOpen, onCloseForm, onSubmitted }) {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [letter, setLetter] = useState(null);
  const [fields, setFields] = useState([]);
  const [busy, setBusy] = useState(false);

  const { request: lastRequest, status, unlocked, unlockedFields } = editState;
  const view = EDIT_REQUEST_VIEW[status];

  if (!lastRequest && !formOpen && !unlocked) return null;

  const toggleField = (field) =>
    setFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));

  const pickLetter = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!picked.canceled && picked.assets?.length) setLetter(picked.assets[0]);
    } catch {
      showToastOrAlert(t('The operation failed. Please try again.'));
    }
  };

  const submit = async () => {
    if (!letter) {
      showToastOrAlert(t('Uploading the stamped and signed letter is required.'));
      return;
    }
    if (description.trim().length < 5) {
      showToastOrAlert(t('Please describe the changes you need.'));
      return;
    }
    setBusy(true);
    const result = await submitEditRequest({ description: description.trim(), letter, fields });
    setBusy(false);
    if (!result.ok) {
      showToastOrAlert(failMessage(t, result));
      return;
    }
    showToastOrAlert(result.message || t('Your edit request was sent to the admin panel.'));
    setDescription('');
    setLetter(null);
    setFields([]);
    onSubmitted?.();
  };

  return (
    <SectionCard title={t('Request to change account information')} icon="document-lock-outline">
      {unlocked ? (
        <View
          style={{
            backgroundColor: colors.success.bgColor(0.1),
            borderRadius: 8,
            padding: spacing.sm,
          }}
        >
          <BodyText bold style={{ color: colors.success.color }}>
            {t('Your edit request was approved. Tap «Edit» to change the unlocked fields; they lock again after you save.')}
          </BodyText>
          <BodyText muted>
            {unlockedFields.map((field) => t(LOCKED_FIELD_LABELS[field] || field)).join('، ')}
          </BodyText>
        </View>
      ) : null}

      {lastRequest && !unlocked ? (
        <View style={{ gap: spacing.xs }}>
          {view ? <StatusPill tone={view.tone} icon={view.icon} label={t(view.label)} /> : null}
          {lastRequest.createdAt ? <InfoRow label={t('Request date')} value={formatDateTime(lastRequest.createdAt)} /> : null}
          {lastRequest.description ? <BodyText muted>{lastRequest.description}</BodyText> : null}
          {lastRequest.adminNote ? (
            <BodyText>{`${t('Admin note')}: ${lastRequest.adminNote}`}</BodyText>
          ) : null}
          {lastRequest.letterUrl ? (
            <ActionButton title={t('View letter')} variant="outline" icon="document-outline" onPress={() => Linking.openURL(lastRequest.letterUrl)} />
          ) : null}
        </View>
      ) : null}

      {formOpen && editState.canRequest ? (
        <View style={{ gap: spacing.sm }}>
          <BodyText muted>
            {t('To change locked information (organization name, registered mobile, manager national ID and mobile, CEO name), upload an official letter with the organization stamp and signature. After the admin panel approves it, those fields can be edited once and are locked again after saving.')}
          </BodyText>
          <ActionButton
            title={letter ? letter.name : t('Upload stamped and signed letter (required)')}
            variant="outline"
            icon={letter ? 'document-attach' : 'cloud-upload-outline'}
            onPress={pickLetter}
          />
          <TextField
            value={description}
            onChangeText={setDescription}
            placeholder={t('Description of the requested changes (required)')}
            multiline
          />
          <BodyText bold>{t('Fields to change (optional)')}</BodyText>
          {LOCKED_PROFILE_FIELDS.map((field) => (
            <ChoiceRow
              key={field}
              multi
              label={t(LOCKED_FIELD_LABELS[field])}
              selected={fields.includes(field)}
              onPress={() => toggleField(field)}
            />
          ))}
          <ActionButton title={t('Send request')} icon="send-outline" loading={busy} onPress={submit} />
          <ActionButton title={t('Cancel')} variant="outline" disabled={busy} onPress={onCloseForm} />
        </View>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// نسخه‌ی اپ و بروزرسانی
// ---------------------------------------------------------------------------
export function AppVersionRow() {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const version = getAppVersion() || '-';

  const check = async () => {
    setChecking(true);
    const result = await checkAppVersion();
    setChecking(false);
    if (!result.ok) {
      showToastOrAlert(
        isNotImplemented(result)
          ? t('Checking for updates will be available soon.')
          : result.message || t('The operation failed. Please try again.')
      );
      return;
    }
    const info = result.data || {};
    if (info.update_available && info.update_url) {
      showAlert(
        t('Update available'),
        t('Version {{version}} of the app is available.', { version: info.latest_version || '' }),
        [
          ...(info.force ? [] : [{ text: t('Later'), style: 'cancel' }]),
          { text: t('Update'), onPress: () => Linking.openURL(info.update_url) },
        ]
      );
    } else {
      showToastOrAlert(t('You are using the latest version.'));
    }
  };

  return (
    <NavRow
      icon="cloud-download-outline"
      title={t('Update the app')}
      subtitle={`${t('Version')} ${version}`}
      onPress={checking ? undefined : check}
    />
  );
}

/** ردیف‌های «امنیت حساب / تأیید دومرحله‌ای / بروزرسانی / حذف حساب» در پروفایل. */
export function AccountActionsCard({ navigation, isOrganization }) {
  const { t } = useTranslation();
  return (
    <SectionCard style={{ paddingVertical: spacing.xs }}>
      <NavRow
        icon="shield-half-outline"
        title={t('Account security')}
        subtitle={t('Two-step verification, devices, sessions, alerts')}
        onPress={() => navigation.navigate('AccountSecurity')}
      />
      <NavRow
        icon="shield-checkmark-outline"
        title={t('Two-step verification')}
        onPress={() => navigation.navigate('AccountSecurity', { section: 'two_factor' })}
      />
      <AppVersionRow />
      <NavRow
        icon="trash-outline"
        danger
        title={isOrganization ? t('Delete organization / company account') : t('Delete account')}
        subtitle={isOrganization ? t('Carried out after review and approval by the admin panel.') : null}
        onPress={() => navigation.navigate('AccountSecurity', { section: 'delete' })}
      />
    </SectionCard>
  );
}
