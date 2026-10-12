import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhotoEditor from '@components/avatar/ProfilePhotoEditor';
import { appendImageFile } from '@components/avatar/photoFile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import { colors, themeColor1, themeColor11, themeColor4, themeColor6, themeColor7 } from '@theme/Color';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import DatePickerModal from '@components/DatePickerModal';
import { isLocalUri, langIsRTL, showAlert } from '@helpers/Common';

import useLogout from '@hooks/useLogout';
import { imageUri, uri } from '@services/URL';
import NewStyles from '@styles/NewStyles';
import { useSelector } from 'react-redux';
import FooterSpacer from '@components/FooterSpacer';
import { spacing } from '@theme/Spacing';
import { clearAccountProfileCache } from '@services/receipt/receiptProfile';
import {
  AccountActionsCard,
  AuthorizedUsersSection,
  OrganizationDocumentsSection,
  OrganizationEditRequestCard,
  VerificationStatusCard,
} from '@components/account/OrganizationAccountSections';
import {
  isProfileFieldEditable,
  pickEditableProfileValues,
  readEditRequestState,
} from '@services/OrganizationAccountApi';

// برچسب فیلد؛ فیلدهای قفل‌شده آیکون قفل می‌گیرند تا کاربر بداند تغییرشان
// «درخواست ویرایش» لازم دارد.
// در فارسی برچسب راست‌چین است و قفل سمت چپش؛ در انگلیسی برعکس.
const FieldLabel = ({ text, locked, style, rtl }) => (
  <View style={{ flexDirection: rtl ? 'row' : 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
    {locked ? <Ionicons name="lock-closed" size={13} color={colors.textMuted.color} /> : null}
    <Text style={style}>{text}</Text>
  </View>
);
// Backend تاریخ شمسی می‌خواد، نیازی به تبدیل نیست
// import { jalaliToGregorian } from '@helpers/Common';

const OrganizationProfile = () => {
  const navigation = useNavigation();
  const { logoutWithConfirmation, isLoggingOut } = useLogout();
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles, isRTL), [NewStyles, isRTL]);
  // Form states - مطابق با فیلدهای ثبت‌نام
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [businessName, setBusinessName] = useState('');
  // شناسه‌ی ملی سازمان در ثبت‌نام با کلید `melicode` فرستاده می‌شود.
  const [organizationNationalId, setOrganizationNationalId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [economicCode, setEconomicCode] = useState('');
  const [editRequest, setEditRequest] = useState(null);
  const [savedMainData, setSavedMainData] = useState(null);

  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [history, setHistory] = useState('');

  const [familyName, setFamilyName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');
  const token = useSelector(state => state.auth?.token)
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState({});
  const [datePickerModal, setDatePickerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  // لوگو / عکس حذف شده و هنوز «ذخیره» نزده است.
  const [removePhoto, setRemovePhoto] = useState(false);

  // بند ۱۰: فیلدهای آزاد همیشه با «ویرایش» باز می‌شوند؛ فیلدهای قفل فقط وقتی
  // پنل «درخواست ویرایش» را تأیید کرده باشد (و پس از ذخیره دوباره قفل می‌شوند).
  const editState = useMemo(() => readEditRequestState(savedMainData), [savedMainData]);
  const can = (field) =>
    isProfileFieldEditable(field, { editing: isEditing, unlockedFields: editState.unlockedFields });
  const isLocked = (field) => !isProfileFieldEditable(field, { editing: true, unlockedFields: editState.unlockedFields });

  useEffect(() => {
    loadOrganizationProfile();
  }, []);

  // بارگذاری اطلاعات پروفایل
  const loadOrganizationProfile = async () => {
    try {
      setLoadingProfile(true);

      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        navigation.navigate('Login');
        return;
      }


      const response = await axios.get(`${uri}/organization/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });


      if (response.data.status === 'success') {
        const data = response.data.data;
        setEditRequest(data?.edited_organization)
        setSavedMainData(data)
        setOrganizationName(data.organization_name || '');
        setBusinessName(data.business_name || '');
        setOrganizationNationalId(data.melicode || data.organization_national_id || data.national_id || '');
        setRegistrationNumber(data.registration_number || '');
        setEconomicCode(data.economic_code || '');
        setAgentName(data.agent_name || '');
        setAgentPhone(data.agent_phone || '');
        setHistory(data.history || '');
        setFamilyName(data.manager_full_name || '');
        setNationalCode(data.manager_national_code || '');

        if (data.manager_mobile) {
          setMobileNumber(data.manager_mobile);
        } else {

          const orgData = await AsyncStorage.getItem('organizationData');
          if (orgData) {
            const savedData = JSON.parse(orgData);
            if (savedData.manager_mobile) {
              setMobileNumber(savedData.manager_mobile);
            }
          }


        }

        setOrganizationPhoneNumber(data.organization_phone || '');
        setBirthDate(data.manager_birthdate || '');
        setOrganizationEmail(data.organization_email || '');
        setCity(data.city || '');
        setRegion(data.region_id || '');
        setOrganizationAddress(data.organization_address || '');
        setOrganizationPostalCode(data.postal_code || '');

        if (data.profile_image) {

          // بررسی: آیا URL کامل است؟
          const isFullUrl = data.profile_image.startsWith('http');

          const imageUrl = isFullUrl ? data.profile_image : `${imageUri}/${data.profile_image}`;
          setProfileImage({ uri: imageUrl, uploaded: true });
        } else {
        }

      } else {
      }
    } catch (error) {

    } finally {
      setLoadingProfile(false);
    }
  };

  // فرم را از یک منبع (پروفایل ذخیره‌شده یا تغییرات در انتظار بررسی) پر می‌کند.
  const fillForm = (source) => {
    if (!source) return;
    setOrganizationName(source.organization_name || '');
    setBusinessName(source.business_name || '');
    setOrganizationNationalId(source.melicode || source.organization_national_id || source.national_id || '');
    setRegistrationNumber(source.registration_number || '');
    setEconomicCode(source.economic_code || '');
    setAgentName(source.agent_name || '');
    setAgentPhone(source.agent_phone || '');
    setHistory(source.history || '');
    setFamilyName(source.manager_full_name || '');
    if (source.manager_national_code) setNationalCode(source.manager_national_code);
    if (source.manager_mobile) setMobileNumber(source.manager_mobile);
    setOrganizationPhoneNumber(source.organization_phone || '');
    setBirthDate(source.manager_birthdate || '');
    setOrganizationEmail(source.organization_email || '');
    setCity(source.city || '');
    setRegion(source.region_id || '');
    setOrganizationAddress(source.organization_address || '');
    setOrganizationPostalCode(source.postal_code || '');
    if (source.profile_image) {
      const isFullUrl = source.profile_image.startsWith('http');
      const imageUrl = isFullUrl ? source.profile_image : `${imageUri}/${source.profile_image}`;
      setProfileImage({ uri: imageUrl, uploaded: true });
    }
  };

  const startEdit = () => {
    // تغییراتی که هنوز در انتظار بررسی پنل‌اند (روال قبلی) ادامه داده می‌شوند.
    if (editRequest && Number(editRequest.status) === 0) fillForm(editRequest);
    setRequestFormOpen(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setRemovePhoto(false);
    if (!savedMainData?.profile_image) setProfileImage(null);
    fillForm(savedMainData);
    setErrors({});
    setIsEditing(false);
  };

  // به‌روزرسانی پروفایل
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        return;
      }

      // بررسی آیا عکس جدید داریم
      // عکس تازه همیشه URI محلی است (برش‌خورده، دوربین یا آواتار آماده).
      const hasNewImage = Boolean(profileImage?.uri) && isLocalUri(profileImage.uri);

      let requestData;
      let requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // فقط فیلدهای مجاز فرستاده می‌شوند: آزادها همیشه، قفل‌ها فقط پس از تأیید
      // «درخواست ویرایش» توسط پنل.
      const values = pickEditableProfileValues(
        {
          organization_name: organizationName,
          business_name: businessName,
          melicode: organizationNationalId,
          registration_number: registrationNumber,
          economic_code: economicCode,
          agent_name: agentName,
          agent_phone: agentPhone,
          history: history,
          organization_email: organizationEmail,
          organization_phone: organizationPhoneNumber,
          organization_address: organizationAddress,
          manager_full_name: familyName,
          manager_national_code: nationalCode,
          manager_mobile: mobileNumber,
          city: city,
          region: region,
          postal_code: organizationPostalCode,
          // Backend تاریخ شمسی می‌خواد (مثلاً 1370/01/01)
          ...(birthDate ? { manager_birthdate: birthDate } : {}),
        },
        editState.unlockedFields
      );
      // حذف لوگو / عکس سازمان (بند ۱۲) - قرارداد: `remove_profile_image: 1`.
      if (removePhoto && !hasNewImage) values.remove_profile_image = 1;

      if (hasNewImage) {
        const formData = new FormData();

        await appendImageFile(formData, 'profile_image', profileImage.uri);
        Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ''));

        requestData = formData;
        requestHeaders['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = values;
        requestHeaders['Content-Type'] = 'application/json';
      }



      // همیشه از POST استفاده کن
      const response = await axios.post(
        `${uri}/organization/update-profile`,
        requestData,
        {
          headers: requestHeaders,
          timeout: 30000,
        }
      );


      if (response.data.status === 'success') {
        const responseData = response.data.data;


        // بررسی تصویر در پاسخ
        if (responseData?.profile_image) {

          const isFullUrl = responseData.profile_image.startsWith('http');
          const newImageUrl = isFullUrl ? responseData.profile_image : `${uri}/storage/${responseData.profile_image}`;

          setProfileImage({ uri: newImageUrl, uploaded: true });
        }

        // رسید آدرس/تلفن ثابت/شناسه ملی را از همین پروفایل می‌خواند و نتیجه را
        // کش می‌کند؛ بدون این، رسید تا ری‌لود بعدی مقدار قدیمی را نشان می‌داد.
        clearAccountProfileCache();
        showAlert(t('Success'), t('Profile updated successfully.'));
        setRemovePhoto(false);
        setIsEditing(false);
        // بارگذاری مجدد اطلاعات
        await loadOrganizationProfile();
      }
    } catch (error) {
      // چک کردن خطاهای مختلف
      if (error.response?.status === 405) {
        const errorMessage = error.response?.data?.message || '';
        const method = errorMessage.includes('POST') ? 'POST' : 'PUT';

        showAlert(
          t('⚠️ Update is not enabled yet'),
          t('Unfortunately, the backend has not enabled organizational profile editing yet.\n\n📋 Current status:\n✅ View profile: enabled\n❌ Edit profile: disabled\n\n🔧 Required backend endpoint:\n• POST /api/organization/profile (with _method=PUT)\n• or PUT /api/organization/profile\n\n📞 Please coordinate with the backend team to enable this endpoint.'),
          [{
            text: t('Got it'),
            onPress: () => {
              setIsEditing(false);
              loadOrganizationProfile();
            }
          }]
        );
      } else if (error.response?.status === 422 && error.response?.data?.errors) {
        // نمایش خطاهای validation
        const errors = error.response.data.errors;
        const errorList = Object.keys(errors).map(key => `• ${errors[key].join('\n• ')}`).join('\n');
        showAlert(t('Validation error'), errorList);
      } else if (error.response?.status === 404) {
        showAlert(t('Error'), t('Organization information not found.'));
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        showAlert(t('Error'), t('Unauthorized access. Please login.'));
      } else {
        const errorMessage = error.response?.data?.message || t('Error updating profile');
        showAlert(t('Error'), errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // تغییر رمز عبور
  const handleChangePassword = async () => {
    try {
      // اعتبارسنجی
      const newErrors = {};

      if (!currentPassword) {
        newErrors.currentPassword = t('Current password is required');
      }

      if (!newPassword) {
        newErrors.newPassword = t('New password is required');
      } else if (newPassword.length < 8) {
        newErrors.newPassword = t('New password must be at least 8 characters');
      }

      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = t('Password and repeat password do not match.');
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);


      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        setLoading(false);
        return;
      }


      const response = await axios.patch(
        `${uri}/profile/password`,
        {
          current_password: currentPassword,
          password: newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );


      if (response.data.success) {
        showAlert(t('Success'), response.data.message || t('Password changed successfully.'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('Error changing password');
      showAlert(t('Error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d1e9ff' }}>
        <CustomStatusBar />
        <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
        <Text style={{ marginTop: 10, fontFamily: 'VazirLight', fontSize: 14 }}>{t('Loading...')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title={t('Organization profile')}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* وضعیت احراز هویت سازمان: در حال بررسی / تأیید / معلق / حذف */}
        <View style={styles.topSection}>
          <VerificationStatusCard profileData={savedMainData} />
        </View>

        {/* Header با دکمه ویرایش */}
        <View style={styles.headerContainer}>
          <View style={{alignItems: langIsRTL(i18n.language) ? 'flex-end' : 'flex-start'}}>
            <Text style={styles.headerTitle}>{t('Organization information')}</Text>
            {
              editRequest &&
              <View style={[{ backgroundColor: themeColor4.bgColor(1) }, NewStyles.border100]}>
                <View style={[{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: editRequest?.status == 0 ? themeColor11.bgColor(0.1) : editRequest?.status == 1 ? themeColor7.bgColor(0.1) : themeColor6.bgColor(0.1) }, NewStyles.border100]}>
                  <Text style={[editRequest?.status == 0 ? NewStyles.text11 : editRequest?.status == 1 ? NewStyles.text7 : NewStyles.text6]}>{editRequest?.status == 0 ? t("Awaiting review of changes") : editRequest?.status == 1 ? t("Approved") : t("Rejected")}</Text>
                </View>
              </View>
            }
          </View>
          {/* «ویرایش» فیلدهای آزاد را باز می‌کند (و پس از تأیید پنل، فیلدهای قفل را
              هم)؛ «درخواست ویرایش» فرم نامه‌ی مهر و امضادار را باز می‌کند. */}
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
            <TouchableOpacity onPress={isEditing ? cancelEdit : startEdit} style={styles.editButton}>
              <Ionicons
                name={isEditing ? 'close-circle-outline' : 'create-outline'}
                size={22}
                color={themeColor1.bgColor(1)}
              />
              <Text style={styles.editButtonText}>{isEditing ? t('Cancel') : t('Edit')}</Text>
            </TouchableOpacity>
            {!isEditing && editState.canRequest && (
              <TouchableOpacity onPress={() => setRequestFormOpen((open) => !open)} style={styles.editButton}>
                <Ionicons name="document-lock-outline" size={22} color={themeColor1.bgColor(1)} />
                <Text style={styles.editButtonText}>{t('Edit request')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.topSection}>
          <OrganizationEditRequestCard
            editState={editState}
            formOpen={requestFormOpen}
            onCloseForm={() => setRequestFormOpen(false)}
            onSubmitted={() => {
              setRequestFormOpen(false);
              loadOrganizationProfile();
            }}
          />
        </View>

        <View style={styles.formContainer}>

          {/* لوگو / عکس سازمان: گرد، با دوربین / گالری / آواتار و نمای شرکت‌ها /
              نمایش تمام‌صفحه / حذف (بند ۱۲). تغییر فقط در حالت «ویرایش». */}
          <View style={styles.imageContainer}>
            <ProfilePhotoEditor
              uri={profileImage?.uri || null}
              variant="organization"
              editable={can('profile_image')}
              onChange={({ uri: photoUri }) => {
                setProfileImage({ uri: photoUri });
                setRemovePhoto(false);
              }}
              onRemove={() => {
                setProfileImage(null);
                setRemovePhoto(true);
              }}
            />
            {isEditing && (
              <Text style={styles.imageText}>
                {t('Use the camera button to change the logo / photo')}
              </Text>
            )}
          </View>

          {/* نام سازمان */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Organization name *')} locked={isLocked('organization_name')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={organizationName}
              onChangeText={setOrganizationName}
              editable={can('organization_name')}
              style={[styles.input, !can('organization_name') && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Business name')} locked={isLocked('business_name')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              editable={can('business_name')}
              style={[styles.input, !can('business_name') && styles.inputDisabled]}
            />
          </View>

          {/* شناسه ملی، شماره ثبت و شماره اقتصادی سازمان / شرکت */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Organization national ID')} locked={isLocked('melicode')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={organizationNationalId}
              onChangeText={setOrganizationNationalId}
              editable={can('melicode')}
              keyboardType="number-pad"
              style={[styles.input, !can('melicode') && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Company registration number')} locked={isLocked('registration_number')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              editable={can('registration_number')}
              keyboardType="number-pad"
              style={[styles.input, !can('registration_number') && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Economic code (optional)')} locked={isLocked('economic_code')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={economicCode}
              onChangeText={setEconomicCode}
              editable={can('economic_code')}
              keyboardType="number-pad"
              style={[styles.input, !can('economic_code') && styles.inputDisabled]}
            />
          </View>

          {/* نام مدیر */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Manager full name *')} locked={isLocked('manager_full_name')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              editable={can('manager_full_name')}
              style={[styles.input, !can('manager_full_name') && styles.inputDisabled]}
            />
          </View>

          {/* کد ملی - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Manager national ID')} locked={isLocked('manager_national_code')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={nationalCode}
              onChangeText={setNationalCode}
              editable={can('manager_national_code')}
              keyboardType="number-pad"
              maxLength={10}
              style={[styles.input, !can('manager_national_code') && styles.inputDisabled]}
            />
          </View>

          {/* شماره موبایل - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Manager mobile number')} locked={isLocked('manager_mobile')} style={styles.label} rtl={isRTL} />
            <TextInput
              value={mobileNumber}
              onChangeText={setMobileNumber}
              editable={can('manager_mobile')}
              keyboardType="phone-pad"
              maxLength={11}
              style={[styles.input, !can('manager_mobile') && styles.inputDisabled]}
            />
          </View>

          {/* تاریخ تولد */}
          <View style={styles.fieldContainer}>
            <FieldLabel text={t('Manager date of birth')} locked={isLocked('manager_birthdate')} style={styles.label} rtl={isRTL} />
            <TouchableOpacity
              onPress={can('manager_birthdate') ? () => setDatePickerModal(true) : null}
              disabled={!can('manager_birthdate')}
              style={[styles.input, !can('manager_birthdate') && styles.inputDisabled]}
            >
              <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
                {birthDate || t('Select Date')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("Name of the CEO's representative")}</Text>
            <TextInput
              value={agentName}
              onChangeText={setAgentName}
              editable={can('agent_name')}
              style={[styles.input, !can('agent_name') && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("CEO Representative Phone")}</Text>
            <TextInput
              value={agentPhone}
              onChangeText={setAgentPhone}
              editable={can('agent_phone')}
              keyboardType={'phone-pad'}
              maxLength={11}
              style={[styles.input, !can('agent_phone') && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("Records")}</Text>
            <TextInput
              value={history}
              onChangeText={setHistory}
              editable={can('history')}
              style={[styles.input, !can('history') && styles.inputDisabled]}
            />
          </View>

          {/* ایمیل سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization email *')}</Text>
            <TextInput
              value={organizationEmail}
              onChangeText={setOrganizationEmail}
              editable={can('organization_email')}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, !can('organization_email') && styles.inputDisabled]}
            />
          </View>

          {/* تلفن ثابت سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization landline *')}</Text>
            <View style={[NewStyles.row, { gap: 10 }]}>
              <TextInput
                value={organizationPhoneNumber}
                onChangeText={setOrganizationPhoneNumber}
                editable={can('organization_phone')}
                keyboardType="phone-pad"
                style={[styles.input, { flex: 1 }, !can('organization_phone') && styles.inputDisabled]}
              />
              <TextInput style={[NewStyles.text10, styles.prefixInput,]} value="021" editable={false} />
            </View>
          </View>

          {/*منطقه */}
          <View style={styles.rowContainer}>

            <View style={styles.halfField}>
              <Text style={styles.label}>{t('Region *')}</Text>
              <TextInput
                value={region}
                onChangeText={setRegion}
                editable={can('region')}
                keyboardType='number-pad'
                style={[styles.input, !can('region') && styles.inputDisabled]}
              />
            </View>
          </View>

          {/* آدرس سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization address *')}</Text>
            <TextInput
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
              editable={can('organization_address')}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea, !can('organization_address') && styles.inputDisabled]}
            />
          </View>

          {/* کد پستی */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization postal code *')}</Text>
            <TextInput
              value={organizationPostalCode}
              onChangeText={setOrganizationPostalCode}
              editable={can('postal_code')}
              keyboardType="numeric"
              maxLength={10}
              style={[styles.input, !can('postal_code') && styles.inputDisabled]}
            />
          </View>

          {/* دکمه ذخیره تغییرات */}
          {isEditing && (
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={loading}
              style={styles.saveButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t('Save Changes')}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* مدارک و کاربران مجاز سازمان */}
          <View style={styles.accountSections}>
            <OrganizationDocumentsSection />
            <AuthorizedUsersSection />
          </View>

          {/* بخش تغییر رمز عبور */}
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>{t('Change Password')}</Text>

            {/* رمز عبور فعلی */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('Current password')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* رمز عبور جدید */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('New password')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            {/* تکرار رمز عبور */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('Confirm new password')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* دکمه تغییر رمز */}
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={loading}
              style={styles.changePasswordButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t('Change Password')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* امنیت حساب / تأیید دومرحله‌ای / بروزرسانی / حذف حساب */}
          <View style={styles.accountSections}>
            <AccountActionsCard navigation={navigation} isOrganization />
          </View>

          {/* دکمه خروج */}
          <TouchableOpacity
            onPress={logoutWithConfirmation}
            disabled={isLoggingOut}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>{t('Log out of account')}</Text>
          </TouchableOpacity>

        </View>
        <FooterSpacer />
      </ScrollView>

      {/* DatePicker Modal */}
      <DatePickerModal
        datePickerModal={datePickerModal}
        setDatePickerModal={setDatePickerModal}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
      />

    </KeyboardAvoidingView>
  );
};

const createLocalStyles = (NewStyles, isRTL) => StyleSheet.create({
  headerContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1976d2',
    ...NewStyles.border10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    ...NewStyles.row,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
  },
  editButton: {
    ...NewStyles.row,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirLight',
    marginRight: 6,
  },
  formContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  imageText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
    marginBottom: 6,
    ...NewStyles.text10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    fontFamily: 'VazirLight',
    ...NewStyles.text10,
    minHeight: 40,
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#666',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
  },
  passwordSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#1976d2',
    marginBottom: 15,
    textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    fontFamily: 'VazirLight',
    textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr',
    minHeight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    left: 12,
    top: 9,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    fontFamily: 'VazirLight',
    marginTop: 4,
    ...NewStyles.text,
  },
  changePasswordButton: {
    backgroundColor: '#ff9800',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  // داخل formContainer (که خودش ۹۰٪ و وسط‌چین است) فقط فاصله‌ی عمودی لازم است.
  accountSections: {
    marginTop: spacing.md,
  },
  topSection: {
    width: '90%',
    alignSelf: 'center',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
    marginRight: 8,
  },
  prefixInput: {
    width: 70,
    backgroundColor: '#ddd',
    textAlign: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
});

export default OrganizationProfile;

