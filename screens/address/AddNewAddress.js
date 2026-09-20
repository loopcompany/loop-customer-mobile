// فرمِ «افزودن آدرس جدید».
//
// بازنویسیِ کاملِ نسخه‌ی قبلی. مشکلاتی که این نسخه می‌بندد:
//
//   • اعتبارسنجی: نسخه‌ی قبلی یک `if` بلند بود که برای هر ایرادی یک پیامِ
//     واحدِ «لطفا همه‌ی فیلدهای الزامی را پر کنید» نشان می‌داد — کاربر نمی‌فهمید
//     کدام فیلد. حالا هر فیلد خطای خودش را زیرِ خودش نشان می‌دهد، قاب قرمز
//     می‌شود و صفحه به اولین خطا اسکرول می‌کند (utils/addressForm.js).
//   • شماره‌ی موبایل: مقدار با `'0' + text` ذخیره می‌شد ولی برای نمایش یک صفر
//     برداشته می‌شد، پس با هر حرف یک صفرِ اضافه ته‌نشین می‌شد و «۰۰۹۱۲…» ذخیره
//     می‌شد. حالا از `normalizeMobile` می‌گذرد.
//   • جریانِ نقشه: فرم با `replace('Map')` خودش را از پشته حذف می‌کرد و صفحه‌ی
//     نقشه ثبتِ نهایی را انجام می‌داد؛ نقطه‌ای که کاربر قبلاً از کارتِ بالای
//     فرم انتخاب کرده بود با مرکزِ پیش‌فرضِ همان نقشه بازنویسی می‌شد. حالا
//     نقشه فقط انتخابگر است و ثبت اینجا انجام می‌شود.
//   • بازنشانیِ فرم مقدارهای «واحد»، «پلاک»، «طبقه» و مختصات را جا می‌گذاشت.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '@components/ScreenHeaders';
import Button from '@components/Button';
import LocationSection from './LocationSection';
import { createStyles } from '@styles/NewStyles';
import { useMenu } from '@contexts/MenuContext';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import { langIsRTL, showToastOrAlert } from '@helpers/Common';
import { addressAPI } from '@services/Api';
import { distanceInMeters } from '@services/neshan';
import {
  fetchAddresses,
  resetAddressForm,
  setAddress,
  setAddressFields,
  setFloor,
  setFname,
  setLname,
  setMobile,
  setNumber,
  setRegion,
  setTelephone,
  setTitle,
  setUnit,
} from '@slices/addressSlice';
import { fetchRadii } from '@slices/radiusSlice';
import {
  LANDLINE_PREFIX,
  buildAddressPayload,
  composeLandline,
  digitsOnly,
  firstErrorField,
  hasLocation,
  localLandline,
  normalizeMobile,
  serverFieldErrors,
  submitErrorMessage,
  validateAddressForm,
} from '@utils/addressForm';

/** هر فیلد در کدام کارت نشسته — برای اسکرول به اولین خطا. */
const FIELD_CARD = {
  location: 'location',
  title: 'contact',
  fname: 'contact',
  lname: 'contact',
  mobile: 'contact',
  telephone: 'contact',
  region: 'details',
  number: 'details',
  unit: 'details',
  floor: 'details',
  address: 'details',
};

const MAX_ADDRESS_LENGTH = 255;

/**
 * یک فیلدِ فرم: برچسب، ورودی، و زیرِ آن خطا یا راهنما.
 *
 * بیرون از کامپوننتِ صفحه تعریف شده — اگر داخلِ بدنه‌ی صفحه تعریف می‌شد، هر
 * رندر یک نوعِ کامپوننتِ تازه می‌ساخت و React همه‌ی ورودی‌ها را دوباره mount
 * می‌کرد، یعنی با تایپِ هر حرف فوکوس و کیبورد می‌پرید.
 */
