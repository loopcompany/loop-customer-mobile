// ۵. فعالیت‌های اخیر حساب و ۸. هشدارهای امنیتی.
//
// «فعالیت‌ها» رویدادهای امنیتی و مهم حساب‌اند (ورود موفق/ناموفق، تغییر شماره،
// ...) و با «نشست‌ها» فرق دارند. هشدارها اطلاع‌رسانی اتفاقات حساس‌اند؛ اعلان
// هشدارهای معمولی قابل خاموش کردن است ولی هشدارهای «بحرانی» نه.
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import {
  ActionButton,
  BodyText,
  InfoRow,
  ResourceBody,
  StatusPill,
  useDir,
  useRemoteResource,
} from '@components/account/AccountUI';
import {
  getAlertSettings,
  isNotImplemented,
  markAlertRead,
  markAllAlertsRead,
  updateAlertSettings,
} from '@services/AccountSecurityApi';
import { activityLabel, alertTypeLabel, severityOf } from '@services/accountSecurityLabels';

const timeOf = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const Card = ({ children, unread }) => (
  <View
    style={{
      borderWidth: 1,
      borderColor: unread ? colors.warning.bgColor(0.7) : colors.border.bgColor(1),
      backgroundColor: unread ? colors.warning.bgColor(0.06) : colors.surface.bgColor(1),
      borderRadius: radius.sm,
      padding: spacing.md,
      gap: spacing.xs,
    }}
  >
    {children}
  </View>
);

// ---------------------------------------------------------------------------
export function ActivitySection({ activities }) {
  const { t } = useTranslation();
  const dir = useDir();
  const list = Array.isArray(activities.data) ? activities.data : [];

  return (
    <ResourceBody resource={activities} isEmpty={list.length === 0} emptyText={t('No activity recorded yet.')}>
      <View style={{ gap: spacing.sm }}>
        {list.map((item, index) => {
          const success = item.result !== 'failed';
          return (
            <Card key={String(item.id ?? index)}>
              <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
                <BodyText bold style={{ flex: 1 }}>{activityLabel(item)}</BodyText>
                <StatusPill tone={success ? 'success' : 'error'} label={success ? t('Successful') : t('Failed')} />
              </View>
              <InfoRow label={t('Event date')} value={formatDate(item.created_at)} />
              <InfoRow label={t('Event time')} value={timeOf(item.created_at)} />
              <InfoRow label={t('Device')} value={item.device} />
              <InfoRow label={t('Operating system')} value={item.os} />
              <InfoRow label="IP" value={item.ip} />
              {item.approx_location ? <InfoRow label={t('Approximate location')} value={item.approx_location} /> : null}
            </Card>
          );
        })}
      </View>
    </ResourceBody>
  );
}

// ---------------------------------------------------------------------------
export function AlertsSection({ alerts, onUnreadChange }) {
  const { t } = useTranslation();
  const dir = useDir();
  const settings = useRemoteResource(getAlertSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const list = Array.isArray(alerts.data) ? alerts.data : [];
  const unreadCount = list.filter((item) => !item.is_read).length;

  const setRead = (ids) => {
    const next = list.map((item) => (ids.includes(item.id) ? { ...item, is_read: true } : item));
    alerts.setData(next);
    onUnreadChange?.(next.filter((item) => !item.is_read).length);
  };

  const readOne = async (item) => {
    const result = await markAlertRead(item.id);
    if (result.ok) setRead([item.id]);
    else if (!isNotImplemented(result)) showToastOrAlert(result.message || t('The operation failed. Please try again.'));
  };

  const readAll = async () => {
    const result = await markAllAlertsRead();
    if (result.ok) setRead(list.map((item) => item.id));
    else showToastOrAlert(result.message || t('The operation failed. Please try again.'));
  };

  const notificationsEnabled = settings.data?.notifications_enabled !== false;
  const toggleNotifications = async (value) => {
    setSavingSettings(true);
    const result = await updateAlertSettings({ notifications_enabled: value });
    setSavingSettings(false);
    if (result.ok) settings.setData({ ...(settings.data || {}), notifications_enabled: value });
    else showToastOrAlert(result.message || t('The operation failed. Please try again.'));
  };

  return (
    <ResourceBody resource={alerts}>
      <View style={{ gap: spacing.sm }}>
        {settings.state === 'ready' ? (
          <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <BodyText bold>{t('Security notifications')}</BodyText>
              <BodyText muted>{t('Critical alerts are always sent and cannot be turned off.')}</BodyText>
            </View>
            <Switch value={notificationsEnabled} disabled={savingSettings} onValueChange={toggleNotifications} />
          </View>
        ) : null}

        {list.length === 0 ? <BodyText muted>{t('No security alert.')}</BodyText> : null}
        {unreadCount > 0 ? (
          <ActionButton title={`${t('Mark all as read')} (${unreadCount})`} variant="outline" onPress={readAll} />
        ) : null}

        {list.map((item, index) => {
          const severity = severityOf(item.severity);
          return (
            <Card key={String(item.id ?? index)} unread={!item.is_read}>
              <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
                <BodyText bold style={{ flex: 1 }}>{item.title || alertTypeLabel(item)}</BodyText>
                <StatusPill tone={severity.tone} label={`${t('Importance')}: ${severity.label}`} />
              </View>
              {item.message ? <BodyText>{item.message}</BodyText> : null}
              <InfoRow label={t('Alert type')} value={alertTypeLabel(item)} />
              <InfoRow label={t('Date and time')} value={`${formatDate(item.created_at)} ${timeOf(item.created_at)}`} />
              <InfoRow label={t('Device')} value={item.device} />
              <InfoRow label="IP" value={item.ip} />
              <InfoRow label={t('Status')} value={item.is_read ? t('Read') : t('Unread')} />
              {item.suggested_action ? (
                <BodyText muted>{`${t('Suggested action')}: ${item.suggested_action}`}</BodyText>
              ) : null}
              {!item.is_read ? <ActionButton title={t('Mark as read')} variant="outline" onPress={() => readOne(item)} /> : null}
            </Card>
          );
        })}
      </View>
    </ResourceBody>
  );
}
