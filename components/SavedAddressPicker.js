// مرحله‌ی «آدرس‌های منتخب» در مسیرهای سفارش سازمانی (سیستماتیک و جامع).
//
// پیش از این، این مسیرها هیچ مرحله‌ی آدرسی نداشتند و OrderSummaryScreen در لحظه‌ی
// ثبت «یک آدرس ذخیره‌شده» را حدس می‌زد؛ کاربری که آدرسی نداشت پیغام «ابتدا آدرس
// ثبت کنید» می‌گرفت، از صفحه بیرون می‌رفت و همه‌ی انتخاب‌هایش پاک می‌شد.
// حالا آدرس یک مرحله‌ی واقعی بعد از «بازه زمانی / رزرو» است: کاربر از همین‌جا
// آدرس اضافه می‌کند و بدون ترک صفحه‌ی مراحل، همان آدرس انتخاب می‌شود.
//
// کامپوننت کنترل‌شده است: `value` شناسه‌ی آدرس انتخاب‌شده و `onChange(id|null)`.
import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import i18n from 'i18next';
import { fetchAddresses } from '@slices/addressSlice';
import { formatAddressEntry } from '@services/receipt/receiptCustomer';
import { langIsRTL } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { L } from '@org/orgI18n';
import { findNewAddressId, isAddressAvailable } from './savedAddressSelection';

export default function SavedAddressPicker({ value, onChange, navigation }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state?.auth?.token);
  const addresses = useSelector((state) => state?.address?.data);
  const loading = useSelector((state) => state?.address?.loading);
  const loadError = useSelector((state) => state?.address?.error);
  const rtl = langIsRTL(i18n.language);

  // شناسه‌های آدرس در لحظه‌ی زدن «افزودن آدرس جدید»؛ وقتی کاربر برمی‌گردد،
  // آدرسی که در این فهرست نبود همان آدرس تازه است و خودکار انتخاب می‌شود.
  const idsBeforeAdd = useRef(null);

  // با هر بار برگشتن به صفحه (مثلاً از AddNewAddress) فهرست تازه می‌شود.
  useFocusEffect(
    useCallback(() => {
      if (token) dispatch(fetchAddresses(token));
    }, [dispatch, token])
  );

  // تا وقتی یک بارگذاری از سرور (که خودِ این صفحه شروع کرده) تمام نشده، فهرست
  // داخل Redux ممکن است خالی یا کهنه باشد؛ اعتبارسنجی روی آن، آدرسِ معتبرِ یک
  // پیش‌نویس را پاک می‌کرد.
  const sawLoading = useRef(false);

  useEffect(() => {
    if (loading) {
      sawLoading.current = true;
      return;
    }
    if (!sawLoading.current) return;
    if (idsBeforeAdd.current) {
      const newId = findNewAddressId(idsBeforeAdd.current, addresses);
      if (newId != null) {
        idsBeforeAdd.current = null;
        onChange(newId);
        return;
      }
    }
    // آدرسی که کاربر انتخاب کرده بود ولی دیگر وجود ندارد (حذف‌شده) نباید
    // بی‌صدا با سفارش برود. خطای شبکه فهرست را خالی می‌کند؛ آن را حذف حساب نمی‌کنیم.
    if (value != null && !loadError && !isAddressAvailable(addresses, value)) {
      onChange(null);
    }
  }, [addresses, loading, loadError, value, onChange]);

  const handleAdd = () => {
    idsBeforeAdd.current = (Array.isArray(addresses) ? addresses : []).map((item) => String(item?.id));
    navigation.navigate('AddNewAddress');
  };

  const list = Array.isArray(addresses) ? addresses : [];

  return (
    <View>
      <TouchableOpacity
        onPress={handleAdd}
        activeOpacity={0.8}
        style={{
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          backgroundColor: colors.primary.bgColor(1),
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name="add" size={20} color={colors.white.color} />
        <Text style={{ fontFamily: getFontFamily('bold', i18n.language), fontSize: fontSize.sm, color: colors.white.color }}>
          {L('افزودن آدرس جدید')}
        </Text>
      </TouchableOpacity>

      {loading && list.length === 0 ? (
        <ActivityIndicator color={colors.primary.color} style={{ marginVertical: spacing.md }} />
      ) : null}

      {!loading && list.length === 0 ? (
        <Text
          style={{
            fontFamily: getFontFamily('regular', i18n.language),
            fontSize: fontSize.sm,
            color: colors.textSecondary.color,
            textAlign: 'center',
            marginVertical: spacing.sm,
          }}
        >
          {loadError
            ? L('دریافت آدرس‌ها ممکن نشد. اتصال اینترنت را بررسی کنید.')
            : L('هنوز آدرسی ثبت نکرده‌اید. با دکمه‌ی بالا آدرس محل ارائه خدمت را اضافه کنید.')}
        </Text>
      ) : null}

      {list.map((item) => {
        const selected = value != null && String(item?.id) === String(value);
        return (
          <TouchableOpacity
            key={String(item?.id)}
            onPress={() => onChange(selected ? null : item?.id)}
            activeOpacity={0.75}
            accessibilityState={{ selected }}
            style={{
              flexDirection: rtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: spacing.sm,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: selected ? colors.primary.color : colors.border.bgColor(1),
              backgroundColor: selected ? colors.primary.bgColor(0.08) : colors.surface.bgColor(1),
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selected ? colors.primary.color : colors.textMuted.color}
            />
            <View style={{ flex: 1 }}>
              {item?.title ? (
                <Text
                  style={{
                    fontFamily: getFontFamily('bold', i18n.language),
                    fontSize: fontSize.sm,
                    color: selected ? colors.primary.color : colors.textPrimary.color,
                    textAlign: rtl ? 'right' : 'left',
                  }}
                >
                  {item.title}
                </Text>
              ) : null}
              <Text
                style={{
                  fontFamily: getFontFamily('regular', i18n.language),
                  fontSize: fontSize.xs,
                  color: colors.textSecondary.color,
                  textAlign: rtl ? 'right' : 'left',
                  marginTop: spacing.xs,
                }}
                numberOfLines={3}
              >
                {formatAddressEntry(item) || '-'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
