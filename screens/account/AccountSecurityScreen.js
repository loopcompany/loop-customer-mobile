// «امنیت حساب» - برای کاربر عادی و سازمانی / شرکتی / نیمه‌دولتی.
//
// نه بخش طبق سند «فیلد امنیت حساب در اپ کاربر. سازمانی»:
//   ۱ تأیید دومرحله‌ای  ۲ تغییر رمز عبور  ۳ دستگاه‌های واردشده  ۴ خروج از سایر
//   دستگاه‌ها  ۵ فعالیت‌های اخیر  ۶ مدیریت نشست‌ها  ۷ تأیید شماره موبایل
//   ۸ هشدارهای امنیتی  ۹ حذف حساب کاربری
//
// هر بخش فقط وقتی باز می‌شود داده‌اش را می‌خواند. endpointهای این صفحه
// (services/AccountSecurityApi.js) هنوز در بک‌اند پیاده نشده‌اند؛ تا آن موقع
// هر بخش «به‌زودی فعال می‌شود» نشان می‌دهد، نه خطا.
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import ScreenHeaders from '@components/ScreenHeaders';
import FooterSpacer from '@components/FooterSpacer';
import { spacing } from '@theme/Spacing';
import {
  ComingSoonNote,
  NavRow,
  RESOURCE_STATE,
  ResourceBody,
  SectionCard,
  useRemoteResource,
} from '@components/account/AccountUI';
import {
  getDeletionRequest,
  getSecuritySummary,
  listActivities,
  listDevices,
  listSecurityAlerts,
  listSessions,
} from '@services/AccountSecurityApi';
import { isOrganizationAccount } from '@services/receipt';
import TwoFactorSection from './security/TwoFactorSection';
import { DevicesSection, LogoutOthersSection, SessionsSection } from './security/DeviceSections';
import { ActivitySection, AlertsSection } from './security/ActivityAlertSections';
import MobileSection from './security/MobileSection';
import DeleteAccountSection from './security/DeleteAccountSection';

export const SECURITY_SECTIONS = {
  TWO_FACTOR: 'two_factor',
  PASSWORD: 'password',
  DEVICES: 'devices',
  LOGOUT_OTHERS: 'logout_others',
  ACTIVITY: 'activity',
  SESSIONS: 'sessions',
  MOBILE: 'mobile',
  ALERTS: 'alerts',
  DELETE: 'delete',
};
const S = SECURITY_SECTIONS;

