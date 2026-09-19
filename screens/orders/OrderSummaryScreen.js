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
import { formatAddressEntry, pickSavedAddress } from '@services/receipt';
import FooterSpacer from '@components/FooterSpacer';

// این دو کلید تنها fallbackهایی هستند که describeApiError صدا می‌زند؛ این
// صفحه از i18next استفاده نمی‌کند (L()/LO() فارسی محلی‌اش را دارد) پس یک
// مترجم کوچک محلی برای همین دو مورد کافی است.
const describeErrorFa = (key) => ({
  'Network error!': 'اتصال به اینترنت برقرار نیست. لطفاً دوباره تلاش کنید.',
  'An unexpected error occurred!': 'خطای غیرمنتظره‌ای رخ داد.',
}[key] || key);

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
    receipt = null,
  } = params;

  const user = useSelector((state) => state?.user?.data);
  const savedAddresses = useSelector((state) => state?.address?.data);
  const addressDraft = useSelector((state) => state?.address);
  const selectedAddressId = useSelector((state) => state?.step?.addressId);
  const orgProfile = useSelector((state) => state?.organization?.profileData);

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

  // آدرسِ سفارش: همان آدرسی که موقع ثبت به‌عنوان `address_id` فرستاده می‌شود
  // (انتخاب‌شده، وگرنه اولین آدرسِ ذخیره‌شده)، سپس آدرسِ در حال ویرایش، سپس
  // آدرس سازمان. pickSavedAddress مشترک است تا این نمایش و آن ثبت از هم جدا
  // نیفتند.
  const address = useMemo(
    () =>
      formatAddressEntry(pickSavedAddress(savedAddresses, selectedAddressId)) ||
      formatAddressEntry(addressDraft) ||
      orgProfile?.address ||
      NOT_SET,
    [savedAddresses, selectedAddressId, addressDraft, orgProfile?.address]
  );

  const phone =
    contact?.mobile ||
    user?.mobile ||
    user?.phone ||
    addressDraft?.mobile ||
    orgProfile?.phone ||
    NOT_SET;

  const customerName =
    contact?.fullName ||
    [user?.fname, user?.lname].filter(Boolean).join(' ') ||
    user?.name ||
    orgProfile?.organization_name ||
    '';

  const orderType = orderTitle || categoryTitle || NOT_SET;

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

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.goBack()}>
          <Text style={NewStyles.text4}>ویرایش اطلاعات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={async () => {
            if (isSubmitting) return;
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
              const response = await apiClient.post(`${uri}${API_ENDPOINTS.ORDERS.CREATE}`, {
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
              });

              const body = response?.data;
              const orderCreated =
                (response.status === 200 || response.status === 201) && body?.success !== false;
              if (!orderCreated) {
                showToastOrAlert(body?.message || 'ثبت سفارش ناموفق بود.');
                setIsSubmitting(false);
                return;
              }
              realOrderId = body?.data?.order_id ?? body?.data?.order?.id ?? null;
            } catch (error) {
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
                  userId: user?.id ?? orgProfile?.id ?? null,
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
