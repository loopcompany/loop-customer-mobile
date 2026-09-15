// گالری رسیدها - فقط در حالت توسعه (__DEV__).
//
// طرح رسید ۹ ترکیب دارد (۳ حالت × ۳ نوع سفارش) و تولید همه‌ی آن‌ها از داده‌ی
// واقعی عملاً ممکن نیست: باید هم‌زمان یک سفارشِ لغو‌شده‌ی فقط-کالا از کاربر
// سازمانی دولتی و یک سفارشِ پرداخت‌شده‌ی فقط-خدمات از کاربر عادی در دیتابیس
// داشته باشیم. این صفحه همان ۹ حالت را از fixture می‌سازد تا بشود در یک
// اسکرول با تصاویر طرح مقایسه‌شان کرد.
//
// مسیر وب: /dev/receipts

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomStatusBar from '@components/CustomStatusBar';
import ScreenHeaders from '@components/ScreenHeaders';
import OrderReceipt from '@components/receipt/OrderReceipt';
import { useMenu } from '@contexts/MenuContext';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { RECEIPT_STATE, ORDER_KIND, DELIVERY_STATUS, buildReceipt } from '@services/receipt';

// --- داده‌ی نمونه، دقیقاً مطابق اعداد تصاویر طرح ------------------------
const ITEMS = [
  {
    title: 'لپ تاپ',
    brand: 'Acer',
    model: 'X555U',
    warranty: 'گارانتی شرکتی',
    testPeriod: '7 روز',
    barcode: '1234567890123',
    qty: 20,
    unitPrice: 28500000,
    totalPrice: 570000000,
  },
  {
    title: 'SSD',
    brand: 'Samsung',
    model: '512GB SATA',
    warranty: 'گارانتی شرکتی',
    testPeriod: '7 روز',
    barcode: '9876543210987',
    qty: 50,
    unitPrice: 2150000,
    totalPrice: 107500000,
  },
  {
    title: 'رم',
    brand: 'Kingston',
    model: '16GB DDR4',
    warranty: 'گارانتی شرکتی',
    testPeriod: '7 روز',
    barcode: '4567891234567',
    qty: 100,
    unitPrice: 1350000,
    totalPrice: 135000000,
  },
];

const SERVICES = [
  {
    title: 'لپ تاپ',
    brand: 'Acer',
    model: 'X555U',
    description: 'نصب ویندوز 10 / نصب درایورهای آفلاین / نصب نرم افزارهای کاربردی',
    qty: 20,
    unitPrice: 28500000,
    totalPrice: 570000000,
  },
];

const PRODUCT = { type: 'لپ تاپ', brand: 'Acer', model: 'X555U' };

/** کاربر عادی (شماره ملی) و کاربر سازمانی (شناسه ملی) - هر دو حالت طرح. */
const INDIVIDUAL = {
  isOrganization: false,
  name: 'احمد زارعی',
  nationalId: '0084403507',
  phone: '0912 123 4567',
  landline: '021 8888 9999',
  address: 'تهران، ونک، خیابان گاندی',
};

const ORGANIZATION = {
  isOrganization: true,
  name: 'شرکت ایده پردازان مبین',
  nationalId: '14009876543',
  phone: '0912 123 4567',
  landline: '021 8888 9999',
  address: 'تهران، ونک، خیابان گاندی',
};

const PAYMENT_BY_STATE = {
  [RECEIPT_STATE.DONE]: {
    discountCode: 'LOOP20',
    discountAmount: 20000000,
    status: 'پرداخت کامل',
    method: 'انتقال بانکی',
  },
  [RECEIPT_STATE.PENDING]: {
    discountCode: 'LOOP20',
    discountAmount: 20000000,
    status: 'در انتظار تایید و پرداخت',
    method: 'در انتظار تایید و پرداخت',
  },
  [RECEIPT_STATE.FAILED]: {
    discountCode: 'LOOP20',
    discountAmount: 20000000,
    status: 'پرداخت نشده',
    method: 'پرداخت نشده',
  },
};