function TextField({
  styles,
  label,
  required = false,
  hint,
  error,
  prefix,
  ltr = false,
  style,
  inputStyle,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  const input = (
    <TextInput
      {...inputProps}
      onFocus={(event) => {
        setFocused(true);
        inputProps.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        inputProps.onBlur?.(event);
      }}
      placeholderTextColor={colors.textMuted.bgColor(1)}
      style={[
        styles.input,
        ltr && styles.inputLtr,
        inputProps.multiline && styles.inputMultiline,
        focused && styles.inputFocused,
        !!error && styles.inputError,
        inputStyle,
      ]}
    />
  );

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.required}>*</Text> : null}
      </View>

      {prefix ? (
        <View style={styles.prefixRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
          <View style={styles.prefixInputWrap}>{input}</View>
        </View>
      ) : (
        input
      )}

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.error.bgColor(1)} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** سرتیترِ هر کارت. */
function SectionTitle({ styles, icon, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={16} color={colors.primary.bgColor(1)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export default function AddNewAddress({ navigation }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const { footerSpace } = useMenu();

  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(i18n.language, isRTL), [i18n.language, isRTL]);

  const address = useSelector((state) => state?.address);
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.user?.data);
  const radiusData = useSelector((state) => state?.radius?.data);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // وقتی نقشه‌ی بالای فرم باز است، اسکرولِ فرم خاموش می‌شود؛ وگرنه ژستِ عمودیِ
  // کشیدنِ نقشه با اسکرولِ صفحه می‌جنگد و هیچ‌کدام درست کار نمی‌کنند.
  const [mapActive, setMapActive] = useState(false);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const scrollRef = useRef(null);
  const cardOffsets = useRef({});

  // فرم یک بار در زمانِ باز شدنِ صفحه خالی می‌شود — نه در هر focus. با
  // useFocusEffect، برگشتن از نقشه (که این صفحه را unmount نمی‌کند) همه‌ی چیزی
  // را که کاربر تازه پر کرده یا از نقشه گرفته بود پاک می‌کرد.
  useEffect(() => {
    dispatch(resetAddressForm());
  }, [dispatch]);

  useEffect(() => {
    if (token) dispatch(fetchRadii(token));
  }, [dispatch, token]);

  const radii = useMemo(
    () => (Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData),
    [radiusData]
  );

  const errors = useMemo(() => {
    const found = validateAddressForm(address, t);
    // خطاهای سرور تا وقتی کاربر همان فیلد را دست نزده روی صفحه می‌مانند.
    return { ...found, ...serverErrors };
  }, [address, serverErrors, t]);

  const errorCount = Object.keys(errors).length;

  /** خطا فقط بعد از دست زدن به فیلد (یا بعد از اولین ثبت) نشان داده می‌شود. */
  const errorFor = useCallback(
    (field) => (touched[field] || submitted ? errors[field] : undefined),
    [errors, submitted, touched]
  );

  const markTouched = useCallback(
    (field) => () => setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true })),
    []
  );

  /** هر تغییری خطای سرورِ همان فیلد را باطل می‌کند. */
  const clearServerError = useCallback((field) => {
    setServerErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const change = useCallback(
    (field, action, transform) => (text) => {
      clearServerError(field);
      dispatch(action(transform ? transform(text) : text));
    },
    [clearServerError, dispatch]
  );

  const rememberCard = useCallback(
    (card) => (event) => {
      cardOffsets.current[card] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToField = useCallback((field) => {
    const card = FIELD_CARD[field];
    const y = cardOffsets.current[card];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - spacing.lg, 0), animated: true });
    }
  }, []);

  // ---------------------------------------------------------------------------
  // پر کردن از روی پروفایل
  // ---------------------------------------------------------------------------
  const profileContact = useMemo(() => {
    const fname = String(user?.fname || user?.name || user?.first_name || '').trim();
    const lname = String(user?.lname || user?.last_name || '').trim();
    const mobile = normalizeMobile(user?.mobile_number || user?.mobile || user?.phone || '');
    return fname || lname || mobile ? { fname, lname, mobile } : null;
  }, [user]);

  const canUseProfile = Boolean(
    profileContact &&
      (!address?.fname || !address?.lname || !address?.mobile) &&
      (profileContact.fname || profileContact.lname || profileContact.mobile)
  );

  const fillFromProfile = useCallback(() => {
    if (!profileContact) return;
    const patch = {};
    if (profileContact.fname && !address?.fname) patch.fname = profileContact.fname;
    if (profileContact.lname && !address?.lname) patch.lname = profileContact.lname;
    if (profileContact.mobile && !address?.mobile) patch.mobile = profileContact.mobile;
    if (Object.keys(patch).length > 0) dispatch(setAddressFields(patch));
  }, [address?.fname, address?.lname, address?.mobile, dispatch, profileContact]);

  // ---------------------------------------------------------------------------
  // ثبت
  // ---------------------------------------------------------------------------
  const outOfServiceArea = useMemo(() => {
    if (!hasLocation(address)) return false;
    const lat = parseFloat(radii?.latitude);
    const lng = parseFloat(radii?.longitude);
    const rad = parseFloat(radii?.radius);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(rad) || rad <= 0) {
      return false;
    }
    return distanceInMeters(lat, lng, address.latitude, address.longitude) > rad;
  }, [address, radii]);

  const submit = useCallback(async () => {
    setSubmitted(true);

    if (errorCount > 0) {
      const field = firstErrorField(errors);
      showToastOrAlert(errors[field] || t('Please fix the highlighted fields.'));
      if (field) scrollToField(field);
      return;
    }

    if (!token) {
      showToastOrAlert(t('Please log in first.'));
      return;
    }

    // پشتوانه‌ی دوم برای محدوده‌ی سرویس. نقشه خودش جلوی انتخابِ نقطه‌ی بیرون از
    // محدوده را می‌گیرد، ولی مختصات از راه‌های دیگری هم می‌تواند در Redux بنشیند.
    if (outOfServiceArea) {
      showToastOrAlert(t('Please select a location within the specified area!'));
      scrollToField('location');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addressAPI.create(buildAddressPayload(address));

      // این سرور شکستِ کاری را هم با ۲xx گزارش می‌کند؛ نبودِ این بررسی یعنی
      // «ثبت شد» گفتن به کاربری که آدرسش ثبت نشده.
      if (result && result.success === false) {
        showToastOrAlert(result.message || t('An unexpected error occurred!'));
        return;
      }

      showToastOrAlert(result?.message || t('Address successfully registered'));
      dispatch(fetchAddresses(token));
      dispatch(resetAddressForm());
      if (navigation.canGoBack()) navigation.goBack();
    } catch (error) {
      // فقط خطای فیلدهایی که واقعاً روی این فرم هستند زیرِ فیلد می‌نشیند؛
      // وگرنه کاربر با خطایی روبه‌رو می‌شد که هیچ ورودی‌ای برای اصلاحش ندارد و
      // فرم برای همیشه قفل می‌ماند. بقیه فقط به‌شکلِ پیام نشان داده می‌شوند.
      const fields = serverFieldErrors(error);
      const onForm = Object.keys(fields)
        .filter((field) => FIELD_CARD[field])
        .reduce((acc, field) => ({ ...acc, [field]: fields[field] }), {});

      if (Object.keys(onForm).length > 0) {
        setServerErrors(onForm);
        const field = firstErrorField(onForm);
        if (field) scrollToField(field);
      }
      showToastOrAlert(submitErrorMessage(error, t));
    } finally {
      setSubmitting(false);
    }
  }, [address, dispatch, errorCount, errors, navigation, outOfServiceArea, scrollToField, t, token]);

  // ---------------------------------------------------------------------------
  // رندر
  // ---------------------------------------------------------------------------
  const locationError = errorFor('location');
  const titleSuggestions = [t('Home'), t('Work'), t('Office'), t('Store')];

  const openMap = () => navigation.navigate('Map');

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} mode="padding" style={NewStyles.container}>
      <ScreenHeaders title={t('Register Address')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!mapActive}
        >
          {/* ---------- موقعیت روی نقشه ---------- */}
          <View onLayout={rememberCard('location')}>
            <LocationSection
              onOpenFullScreen={openMap}
              onActiveChange={setMapActive}
              error={locationError}
            />
          </View>

          {/* ---------- عنوان و مشخصات تماس ---------- */}
          <View style={styles.card} onLayout={rememberCard('contact')}>
            <SectionTitle
              styles={styles}
              icon="person-outline"
              title={t('Contact details')}
              subtitle={'این مشخصات روی سفارش و رسید چاپ می‌شود'}
            />

            <TextField
              styles={styles}
              label={t('Address Title')}
              required
              error={errorFor('title')}
              value={address?.title || ''}
              onChangeText={change('title', setTitle)}
              onBlur={markTouched('title')}
              placeholder={t('Such as: home, office, store, etc.')}
              maxLength={30}
            />

            <View style={styles.chipRow}>
              {titleSuggestions.map((suggestion) => {
                const active = address?.title === suggestion;
                return (
                  <Pressable
                    key={suggestion}
                    onPress={() => {
                      clearServerError('title');
                      dispatch(setTitle(suggestion));
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {suggestion}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {canUseProfile && (
              <Pressable
                onPress={fillFromProfile}
                style={({ pressed }) => [styles.profileFill, pressed && styles.pressed]}
              >
                <Ionicons name="sparkles-outline" size={15} color={colors.primary.bgColor(1)} />
                <Text style={styles.profileFillText}>{t('Use my account details')}</Text>
              </Pressable>
            )}

            <View style={styles.row}>
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('First Name')}
                required
                error={errorFor('fname')}
                value={address?.fname || ''}
                onChangeText={change('fname', setFname)}
                onBlur={markTouched('fname')}
                placeholder={t('First Name')}
                maxLength={50}
              />
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('Last Name')}
                required
                error={errorFor('lname')}
                value={address?.lname || ''}
                onChangeText={change('lname', setLname)}
                onBlur={markTouched('lname')}
                placeholder={t('Last Name')}
                maxLength={50}
              />
            </View>

            <TextField
              styles={styles}
              label={t('Mobile Number')}
              required
              ltr
              error={errorFor('mobile')}
              value={address?.mobile || ''}
              onChangeText={change('mobile', setMobile, normalizeMobile)}
              onBlur={markTouched('mobile')}
              placeholder="09xxxxxxxxx"
              keyboardType="phone-pad"
              maxLength={11}
            />

            <TextField
              styles={styles}
              label={t('Landline')}
              required
              ltr
              prefix={LANDLINE_PREFIX}
              hint={'۸ رقم، بدون پیش‌شماره'}
              error={errorFor('telephone')}
              value={localLandline(address?.telephone)}
              onChangeText={change('telephone', setTelephone, composeLandline)}
              onBlur={markTouched('telephone')}
              placeholder={t('Landline number')}
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>

          {/* ---------- جزئیات آدرس ---------- */}
          <View style={styles.card} onLayout={rememberCard('details')}>
            <SectionTitle
              styles={styles}
              icon="home-outline"
              title={t('Address details')}
              subtitle={'هرچه دقیق‌تر، تکنسین راحت‌تر پیدا می‌کند'}
            />

            <View style={styles.row}>
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('Region')}
                required
                hint={'۱ تا ۲۲'}
                error={errorFor('region')}
                value={address?.region || ''}
                onChangeText={change('region', setRegion, (text) => digitsOnly(text).slice(0, 2))}
                onBlur={markTouched('region')}
                placeholder={t('Region')}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('Number')}
                required
                error={errorFor('number')}
                value={address?.number || ''}
                onChangeText={change('number', setNumber)}
                onBlur={markTouched('number')}
                placeholder={t('Number')}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.row}>
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('Unit')}
                required
                hint={'خانه‌ی ویلایی: ۰'}
                error={errorFor('unit')}
                value={address?.unit || ''}
                onChangeText={change('unit', setUnit, (text) => digitsOnly(text).slice(0, 4))}
                onBlur={markTouched('unit')}
                placeholder={t('Unit')}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TextField
                styles={styles}
                style={styles.rowItem}
                label={t('Floor')}
                required
                hint={'همکف: ۰'}
                error={errorFor('floor')}
                value={address?.floor || ''}
                onChangeText={change('floor', setFloor, (text) => digitsOnly(text).slice(0, 3))}
                onBlur={markTouched('floor')}
                placeholder={t('Floor')}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <TextField
              styles={styles}
              label={t('Full detailed address')}
              required
              error={errorFor('address')}
              hint={`${String(address?.address || '').length} / ${MAX_ADDRESS_LENGTH}`}
              value={address?.address || ''}
              onChangeText={change('address', setAddress)}
              onBlur={markTouched('address')}
              placeholder={t('Full detailed address')}
              maxLength={MAX_ADDRESS_LENGTH}
              multiline
            />
          </View>
        </ScrollView>

        {/* ---------- نوارِ ثبت ---------- */}
        <View style={[styles.footer, { paddingBottom: (footerSpace || 0) + spacing.md }]}>
          {submitted && errorCount > 0 && (
            <Pressable
              onPress={() => scrollToField(firstErrorField(errors))}
              style={styles.errorSummary}
            >
              <Ionicons name="alert-circle" size={15} color={colors.error.bgColor(1)} />
              <Text style={styles.errorSummaryText}>
                {`${errorCount} مورد نیاز به اصلاح دارد`}
              </Text>
            </Pressable>
          )}

          <Button
            title={t('Register Address')}
            loading={submitting}
            disabled={submitting}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (lang, isRTL) => {
  const align = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    pressed: { opacity: 0.85 },

    // ---- کارت ----
    card: {
      backgroundColor: colors.surface.bgColor(1),
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.bgColor(0.5),
      padding: spacing.lg,
      gap: spacing.md,
      ...shadow.sm,
    },
    sectionHeader: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider.bgColor(0.4),
    },
    sectionIcon: {
      width: 30,
      height: 30,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.bgColor(0.1),
    },
    sectionTitle: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textPrimary.color,
      ...align,
    },
    sectionSubtitle: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textMuted.color,
      marginTop: 1,
      ...align,
    },

    // ---- فیلد ----
    field: {
      gap: spacing.xs,
    },
    labelRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: 3,
    },
    label: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.textSecondary.color,
      ...align,
    },
    required: {
      fontSize: fontSize.xs,
      color: colors.error.color,
      fontFamily: getFontFamily('bold', lang),
    },
    input: {
      backgroundColor: colors.background.bgColor(1),
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textPrimary.color,
      minHeight: 46,
      ...align,
    },
    inputLtr: {
      textAlign: 'left',
      writingDirection: 'ltr',
    },
    inputMultiline: {
      minHeight: 96,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
    },
    inputFocused: {
      borderColor: colors.primary.bgColor(1),
      backgroundColor: colors.surface.bgColor(1),
    },
    inputError: {
      borderColor: colors.error.bgColor(1),
      backgroundColor: colors.error.bgColor(0.04),
    },
    prefixRow: {
      // شماره‌ی تلفن همیشه چپ‌به‌راست خوانده می‌شود، حتی در صفحه‌ی فارسی.
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: spacing.sm,
    },
    prefixBox: {
      minWidth: 58,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      backgroundColor: colors.divider.bgColor(0.25),
      paddingHorizontal: spacing.sm,
    },
    prefixText: {
      fontSize: fontSize.sm,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
    },
    prefixInputWrap: {
      flex: 1,
    },
    messageRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    errorText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.error.color,
      ...align,
    },
    hintText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textMuted.color,
      ...align,
    },

    // ---- ردیف دو ستونه ----
    row: {
      flexDirection: rowDir,
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    rowItem: {
      flex: 1,
    },

    // ---- پیشنهادِ عنوان ----
    chipRow: {
      flexDirection: rowDir,
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      backgroundColor: colors.background.bgColor(1),
    },
    chipActive: {
      borderColor: colors.primary.bgColor(1),
      backgroundColor: colors.primary.bgColor(0.1),
    },
    chipText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.textSecondary.color,
    },
    chipTextActive: {
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.color,
    },

    profileFill: {
      flexDirection: rowDir,
      alignItems: 'center',
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    profileFillText: {
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('bold', lang),
      color: colors.primary.color,
    },

    // ---- فوتر ----
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      backgroundColor: colors.surface.bgColor(1),
      borderTopWidth: 1,
      borderTopColor: colors.divider.bgColor(0.4),
      alignItems: 'center',
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    errorSummary: {
      flexDirection: rowDir,
      alignItems: 'center',
      alignSelf: 'stretch',
      gap: spacing.xs,
      backgroundColor: colors.error.bgColor(0.08),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    errorSummaryText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: getFontFamily('light', lang),
      color: colors.error.color,
      ...align,
    },
  });
};