export default function AccountSecurityScreen({ navigation, route }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const userType = useSelector((state) => state?.auth?.userType);
  const user = useSelector((state) => state?.user?.data);
  const isOrganization = userType === 'organization' || isOrganizationAccount(user?.account_type);

  const [expanded, setExpanded] = useState(route?.params?.section || null);
  // بخش‌هایی که خلاصه‌ی سرور گفته endpointشان نیست (یا خود بخش 404 گرفته).
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);

  const summary = useRemoteResource(getSecuritySummary);
  // هر بخش با اولین باز شدنش (و هر بار باز شدن دوباره) داده‌ی تازه می‌خواند.
  const devices = useRemoteResource(listDevices, {
    auto: expanded === S.DEVICES || expanded === S.LOGOUT_OTHERS,
  });
  const activities = useRemoteResource(() => listActivities(1), { auto: expanded === S.ACTIVITY });
  const sessions = useRemoteResource(listSessions, { auto: expanded === S.SESSIONS });
  const alerts = useRemoteResource(listSecurityAlerts, { auto: expanded === S.ALERTS });
  const deletion = useRemoteResource(getDeletionRequest, { auto: expanded === S.DELETE });
  const [unreadAlerts, setUnreadAlerts] = useState(null);

  // اگر صفحه از قبل در پشته باشد و دوباره با بخش دیگری باز شود (مثلاً «حذف حساب»).
  const requestedSection = route?.params?.section;
  const [lastRequested, setLastRequested] = useState(requestedSection);
  if (requestedSection !== lastRequested) {
    setLastRequested(requestedSection);
    if (requestedSection) setExpanded(requestedSection);
  }

  const toggle = useCallback((id) => setExpanded((prev) => (prev === id ? null : id)), []);

  const summaryData = summary.data || {};
  const summaryReady = summary.state === RESOURCE_STATE.READY && !summaryUnavailable;
  const twoFactorOn = Boolean(summaryData.two_factor?.enabled);
  const unread = unreadAlerts ?? summaryData.unread_alerts_count ?? 0;

  const summaryDependent = (render) => {
    if (summary.state === RESOURCE_STATE.UNAVAILABLE || summaryUnavailable) return <ComingSoonNote />;
    return <ResourceBody resource={summary}>{render()}</ResourceBody>;
  };

  const rows = [
    {
      id: S.TWO_FACTOR,
      icon: 'shield-checkmark-outline',
      title: t('Two-step verification'),
      badge: summaryReady ? { label: twoFactorOn ? t('Active status') : t('Inactive'), tone: twoFactorOn ? 'success' : 'muted' } : null,
      body: () =>
        summaryDependent(() => (
          <TwoFactorSection summary={summaryData} onChanged={summary.reload} onUnavailable={() => setSummaryUnavailable(true)} />
        )),
    },
    {
      id: S.PASSWORD,
      icon: 'key-outline',
      title: t('Change password'),
      // تغییر رمز از قبل در صفحه‌ی پروفایل هر نوع حساب پیاده شده است.
      onPress: () => navigation.navigate(isOrganization ? 'OrganizationProfile' : 'Profile'),
    },
    { id: S.DEVICES, icon: 'phone-portrait-outline', title: t('Signed-in devices'), body: () => <DevicesSection devices={devices} /> },
    { id: S.LOGOUT_OTHERS, icon: 'log-out-outline', title: t('Log out of other devices'), body: () => <LogoutOthersSection devices={devices} /> },
    { id: S.ACTIVITY, icon: 'time-outline', title: t('Recent account activity'), body: () => <ActivitySection activities={activities} /> },
    // اگر بک‌اند نشست‌ها را جدا از دستگاه‌ها مدیریت نکند، این ردیف حذف می‌شود.
    summaryData.sessions_supported === false
      ? null
      : { id: S.SESSIONS, icon: 'key-outline', title: t('Manage sessions'), body: () => <SessionsSection sessions={sessions} supported={summaryData.sessions_supported} /> },
    {
      id: S.MOBILE,
      icon: 'call-outline',
      title: t('Mobile number verification'),
      badge: summaryReady
        ? summaryData.mobile?.verified
          ? { label: t('Verified'), tone: 'success' }
          : { label: t('Not verified'), tone: 'warning' }
        : null,
      body: () =>
        summaryDependent(() => (
          <MobileSection summary={summaryData} onChanged={summary.reload} onUnavailable={() => setSummaryUnavailable(true)} />
        )),
    },
    {
      id: S.ALERTS,
      icon: 'notifications-outline',
      title: t('Security alerts'),
      badge: unread > 0 ? { label: String(unread), tone: 'warning' } : null,
      body: () => <AlertsSection alerts={alerts} onUnreadChange={setUnreadAlerts} />,
    },
    {
      id: S.DELETE,
      icon: 'trash-outline',
      title: isOrganization ? t('Delete organization / company account') : t('Delete account'),
      danger: true,
      body: () => <DeleteAccountSection deletion={deletion} isOrganization={isOrganization} />,
    },
  ].filter(Boolean);

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Account security')} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <SectionCard style={{ paddingVertical: spacing.xs }}>
          {rows.map((row) => (
            <View key={row.id}>
              <NavRow
                icon={row.icon}
                title={row.title}
                badge={row.badge}
                danger={row.danger}
                onPress={row.onPress || (() => toggle(row.id))}
              />
              {expanded === row.id && row.body ? (
                <View style={{ paddingVertical: spacing.md }}>{row.body()}</View>
              ) : null}
            </View>
          ))}
        </SectionCard>
        <FooterSpacer />
      </ScrollView>
    </SafeAreaView>
  );
}
