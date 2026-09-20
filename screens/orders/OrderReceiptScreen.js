// میزبانِ رسید سفارش.
//
// دو مسیر ورودی دارد و هر دو به یک کامپوننت می‌رسند:
//
//   • route.params.receipt  - رسیدِ از پیش ساخته‌شده. مسیرهای سازمانی
//     («انتخاب جامع» / «انتخاب سیستماتیک») سفارش را روی سرور ثبت نمی‌کنند،
//     پس رسیدشان از state محلی ساخته و مستقیم پاس داده می‌شود.
//   • route.params.orderId - سفارش واقعی؛ از `POST /orders/detail` خوانده
//     و با receiptFromOrderApi نرمال می‌شود.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomStatusBar from '@components/CustomStatusBar';
import ScreenHeaders from '@components/ScreenHeaders';
import Loader from '@components/Loader';
import Button from '@components/Button';
import OrderReceipt from '@components/receipt/OrderReceipt';
import { useMenu } from '@contexts/MenuContext';
import useReceiptSources from '@hooks/useReceiptSources';
import { showToastOrAlert } from '@helpers/Common';
import { describeApiError } from '@utils/apiErrorHandler';
import { shareContent, SHARE_RESULT } from '@utils/shareContent';
import axiosInstance from '@services/axiosConfig';
import { mainUri, uri } from '@services/URL';
import { RECEIPT_STATE, asReceipt, receiptFromOrderApi } from '@services/receipt';
import { spacing } from '@theme/Spacing';

/** متن اشتراک‌گذاری - خلاصه‌ی رسید، نه کل جدول‌ها. */
const shareText = (receipt) => {
  const lines = [
    `شماره سفارش: ${receipt.order.number ?? '—'}`,
    `وضعیت: ${receipt.state === RECEIPT_STATE.DONE ? 'انجام شد' : receipt.state === RECEIPT_STATE.FAILED ? 'ناموفق' : 'در انتظار تایید و پرداخت'}`,
    receipt.payment.payable != null ? `مبلغ قابل پرداخت: ${receipt.payment.payable} تومان` : null,
    `${mainUri}/orders/${receipt.order.number ?? ''}`,
  ];
  return lines.filter(Boolean).join('\n');
};

function OrderReceiptScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { footerSpace } = useMenu();

  // asReceipt: بعد از refreshِ صفحه روی وب، این param یک رشته است نه رسید.
  const prebuilt = asReceipt(route?.params?.receipt);
  const orderId = route?.params?.orderId ?? null;
  // مقصد «ثبت مجدد» را صفحه‌ی مبدا تعیین می‌کند؛ بدون آن دکمه رندر نمی‌شود.
  const reorder = route?.params?.reorder ?? null;

  // پشتیبانِ آدرس/تلفن ثابت/شماره ملی وقتی پاسخِ سرور `user_address` ندارد یا
  // آن رکورد ناقص است - شامل پروفایلِ واقعیِ حساب.
  const receiptSources = useReceiptSources();

  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId) && !prebuilt);
  const [refreshing, setRefreshing] = useState(false);

  // شمارنده‌ی بارگذاری مجدد - «کشیدن برای تازه‌سازی» همین را جلو می‌برد تا
  // افکت دوباره اجرا شود، به‌جای فراخوانی مستقیم تابعِ fetch.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!orderId) return undefined;

    // اگر کاربر پیش از رسیدن پاسخ صفحه را ترک کند، setState روی کامپوننتِ
    // unmount شده صدا زده می‌شد.
    let cancelled = false;

    (async () => {
      try {
        // apiClient بدون baseURL ساخته شده - مسیر کامل لازم است. توکن و
        // Accept-Language را خودِ interceptor اضافه می‌کند.
        const response = await axiosInstance.post(`${uri}/orders/detail`, { orderId });
        if (!cancelled) setFetched(response?.data ?? null);
      } catch (error) {
        if (!cancelled) showToastOrAlert(describeApiError(error, t));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, reloadToken, t]);

  const receipt = useMemo(() => {
    if (prebuilt) return prebuilt;
    if (!fetched) return null;
    return receiptFromOrderApi(fetched, receiptSources);
  }, [prebuilt, fetched, receiptSources]);

  const onShare = useCallback(async () => {
    if (!receipt) return;
    // shareContent روی وب به Web Share API و سپس کلیپ‌بورد برمی‌گردد؛ `Share`ی
    // react-native روی مرورگر خطای «not supported» می‌داد.
    const result = await shareContent({
      message: shareText(receipt),
      title: t('Receipt'),
    });
    if (result === SHARE_RESULT.COPIED) {
      showToastOrAlert(t('Receipt link copied'));
    } else if (result === SHARE_RESULT.FAILED) {
      showToastOrAlert(t('Sharing is not available on this device.'));
    }
  }, [receipt, t]);

  const onReorder = useCallback(() => {
    if (!reorder?.screen) return;
    navigation.navigate(reorder.screen, reorder.params ?? {});
  }, [navigation, reorder]);

  return (
    <ImageBackground
      source={require('@assets/moon.jpg')}
      style={{ flex: 1 }}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <CustomStatusBar />
      <ScreenHeaders title={t('Receipt')} />

      {loading ? (
        <Loader />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.huge + footerSpace,
            gap: spacing.md,
          }}
          refreshControl={
            orderId ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setReloadToken((token) => token + 1);
                }}
              />
            ) : undefined
          }
        >
          {receipt ? <OrderReceipt receipt={receipt} /> : null}

          {receipt ? (
            <View style={{ gap: spacing.sm }}>
              <Button title={t('Share')} onPress={onShare} style={styles.action} />
              {/* «ثبت مجدد» فقط روی رسید ناموفق معنا دارد - همان دکمه‌ای که
                  «توضیحات رسیدها.pdf» برای این گروه خواسته است. */}
              {reorder && receipt.state === RECEIPT_STATE.FAILED ? (
                <Button title={t('Reorder')} onPress={onReorder} style={styles.action} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </ImageBackground>
  );
}

const styles = {
  // Button خودش فقط minWidth دارد؛ برای تمام‌عرض شدن باید صریح گفته شود.
  action: { width: '100%' },
};

export default OrderReceiptScreen;
