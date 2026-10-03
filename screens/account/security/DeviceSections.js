// ۳. دستگاه‌های واردشده، ۴. خروج از سایر دستگاه‌ها، ۶. مدیریت نشست‌ها.
//
// تفاوت دستگاه و نشست (طبق سند): دستگاه = روی کدام دستگاه‌ها حساب فعال است؛
// نشست = کدام Session/Tokenها در سیستم فعال‌اند. اگر بک‌اند نشست‌ها را جدا
// مدیریت نکند (`sessions_supported: false` در خلاصه)، بخش نشست‌ها پنهان می‌شود.
import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDateTime, showAlert, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import {
  ActionButton,
  BodyText,
  ComingSoonNote,
  InfoRow,
  ResourceBody,
  StatusPill,
  useDir,
} from '@components/account/AccountUI';
import { endSession, isNotImplemented, logoutDevice, logoutOtherDevices } from '@services/AccountSecurityApi';
import { DEVICE_TYPE_ICONS, otherDevicesCount, shortId } from '@services/accountSecurityLabels';

const CardHeader = ({ children }) => {
  const dir = useDir();
  return <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>{children}</View>;
};

const ItemCard = ({ children, highlighted }) => (
  <View
    style={{
      borderWidth: 1,
      borderColor: highlighted ? colors.primary.bgColor(0.5) : colors.border.bgColor(1),
      backgroundColor: highlighted ? colors.primary.bgColor(0.04) : colors.surface.bgColor(1),
      borderRadius: radius.sm,
      padding: spacing.md,
      gap: spacing.xs,
    }}
  >
    {children}
  </View>
);

const failMessage = (t, result) =>
  isNotImplemented(result)
    ? t('This feature will be available soon.')
    : result?.message || t('The operation failed. Please try again.');

// ---------------------------------------------------------------------------
export function DevicesSection({ devices }) {
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState(null);
  const list = Array.isArray(devices.data) ? devices.data : [];

  const handleLogout = (device) =>
    showAlert(t('Log out of this device'), t('This device will be signed out of your account. Continue?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Log Out'),
        style: 'destructive',
        onPress: async () => {
          setBusyId(device.id);
          const result = await logoutDevice(device.id);
          setBusyId(null);
          if (!result.ok) {
            showToastOrAlert(failMessage(t, result));
            return;
          }
          devices.setData(list.filter((item) => item.id !== device.id));
          showToastOrAlert(result.message || t('The device was signed out.'));
        },
      },
    ]);

  return (
    <ResourceBody resource={devices} isEmpty={list.length === 0} emptyText={t('No device found.')}>
      <View style={{ gap: spacing.sm }}>
        {list.map((device) => (
          <ItemCard key={String(device.id)} highlighted={device.is_current}>
            <CardHeader>
              <Ionicons name={DEVICE_TYPE_ICONS[device.device_type] || 'hardware-chip-outline'} size={20} color={colors.primary.color} />
              <BodyText bold style={{ flex: 1 }}>{device.device_model || t('Unknown device')}</BodyText>
              <StatusPill tone={device.is_current ? 'success' : 'info'} label={device.is_current ? t('Current device') : t('Active status')} />
            </CardHeader>
            <InfoRow label={t('Operating system')} value={[device.os_name, device.os_version].filter(Boolean).join(' ')} />
            <InfoRow label={t('App version')} value={device.app_version} />
            <InfoRow label={t('Device ID')} value={shortId(device.device_id)} />
            <InfoRow label={t('Last connection IP')} value={device.last_ip} />
            {device.approx_location ? <InfoRow label={t('Approximate location')} value={device.approx_location} /> : null}
            <InfoRow label={t('Last activity')} value={formatDateTime(device.last_activity_at)} />
            {!device.is_current ? (
              <ActionButton
                title={t('Log out of this device')}
                variant="dangerOutline"
                loading={busyId === device.id}
                onPress={() => handleLogout(device)}
              />
            ) : null}
          </ItemCard>
        ))}
      </View>
    </ResourceBody>
  );
}

// ---------------------------------------------------------------------------
export function LogoutOthersSection({ devices }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const list = Array.isArray(devices.data) ? devices.data : [];
  const others = otherDevicesCount(list);

  const run = () =>
    showAlert(
      t('Log out of other devices'),
      t('{{count}} active devices. If you continue, your account will be signed out of {{others}} other devices.', {
        count: list.length,
        others,
      }),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Continue'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const result = await logoutOtherDevices();
            setBusy(false);
            if (!result.ok) {
              showToastOrAlert(failMessage(t, result));
              return;
            }
            devices.setData(list.filter((item) => item.is_current));
            showToastOrAlert(result.message || t('You were signed out of all other devices.'));
          },
        },
      ]
    );

  return (
    <ResourceBody resource={devices}>
      <View style={{ gap: spacing.sm }}>
        <InfoRow label={t('Active devices')} value={list.length} />
        <InfoRow label={t('Current device')} value={list.find((d) => d.is_current)?.device_model || t('This device')} />
        <InfoRow label={t('Other devices')} value={others} />
        <ActionButton
          title={t('Log out of other devices')}
          variant="danger"
          icon="log-out-outline"
          loading={busy}
          disabled={others === 0}
          onPress={run}
        />
      </View>
    </ResourceBody>
  );
}

// ---------------------------------------------------------------------------
export function SessionsSection({ sessions, supported }) {
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState(null);
  if (supported === false) return <ComingSoonNote text={t('Session management is not available for this account.')} />;
  const list = Array.isArray(sessions.data) ? sessions.data : [];

  const end = async (session) => {
    setBusyId(session.id);
    const result = await endSession(session.id);
    setBusyId(null);
    if (!result.ok) {
      showToastOrAlert(failMessage(t, result));
      return;
    }
    sessions.setData(list.filter((item) => item.id !== session.id));
    showToastOrAlert(result.message || t('The session was ended.'));
  };

  return (
    <ResourceBody resource={sessions} isEmpty={list.length === 0} emptyText={t('No active session found.')}>
      <View style={{ gap: spacing.sm }}>
        {list.map((session) => (
          <ItemCard key={String(session.id)} highlighted={session.is_current}>
            <CardHeader>
              <BodyText bold style={{ flex: 1 }}>{`${t('Session')} ${shortId(session.id)}`}</BodyText>
              <StatusPill
                tone={session.is_current ? 'success' : session.status === 'expired' ? 'muted' : 'info'}
                label={session.is_current ? t('Current device') : session.status === 'expired' ? t('Expired') : t('Active status')}
              />
            </CardHeader>
            <InfoRow label={t('Device')} value={session.device} />
            <InfoRow label={t('Operating system')} value={session.os} />
            <InfoRow label={t('App version')} value={session.app_version} />
            <InfoRow label="IP" value={session.ip} />
            <InfoRow label={t('Session created')} value={formatDateTime(session.created_at)} />
            <InfoRow label={t('Last activity')} value={formatDateTime(session.last_activity_at)} />
            <InfoRow label={t('Expires')} value={formatDateTime(session.expires_at)} />
            {!session.is_current ? (
              <ActionButton title={t('End session')} variant="dangerOutline" loading={busyId === session.id} onPress={() => end(session)} />
            ) : null}
          </ItemCard>
        ))}
      </View>
    </ResourceBody>
  );
}
