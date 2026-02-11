import React, { useState, useEffect,useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import { showAlert } from '../../helpers/Common';

import useLogout from '../../hooks/useLogout';
import { uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
// Backend تاریخ شمسی می‌خواد، نیازی به تبدیل نیست
// import { jalaliToGregorian } from '../../helpers/Common';

const OrganizationProfile = () => {
  const navigation = useNavigation();
  const { logoutWithConfirmation, isLoggingOut } = useLogout();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  // Form states - مطابق با فیلدهای ثبت‌نام
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
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

  useEffect(() => {
    loadOrganizationProfile();
  }, []);

  // بارگذاری اطلاعات پروفایل
  const loadOrganizationProfile = async () => {
    try {
      console.log('🔄 [OrganizationProfile] شروع بارگذاری پروفایل...');
      setLoadingProfile(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        console.log('❌ [OrganizationProfile] توکن یافت نشد');
        showAlert(t('Error'), t('Please log in first.'));
        navigation.navigate('Login');
        return;
      }

      console.log('📡 [OrganizationProfile] ارسال درخواست به:', `${uri}/organization/profile`);

      const response = await axios.get(`${uri}/organization/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      console.log('✅ [OrganizationProfile] پاسخ دریافت شد:', response.data);
      console.log('📊 [OrganizationProfile] وضعیت پاسخ:', response.data.status);

      if (response.data.status === 'success') {
        const data = response.data.data;
        console.log('📦 [OrganizationProfile] داده‌های دریافتی کامل:', JSON.stringify(data, null, 2));

        setOrganizationName(data.organization_name || '');
        setFamilyName(data.manager_full_name || '');
        setNationalCode(data.manager_national_code || '');

        // اگر شماره موبایل null بود، از AsyncStorage بخوان
        if (data.manager_mobile) {
          setMobileNumber(data.manager_mobile);
          console.log('📱 [OrganizationProfile] شماره موبایل از API:', data.manager_mobile);
        } else {
          console.log('⚠️ [OrganizationProfile] manager_mobile null است، خواندن از AsyncStorage...');

          // ابتدا از organizationData بخوان
          const orgData = await AsyncStorage.getItem('organizationData');
          if (orgData) {
            const savedData = JSON.parse(orgData);
            console.log('📦 [OrganizationProfile] organizationData:', savedData);
            if (savedData.manager_mobile) {
              setMobileNumber(savedData.manager_mobile);
              console.log('📱 [OrganizationProfile] شماره موبایل از organizationData:', savedData.manager_mobile);
            }
          }

          // اگر نبود، از userData بخوان
          if (!mobileNumber) {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              console.log('📦 [OrganizationProfile] userData:', user);
              if (user.phone || user.mobile) {
                const phone = user.phone || user.mobile;
                setMobileNumber(phone);
                console.log('📱 [OrganizationProfile] شماره موبایل از userData:', phone);
              }
            }
          }
        }

        setOrganizationPhoneNumber(data.organization_phone || '');
        setBirthDate(data.manager_birthdate || '');
        setOrganizationEmail(data.organization_email || '');
        setCity(data.city || '');
        setRegion(data.region || '');
        setOrganizationAddress(data.organization_address || '');
        setOrganizationPostalCode(data.postal_code || '');

        console.log('🏢 [OrganizationProfile] نام سازمان set شد:', data.organization_name);
        console.log('👤 [OrganizationProfile] نام مدیر set شد:', data.manager_full_name);
        console.log('📱 [OrganizationProfile] شماره موبایل نهایی:', data.manager_mobile || 'از AsyncStorage');

        if (data.profile_image) {
          console.log('🖼️ [OrganizationProfile] ===== بررسی تصویر پروفایل =====');
          console.log('🖼️ [OrganizationProfile] مقدار خام از سرور:', data.profile_image);

          // بررسی: آیا URL کامل است؟
          const isFullUrl = data.profile_image.startsWith('http');
          console.log('🖼️ [OrganizationProfile] آیا URL کامل است?:', isFullUrl);

          const imageUrl = isFullUrl ? data.profile_image : `${uri}/storage/${data.profile_image}`;
          console.log('🖼️ [OrganizationProfile] URL نهایی:', imageUrl);
          setProfileImage({ uri: imageUrl, uploaded: true });
        } else {
          console.log('⚠️ [OrganizationProfile] تصویر پروفایل موجود نیست');
        }

        console.log('✅ [OrganizationProfile] تمام داده‌ها با موفقیت set شدند');
      } else {
        console.log('⚠️ [OrganizationProfile] وضعیت پاسخ success نیست:', response.data);
      }
    } catch (error) {
      console.error('❌ [OrganizationProfile] خطا در بارگذاری پروفایل:', error);
      console.error('❌ [OrganizationProfile] جزئیات خطا:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Fallback: تلاش برای بارگذاری از AsyncStorage
      console.log('🔄 [OrganizationProfile] تلاش برای بارگذاری از AsyncStorage...');
      try {
        const organizationData = await AsyncStorage.getItem('organizationData');
        if (organizationData) {
          const data = JSON.parse(organizationData);
          console.log('📦 [OrganizationProfile] داده‌های AsyncStorage:', data);

          setOrganizationName(data.organization_name || '');
          setFamilyName(data.manager_full_name || '');
          setNationalCode(data.manager_national_code || '');
          setMobileNumber(data.manager_mobile || '');
          setOrganizationPhoneNumber(data.organization_phone || '');
          setBirthDate(data.manager_birthdate || '');
          setOrganizationEmail(data.organization_email || '');
          setCity(data.city || '');
          setRegion(data.region || '');
          setOrganizationAddress(data.organization_address || '');
          setOrganizationPostalCode(data.postal_code || '');

          if (data.profile_image) {
            const isFullUrl = data.profile_image.startsWith('http');
            const imageUrl = isFullUrl ? data.profile_image : `${uri}/storage/${data.profile_image}`;
            setProfileImage({ uri: imageUrl, uploaded: true });
          }

          console.log('✅ [OrganizationProfile] داده‌ها از AsyncStorage بارگذاری شد');
        } else {
          console.log('⚠️ [OrganizationProfile] داده‌ای در AsyncStorage یافت نشد');
          showAlert(t('Error'), error.response?.data?.message || t('Error loading information. Please log in again.'));
        }
      } catch (storageError) {
        console.error('❌ [OrganizationProfile] خطا در خواندن از AsyncStorage:', storageError);
        showAlert(t('Error'), t('Error loading information.'));
      }
    } finally {
      setLoadingProfile(false);
      console.log('🏁 [OrganizationProfile] پایان بارگذاری پروفایل');
    }
  };

  // انتخاب تصویر پروفایل
  const pickImage = async () => {
    try {
      console.log('📸 [OrganizationProfile] ===== شروع انتخاب تصویر =====');

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        console.log('❌ [OrganizationProfile] دسترسی رد شد');
        showAlert(t('Error'), t('Gallery access is required.'));
        return;
      }

      console.log('✅ [OrganizationProfile] دسترسی تأیید شد');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📸 [OrganizationProfile] نتیجه:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('✅ [OrganizationProfile] تصویر انتخاب شد:');
        console.log('  - URI:', selectedImage.uri);
        console.log('  - Width:', selectedImage.width);
        console.log('  - Height:', selectedImage.height);

        setProfileImage(selectedImage);
        console.log('✅ [OrganizationProfile] تصویر set شد');
      } else {
        console.log('❌ [OrganizationProfile] انتخاب لغو شد');
      }

      console.log('📸 [OrganizationProfile] ===== پایان انتخاب =====');
    } catch (error) {
      console.error('❌ [OrganizationProfile] خطا:', error);
      showAlert(t('Error'), t('Error selecting image'));
    }
  };

  // به‌روزرسانی پروفایل
  const handleUpdateProfile = async () => {
    try {
      console.log('🔄 [OrganizationProfile] شروع به‌روزرسانی پروفایل...');
      setLoading(true);
      setErrors({});

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        return;
      }

      // بررسی آیا عکس جدید داریم
      const hasNewImage = profileImage && profileImage.uri && !profileImage.uri.startsWith('http');

      console.log('📝 [OrganizationProfile] آماده‌سازی داده‌ها...');
      console.log('🖼️ [OrganizationProfile] عکس جدید:', hasNewImage ? 'بله' : 'خیر');

      let requestData;
      let requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      if (hasNewImage) {
        // اگر عکس جدید داریم، از FormData استفاده کن
        console.log('📦 [OrganizationProfile] استفاده از FormData (با عکس)');
        const formData = new FormData();

        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('profile_image', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });

        formData.append('organization_name', organizationName);
        formData.append('organization_email', organizationEmail);
        formData.append('organization_phone', organizationPhoneNumber);
        formData.append('organization_address', organizationAddress);
        formData.append('manager_full_name', familyName);
        formData.append('city', city);
        formData.append('region', region);
        formData.append('postal_code', organizationPostalCode);

        if (birthDate) {
          // Backend تاریخ شمسی می‌خواد (مثلاً 1370/01/01)
          formData.append('manager_birthdate', birthDate);
          console.log('📅 [OrganizationProfile] تاریخ تولد (شمسی):', birthDate);
        }

        requestData = formData;
        requestHeaders['Content-Type'] = 'multipart/form-data';
      } else {
        // اگر عکس نداریم، از JSON استفاده کن
        console.log('� [OrganizationProfile] استفاده از JSON (بدون عکس)');
        const jsonData = {
          organization_name: organizationName,
          organization_email: organizationEmail,
          organization_phone: organizationPhoneNumber,
          organization_address: organizationAddress,
          manager_full_name: familyName,
          city: city,
          region: region,
          postal_code: organizationPostalCode,
        };

        if (birthDate) {
          // Backend تاریخ شمسی می‌خواد (مثلاً 1370/01/01)
          jsonData.manager_birthdate = birthDate;
          console.log('📅 [OrganizationProfile] تاریخ تولد (شمسی):', birthDate);
        }

        requestData = jsonData;
        requestHeaders['Content-Type'] = 'application/json';
      }

      console.log('📡 [OrganizationProfile] ارسال درخواست به:', `${uri}/organization/update-profile`);
      console.log('📡 [OrganizationProfile] استفاده از متد: POST');
      console.log('📡 [OrganizationProfile] Content-Type:', requestHeaders['Content-Type']);
      console.log('📦 [OrganizationProfile] داده‌های ارسالی:', {
        organization_name: organizationName,
        organization_email: organizationEmail,
        organization_phone: organizationPhoneNumber,
        manager_full_name: familyName,
        city: city,
        region: region,
        postal_code: organizationPostalCode,
      });

      // همیشه از POST استفاده کن
      const response = await axios.post(
        `${uri}/organization/update-profile`,
        requestData,
        {
          headers: requestHeaders,
          timeout: 30000,
        }
      );

      console.log('✅ [OrganizationProfile] پاسخ دریافت شد:', response.data);
      console.log('📦 [OrganizationProfile] response.data کامل:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        const responseData = response.data.data;

        console.log('🔍 [OrganizationProfile] ===== بررسی پاسخ =====');
        console.log('  - نام سازمان ارسالی:', organizationName);
        console.log('  - نام سازمان برگشتی:', responseData?.organization_name);

        // بررسی تصویر در پاسخ
        if (responseData?.profile_image) {
          console.log('🖼️ [OrganizationProfile] ===== تصویر جدید در پاسخ =====');
          console.log('🖼️ [OrganizationProfile] profile_image:', responseData.profile_image);

          const isFullUrl = responseData.profile_image.startsWith('http');
          const newImageUrl = isFullUrl ? responseData.profile_image : `${uri}/storage/${responseData.profile_image}`;

          console.log('🖼️ [OrganizationProfile] URL نهایی:', newImageUrl);
          setProfileImage({ uri: newImageUrl, uploaded: true });
        }

        showAlert(t('Success'), t('Profile updated successfully.'));
        setIsEditing(false);

        console.log('🔄 [OrganizationProfile] بارگذاری مجدد اطلاعات...');
        // بارگذاری مجدد اطلاعات
        await loadOrganizationProfile();
        console.log('✅ [OrganizationProfile] بارگذاری مجدد کامل شد');
      }
    } catch (error) {
      console.error('❌ [OrganizationProfile] خطا در به‌روزرسانی:', error);
      console.error('❌ [OrganizationProfile] جزئیات خطا:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

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
      const token = await AsyncStorage.getItem('userToken');

      console.log('🔑 [OrganizationProfile] توکن برای تغییر رمز:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        setLoading(false);
        return;
      }

      console.log('📡 [OrganizationProfile] ارسال درخواست با body:', {
        current_password: '***',
        password: '***'
      });

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

      console.log('✅ [OrganizationProfile] پاسخ سرور:', response.data);

      if (response.data.success) {
        showAlert(t('Success'), response.data.message || t('Password changed successfully.'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      }
    } catch (error) {
      console.error('Error changing password:', error);
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header با دکمه ویرایش */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t('Organization information')}</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Ionicons
              name={isEditing ? "checkmark-circle" : "create-outline"}
              size={24}
              color={themeColor1.bgColor(1)}
            />
            <Text style={styles.editButtonText}>
              {isEditing ? t('Cancel') : t('Edit')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>

          {/* تصویر پروفایل */}
          <TouchableOpacity
            onPress={isEditing ? pickImage : null}
            disabled={!isEditing}
            style={styles.imageContainer}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage.uri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={{ fontSize: 40 }}>🏢</Text>
              </View>
            )}
            {isEditing && (
              <Text style={styles.imageText}>
                {profileImage ? t('Change image') : t('Select image')}
              </Text>
            )}
          </TouchableOpacity>

          {/* نام سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization name *')}</Text>
            <TextInput
              value={organizationName}
              onChangeText={setOrganizationName}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* نام مدیر */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Manager full name *')}</Text>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* کد ملی - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Manager national ID')}</Text>
            <TextInput
              value={nationalCode}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
          </View>

          {/* شماره موبایل - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Manager mobile number')}</Text>
            <TextInput
              value={mobileNumber}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
          </View>

          {/* تاریخ تولد */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Manager date of birth')}</Text>
            <TouchableOpacity
              onPress={isEditing ? () => setDatePickerModal(true) : null}
              disabled={!isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            >
              <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
                {birthDate || t('Select Date')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ایمیل سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization email *')}</Text>
            <TextInput
              value={organizationEmail}
              onChangeText={setOrganizationEmail}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* تلفن ثابت سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization landline *')}</Text>
            <View style={[NewStyles.row, { gap: 10 }]}>
              <TextInput
                value={organizationPhoneNumber}
                onChangeText={setOrganizationPhoneNumber}
                editable={isEditing}
                keyboardType="phone-pad"
                style={[styles.input, { flex: 1 }, !isEditing && styles.inputDisabled]}
              />
              <TextInput style={[NewStyles.text10, styles.prefixInput,]} value="021" editable={false} />
            </View>
          </View>

          {/* شهر و منطقه */}
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.label}>{t('City *')}</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                editable={isEditing}
                style={[styles.input, !isEditing && styles.inputDisabled]}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>{t('Region *')}</Text>
              <TextInput
                value={region}
                onChangeText={setRegion}
                editable={isEditing}
                style={[styles.input, !isEditing && styles.inputDisabled]}
              />
            </View>
          </View>

          {/* آدرس سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization address *')}</Text>
            <TextInput
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
              editable={isEditing}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* کد پستی */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Organization postal code *')}</Text>
            <TextInput
              value={organizationPostalCode}
              onChangeText={setOrganizationPostalCode}
              editable={isEditing}
              keyboardType="numeric"
              maxLength={10}
              style={[styles.input, !isEditing && styles.inputDisabled]}
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

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    textAlign: 'right',
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
    textAlign: 'right',
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

