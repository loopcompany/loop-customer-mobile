// screens/orders/OrderSummaryScreen.js
//
// پیش‌نمایش نهایی ثبت سفارش.
//
// این صفحه هیچ داده‌ی نمونه‌ای ندارد: همه‌ی مقادیر یا از route.params می‌آیند
// (صفحه‌ای که کاربر از آن «ثبت سفارش» را زده) یا از Redux خوانده می‌شوند.
// قرارداد پارامترها:
//   orderTitle    : string  - عنوان سفارش
//   summaryLines  : [{label, value}] - خلاصه‌ی واقعی انتخاب‌های کاربر
//   schedule      : {date, slot} - تاریخ (قالب DatePicker) و شناسه‌ی بازه‌ی ساعتی
//   contact       : {fullName, mobile} - اطلاعات تماس واردشده در همان فرم
//   price         : number|null - اگر مبلغ قطعی نیست null بماند تا «استعلام» نمایش داده شود

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import NewStyles from '@styles/NewStyles';
import CustomStatusBar from '@components/CustomStatusBar';
import ScreenTitle from '@components/ScreenTitle';
import { notificationAPI } from '@services/NotificationService';
import apiClient from '@services/axiosConfig';
import { uri } from '@services/URL';
import { API_ENDPOINTS } from '@services/ApiEndpoints';
import { describeApiError } from '@utils/apiErrorHandler';
import { describePickerDate, parsePickerDate, showToastOrAlert } from '@helpers/Common';
import { TIME_SLOT_OPTIONS } from '@org/deviceCatalog';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { createDirectionalStyles } from '@styles/directionalStyles';
import OrderReceipt from '@components/receipt/OrderReceipt';
import {
  asReceipt,
  isOrganizationAccount,
  pickSavedAddress,
  resolveCustomer,
} from '@services/receipt';
import useReceiptSources from '@hooks/useReceiptSources';
import FooterSpacer from '@components/FooterSpacer';
import OrderCodesSection from '@components/OrderCodesSection';
import usePromoCode from '@hooks/usePromoCode';
import useReferralCode from '@hooks/useReferralCode';

// این دو کلید تنها fallbackهایی هستند که describeApiError صدا می‌زند؛ این
// صفحه از i18next استفاده نمی‌کند (L()/LO() فارسی محلی‌اش را دارد) پس یک
// مترجم کوچک محلی برای همین دو مورد کافی است.
const describeErrorFa = (key) =>
  ({
    'Network error!': 'اتصال به اینترنت برقرار نیست. لطفاً دوباره تلاش کنید.',
    'An unexpected error occurred!': 'خطای غیرمنتظره‌ای رخ داد.',
  })[key] || key;

const NOT_SET = 'ثبت نشده';

