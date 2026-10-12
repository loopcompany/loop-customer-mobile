// «مشخصات تحویل» در جزئیات سفارش (بند ۱۵ سند کارفرما).
//
// برای سفارش‌هایی که کالا/محصول از لوپ به کاربر برمی‌گردد (اعزام به لوپ و تامین
// کالا). کاربر مشخص می‌کند چه کسی تحویل می‌گیرد (خودش، یا نماینده/شخص دیگر با
// مشخصات) و از چه راهی ارسال شود (تکنسین لوپ، خود کاربر، پیک). تاریخ و ساعت
// تحویل را سرور در لحظه‌ی ثبت «دریافت محصول / سفارش» توسط کاربر می‌نویسد.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { formatDateTime, showToastOrAlert } from '@helpers/Common';
import { spacing } from '@theme/Spacing';
import {
  ActionButton,
  BodyText,
  ChoiceRow,
  InfoRow,
  SectionCard,
  StatusPill,
  TextField,
  useDir,
} from '@components/account/AccountUI';
import {
  DELIVERY_METHOD,
  RECEIVER_TYPE,
  readDelivery,
  updateDeliveryDetails,
  validateDeliveryForm,
} from '@services/OrderFulfillmentApi';
import { isNotImplemented } from '@services/AccountSecurityApi';

// کلیدهای i18n (برچسب فارسی در fa.json).
export const DELIVERY_METHOD_KEYS = {
  [DELIVERY_METHOD.LOOP_TECHNICIAN]: 'By Loop technician',
  [DELIVERY_METHOD.USER]: 'By the user (in-person pickup)',
  [DELIVERY_METHOD.COURIER]: 'By courier',
};

