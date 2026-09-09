// مرحله‌ی دومِ ثبت آدرس: انتخاب موقعیت روی نقشه‌ی نشان و ارسال به سرور.
//
// همه‌ی کارِ نقشه در NeshanMap است؛ این فایل فقط قواعدِ کاری را نگه می‌دارد:
// اعتبارسنجیِ محدوده‌ی سرویس و POST به /addresses.
import { View, Platform } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import NewStyles from '@styles/NewStyles';
import { fetchAddresses, setAddress, setCity, setRegion } from '@slices/addressSlice';
import { fetchRadii } from '@slices/radiusSlice';
import { uri } from '@services/URL';
import { distanceInMeters } from '@services/neshan';
import { showToastOrAlert } from '@helpers/Common';
import NeshanMap from './NeshanMap';

/**
 * فقط فیلدهای واقعیِ آدرس به سرور می‌روند. اسلایس آدرس علاوه بر فرم،
 * `data` (فهرست کاملِ آدرس‌های ذخیره‌شده)، `loading` و `error` را هم دارد و
 * فرستادنِ کلِ آبجکت یعنی حمل کردنِ یک آرایه‌ی بی‌ربط در بدنه‌ی هر درخواست.
 */
const ADDRESS_FIELDS = [
  'title',
  'fname',
  'lname',
  'telephone',
  'mobile',
  'city',
  'region',
  'address',
  'unit',
  'number',
  'floor',
  'latitude',
  'longitude',
];

const buildPayload = (address) =>
  ADDRESS_FIELDS.reduce((payload, key) => {
    if (address?.[key] !== undefined && address?.[key] !== null && address?.[key] !== '') {
      payload[key] = address[key];
    }
    return payload;
  }, {});

export default function Map({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // دو حالت دارد:
  //   picker  — کاربر از فرمِ آدرس آمده تا فقط موقعیت و آدرسِ متنی را بردارد
  //             و به فرم برگردد (چیزی ثبت نمی‌شود).
  //   submit  — مرحله‌ی آخرِ ثبت آدرس؛ POST به /addresses. (پیش‌فرض)
  const isPicker = route?.params?.mode === 'picker';

  const address = useSelector((state) => state?.address);
  const token = useSelector((state) => state.auth?.token);
  const radiusData = useSelector((state) => state.radius?.data);

  React.useEffect(() => {
    if (token) dispatch(fetchRadii(token));
  }, [token, dispatch]);

  const radii = useMemo(
    () => (Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData),
    [radiusData]
  );

  /**
   * نتیجه‌ی ژئوکدینگِ معکوس فقط جاهای *خالی* فرم را پر می‌کند — چیزی که کاربر
   * خودش تایپ کرده هرگز بازنویسی نمی‌شود.
   */
  const handleResolvedAddress = useCallback(
    (resolved) => {
      if (!resolved) return;
      // در حالتِ picker کاربر عمداً آمده تا آدرس را از نقشه بردارد، پس نتیجه
      // جایگزینِ مقدارِ فعلی می‌شود.
      if (resolved.formatted && (isPicker || !address?.address)) {
        dispatch(setAddress(resolved.formatted));
      }
      if (resolved.city && (isPicker || !address?.city)) dispatch(setCity(resolved.city));
      if (resolved.region && (isPicker || !address?.region)) dispatch(setRegion(resolved.region));
    },
    [address?.address, address?.city, address?.region, dispatch, isPicker]
  );

  const submitAddress = useCallback(async () => {
    // حالتِ picker چیزی ثبت نمی‌کند؛ مختصات و آدرسِ متنی همین حالا در Redux
    // نشسته‌اند، پس فقط به فرم برمی‌گردیم.
    if (isPicker) {
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        showToastOrAlert(t('Please log in first.'));
        return;
      }

      if (radii?.latitude && radii?.longitude && radii?.radius) {
        const distance = distanceInMeters(
          parseFloat(radii.latitude),
          parseFloat(radii.longitude),
          address?.latitude,
          address?.longitude
        );
        if (distance > parseFloat(radii.radius)) {
          showToastOrAlert(t('Please select a location within the specified area!'));
          return;
        }
      }

      const response = await axios.post(`${uri}/addresses`, buildPayload(address), {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        showToastOrAlert(response?.data?.message || t('Address successfully registered'));
        dispatch(fetchAddresses(token));
        if (Platform.OS === 'web') {
          window.history.back();
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Submit address error:', error.response?.data);
      const message = error?.response
        ? error?.response?.data?.message || t('An unexpected error occurred!')
        : t('Network error!');
      showToastOrAlert(message);
    } finally {
      setLoading(false);
    }
  }, [address, dispatch, isPicker, navigation, radii, t, token]);

  return (
    <View style={NewStyles.container}>
      <NeshanMap
        submitAddress={submitAddress}
        loading={loading}
        radii={radii}
        onResolvedAddress={handleResolvedAddress}
        confirmLabel={isPicker ? 'ثبت این موقعیت' : t('Confirm')}
      />
    </View>
  );
}