export default function OrderSummaryScreen({ navigation, route }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(NOT_SET);

  const params = route?.params || {};
  const {
    source,
    categoryId,
    orderTitle,
    categoryTitle,
    summaryLines = [],
    schedule,
    contact,
    price = null,
    currency = 'تومان',
    // رسیدِ از پیش ساخته‌شده توسط صفحه‌ی مبدا (مسیرهای سازمانی).
    receipt: receiptParam = null,
  } = params;

  // بعد از refreshِ صفحه روی وب این param رشته‌ی «[object Object]» است، نه رسید.
  const receipt = asReceipt(receiptParam);

  // همان منابعی که رسید از آن‌ها ساخته می‌شود - تا این خلاصه و رسیدِ بعدش یک
  // آدرس و یک شماره نشان دهند.
  const receiptSources = useReceiptSources();
  const { user, addresses: savedAddresses, selectedAddressId } = receiptSources;
  const addressDraft = useSelector((state) => state?.address);

  // تاریخ و ساعت مراجعه از همان انتخابگری که کاربر پر کرده است.
  const scheduleDate = schedule?.date;
  const scheduleSlot = schedule?.slot;

  const visitDate = useMemo(() => {
    if (!scheduleDate) return NOT_SET;
    const described = describePickerDate(scheduleDate);
    return described ? `${described.weekday} ${described.dayLabel}` : scheduleDate;
  }, [scheduleDate]);

  const visitTime = useMemo(() => {
    if (!scheduleSlot) return NOT_SET;
    return TIME_SLOT_OPTIONS.find((opt) => opt.id === scheduleSlot)?.title || scheduleSlot;
  }, [scheduleSlot]);

  // آدرس/شماره/نام از همان زنجیره‌ی fallbackی می‌آیند که رسید استفاده می‌کند
  // (آدرسِ انتخاب‌شده → اولین آدرسِ ذخیره‌شده → فرمِ در حال ویرایش → پروفایل
  // حساب). قبلاً این صفحه زنجیره‌ی خودش را داشت و ته آن `state.user.data` بود،
  // که آدرس و تلفن ثابت ندارد.
  const customer = useMemo(
    () =>
      resolveCustomer({
        ...receiptSources,
        isOrganization: isOrganizationAccount(receiptSources.user?.account_type),
        name: contact?.fullName || null,
        phone: contact?.mobile || null,
        addressDraft,
      }),
    [receiptSources, contact?.fullName, contact?.mobile, addressDraft]
  );

  const address = customer.address || NOT_SET;
  const phone = customer.phone || NOT_SET;
  const customerName = customer.name || '';

  const orderType = orderTitle || categoryTitle || NOT_SET;

  // کد تخفیف و کد معرف، مثل صفحه‌ی پیش‌نمایش سفارشِ دسته‌های عادی. بررسی کد
  // تخفیف به category_id نیاز ندارد؛ `/promo-codes/check` فقط خود کد را می‌گیرد.
  const token = useSelector((state) => state?.auth?.token);
  const promo = usePromoCode({ token });
  const referral = useReferralCode({ token });

  return (
    <ImageBackground
      source={require('@assets/moon.jpg')}
      style={NewStyles.container}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <CustomStatusBar />
      <View style={{ padding: spacing.md }}>
        <ScreenTitle title={'پیش‌نمایش نهایی ثبت سفارش'} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* وقتی صفحه‌ی مبدا رسید را ساخته باشد، همان رسید نشان داده می‌شود تا
            «پیش‌نمایش نهایی» دقیقاً همان چیزی باشد که کاربر بعد از ثبت می‌بیند.
            ورودی‌های دیگرِ این صفحه (مثلاً نوتیفیکیشن) رسید ندارند و خلاصه‌ی
            قبلی برایشان می‌ماند. */}
        {receipt ? (
          <OrderReceipt receipt={receipt} />
        ) : (
          <>
            <View style={styles.card}>
              <Text style={NewStyles.title10}>نوع سفارش:</Text>
              <Text style={NewStyles.text10}>{orderType}</Text>

              <Text style={NewStyles.title10}>تاریخ مراجعه:</Text>
              <Text style={NewStyles.text10}>{visitDate}</Text>

              <Text style={NewStyles.title10}>ساعت مراجعه:</Text>
              <Text style={NewStyles.text10}>{visitTime}</Text>

              <Text style={NewStyles.title10}>آدرس:</Text>
              <Text style={NewStyles.text10}>{address}</Text>

              <Text style={NewStyles.title10}>شماره تماس:</Text>
              <Text style={NewStyles.text10}>{phone}</Text>

              <Text style={NewStyles.title10}>هزینه:</Text>
              <Text style={[NewStyles.text11, styles.priceText]}>
                {price > 0
                  ? `${price.toLocaleString('fa-IR')} ${currency}`
                  : 'پس از بررسی کارشناس اعلام می‌شود'}
              </Text>

              <Text style={NewStyles.title10}>وضعیت سفارش:</Text>
              <Text style={NewStyles.text11}>{status}</Text>
            </View>

            {/* خلاصه‌ی واقعی انتخاب‌های کاربر در فرم قبلی */}
            {summaryLines.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.summaryTitle}>جزئیات انتخاب‌های شما</Text>
                {summaryLines.map((line, idx) => (
                  <View key={`${line.label}-${idx}`} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{line.label}</Text>
                    <Text style={styles.summaryValue}>{line.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.codesCard}>
          <OrderCodesSection promo={promo} referral={referral} />
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.goBack()}>
          <Text style={NewStyles.text4}>ویرایش اطلاعات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={async () => {
            if (isSubmitting) return;

            // کدِ تایپ‌شده ولی تأییدنشده نه بی‌صدا حذف می‌شود و نه کور ارسال؛
            // ثبت متوقف می‌شود و دلیلش گفته می‌شود.
            if (promo.needsCheck) {
              showToastOrAlert('لطفاً کد تخفیف را تأیید کنید یا آن را پاک کنید.');
              return;
            }
            if (referral.needsCheck) {
              showToastOrAlert('لطفاً کد معرف را ثبت کنید یا آن را پاک کنید.');
              return;
            }
            setIsSubmitting(true);

            // آدرس: این مسیر (سیستماتیک/جامع سازمانی) مرحله‌ی انتخاب آدرس ندارد.
            // آدرس‌های حساب سازمانی در لاگین (`fetchAddresses`) بارگذاری شده‌اند؛
            // همان آدرسِ انتخاب‌شده‌ی مسیر عادی را در نبودش، اولین آدرس ذخیره‌شده
            // را استفاده می‌کنیم. بدون هیچ آدرسی، ادامه نمی‌دهیم.
            const resolvedAddressId =
              pickSavedAddress(savedAddresses, selectedAddressId)?.id ?? null;
            if (!resolvedAddressId) {
              showToastOrAlert('برای ثبت سفارش، ابتدا یک آدرس در پروفایل خود ثبت کنید.');
              setIsSubmitting(false);
              return;
            }

            // category_id واقعی بک‌اند: «جامع» عدد ثابت ۳ را می‌فرستد و «سیستماتیک»
            // id عددی همان کاشی API را که کاربر رویش زده. بک‌اند فقط عدد صحیح
            // می‌پذیرد، پس هر چیز دیگری (مثل کلید محلی 'laptop') همین‌جا رد می‌شود.
            const resolvedCategoryId = Number(categoryId);
            if (categoryId == null || !Number.isInteger(resolvedCategoryId)) {
              showToastOrAlert(
                source === 'systematic'
                  ? 'شناسه‌ی این دسته از سرور دریافت نشده است. صفحه‌ی دسته‌ها را دوباره باز کنید و مجدداً تلاش کنید.'
                  : 'دسته‌بندی سفارش نامعتبر است.'
              );
              setIsSubmitting(false);
              return;
            }

            const parsedDate = parsePickerDate(scheduleDate);
            const apiDate = parsedDate
              ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
              : null;
            const slotOption = TIME_SLOT_OPTIONS.find((opt) => opt.id === scheduleSlot);
            const apiTime = slotOption ? `${String(slotOption.start).padStart(2, '0')}:00` : null;

            let realOrderId = null;
            try {
              const orderPayload = {
                address_id: resolvedAddressId,
                category_id: resolvedCategoryId,
                // این مسیرها هنوز مراحل قیمت‌دار واقعی (steps/fetch) را نمی‌خوانند،
                // پس فعلاً همان قیمتِ محاسبه‌شده‌ی محلی (یا ۰ برای سفارش استعلامی)
                // فرستاده می‌شود - در انتظار تأیید بک‌اند برای این دسته‌ها.
                total_price: price > 0 ? price : 0,
                date: apiDate,
                time: apiTime,
                description: summaryLines.map((line) => `${line.label}: ${line.value}`).join('\n'),
                platform: Platform.OS,
                steps: [],
                file_paths: [],
              };
              // فقط کدهای تأییدشده، دقیقاً همان رشته‌ای که سرور به رسمیت شناخته.
              // کد تخفیف فقط در `promo_code` — قرارداد FRONTEND_PROMO_CODES.md.
              if (promo.appliedCode) orderPayload.promo_code = promo.appliedCode;
              if (referral.appliedCode) orderPayload.referral_code = referral.appliedCode;
              const response = await apiClient.post(
                `${uri}${API_ENDPOINTS.ORDERS.CREATE}`,
                orderPayload
              );

              const body = response?.data;
              const orderCreated =
                (response.status === 200 || response.status === 201) && body?.success !== false;
              if (!orderCreated) {
                if (body?.error_code === 'INVALID_REFERRAL_CODE') referral.reject(body?.message);
                // سرور کد تخفیف را هنگام ثبت دوباره بررسی می‌کند و می‌تواند ردش کند.
                if (body?.error_code === 'INVALID_PROMO_CODE') promo.reject(body?.message);
                showToastOrAlert(body?.message || 'ثبت سفارش ناموفق بود.');
                setIsSubmitting(false);
                return;
              }
              realOrderId = body?.data?.order_id ?? body?.data?.order?.id ?? null;
            } catch (error) {
              // ۴۰۹ (کد معرفِ نامعتبر) در catch می‌افتد نه در شاخه‌ی بالا.
              if (error?.response?.data?.error_code === 'INVALID_REFERRAL_CODE') {
                referral.reject(error?.response?.data?.message);
              }
              if (error?.response?.data?.error_code === 'INVALID_PROMO_CODE') {
                promo.reject(error?.response?.data?.message);
              }
              showToastOrAlert(describeApiError(error, describeErrorFa));
              setIsSubmitting(false);
              return;
            }

            const orderNumber = String(realOrderId ?? '');

            // پیامک تاییدیه «بهترین-تلاش» است و نباید ثبت سفارشِ واقعی (که بالا
            // انجام شد) را شکست بدهد.
            let smsSent = true;
            try {
              await notificationAPI.sendOrderConfirmation(orderNumber, {
                phone,
                type: orderType,
                date: scheduleDate || '',
                time: visitTime,
                address,
                customerName,
                price,
                items: summaryLines,
              });
            } catch (error) {
              smsSent = false;
              console.warn(
                'Order confirmation SMS failed (order still submitted):',
                error?.message
              );
            }

            setStatus('در حال بررسی');
            showToastOrAlert(
              smsSent
                ? 'سفارش با موفقیت ثبت شد. پیامک تایید برای شما ارسال شد.'
                : 'سفارش با موفقیت ثبت شد. ارسال پیامک تایید با تاخیر انجام می‌شود.'
            );

            // پس از ثبت، کاربر باید رسید را ببیند - نه صفحه‌ی رهگیری. رسیدِ
            // ساخته‌شده در صفحه‌ی مبدا فقط شماره‌ی سفارشِ واقعی را کم دارد، که
            // همین‌جا از پاسخ سرور پر می‌شود. اگر صفحه‌ی مبدا رسیدی نفرستاده
            // باشد، رفتار قبلی (رهگیری سفارش) حفظ می‌شود.
            if (receipt) {
              navigation.replace('OrderReceipt', {
                receipt: { ...receipt, order: { ...receipt.order, number: orderNumber } },
              });
            } else {
              navigation.replace('OrderTrackingScreen', {
                orderData: {
                  orderNumber,
                  userId: user?.id ?? receiptSources.orgProfile?.id ?? null,
                  phone,
                  date: scheduleDate || '',
                },
              });
            }
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.textInverse.color} />
          ) : (
            <Text style={NewStyles.text4}>ثبت نهایی سفارش</Text>
          )}
        </TouchableOpacity>
        <FooterSpacer />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = createDirectionalStyles((isRTL) => ({
  container: {
    padding: spacing.md,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface.bgColor(0.9),
    borderRadius: radius.md,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    width: '100%',
  },
  summaryTitle: {
    fontFamily: getFontFamily('bold', 'fa'),
    fontSize: fontSize.md,
    color: colors.textPrimary.color,
    marginBottom: spacing.sm,
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  },
  summaryRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.bgColor(0.4),
  },
  summaryLabel: {
    flex: 1,
    fontFamily: getFontFamily('light', 'fa'),
    fontSize: fontSize.sm,
    color: colors.textSecondary.color,
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  },
  summaryValue: {
    fontFamily: getFontFamily('bold', 'fa'),
    fontSize: fontSize.sm,
    color: colors.textPrimary.color,
    marginRight: spacing.sm,
  },
  // کارتِ کدها فقط ردیفِ جمع‌وجورِ OrderCodesSection را نگه می‌دارد؛ padding
  // و پس‌زمینه‌ی کارتِ خلاصه اینجا اضافی است و ردیف را دوقاب می‌کند.
  // marginTop مثل editButton لازم است: رسیدِ بالای این ردیف حاشیه‌ی پایین ندارد
  // و بدون آن، ردیف به لبه‌ی رسید می‌چسبد.
  codesCard: {
    width: '100%',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  editButton: {
    backgroundColor: colors.warning.bgColor(1),
    padding: spacing.md,
    borderRadius: radius.sm,
    // فاصله از رسیدِ بالای دکمه - رسید حاشیه‌ی پایین ندارد و بدون این، دکمه
    // به لبه‌ی کارت می‌چسبید.
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: colors.success.bgColor(1),
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xxxl,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    color: colors.info.color,
  },
}));