const STATUS_KEYS = {
  pending: 'Awaiting dispatch',
  ready: 'Ready for dispatch',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

// پیام‌های validateDeliveryForm فارسی‌اند؛ برای زبان انگلیسی معادلشان.
const VALIDATION_KEYS = {
  'تحویل‌گیرنده را مشخص کنید.': 'Choose who receives the delivery.',
  'نام و نام خانوادگی تحویل‌گیرنده را وارد کنید.': "Enter the receiver's full name.",
  'شماره موبایل تحویل‌گیرنده باید ۱۱ رقم و با ۰۹ شروع شود.':
    "The receiver's mobile must be 11 digits starting with 09.",
  'کد ملی تحویل‌گیرنده باید ۱۰ رقم باشد.': "The receiver's national ID must be 10 digits.",
  'روش ارسال را انتخاب کنید.': 'Choose a delivery method.',
};

const formFrom = (delivery) => ({
  receiverType: delivery.receiverType,
  receiverName:
    delivery.receiverType === RECEIVER_TYPE.REPRESENTATIVE ? delivery.receiverName || '' : '',
  receiverMobile:
    delivery.receiverType === RECEIVER_TYPE.REPRESENTATIVE ? delivery.receiverMobile || '' : '',
  receiverNationalId:
    delivery.receiverType === RECEIVER_TYPE.REPRESENTATIVE ? delivery.receiverNationalId || '' : '',
  method: delivery.method,
});

// فرم فقط وقتی خودبه‌خود باز است که هنوز چیزی ثبت نشده و ارسال هم انجام نشده.
const needsInput = (delivery) => delivery.editable && (!delivery.receiverType || !delivery.method);

// صفحه‌ی جزئیات این کامپوننت را با key = مقدار `order.delivery` رندر می‌کند؛ پس
// پس از ذخیره و بارگذاری دوباره‌ی سفارش، فرم با مقدار تازه‌ی سرور از نو ساخته می‌شود.
const DeliveryDetailsSection = ({ order, orderId, onUpdate }) => {
  const { t } = useTranslation();
  const dir = useDir();
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.user?.data);
  const delivery = useMemo(() => readDelivery(order), [order]);

  const [form, setForm] = useState(() => formFrom(delivery));
  const [editing, setEditing] = useState(() => needsInput(delivery));
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const selfName = [user?.name ?? user?.fname, user?.last_name ?? user?.lname]
    .filter(Boolean)
    .join(' ');
  const receiverSummary =
    delivery.receiverType === RECEIVER_TYPE.SELF
      ? `${t('Myself')}${delivery.receiverName || selfName ? ` - ${delivery.receiverName || selfName}` : ''}`
      : delivery.receiverName;

  const save = async () => {
    const error = validateDeliveryForm(form);
    if (error) {
      showToastOrAlert(t(VALIDATION_KEYS[error] || error));
      return;
    }
    setSaving(true);
    const result = await updateDeliveryDetails(token, orderId, form);
    setSaving(false);
    if (result.ok) {
      showToastOrAlert(result.message || t('Delivery details saved.'));
      setEditing(false);
      onUpdate?.();
      return;
    }
    showToastOrAlert(
      isNotImplemented(result)
        ? t('This feature will be available soon.')
        : result.message || t('An unexpected error occurred!')
    );
  };

  const isRepresentative = form.receiverType === RECEIVER_TYPE.REPRESENTATIVE;

  return (
    <View style={{ width: '90%', alignSelf: 'center', marginBottom: spacing.md }}>
      <SectionCard
        title={t('Delivery details')}
        icon="car-outline"
        right={
          delivery.status ? (
            <StatusPill
              label={t(STATUS_KEYS[delivery.status])}
              tone={delivery.status === 'delivered' ? 'success' : 'info'}
            />
          ) : null
        }
      >
        {!editing ? (
          <View>
            <InfoRow label={t('Receiver')} value={receiverSummary} />
            {delivery.receiverType === RECEIVER_TYPE.REPRESENTATIVE ? (
              <>
                <InfoRow label={t('Mobile number')} value={delivery.receiverMobile} />
                {delivery.receiverNationalId ? (
                  <InfoRow label={t('National ID')} value={delivery.receiverNationalId} />
                ) : null}
              </>
            ) : null}
            <InfoRow
              label={t('Delivery method')}
              value={delivery.method ? t(DELIVERY_METHOD_KEYS[delivery.method]) : null}
            />
            <InfoRow
              label={t('Delivery date and time')}
              value={
                delivery.deliveredAt
                  ? formatDateTime(delivery.deliveredAt.toISOString(), dir.lang === 'fa')
                  : t('Not delivered yet')
              }
            />
            {delivery.editable ? (
              <ActionButton
                title={t('Edit delivery details')}
                variant="outline"
                icon="create-outline"
                onPress={() => setEditing(true)}
              />
            ) : null}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <BodyText bold>{t('Who receives the goods / product?')}</BodyText>
            <ChoiceRow
              label={t('Myself')}
              subtitle={selfName || null}
              selected={form.receiverType === RECEIVER_TYPE.SELF}
              onPress={() => set({ receiverType: RECEIVER_TYPE.SELF })}
            />
            <ChoiceRow
              label={t('A representative / another person')}
              selected={isRepresentative}
              onPress={() => set({ receiverType: RECEIVER_TYPE.REPRESENTATIVE })}
            />
            {isRepresentative ? (
              <View style={{ gap: spacing.sm }}>
                <TextField
                  value={form.receiverName}
                  onChangeText={(v) => set({ receiverName: v })}
                  placeholder={t("Receiver's full name")}
                />
                <TextField
                  value={form.receiverMobile}
                  onChangeText={(v) => set({ receiverMobile: v.replace(/[^0-9]/g, '') })}
                  placeholder={t("Receiver's mobile (09xxxxxxxxx)")}
                  keyboardType="phone-pad"
                />
                <TextField
                  value={form.receiverNationalId}
                  onChangeText={(v) => set({ receiverNationalId: v.replace(/[^0-9]/g, '') })}
                  placeholder={t("Receiver's national ID (optional)")}
                  keyboardType="number-pad"
                />
              </View>
            ) : null}

            <BodyText bold>{t('Delivery method')}</BodyText>
            {Object.values(DELIVERY_METHOD).map((method) => (
              <ChoiceRow
                key={method}
                label={t(DELIVERY_METHOD_KEYS[method])}
                selected={form.method === method}
                onPress={() => set({ method })}
              />
            ))}

            <BodyText muted>
              {t(
                'The delivery date and time are recorded when you submit «Receive product / order».'
              )}
            </BodyText>

            <View style={{ flexDirection: dir.row, gap: spacing.sm }}>
              <ActionButton title={t('Save')} loading={saving} onPress={save} style={{ flex: 1 }} />
              {delivery.receiverType && delivery.method ? (
                <ActionButton
                  title={t('Cancel')}
                  variant="outline"
                  disabled={saving}
                  onPress={() => {
                    setForm(formFrom(delivery));
                    setEditing(false);
                  }}
                  style={{ flex: 1 }}
                />
              ) : null}
            </View>
          </View>
        )}
      </SectionCard>
    </View>
  );
};

export default DeliveryDetailsSection;
