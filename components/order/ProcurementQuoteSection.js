// «تامین کالا / استعلام قیمت» در جزئیات سفارش (بند ۱۱ سند کارفرما).
//
// مسیر: پیش‌رسید (اقلام تامین کالا) با ثبت سفارش به پنل می‌رود → پنل قیمت اعلام
// می‌کند و «این رسید تا پایان ساعات کاری روز جاری معتبر است» → کاربر تأیید
// می‌کند → پیش‌پرداخت (پیش‌فرض ۶۰٪، قابل تغییر در پنل) → لوپ کالا را آماده
// می‌کند → پرداخت باقی‌مانده → ارسال (لوپ / کاربر / پیک، بخش «مشخصات تحویل»).
//
// همه‌ی تصمیم‌ها و مبالغ از سرور می‌آیند (readProcurement)؛ این کامپوننت فقط
// نمایش و ارسال اقدام است.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatPrice, showAlert, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  InfoRow,
  SectionCard,
  StatusPill,
  TextField,
  useDir,
} from '@components/account/AccountUI';
import {
  PAYMENT_STAGE,
  PROCUREMENT_STATUS,
  acceptProcurementQuote,
  payProcurementStage,
  readProcurement,
  rejectProcurementQuote,
  requestProcurementRequote,
} from '@services/OrderFulfillmentApi';
import { isNotImplemented } from '@services/AccountSecurityApi';
import { fetchWalletBalance, selectWalletBalance } from '@slices/walletSlice';
import { fetchOrders } from '@slices/orderSlice';
import { createPaymentRedirectUrl, openPaymentGateway } from '@utils/paymentGateway';

const STATUS_TONE = {
  awaiting_quote: 'info',
  quoted: 'warning',
  accepted: 'warning',
  rejected: 'error',
  expired: 'error',
  preparing: 'info',
  ready: 'warning',
  shipped: 'info',
  delivered: 'success',
};

