import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getFormatedDate } from 'react-native-modern-datepicker';
import Footer from '../../screens/Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import LocationPicker from '../../components/LocationPicker';
import { uri } from '../../services/URL';
import { jalaliToGregorian, showAlert } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { createStyles } from '../../styles/NewStyles';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { restartOtpRetriever, stopOtpRetriever } from './../../screens/auth/OtpRetriever';

const Register = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );

  const hashApp = useSelector(state=>state.hashApp?.hash)
  // const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  // Form states
  const [accountType, setAccountType] = useState('g_organization');
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [history, setHistory] = useState('');

  const [nationalCode, setNationalCode] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('تهران');
  const [region, setRegion] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');
  const [securityCode, setSecurityCode] = useState('');

  // Location states
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [datePickerModal, setDatePickerModal] = useState(false);

  // Generate random captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [displayedCaptcha, setDisplayedCaptcha] = useState(generateCaptcha());

  // Initialize captcha on component mount
  useEffect(() => {
    setDisplayedCaptcha(generateCaptcha());
  }, []);

  // Validation functions
  const validateNationalCode = (code) => {
    if (!/^\d{10}$/.test(code)) return false;
    const check = parseInt(code[9]);
    const sum = code.split('').slice(0, 9)
      .reduce((acc, digit, i) => acc + parseInt(digit) * (10 - i), 0);
    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) ||
      (remainder >= 2 && check === 11 - remainder);
  };

  const validateMobile = (mobile) => {
    return /^09\d{9}$/.test(mobile);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePostalCode = (code) => {
    return /^\d{10}$/.test(code);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!acceptTerms) {
      newErrors.acceptTerms = t('Acceptance of the rules and regulations is mandatory.');
    }
    if (!organizationName || organizationName.length < 2) {
      newErrors.organizationName = t('Organization name must be at least 2 characters');
    }

    if (!familyName || familyName.length < 2) {
      newErrors.familyName = t('Manager full name must be at least 2 characters');
    }

    if (!agentName || agentName.length < 2) {
      newErrors.agentName = t('Agent name must be at least 2 characters');
    }

    if (!agentPhone) {
      newErrors.agentPhone = t('Agent phone number is required');
    } else if (!validateMobile(agentPhone)) {
      newErrors.agentPhone = t('Agent phone number must be 11 digits and start with 09');
    }

    if (!history || history.length < 2) {
      newErrors.history = t('Records must be at least 2 characters');
    }

    if (!nationalCode) {
      newErrors.nationalCode = t('National ID is required');
    } else if (!validateNationalCode(nationalCode)) {
      newErrors.nationalCode = t('National ID is invalid');
    }
    if (!nationalID) {
      newErrors.nationalID = t('National Identifier is required');
    }

    if (!mobileNumber) {
      newErrors.mobileNumber = t('Mobile number is required');
    } else if (!validateMobile(mobileNumber)) {
      newErrors.mobileNumber = t('Mobile number must be 11 digits and start with 09');
    }

    if (!birthDate) {
      newErrors.birthDate = t('Birth date is required');
    }

    if (!organizationEmail) {
      newErrors.organizationEmail = t('Email address is required');
    } else if (!validateEmail(organizationEmail)) {
      newErrors.organizationEmail = t('The email address you entered is not valid.');
    }

    if (!organizationPhoneNumber) {
      newErrors.organizationPhoneNumber = t('Organization landline number is required');
    }

    if (!password || password.length < 8) {
      newErrors.password = t('Password must be at least 8 characters');
    }


    if (!selectedRegion) {
      newErrors.region = t('Region is required');
    }

    if (!organizationAddress || organizationAddress.length < 10) {
      newErrors.organizationAddress = t('Address must be at least 10 characters');
    }

    if (!organizationPostalCode) {
      newErrors.organizationPostalCode = t('Postal code is required');
    } else if (!validatePostalCode(organizationPostalCode)) {
      newErrors.organizationPostalCode = t('Postal code must be 10 digits');
    }

    // Captcha validation
    if (!securityCode) {
      newErrors.securityCode = t('Security code is required');
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      newErrors.securityCode = t('Security code is incorrect');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker function
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showAlert(t('Error'), t('Gallery access is required'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(t('Error'), t('Error selecting image'));
    }
  };

  // Register handler
  const handleRegister = async () => {
    if (loading) return;

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showAlert(t('Error'), t('Please fill in all the required fields.'));
      return;
    }

    // Validate captcha
    if (!securityCode) {
      setErrors({ securityCode: t('Security code is required') });
      showAlert(t('Error'), t('Please enter the security code'));
      return;
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      setErrors({ securityCode: t('Security code is incorrect') });
      showAlert(t('Error'), t('Security code is incorrect'));
      setDisplayedCaptcha(generateCaptcha());
      setSecurityCode('');
      return;
    }

    setLoading(true);

    try {
      // Convert Jalali date to Gregorian for API
      const gregorianDate = jalaliToGregorian(birthDate);



      // Create FormData
      const formData = new FormData();

      // Add image if selected (React Native specific format)
      if (profileImage) {
        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('profile_image', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      // Add all form fields
      formData.append('organization_name', organizationName);

      formData.append('business_name', businessName);

      formData.append('agent_name', agentName);
      formData.append('agent_phone', agentPhone);
      formData.append('history', history);
      formData.append('organization_email', organizationEmail);
      formData.append('organization_phone', '021' + organizationPhoneNumber);
      formData.append('organization_address', organizationAddress);
      formData.append('manager_full_name', familyName);
      formData.append('manager_national_code', nationalCode);
      formData.append('melicode', nationalID);
      formData.append('account_type', accountType);
      formData.append('manager_mobile', mobileNumber);
      formData.append('manager_birthdate', gregorianDate);  // Send Gregorian date to API
      formData.append('city', city);
      formData.append('region', region);
      formData.append('postal_code', organizationPostalCode);
      formData.append('password', password);
      formData.append('password_confirmation', password);
      formData.append('hashApp', hashApp?.[0] ?? '');

      if (selectedRegion) {
        formData.append('region_id', selectedRegion.id);
      }

      if (Platform.OS === 'android') {
        try {
          await restartOtpRetriever();
        } catch (otpError) {
          console.warn('OTP Retriever start error:', otpError);
        }
      }

      // Make API call with timeout
      const response = await axios.post(
        `${uri}/organization/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      console.log('✅ Registration successful:', response.data);

      if (response.data.status === 'success') {
        showAlert(
          t('Success'),
          t('Registration completed successfully. A verification code was sent to the mobile number.'),
          [
            {
              text: t('Confirm'),
              onPress: () => {
                navigation.navigate('OTPVerification', {
                  phone: mobileNumber,
                  organizationCode: response.data.data.organization_code,
                  userId: response.data.data.user_id,
                  organizationId: response.data.data.organization_id,
                });
              },
            },
          ]
        );
      } else {
        stopOtpRetriever({ clearPending: true });
        showAlert(t('Error'), response.data.message || t('Registration error'));
      }
    } catch (error) {
      stopOtpRetriever({ clearPending: true });

      if (error.response) {
        // Server responded with error (4xx, 5xx)
        console.log('Server response:', error.response.data);
        const errorData = error.response.data;

        if (errorData.errors) {
          // Validation errors from server
          const serverErrors = {};
          Object.keys(errorData.errors).forEach((key) => {
            serverErrors[key] = errorData.errors[key][0];
          });
          setErrors(serverErrors);

          showAlert(t('Validation error'), errorData.message || t('Please check the fields'));
        } else {
          showAlert(t('Error'), errorData.message || t('Registration error'));
        }
      } else if (error.request) {
        // Request made but no response (network error)
        console.log('No response received');
        showAlert(
          t('Connection error'),
          t('Server is not responding. Please check the following:') +
          '\n\n' +
          `${t('1. Device internet connection')}\n` +
          `${t('2. The server is running at address')} ${uri}\n` +
          t('3. The device and server are on the same network'),
          [
            { text: t('Close') },
            {
              text: t('Try again'),
              onPress: () => handleRegister()
            }
          ]
        );
      } else {
        // Something else happened
        console.log('Unknown error:', error.message);
        showAlert(t('Error'), `${t('Unknown error:')} ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView
        style={NewStyles.container}
        behavior={'padding'}
      >
        <CustomStatusBar />
        <ScreenHeaders
          title={t('Organization / Government')}
          onPressRight={() => navigation.navigate('TestConnection')}
          rightIcon="🔧"
        />

        <ScrollView
          contentContainerStyle={{ paddingTop: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main header - اطلاعات تکمیلی */}
          <View style={{
            width: '90%',
            alignSelf: 'center',
            backgroundColor: '#1976d2',
            borderRadius: 10,
            paddingVertical: 12,
            marginBottom: 15,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
            shadowColor: '#1976d2',
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={[NewStyles.title4]}>{t('Additional information')}</Text>
          </View>

          {/* Form Container */}
          <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>

            {/* تصویر پروفایل */}
            <TouchableOpacity
              onPress={pickImage}
              style={{
                marginBottom: 15,
                alignItems: 'center',
                paddingVertical: 15,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ccc',
                borderStyle: 'dashed'
              }}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    marginBottom: 8
                  }}
                />
              ) : (
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
              )}
              <Text style={{
                fontSize: 14,
                fontFamily: 'VazirLight',
                color: '#666'
              }}>
                {profileImage ? t('Change profile image') : t('Select profile image (optional)')}
              </Text>
            </TouchableOpacity>

            {/* نام سازمان */}
            <View>
              <Text style={NewStyles.text}>{t("Select organization type")} <Text style={NewStyles.title6}>*</Text></Text>
              <Dropdown
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  fontSize: 14,
                  height: 40
                }}
                itemTextStyle={NewStyles.text10}
                placeholderStyle={[NewStyles.text3, { fontSize: 12 }]}
                selectedTextStyle={[NewStyles.text10, { fontSize: 12 }]}
                data={[
                  { "label": t("Government organization"), "value": "g_organization" },
                  { "label": t("Semi-governmental organization"), "value": "s_g_organization" },
                  { "label": t("Private company"), "value": "company" },
                ]}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={t('Select organization type')}

                value={accountType}
                onChange={item => {
                  setAccountType(item?.value)
                }}
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Organization name')} <Text style={NewStyles.title6}>*</Text></Text>
              <TextInput
                value={organizationName}
                onChangeText={setOrganizationName}
                placeholder={t('Organization name *')}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.organizationName ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.organizationName && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.organizationName}
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Business name')} {t("(Optional)")} </Text>
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder={t('Business name')}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.businessName ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.businessName && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.businessName}
                </Text>
              )}
            </View>

            {/* نام و نام خانوادگی مدیر */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Manager full name')} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={familyName}
                onChangeText={setFamilyName}
                placeholder={t('Manager full name *')}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.familyName ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.familyName && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.familyName}
                </Text>
              )}
            </View>

            {/* شماره ملی مدیر */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Manager national ID')} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={nationalCode}
                onChangeText={setNationalCode}
                placeholder={t('Manager national ID *')}
                keyboardType="numeric"
                maxLength={10}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.nationalCode ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.nationalCode && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.nationalCode}
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t("National Identifier")} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={nationalID}
                onChangeText={setNationalID}
                placeholder={`${t("National Identifier")}  *`}
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.nationalID ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.nationalID && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.nationalID}
                </Text>
              )}
            </View>

            {/* شماره تلفن همراه مدیر */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Manager mobile number')} <Text style={NewStyles.title6}>*</Text></Text>
              <View style={{ gap: 10, flexDirection: "row" }}>

                <TextInput
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder={t('Manager mobile number *')}
                  keyboardType="numeric"
                  maxLength={11}
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    paddingLeft: 45,
                    borderWidth: 1,
                    borderColor: errors.mobileNumber ? '#ff0000' : '#ccc',
                    fontSize: 14,
                    fontFamily: 'VazirLight',
                    ...NewStyles.text10,

                    flex: 1
                  }}

                  placeholderTextColor={themeColor3.bgColor(1)}
                />

              </View>
              {errors.mobileNumber && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.mobileNumber}
                </Text>
              )}
            </View>

            {/* متولد */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Birth date')} <Text style={NewStyles.title6}>*</Text></Text>

              <TouchableOpacity
                onPress={() => setDatePickerModal(true)}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.birthDate ? '#ff0000' : '#ccc',

                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  color: birthDate ? '#333' : '#999'
                }}>
                  {birthDate ? `${t('Birth date:')} ${birthDate}` : t('Birth date *: (Select date)')}
                </Text>
              </TouchableOpacity>
              {errors.birthDate && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.birthDate}
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t("Name of the CEO's representative")} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={agentName}
                onChangeText={setAgentName}
                placeholder={t("Name of the CEO's representative")}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.agentName ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.agentName && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.agentName}
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t("CEO Representative Phone")} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={agentPhone}
                onChangeText={setAgentPhone}
                placeholder={t("CEO Representative Phone")}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.agentPhone ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  ...NewStyles.text10,
                  height: 40
                }}
                keyboardType='phone-pad'
                maxLength={11}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.agentPhone && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.agentPhone}
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t("Records")} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={history}
                onChangeText={setHistory}
                placeholder={t("Records")}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.history ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.history && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.history}
                </Text>
              )}
            </View>

            {/* آدرس ایمیل سازمان */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Organization email address')} <Text style={NewStyles.title6}>*</Text></Text>
              <TextInput
                value={organizationEmail}
                onChangeText={setOrganizationEmail}
                placeholder={t('Organization email address *')}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.organizationEmail ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}

                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.organizationEmail && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.organizationEmail}
                </Text>
              )}
            </View>

            {/* شماره تلفن ثابت سازمان */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Organization landline number')} <Text style={NewStyles.title6}>*</Text></Text>
              <View style={{ gap: 8, flexDirection: "row" }}>
                <View style={{
                  backgroundColor: '#ffeb3b',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  alignItems: 'center',
                  justifyContent: 'center',

                  minWidth: 50
                }}>
                  <Text style={{ fontSize: 10, color: '#333', fontFamily: 'VazirBold' }}>021-</Text>
                </View>
                <View style={{ flex: 2 }}>
                  <TextInput
                    value={organizationPhoneNumber}
                    onChangeText={setOrganizationPhoneNumber}
                    placeholder={t('Organization landline number *')}
                    keyboardType="phone-pad"
                    maxLength={8}
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: errors.organizationPhoneNumber ? '#ff0000' : '#ccc',
                      fontSize: 14,
                      fontFamily: 'VazirLight',
                      ...NewStyles.text10,
                      height: 40
                    }}
                    placeholderTextColor={themeColor3.bgColor(1)}
                  />
                </View>

              </View>
              {errors.organizationPhoneNumber && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.organizationPhoneNumber}
                </Text>
              )}
            </View>

            {/* رمز عبور */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Password')} <Text style={NewStyles.title6}>*</Text></Text>
              <View style={[NewStyles.row, {
                gap: 10, backgroundColor: '#f5f5f5',
                borderWidth: 1,
                borderColor: errors.password ? '#ff0000' : '#ccc', borderRadius: 8, paddingHorizontal: 12,
              }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('Password * (minimum 8 characters)')}
                  secureTextEntry={!showPassword}
                  style={{

                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                    paddingLeft: 45,
                    fontSize: 12,
                    fontFamily: 'VazirLight',
                    ...NewStyles.text10,

                    flex: 1
                  }}
                  placeholderTextColor={themeColor3.bgColor(1)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                  }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* استان، شهر و منطقه با LocationPicker */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Region')} <Text style={NewStyles.title6}>*</Text></Text>
              <LocationPicker
                selectedProvince={selectedProvince}
                selectedCity={selectedCity}
                selectedRegion={selectedRegion}
                onProvinceChange={setSelectedProvince}
                onCityChange={setSelectedCity}
                onRegionChange={setSelectedRegion}
                errors={{
                  province: errors.province,
                  city: errors.city,
                  region: errors.region
                }}
                required={true}
              />
            </View>

            {/* آدرس سازمان */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Organization address')} <Text style={NewStyles.title6}>*</Text></Text>
              <TextInput
                value={organizationAddress}
                onChangeText={setOrganizationAddress}
                placeholder={t('Organization address *')}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.organizationAddress ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 60,
                  textAlignVertical: 'top'
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.organizationAddress && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.organizationAddress}
                </Text>
              )}
            </View>

            {/* کد پستی سازمان */}
            <View style={{ marginBottom: 15 }}>
              <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Organization postal code')} <Text style={NewStyles.title6}>*</Text></Text>

              <TextInput
                value={organizationPostalCode}
                onChangeText={setOrganizationPostalCode}
                placeholder={t('Organization postal code * (10 digits)')}
                keyboardType="numeric"
                maxLength={10}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.organizationPostalCode ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 40
                }}
                placeholderTextColor={themeColor3.bgColor(1)}
              />
              {errors.organizationPostalCode && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.organizationPostalCode}
                </Text>
              )}
            </View>

            {/* Security Code Input and Captcha */}
            <View style={{ marginBottom: 15, }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-end' }}>
                {/* بروچر - دکمه سمت چپ */}
                <TouchableOpacity
                  onPress={() => {
                    setDisplayedCaptcha(generateCaptcha());
                    setSecurityCode('');
                  }}
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderWidth: 1.5,
                    borderColor: '#1976d2',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 36,
                    flexDirection: 'row'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'VazirBold',
                    color: '#1976d2',
                    textAlign: 'center',
                    letterSpacing: 2,
                    textDecorationLine: 'line-through',
                    textDecorationColor: '#1976d2',
                    marginRight: 4
                  }}>{displayedCaptcha}</Text>
                  <Text style={{ fontSize: 12, color: '#1976d2' }}>↺</Text>
                </TouchableOpacity>

                {/* کد امنیتی - Text Input سمت راست */}
                <View style={{ flex: 1 }}>
                  <Text style={[NewStyles.text, { marginBottom: 5 }]}>{t('Security code')} <Text style={NewStyles.title6}>*</Text></Text>
                  <TextInput
                    value={securityCode}
                    onChangeText={setSecurityCode}
                    placeholder={t('Security code *')}
                    autoCapitalize="characters"
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: errors.securityCode ? '#ff0000' : '#ccc',
                      fontSize: 14,
                      fontFamily: 'VazirLight',
                      ...NewStyles.text10,
                      height: 36
                    }}
                    placeholderTextColor={themeColor3.bgColor(1)}
                  />
                </View>
              </View>
              {errors.securityCode && (
                <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                  {errors.securityCode}
                </Text>
              )}
            </View>
          </View>
          <View style={{width: '100%',paddingHorizontal: '5%'}}>

            <View style={[NewStyles.row, {  }]}>
              <TouchableOpacity style={{ padding: 10 }}>
                <Ionicons
                  name={acceptTerms ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={themeColor0.bgColor(1)}
                  onPress={() => {

                    setAcceptTerms(pre => !pre)
                  }}
                />
              </TouchableOpacity>
              <Text style={[NewStyles.text10, { flex: 1, padding: 5 }]}> {t("By continuing, I accept Loop's Terms of Use and Privacy Policy.")} </Text>
            </View>
            {errors.acceptTerms && (
              <Text style={[NewStyles.text6, { fontSize: 12, marginTop: 4, }]}>
                {errors.acceptTerms}
              </Text>
            )}
          </View>


          {/* ثبت نام section */}
          <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>

            <Button
              title={t('Sign Up')}
              onPress={handleRegister}
              loading={loading}
            />
            <Button
              title={t('Login to account')}
              onPress={() => { navigation.navigate('Login') }}
            />
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
    </SafeAreaView>
  );
};

export default Register;