const DELIVERY_BY_STATE = {
  [RECEIPT_STATE.DONE]: {
    receiverName: 'محمد رضایی',
    date: '1404 / 08 / 07',
    status: DELIVERY_STATUS.BY_COURIER_LOOP,
  },
  [RECEIPT_STATE.PENDING]: {
    receiverName: 'محمد رضایی',
    date: '1404 / 08 / 07',
    status: DELIVERY_STATUS.UNKNOWN,
  },
  [RECEIPT_STATE.FAILED]: {
    receiverName: 'محمد رضایی',
    date: '1404 / 08 / 07',
    status: DELIVERY_STATUS.BY_COURIER_USER,
  },
};

const STATE_LABELS = [
  [RECEIPT_STATE.DONE, 'انجام شد'],
  [RECEIPT_STATE.PENDING, 'جزئیات سفارش'],
  [RECEIPT_STATE.FAILED, 'ناموفق'],
];

const KIND_LABELS = [
  [ORDER_KIND.GOODS, 'تامین کالا'],
  [ORDER_KIND.SERVICES, 'خدمات'],
  [ORDER_KIND.BOTH, 'تامین کالا و خدمات'],
];

/** یکی از ۹ ترکیب را می‌سازد. */
const makeFixture = (state, kind) =>
  buildReceipt({
    state,
    issuedAt: '1404 / 08 / 08',
    order: {
      number: 55689965,
      userCode: 211866545,
      userName: 'احمد زارعی',
      channel: 'اپلیکیشن',
      // کالا-تنها را با کاربر سازمانی نشان می‌دهیم تا حالت «شناسه ملی» هم
      // در گالری دیده شود.
      userStatus: kind === ORDER_KIND.GOODS ? 'سازمانی دولتی' : 'کاربر عادی',
      registeredDate: '1404 / 08 / 05',
      registeredTime: '16 : 45',
      kind,
    },
    customer: kind === ORDER_KIND.GOODS ? ORGANIZATION : INDIVIDUAL,
    // «تامین کالا» در طرح بخش مشخصات محصول ندارد.
    product: kind === ORDER_KIND.GOODS ? null : PRODUCT,
    items: kind === ORDER_KIND.SERVICES ? [] : ITEMS,
    services: kind === ORDER_KIND.GOODS ? [] : SERVICES,
    delivery: DELIVERY_BY_STATE[state],
    payment: PAYMENT_BY_STATE[state],
  });

function ReceiptGalleryScreen() {
  const { t, i18n } = useTranslation();
  const { footerSpace } = useMenu();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fa';
  const styles = useMemo(() => createStyles(lang), [lang]);

  const [state, setState] = useState(RECEIPT_STATE.DONE);
  const [kind, setKind] = useState(ORDER_KIND.BOTH);

  const receipt = useMemo(() => makeFixture(state, kind), [state, kind]);

  const renderChips = (options, active, onSelect) => (
    <View style={styles.chipRow}>
      {options.map(([value, label]) => (
        <TouchableOpacity
          key={value}
          onPress={() => onSelect(value)}
          style={[styles.chip, active === value && styles.chipActive]}
        >
          <Text style={[styles.chipText, active === value && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ImageBackground
      source={require('@assets/moon.jpg')}
      style={{ flex: 1 }}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <CustomStatusBar />
      <ScreenHeaders title={t('Receipt gallery')} />

      <View style={styles.controls}>
        {renderChips(STATE_LABELS, state, setState)}
        {renderChips(KIND_LABELS, kind, setKind)}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.huge + footerSpace,
        }}
      >
        <OrderReceipt receipt={receipt} />
      </ScrollView>
    </ImageBackground>
  );
}

const createStyles = (lang) => ({
  controls: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent.bgColor(1),
    backgroundColor: colors.surface.bgColor(0.85),
  },
  chipActive: {
    backgroundColor: colors.primary.bgColor(1),
  },
  chipText: {
    fontFamily: getFontFamily('light', lang),
    fontSize: fontSize.xs,
    color: colors.textPrimary.color,
  },
  chipTextActive: {
    fontFamily: getFontFamily('bold', lang),
    color: colors.accent.color,
  },
});

export default ReceiptGalleryScreen;
