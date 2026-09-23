import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '@styles/NewStyles';
import { colors, themeColor0, themeColor3 } from '@theme/Color';
import Button from '@components/Button';
import { formatPrice, showToastOrAlert } from '@helpers/Common';
import { fetchUser } from '@slices/userSlice';
import { chargeWallet, MIN_CHARGE_AMOUNT, MAX_CHARGE_AMOUNT } from '@services/WalletApi';
import { fetchWalletBalance, seedBalance, selectWalletBalance } from '@slices/walletSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '@components/ScreenHeaders';
import { createStyles } from '@styles/NewStyles';
import FooterSpacer from '@components/FooterSpacer';
import { createPaymentRedirectUrl, openPaymentGateway } from '@utils/paymentGateway';
export default function Increase({ navigation, route }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state.user?.data);
  // موجودی از walletSlice می‌آید، نه از snapshot پروفایل — بعد از هر شارژ
  // موفق تازه می‌شود. تا رسیدن اولین پاسخ، مقدار پروفایل نمایش داده می‌شود.
  const walletBalance = useSelector(selectWalletBalance);
  const [loading, setLoading] = useState(false);
  const presetAmount = Number(route?.params?.amount);
  const [amount, setAmount] = useState(
    presetAmount >= MIN_CHARGE_AMOUNT && presetAmount <= MAX_CHARGE_AMOUNT ? presetAmount : null
  );
  const paymentSessionRef = useRef(null);

  const redirectUrl = createPaymentRedirectUrl();

  useEffect(() => {
    dispatch(seedBalance(user?.wallet));
    if (token) dispatch(fetchWalletBalance(token));
    // `user?.wallet` عمداً در وابستگی‌ها نیست: فقط مقدار اولیه است و
    // تغییرش نباید یک درخواست دیگر بفرستد.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token]);

  // بستن نشستِ پرداخت هنگام unmount تا شنونده‌ی لینک باقی نماند.
  useEffect(() => {
    return () => {
      paymentSessionRef.current?.close();
      paymentSessionRef.current = null;
    };
  }, []);

  // بازگشت از درگاه. `null` یعنی کاربر بدون نتیجه برگشت و فقط باید دکمه آزاد شود.
  const handlePaymentResult = (status) => {
    if (status === 'OK') {
      // موجودی را سرور بعد از تأیید callback بالا می‌برد؛ ما فقط
      // دوباره می‌خوانیمش و هرگز محلی اضافه نمی‌کنیم.
      dispatch(fetchUser(token));
      dispatch(fetchWalletBalance(token));
      showToastOrAlert(t('Your wallet has been successfully topped up.'));
      setLoading(false);
      if (Platform.OS == 'web') {
        window.history.back();
      } else {
        navigation.goBack();
      }
      return;
    }

    if (status === 'NOK') showToastOrAlert(t('Transaction failed'));
    setLoading(false);
  };

  const increaseWallet = async () => {
    // همان محدوده‌ای که بک‌اند اعتبارسنجی می‌کند — از WalletApi می‌آید تا
    // اگر تغییر کرد، در یک جا عوض شود.
    const value = Number(amount);

    if (!value || value < MIN_CHARGE_AMOUNT) {
      showToastOrAlert(t('The minimum amount for wallet recharge is 10,000 Tomans'));
      return;
    }

    if (value > MAX_CHARGE_AMOUNT) {
      showToastOrAlert(t('The maximum amount for wallet recharge is 50,000,000 Tomans'));
      return;
    }

    setLoading(true);

    const result = await chargeWallet(token, { amount: value, linking_url: redirectUrl });
    const paymentUrl = result.data?.payment_url;

    // یک 2xx بدون payment_url موفقیت نیست؛ قبلاً این حالت کاربر را بدون
    // هیچ بازخوردی رها می‌کرد.
    if (!result.ok || !paymentUrl) {
      showToastOrAlert(result.message || t('Error connecting to payment gateway'));
      setLoading(false);
      return;
    }

    // مرورگر درون‌برنامه‌ای: اپ در پس‌زمینه زنده می‌ماند و بعد از پرداخت
    // همان صفحه ادامه پیدا می‌کند، به‌جای اینکه از اسپلش شروع شود.
    paymentSessionRef.current = openPaymentGateway({
      paymentUrl,
      redirectUrl,
      onResult: handlePaymentResult,
    });

    if (!(await paymentSessionRef.current.opened)) {
      showToastOrAlert(t('Error connecting to payment gateway'));
      setLoading(false);
    }
  };
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container]}>
      <ScreenHeaders title={t('Wallet recharge')} />
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={NewStyles.text}>
          {t('Enter your desired amount in Tomans.')} <Text style={[NewStyles.title6]}>*</Text>
        </Text>
        <Text style={NewStyles.text10}>
          {t('Your current wallet balance:')}{' '}
          <Text style={NewStyles.title}>{formatPrice(walletBalance)}</Text> {t('Tomans')}
        </Text>
        <View
          style={[{ backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.row, NewStyles.border10]}
        >
          <View
            style={[
              {
                gap: 5,
                flex: 2,
                minHeight: 50,
                paddingHorizontal: '5%',
              },
              NewStyles.row,
            ]}
          >
            <Ionicons name={'cash-outline'} size={20} color={themeColor0.bgColor(1)} />
            <TextInput
              style={[
                styles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                { flex: 1, height: '100%' },
              ]}
              keyboardType="number-pad"
              placeholder={t('Amount in Tomans')}
              placeholderTextColor={themeColor3.bgColor(1)}
              maxLength={10}
              value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              onChangeText={(text) => {
                setAmount(text?.replace(/,/g, ''));
              }}
            />
          </View>
          <View
            style={[
              { gap: 5, flex: 1, backgroundColor: colors.primary.bgColor(1), height: 50 },
              NewStyles.border10,
              NewStyles.center,
            ]}
          >
            <Text style={[NewStyles.title, { color: colors.textInverse.color }]}>{t('Tomans')}</Text>
          </View>
        </View>
        <Button title={t('Payment')} loading={loading} onPress={increaseWallet} />
        <FooterSpacer />
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) =>
  StyleSheet.create({
    contentContainerStyle: {
      paddingHorizontal: '5%',
      paddingVertical: '5%',
      gap: 10,
    },
  });
