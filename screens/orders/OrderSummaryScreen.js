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
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import NewStyles from '@styles/NewStyles';
import CustomStatusBar from '@components/CustomStatusBar';
import ScreenTitle from '@components/ScreenTitle';
import { notificationAPI } from '@services/NotificationService';
import { describePickerDate, showToastOrAlert } from '@helpers/Common';
import { TIME_SLOT_OPTIONS } from '@org/deviceCatalog';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';

const NOT_SET = 'ثبت نشده';

// آدرس ذخیره‌شده یا در حال ویرایش را به یک رشته‌ی خوانا تبدیل می‌کند.
const formatAddress = (entry) => {
  if (!entry) return '';
  const parts = [
    entry.city,
    entry.region,
    entry.address,
    entry.number ? `پلاک ${entry.number}` : '',
    entry.unit ? `واحد ${entry.unit}` : '',
  ];
  return parts.filter((part) => String(part || '').trim()).join('، ');
};

export default function OrderSummaryScreen({ navigation, route }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(NOT_SET);

  const params = route?.params || {};
  const {
    orderTitle,
    categoryTitle,
    summaryLines = [],
    schedule,
    contact,
    price = null,
    currency = 'تومان',
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

  // آدرس: آدرس انتخاب‌شده‌ی سفارش، سپس آدرس در حال ویرایش، سپس آدرس سازمان.
  const address = useMemo(() => {
    const picked = Array.isArray(savedAddresses)
      ? savedAddresses.find((item) => String(item?.id) === String(selectedAddressId))
      : null;
    return (
      formatAddress(picked) ||
      formatAddress(addressDraft) ||
      orgProfile?.address ||
      NOT_SET
    );
  }, [savedAddresses, selectedAddressId, addressDraft, orgProfile?.address]);

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

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.goBack()}>
          <Text style={NewStyles.text4}>ویرایش اطلاعات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={async () => {
            setIsSubmitting(true);
            try {
              const orderNumber = `${Date.now()}`;
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
              setStatus('در حال بررسی');
              showToastOrAlert('سفارش با موفقیت ثبت شد. پیامک تایید برای شما ارسال شد.');

              navigation.replace('OrderTrackingScreen', {
                orderData: {
                  orderNumber,
                  userId: user?.id ?? orgProfile?.id ?? null,
                  phone,
                  date: scheduleDate || '',
                },
              });
            } catch (error) {
              console.error('Error submitting order:', error);
              showToastOrAlert('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.');
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.textInverse.color} />
          ) : (
            <Text style={NewStyles.text4}>ثبت نهایی سفارش</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
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
});
