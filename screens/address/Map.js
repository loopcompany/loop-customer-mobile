// انتخابگرِ موقعیت — مرحله‌ی «روی نقشه مشخص کن» برای فرمِ آدرس.
//
// قبلاً این صفحه مرحله‌ی *آخرِ* ثبت آدرس بود و خودش به `/addresses` پست
// می‌کرد. دو مشکل داشت:
//
//   • هر کس با لینک/دکمه‌ی برگشت سر از این صفحه درمی‌آورد، با یک لمس یک آدرسِ
//     ناقص ثبت می‌کرد؛ هیچ اعتبارسنجی‌ای اینجا نبود.
//   • کاربری که از کارتِ «انتخاب از روی نقشه» آمده بود، بعد از برگشت دوباره
//     همین نقشه را می‌دید و نقطه‌ی انتخاب‌شده‌اش با مرکزِ پیش‌فرضِ نقشه
//     بازنویسی می‌شد.
//
// حالا این صفحه فقط یک انتخابگر است: نقطه را در Redux می‌نشاند، فیلدهای خالیِ
// فرم را از آدرسِ ژئوکدشده پر می‌کند و برمی‌گردد. ثبتِ نهایی کارِ
// `screens/address/AddNewAddress.js` است.
import { View } from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NewStyles from '@styles/NewStyles';
import { setAddressFields, setLocation } from '@slices/addressSlice';
import { fetchRadii } from '@slices/radiusSlice';
import NeshanMap from './NeshanMap';

export default function Map({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const address = useSelector((state) => state?.address);
  const token = useSelector((state) => state.auth?.token);
  const radiusData = useSelector((state) => state.radius?.data);

  useEffect(() => {
    if (token) dispatch(fetchRadii(token));
  }, [token, dispatch]);

  const radii = useMemo(
    () => (Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData),
    [radiusData]
  );

  // نقطه‌ی قبلی (اگر هست) تا نقشه همان‌جا باز شود.
  const initialCoords = useMemo(
    () => ({ latitude: address?.latitude, longitude: address?.longitude }),
    [address?.latitude, address?.longitude]
  );

  /**
   * نتیجه‌ی ژئوکدینگ فقط جاهای *خالیِ* فرم را پر می‌کند.
   *
   * «آدرس» استثناست و جای متنِ قبلی می‌نشیند — ولی فقط وقتی آن متن خودش از
   * نقشه آمده باشد. چیزی که کاربر با دست نوشته (مثلاً «واحد ۳، زنگ دوم») با
   * یک جابه‌جاییِ کوچکِ پین پاک نمی‌شود.
   */
  const handleConfirm = useCallback(
    ({ latitude, longitude, resolved }) => {
      dispatch(setLocation({ latitude, longitude }));

      const patch = {};
      const typedByUser =
        !!address?.address && address.address !== (address?.addressFromMap || '');
      if (resolved?.formatted && !typedByUser) {
        patch.address = resolved.formatted;
        patch.addressFromMap = resolved.formatted;
      }
      if (resolved?.city && !address?.city) patch.city = resolved.city;
      if (resolved?.region && !address?.region) patch.region = resolved.region;
      if (resolved?.number && !address?.number) patch.number = resolved.number;
      if (Object.keys(patch).length > 0) dispatch(setAddressFields(patch));

      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('AddNewAddress');
    },
    [address, dispatch, navigation]
  );

  return (
    <View style={NewStyles.container}>
      <NeshanMap
        onConfirm={handleConfirm}
        radii={radii}
        initialCoords={initialCoords}
        confirmLabel={t('Confirm this location')}
      />
    </View>
  );
}