// کلیدهای i18n وضعیت (برچسب فارسی در fa.json است).
const STATUS_KEY = {
  awaiting_quote: 'Awaiting price quote',
  quoted: 'Prices announced - awaiting your confirmation',
  accepted: 'Confirmed - awaiting prepayment',
  rejected: 'Rejected',
  expired: 'Price inquiry expired',
  preparing: 'Preparing the goods',
  ready: 'Goods ready - awaiting remaining payment',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const money = (amount, t) => (amount == null ? '-' : `${formatPrice(amount)} ${t('Tomans')}`);

const ProcurementQuoteSection = ({ order, orderId, onUpdate }) => {
  const { t } = useTranslation();
  const dir = useDir();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const token = useSelector((state) => state?.auth?.token);
  const walletBalance = useSelector(selectWalletBalance);
  const quote = useMemo(() => readProcurement(order), [order]);

  const [busy, setBusy] = useState(null); // 'accept' | 'reject' | 'requote' | 'wallet' | 'gateway'
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const paymentSessionRef = useRef(null);

  useEffect(
    () => () => {
      paymentSessionRef.current?.close();
      paymentSessionRef.current = null;
    },
    []
  );

  if (!quote) return null;

  const refresh = () => {
    if (token) {
      dispatch(fetchOrders(token));
      dispatch(fetchWalletBalance(token));
    }
    onUpdate?.();
  };

  // نتیجه‌ی یکدست { ok, message, status } را به پیام تبدیل می‌کند.
  const report = (result, successText) => {
    if (result.ok) {
      showToastOrAlert(result.message || successText);
      refresh();
      return true;
    }
    showToastOrAlert(
      isNotImplemented(result)
        ? t('This feature will be available soon.')
        : result.message || t('An unexpected error occurred!')
    );
    return false;
  };

  const run = async (key, action, successText) => {
    setBusy(key);
    const result = await action();
    setBusy(null);
    return report(result, successText);
  };

  const confirmAccept = () =>
    showAlert(
      t('Confirm price inquiry'),
      t('Do you accept the announced prices? After confirmation, the prepayment must be paid.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('I accept'),
          onPress: () =>
            run('accept', () => acceptProcurementQuote(token, orderId), t('Prices confirmed.')),
        },
      ]
    );

  const submitReject = async () => {
    const ok = await run(
      'reject',
      () => rejectProcurementQuote(token, orderId, rejectReason.trim()),
      t('Price inquiry rejected.')
    );
    if (ok) {
      setShowReject(false);
      setRejectReason('');
    }
  };

  const stage = quote.payableStage;
  const stageAmount =
    stage === PAYMENT_STAGE.PREPAYMENT
      ? quote.payment.prepaymentAmount
      : quote.payment.remainingAmount;

  const payFromWallet = () =>
    run(
      'wallet',
      () => payProcurementStage(token, orderId, { stage, method: 'wallet' }),
      t('Payment completed successfully')
    );

  const payOnline = async () => {
    setBusy('gateway');
    const redirectUrl = createPaymentRedirectUrl();
    const result = await payProcurementStage(token, orderId, {
      stage,
      method: 'gateway',
      linkingUrl: redirectUrl,
    });
    const paymentUrl = result.data?.payment_url;
    if (!result.ok || !paymentUrl) {
      setBusy(null);
      report(result.ok ? { ok: false, message: t('Error connecting to payment gateway') } : result);
      return;
    }
    paymentSessionRef.current = openPaymentGateway({
      paymentUrl,
      redirectUrl,
      onResult: (status) => {
        setBusy(null);
        if (status === 'OK') {
          showToastOrAlert(t('Payment completed successfully'));
          refresh();
        } else if (status === 'NOK') {
          showToastOrAlert(t('The payment encountered an error.'));
        }
      },
    });
    if (!(await paymentSessionRef.current.opened)) {
      showToastOrAlert(t('Error connecting to payment gateway'));
      setBusy(null);
    }
  };

  const awaiting = quote.status === PROCUREMENT_STATUS.AWAITING_QUOTE;
  const hasPrices = !awaiting && quote.items.length > 0;

  return (
    <View style={{ width: '90%', alignSelf: 'center', marginBottom: spacing.md }}>
      <SectionCard
        title={t('Equipment supply / Price inquiry')}
        icon="cart-outline"
        right={
          <StatusPill
            label={t(STATUS_KEY[quote.status])}
            tone={STATUS_TONE[quote.status] || 'info'}
          />
        }
      >
        {awaiting ? (
          <BodyText muted>
            {t(
              'Your pre-receipt was sent to Loop for a price inquiry. The prices will appear here once announced.'
            )}
          </BodyText>
        ) : null}

        {hasPrices
          ? quote.items.map((item) => (
              <View
                key={item.key}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider.bgColor(1),
                  paddingVertical: spacing.xs,
                }}
              >
                <BodyText bold>
                  {item.title}
                  {item.condition
                    ? ` / ${item.condition === 'new' ? t('New / Sealed') : t('Used')}`
                    : ''}
                </BodyText>
                <InfoRow label={t('Quantity')} value={item.quantity} />
                <InfoRow label={t('Unit price')} value={money(item.unitPrice, t)} />
                <InfoRow label={t('Total')} value={money(item.totalPrice, t)} />
                {item.description ? <BodyText muted>{item.description}</BodyText> : null}
              </View>
            ))
          : null}

        {!awaiting ? (
          <InfoRow label={t('Total receipt amount')} value={money(quote.totalAmount, t)} />
        ) : null}

        {/* جمله‌ی اعتبار طبق سند - فقط مخصوص تامین کالای سازمانی/شرکتی. */}
        {!awaiting ? (
          <View
            style={{
              backgroundColor: colors.warning.bgColor(0.1),
              borderRadius: 8,
              padding: spacing.sm,
              gap: spacing.xs,
            }}
          >
            <BodyText bold style={{ color: colors.warning.color }}>
              {t('This receipt is valid until the end of working hours today.')}
            </BodyText>
            {quote.validUntil ? (
              <BodyText muted>
                {t('Valid until')}:{' '}
                {formatDateTime(quote.validUntil.toISOString(), dir.lang === 'fa')}
              </BodyText>
            ) : null}
          </View>
        ) : null}

        {quote.note ? (
          <View style={{ gap: spacing.xs }}>
            <BodyText bold>{t('Loop description')}</BodyText>
            <BodyText>{quote.note}</BodyText>
          </View>
        ) : null}

        {/* برنامه‌ی پرداخت: پیش‌پرداخت درصدی + باقی‌مانده پس از آماده‌سازی */}
        {!awaiting && quote.totalAmount != null ? (
          <View style={{ gap: spacing.xs }}>
            <InfoRow
              label={`${t('Prepayment')} (${quote.payment.percent}٪)`}
              value={money(quote.payment.prepaymentAmount, t)}
              valueColor={quote.payment.prepaymentPaid ? colors.success.color : undefined}
            />
            {quote.payment.prepaymentPaid ? (
              <InfoRow
                label={t('Prepayment paid at')}
                value={
                  quote.payment.prepaymentPaidAt
                    ? formatDateTime(
                        quote.payment.prepaymentPaidAt.toISOString(),
                        dir.lang === 'fa'
                      )
                    : t('Paid')
                }
              />
            ) : null}
            <InfoRow
              label={t('Remaining amount (after preparation)')}
              value={money(quote.payment.remainingAmount, t)}
              valueColor={quote.payment.remainingPaid ? colors.success.color : undefined}
            />
            {quote.payment.remainingPaid ? (
              <InfoRow
                label={t('Remaining paid at')}
                value={
                  quote.payment.remainingPaidAt
                    ? formatDateTime(quote.payment.remainingPaidAt.toISOString(), dir.lang === 'fa')
                    : t('Paid')
                }
              />
            ) : null}
            <BodyText muted>
              {t(
                'After the prices are confirmed, the prepayment is required. Once Loop has prepared the goods, the remaining amount must be paid before they are sent to you.'
              )}
            </BodyText>
          </View>
        ) : null}

        {quote.status === PROCUREMENT_STATUS.PREPARING ? (
          <BodyText muted>
            {t(
              'Loop is preparing your goods. You will be asked to pay the remaining amount when they are ready.'
            )}
          </BodyText>
        ) : null}

        {/* تأیید / رد قیمت‌ها */}
        {quote.canDecide ? (
          <View style={{ gap: spacing.sm }}>
            {showReject ? (
              <>
                <TextField
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder={t('Reason (optional)')}
                  multiline
                />
                <View style={{ flexDirection: dir.row, gap: spacing.sm }}>
                  <ActionButton
                    title={t('Reject prices')}
                    variant="danger"
                    loading={busy === 'reject'}
                    disabled={Boolean(busy)}
                    onPress={submitReject}
                    style={{ flex: 1 }}
                  />
                  <ActionButton
                    title={t('Cancel')}
                    variant="outline"
                    disabled={Boolean(busy)}
                    onPress={() => setShowReject(false)}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            ) : (
              <View style={{ flexDirection: dir.row, gap: spacing.sm }}>
                <ActionButton
                  title={t('Confirm prices')}
                  icon="checkmark-circle-outline"
                  loading={busy === 'accept'}
                  disabled={Boolean(busy)}
                  onPress={confirmAccept}
                  style={{ flex: 1 }}
                />
                <ActionButton
                  title={t('Reject prices')}
                  variant="dangerOutline"
                  disabled={Boolean(busy)}
                  onPress={() => setShowReject(true)}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        ) : null}

        {quote.canRequote ? (
          <ActionButton
            title={t('Request a new price inquiry')}
            icon="refresh-outline"
            variant="outline"
            loading={busy === 'requote'}
            disabled={Boolean(busy)}
            onPress={() =>
              run(
                'requote',
                () => requestProcurementRequote(token, orderId),
                t('A new price inquiry was requested.')
              )
            }
          />
        ) : null}

        {/* پرداخت پیش‌پرداخت یا باقی‌مانده */}
        {stage ? (
          <View style={{ gap: spacing.sm }}>
            <InfoRow
              label={
                stage === PAYMENT_STAGE.PREPAYMENT
                  ? t('Prepayment payable now')
                  : t('Remaining payable now')
              }
              value={money(stageAmount, t)}
            />
            <InfoRow label={t('Your wallet balance')} value={money(walletBalance, t)} />
            <View style={{ flexDirection: dir.row, gap: spacing.sm }}>
              <ActionButton
                title={t('Deduct cost from wallet')}
                loading={busy === 'wallet'}
                disabled={Boolean(busy)}
                onPress={payFromWallet}
                style={{ flex: 1 }}
              />
              <ActionButton
                title={t('Charge wallet')}
                variant="outline"
                disabled={Boolean(busy)}
                onPress={() => navigation.navigate('Increase')}
                style={{ flex: 1 }}
              />
            </View>
            <ActionButton
              title={t('Online payment')}
              icon="card-outline"
              loading={busy === 'gateway'}
              disabled={Boolean(busy)}
              onPress={payOnline}
            />
          </View>
        ) : null}
      </SectionCard>
    </View>
  );
};

export default ProcurementQuoteSection;
