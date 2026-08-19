import React, { useState, useEffect, useMemo } from 'react';
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
import { createStyles } from '@styles/NewStyles';
import { themeColor1, themeColor11, themeColor4, themeColor6, themeColor7 } from '@theme/Color';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import DatePickerModal from '@components/DatePickerModal';
import { langIsRTL, showAlert } from '@helpers/Common';

import useLogout from '@hooks/useLogout';
import { imageUri, uri } from '@services/URL';
import NewStyles from '@styles/NewStyles';
import { useSelector } from 'react-redux';
// Backend تاریخ شمسی می‌خواد، نیازی به تبدیل نیست
// import { jalaliToGregorian } from '@helpers/Common';

const OrganizationProfile = () => {
  const navigation = useNavigation();
  const { logoutWithConfirmation, isLoggingOut } = useLogout();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  // Form states - مطابق با فیلدهای ثبت‌نام
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [businessName, setBusinessName] = useState('');
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

  // انتخاب تصویر پروفایل
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showAlert(t('Error'), t('Gallery access is required.'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });


      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        setProfileImage(selectedImage);
      } else {
      }
    } catch (error) {
      showAlert(t('Error'), t('Error selecting image'));
    }
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
      const hasNewImage = profileImage && profileImage.uri && !profileImage.uri.startsWith('http');

      let requestData;
      let requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      if (hasNewImage) {
        const formData = new FormData();

        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('profile_image', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });

        formData.append('organization_name', organizationName);
        formData.append('business_name', businessName);
        formData.append('agent_name', agentName);
        formData.append('agent_phone', agentPhone);
        formData.append('history', history);
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
        }

        requestData = formData;
        requestHeaders['Content-Type'] = 'multipart/form-data';
      } else {
        const jsonData = {
          organization_name: organizationName,
          business_name: businessName,
          agent_name: agentName,
          agent_phone: agentPhone,
          history: history,
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

        }

        requestData = jsonData;
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

        showAlert(t('Success'), t('Profile updated successfully.'));
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
          <TouchableOpacity
            onPress={() => {

              if (editRequest && !isEditing) {
                setOrganizationName(editRequest.organization_name || '');
                setBusinessName(editRequest.business_name || '');
                setAgentName(editRequest.agent_name || '');
                setAgentPhone(editRequest.agent_phone || '');
                setHistory(editRequest.history || '');
                setFamilyName(editRequest.manager_full_name || '');
                setOrganizationPhoneNumber(editRequest.organization_phone || '');
                setBirthDate(editRequest.manager_birthdate || '');
                setOrganizationEmail(editRequest.organization_email || '');
                setCity(editRequest.city || '');
                setRegion(editRequest.region_id || '');
                setOrganizationAddress(editRequest.organization_address || '');
                setOrganizationPostalCode(editRequest.postal_code || '');
                // بررسی: آیا URL کامل است؟
                if (editRequest?.profile_image) {

                  const isFullUrl = editRequest.profile_image.startsWith('http');

                  const imageUrl = isFullUrl ? editRequest.profile_image : `${imageUri}/${editRequest.profile_image}`;
                  setProfileImage({ uri: imageUrl, uploaded: true });
                }
                setIsEditing(true);
              } else if (isEditing) {
                setOrganizationName(savedMainData.organization_name || '');
                setBusinessName(savedMainData.business_name || '');
                setAgentName(savedMainData.agent_name || '');
                setAgentPhone(savedMainData.agent_phone || '');
                setHistory(savedMainData.history || '');
                setFamilyName(savedMainData.manager_full_name || '');
                setOrganizationPhoneNumber(savedMainData.organization_phone || '');
                setBirthDate(savedMainData.manager_birthdate || '');
                setOrganizationEmail(savedMainData.organization_email || '');
                setCity(savedMainData.city || '');
                setRegion(savedMainData.region_id || '');
                setOrganizationAddress(savedMainData.organization_address || '');
                setOrganizationPostalCode(savedMainData.postal_code || '');
                // بررسی: آیا URL کامل است؟
                if (savedMainData?.profile_image) {

                  const isFullUrl = savedMainData.profile_image.startsWith('http');

                  const imageUrl = isFullUrl ? savedMainData.profile_image : `${imageUri}/${savedMainData.profile_image}`;
                  setProfileImage({ uri: imageUrl, uploaded: true });
                }
                setIsEditing(false);
              } else if (!editRequest) {

                setIsEditing(!isEditing);
              }
            }}
            style={styles.editButton}
          >
            <Ionicons
              name={isEditing ? "checkmark-circle" : "create-outline"}
              size={24}
              color={themeColor1.bgColor(1)}
            />
            <Text style={styles.editButtonText}>
              {isEditing ? t('Cancel') : t("Edit request")}
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
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('Business name')}</Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
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

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("Name of the CEO's representative")}</Text>
            <TextInput
              value={agentName}
              onChangeText={setAgentName}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("CEO Representative Phone")}</Text>
            <TextInput
              value={agentPhone}
              onChangeText={setAgentPhone}
              editable={isEditing}
              keyboardType={'phone-pad'}
              maxLength={11}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("Records")}</Text>
            <TextInput
              value={history}
              onChangeText={setHistory}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
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

          {/*منطقه */}
          <View style={styles.rowContainer}>

            <View style={styles.halfField}>
              <Text style={styles.label}>{t('Region *')}</Text>
              <TextInput
                value={region}
                onChangeText={setRegion}
                editable={isEditing}
                keyboardType='number-pad'
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
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

