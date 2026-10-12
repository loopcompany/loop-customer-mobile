// «کیف پول مأمور خرید» (بند ۹ سند «توضیحات اپ کاربر»).
//
// خلاصه‌ی پورسانت‌ها، فهرست پورسانت هر سفارش/رسید، برداشت به شبا (فوری یا پس
// از جمع شدن چند پورسانت) و «تهاتر» با خرید کالا / محصول از لوپ. ورود به این
// صفحه فقط از کیف پول و فقط برای کاربری است که سرور او را مأمور خرید معرفی کند.
import React, { useMemo, useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import ScreenHeaders from '@components/ScreenHeaders';
import FooterSpacer from '@components/FooterSpacer';
import { formatDateTime, formatPrice, showAlert, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  ChoiceRow,
  ComingSoonNote,
  InfoRow,
  RESOURCE_STATE,
  ResourceBody,
  SectionCard,
  StatusPill,
  TextField,
  useDir,
  useRemoteResource,
} from '@components/account/AccountUI';
import {
  COMMISSION_STATUS_KEYS,
  WITHDRAWAL_STATUS_KEYS,
  WITHDRAW_METHOD,
  getAgentSummary,
  listCommissions,
  listWithdrawals,
  normalizeSheba,
  parseAmount,
  readAgentSummary,
  requestWithdrawal,
  validateWithdrawal,
} from '@services/AgentWalletApi';
import { isNotImplemented } from '@services/AccountSecurityApi';
import { fetchWalletBalance } from '@slices/walletSlice';

const money = (amount, t) => `${formatPrice(Math.round(Number(amount) || 0))} ${t('Tomans')}`;

const COMMISSION_TONE = {
  pending: 'warning',
  available: 'success',
  withdrawn: 'muted',
  offset: 'info',
  canceled: 'error',
};
const WITHDRAWAL_TONE = {
  pending: 'warning',
  approved: 'info',
  paid: 'success',
  done: 'success',
  rejected: 'error',
};

export default function AgentWalletScreen() {
  const { t, i18n } = useTranslation();
  const dir = useDir();
  const dispatch = useDispatch();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const token = useSelector((state) => state?.auth?.token);
  const profileSheba = useSelector((state) => state?.user?.data?.sheba_number) || '';

  const summaryRes = useRemoteResource(() => getAgentSummary(token));
  const commissions = useRemoteResource(() => listCommissions(token));
  const withdrawals = useRemoteResource(() => listWithdrawals(token));
  const summary =
    summaryRes.state === RESOURCE_STATE.READY ? readAgentSummary(summaryRes.data) : null;

  const [method, setMethod] = useState(WITHDRAW_METHOD.SHEBA);
  const [amount, setAmount] = useState('');
  const [sheba, setSheba] = useState(null); // null = هنوز دست نخورده؛ از سرور/پروفایل پر می‌شود
  const [submitting, setSubmitting] = useState(false);

  const shebaValue = sheba ?? (summary?.shebaNumber || profileSheba || '');
  const available = summary?.availableBalance ?? 0;

  const fillPercent = (percent) => setAmount(String(Math.floor((available * percent) / 100)));

  const submit = () => {
    const error = validateWithdrawal({
      amount,
      method,
      sheba: shebaValue,
      available,
      minAmount: summary?.minWithdrawAmount,
    });
    if (error) {
      showToastOrAlert(t(error));
      return;
    }
    const value = parseAmount(amount);
    const isOffset = method === WITHDRAW_METHOD.OFFSET;
    showAlert(
      isOffset ? t('Offset against purchase') : t('Withdraw to bank account'),
      isOffset
        ? t(
            '{{amount}} will be moved to your Loop wallet to buy goods / products from Loop. Continue?',
            { amount: money(value, t) }
          )
        : t('{{amount}} will be paid to {{sheba}} after review. Continue?', {
            amount: money(value, t),
            sheba: normalizeSheba(shebaValue),
          }),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Confirm'),
          onPress: async () => {
            setSubmitting(true);
            const result = await requestWithdrawal(token, {
              amount: value,
              method,
              sheba: shebaValue,
            });
            setSubmitting(false);
            if (!result.ok) {
              showToastOrAlert(
                isNotImplemented(result)
                  ? t('This feature will be available soon.')
                  : result.message || t('The operation failed. Please try again.')
              );
              return;
            }
            showToastOrAlert(
              result.message ||
                (isOffset
                  ? t('The amount was added to your Loop wallet.')
                  : t('Your withdrawal request was registered.'))
            );
            setAmount('');
            summaryRes.reload();
            commissions.reload();
            withdrawals.reload();
            // تهاتر موجودی کیف پول لوپ را بالا می‌برد.
            if (isOffset && token) dispatch(fetchWalletBalance(token));
          },
        },
      ]
    );
  };

  const shareCode = () => {
    if (!summary?.referralCode) return;
    Share.share({ message: `${t('My Loop referral code')}: ${summary.referralCode}` }).catch(
      () => {}
    );
  };

  const commissionList = Array.isArray(commissions.data) ? commissions.data : [];
  const withdrawalList = Array.isArray(withdrawals.data) ? withdrawals.data : [];
  const notAgent = summaryRes.state === RESOURCE_STATE.READY && !summary;

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Purchase agent wallet')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard title={t('Commission summary')} icon="wallet-outline">
          <ResourceBody resource={summaryRes}>
            {notAgent ? (
              <ComingSoonNote
                text={t('This wallet is only for purchase agents with a referral code.')}
              />
            ) : summary ? (
              <View>
                {summary.referralCode ? (
                  <View
                    style={{
                      flexDirection: dir.row,
                      alignItems: 'center',
                      gap: spacing.sm,
                      marginBottom: spacing.sm,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <InfoRow label={t('Your referral code')} value={summary.referralCode} />
                    </View>
                    <ActionButton
                      title={t('Share')}
                      variant="outline"
                      icon="share-social-outline"
                      onPress={shareCode}
                    />
                  </View>
                ) : null}
                {summary.commissionPercent != null ? (
                  <InfoRow
                    label={t('Your commission rate')}
                    value={`${summary.commissionPercent}٪`}
                  />
                ) : null}
                <InfoRow
                  label={t('Available for withdrawal')}
                  value={money(summary.availableBalance, t)}
                  valueColor={colors.success.color}
                />
                <InfoRow label={t('Pending settlement')} value={money(summary.pendingBalance, t)} />
                <InfoRow label={t('Total earned')} value={money(summary.totalEarned, t)} />
                <InfoRow label={t('Total withdrawn')} value={money(summary.totalWithdrawn, t)} />
                <InfoRow
                  label={t('Total offset against purchases')}
                  value={money(summary.totalOffset, t)}
                />
                <BodyText muted>
                  {t(
                    'A commission becomes available once its order is registered and fully settled.'
                  )}
                </BodyText>
              </View>
            ) : null}
          </ResourceBody>
        </SectionCard>

        {summary ? (
          <SectionCard title={t('Withdraw or offset')} icon="swap-horizontal-outline">
            <ChoiceRow
              label={t('Withdraw to bank account (Sheba)')}
              subtitle={t('Withdraw now, or after several commissions add up.')}
              selected={method === WITHDRAW_METHOD.SHEBA}
              onPress={() => setMethod(WITHDRAW_METHOD.SHEBA)}
            />
            <ChoiceRow
              label={t('Offset against buying goods / products from Loop')}
              subtitle={t('Instead of a bank transfer, the amount goes to your Loop wallet.')}
              selected={method === WITHDRAW_METHOD.OFFSET}
              onPress={() => setMethod(WITHDRAW_METHOD.OFFSET)}
            />
            <TextField
              value={amount}
              onChangeText={setAmount}
              placeholder={t('Amount (Tomans)')}
              keyboardType="number-pad"
            />
            <View style={{ flexDirection: dir.row, gap: spacing.sm }}>
              {[25, 50, 100].map((percent) => (
                <ActionButton
                  key={percent}
                  title={percent === 100 ? t('All') : `${percent}٪`}
                  variant="outline"
                  onPress={() => fillPercent(percent)}
                  disabled={!available}
                  style={{ flex: 1, paddingHorizontal: spacing.xs }}
                />
              ))}
            </View>
            {method === WITHDRAW_METHOD.SHEBA ? (
              <TextField
                value={shebaValue}
                onChangeText={setSheba}
                placeholder={t('Sheba number (IR...)')}
              />
            ) : null}
            {summary.minWithdrawAmount && method === WITHDRAW_METHOD.SHEBA ? (
              <BodyText
                muted
              >{`${t('Minimum withdrawal')}: ${money(summary.minWithdrawAmount, t)}`}</BodyText>
            ) : null}
            <ActionButton
              title={
                method === WITHDRAW_METHOD.OFFSET
                  ? t('Offset against purchase')
                  : t('Request withdrawal')
              }
              icon={method === WITHDRAW_METHOD.OFFSET ? 'cart-outline' : 'cash-outline'}
              loading={submitting}
              disabled={!available}
              onPress={submit}
            />
          </SectionCard>
        ) : null}

        {summary ? (
          <SectionCard title={t('Commissions per order')} icon="receipt-outline">
            <ResourceBody
              resource={commissions}
              isEmpty={commissionList.length === 0}
              emptyText={t('No commission yet.')}
            >
              <View style={{ gap: spacing.sm }}>
                {commissionList.map((item) => (
                  <View
                    key={String(item.id)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider.bgColor(1),
                      paddingBottom: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: dir.row,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <BodyText bold>{`${t('Order')} #${item.order_id ?? '-'}`}</BodyText>
                      {COMMISSION_STATUS_KEYS[item.status] ? (
                        <StatusPill
                          label={t(COMMISSION_STATUS_KEYS[item.status])}
                          tone={COMMISSION_TONE[item.status]}
                        />
                      ) : null}
                    </View>
                    <InfoRow label={t('Order amount')} value={money(item.order_amount, t)} />
                    <InfoRow
                      label={`${t('Commission')}${item.commission_percent != null ? ` (${item.commission_percent}٪)` : ''}`}
                      value={money(item.commission_amount, t)}
                    />
                    <InfoRow
                      label={t('Date')}
                      value={formatDateTime(item.settled_at || item.created_at)}
                    />
                  </View>
                ))}
              </View>
            </ResourceBody>
          </SectionCard>
        ) : null}

        {summary ? (
          <SectionCard title={t('Withdrawal history')} icon="time-outline">
            <ResourceBody
              resource={withdrawals}
              isEmpty={withdrawalList.length === 0}
              emptyText={t('No withdrawal yet.')}
            >
              <View style={{ gap: spacing.sm }}>
                {withdrawalList.map((item) => (
                  <View
                    key={String(item.id)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider.bgColor(1),
                      paddingBottom: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: dir.row,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <BodyText bold>
                        {item.method === WITHDRAW_METHOD.OFFSET
                          ? t('Offset against purchase')
                          : t('Withdraw to bank account')}
                      </BodyText>
                      {WITHDRAWAL_STATUS_KEYS[item.status] ? (
                        <StatusPill
                          label={t(WITHDRAWAL_STATUS_KEYS[item.status])}
                          tone={WITHDRAWAL_TONE[item.status]}
                        />
                      ) : null}
                    </View>
                    <InfoRow label={t('Amount')} value={money(item.amount, t)} />
                    {item.sheba_number ? (
                      <InfoRow label={t('Sheba')} value={item.sheba_number} />
                    ) : null}
                    {item.tracking_code ? (
                      <InfoRow label={t('Tracking code')} value={item.tracking_code} />
                    ) : null}
                    <InfoRow
                      label={t('Date')}
                      value={formatDateTime(item.processed_at || item.created_at)}
                    />
                    {item.admin_note ? <BodyText muted>{item.admin_note}</BodyText> : null}
                  </View>
                ))}
              </View>
            </ResourceBody>
          </SectionCard>
        ) : null}
        <FooterSpacer />
      </ScrollView>
    </SafeAreaView>
  );
}
