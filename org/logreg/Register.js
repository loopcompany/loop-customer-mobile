import React, { useState, useEffect } from 'react';
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

const Register = ({ navigation }) => {
  // Form states
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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

    if (!organizationName || organizationName.length < 2) {
      newErrors.organizationName = 'نام سازمان باید حداقل 2 کاراکتر باشد';
    }

    if (!familyName || familyName.length < 2) {
      newErrors.familyName = 'نام و نام خانوادگی مدیر باید حداقل 2 کاراکتر باشد';
    }

    if (!nationalCode) {
      newErrors.nationalCode = 'کد ملی الزامی است';
    } else if (!validateNationalCode(nationalCode)) {
      newErrors.nationalCode = 'کد ملی نامعتبر است';
    }

    if (!mobileNumber) {
      newErrors.mobileNumber = 'شماره موبایل الزامی است';
    } else if (!validateMobile(mobileNumber)) {
      newErrors.mobileNumber = 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد';
    }

    if (!birthDate) {
      newErrors.birthDate = 'تاریخ تولد الزامی است';
    }

    if (!organizationEmail) {
      newErrors.organizationEmail = 'ایمیل سازمان الزامی است';
    } else if (!validateEmail(organizationEmail)) {
      newErrors.organizationEmail = 'فرمت ایمیل نامعتبر است';
    }

    if (!organizationPhoneNumber) {
      newErrors.organizationPhoneNumber = 'تلفن ثابت سازمان الزامی است';
    }

    if (!password || password.length < 8) {
      newErrors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    }

    // Location validation
    if (!selectedProvince) {
      newErrors.province = 'انتخاب استان الزامی است';
    }
    if (!selectedCity) {
      newErrors.city = 'انتخاب شهر الزامی است';
    }
    if (!selectedRegion) {
      newErrors.region = 'انتخاب منطقه الزامی است';
    }

    if (!organizationAddress || organizationAddress.length < 10) {
      newErrors.organizationAddress = 'آدرس باید حداقل 10 کاراکتر باشد';
    }

    if (!organizationPostalCode) {
      newErrors.organizationPostalCode = 'کد پستی الزامی است';
    } else if (!validatePostalCode(organizationPostalCode)) {
      newErrors.organizationPostalCode = 'کد پستی باید 10 رقم باشد';
    }

    // Captcha validation
    if (!securityCode) {
      newErrors.securityCode = 'کد امنیتی الزامی است';
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      newErrors.securityCode = 'کد امنیتی صحیح نیست';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker function
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showAlert('خطا', 'دسترسی به گالری مورد نیاز است');
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
      showAlert('خطا', 'خطا در انتخاب تصویر');
    }
  };

  // Register handler
  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showAlert('خطا', 'لطفا تمام فیلدها را به درستی پر کنید');
      return;
    }

    // Validate captcha
    if (!securityCode) {
      setErrors({ securityCode: 'کد امنیتی الزامی است' });
      showAlert('خطا', 'لطفا کد امنیتی را وارد کنید');
      return;
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      setErrors({ securityCode: 'کد امنیتی صحیح نیست' });
      showAlert('خطا', 'کد امنیتی صحیح نیست');
      setDisplayedCaptcha(generateCaptcha());
      setSecurityCode('');
      return;
    }

    setLoading(true);

    try {
      // Convert Jalali date to Gregorian for API
      const gregorianDate = jalaliToGregorian(birthDate);

      // Log for debugging
      console.log('📤 Attempting registration...');
      console.log('API URL:', `${uri}/organization/register`);
      console.log('Data:', {
        organization_name: organizationName,
        manager_mobile: mobileNumber,
        has_image: !!profileImage
      });

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
      formData.append('organization_email', organizationEmail);
      formData.append('organization_phone', organizationPhoneNumber);
      formData.append('organization_address', organizationAddress);
      formData.append('manager_full_name', familyName);
      formData.append('manager_national_code', nationalCode);
      formData.append('manager_mobile', mobileNumber);
      formData.append('manager_birthdate', gregorianDate);  // Send Gregorian date to API
      formData.append('city', city);
      formData.append('region', region);
      formData.append('postal_code', organizationPostalCode);
      formData.append('password', password);
      formData.append('password_confirmation', password);
      
      // Add location IDs
      if (selectedProvince) {
        formData.append('province_id', selectedProvince.id);
      }
      if (selectedCity) {
        formData.append('city_id', selectedCity.id);
      }
      if (selectedRegion) {
        formData.append('region_id', selectedRegion.id);
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
          'موفق',
          'ثبت نام با موفقیت انجام شد. کد تایید به شماره موبایل ارسال شد.',
          [
            {
              text: 'تایید',
              onPress: () => {
                // Navigate to OTP verification screen
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
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
        } : null
      });
      
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
          
          showAlert('خطا در اعتبارسنجی', errorData.message || 'لطفا فیلدها را بررسی کنید');
        } else {
          showAlert('خطا', errorData.message || 'خطا در ثبت نام');
        }
      } else if (error.request) {
        // Request made but no response (network error)
        console.log('No response received');
        showAlert(
          'خطا در اتصال',
          `سرور پاسخگو نیست. لطفا موارد زیر را بررسی کنید:\n\n` +
          `1. اتصال اینترنت دستگاه\n` +
          `2. سرور در آدرس ${uri} در حال اجرا باشد\n` +
          `3. دستگاه و سرور در یک شبکه باشند`,
          [
            { text: 'بستن' },
            { 
              text: 'تلاش مجدد', 
              onPress: () => handleRegister() 
            }
          ]
        );
      } else {
        // Something else happened
        console.log('Unknown error:', error.message);
        showAlert('خطا', `خطای نامشخص: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => navigation.navigate('TestConnection')}
        rightIcon="🔧"
      />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}
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
          <Text style={{ 
            color: '#fff', 
            fontSize: 16, 
            fontWeight: 'bold', 
            fontFamily: 'VazirBold',
            textAlign: 'center' 
          }}>اطلاعات تکمیلی</Text>
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
              {profileImage ? 'تغییر تصویر پروفایل' : 'انتخاب تصویر پروفایل (اختیاری)'}
            </Text>
          </TouchableOpacity>

          {/* نام سازمان */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationName}
              onChangeText={setOrganizationName}
              placeholder="نام سازمان * :"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.organizationName ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            {errors.organizationName && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationName}
              </Text>
            )}
          </View>

          {/* نام و نام خانوادگی مدیر */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="نام و نام خانوادگی مدیر * :"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.familyName ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            {errors.familyName && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.familyName}
              </Text>
            )}
          </View>

          {/* شماره ملی مدیر */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={nationalCode}
              onChangeText={setNationalCode}
              placeholder="شماره ملی مدیر * :"
              keyboardType="numeric"
              maxLength={10}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.nationalCode ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            {errors.nationalCode && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.nationalCode}
              </Text>
            )}
          </View>

          {/* شماره تلفن همراه مدیر */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="شماره تلفن همراه مدیر * (09xxxxxxxxx)"
              keyboardType="numeric"
              maxLength={11}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                paddingLeft: 45,
                borderWidth: 1, 
                borderColor: errors.mobileNumber ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            <View style={{ 
              position: 'absolute', 
              left: 8, 
              top: 11, 
              zIndex: 1,
              backgroundColor: '#ffeb3b',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2
            }}>
              <Text style={{ fontSize: 10, color: '#333', fontFamily: 'VazirBold' }}>iran 98+</Text>
            </View>
            {errors.mobileNumber && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.mobileNumber}
              </Text>
            )}
          </View>

          {/* متولد */}
          <View style={{ marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setDatePickerModal(true)}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.birthDate ? '#ff0000' : '#ccc',
                minHeight: 48,
                justifyContent: 'center'
              }}
            >
              <Text style={{ 
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                color: birthDate ? '#333' : '#999'
              }}>
                {birthDate ? `تاریخ تولد: ${birthDate}` : 'تاریخ تولد * : (انتخاب تاریخ)'}
              </Text>
            </TouchableOpacity>
            {errors.birthDate && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.birthDate}
              </Text>
            )}
          </View>

          {/* آدرس ایمیل سازمان */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationEmail}
              onChangeText={setOrganizationEmail}
              placeholder="آدرس ایمیل سازمان * :"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.organizationEmail ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            {errors.organizationEmail && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationEmail}
              </Text>
            )}
          </View>

          {/* شماره تلفن ثابت سازمان */}
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 2 }}>
                <TextInput
                  value={organizationPhoneNumber}
                  onChangeText={setOrganizationPhoneNumber}
                  placeholder=":شماره تلفن ثابت سازمان * "
                  keyboardType="phone-pad"
                  style={{ 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 8, 
                    paddingVertical: 12, 
                    paddingHorizontal: 12,
                    borderWidth: 1, 
                    borderColor: errors.organizationPhoneNumber ? '#ff0000' : '#ccc',
                    fontSize: 14,
                    fontFamily: 'VazirLight',
                    textAlign: 'right',
                    minHeight: 48
                  }}
                />
              </View>
              <View style={{ 
                backgroundColor: '#ffeb3b',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                minWidth: 50
              }}>
                <Text style={{ fontSize: 10, color: '#333', fontFamily: 'VazirBold' }}>021-</Text>
              </View>
            </View>
            {errors.organizationPhoneNumber && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationPhoneNumber}
              </Text>
            )}
          </View>

          {/* رمز عبور */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder=":رمز عبور * (حداقل 8 کاراکتر)"
              secureTextEntry={!showPassword}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                paddingLeft: 45,
                borderWidth: 1, 
                borderColor: errors.password ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                left: 12, 
                top: 13, 
                zIndex: 1 
              }}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
            {errors.password && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* استان، شهر و منطقه با LocationPicker */}
          <View style={{ marginBottom: 8 }}>
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
            <TextInput
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
              placeholder="آدرس سازمان * :"
              multiline
              numberOfLines={2}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.organizationAddress ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 70,
                textAlignVertical: 'top'
              }}
            />
            {errors.organizationAddress && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationAddress}
              </Text>
            )}
          </View>

          {/* کد پستی سازمان */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value={organizationPostalCode}
              onChangeText={setOrganizationPostalCode}
              placeholder="کد پستی سازمان * : (10 رقم)"
              keyboardType="numeric"
              maxLength={10}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 12, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.organizationPostalCode ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 48
              }}
            />
            {errors.organizationPostalCode && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationPostalCode}
              </Text>
            )}
          </View>

          {/* Security Code Input and Captcha */}
          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
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
                  minHeight: 48,
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
                <TextInput
                  value={securityCode}
                  onChangeText={setSecurityCode}
                  placeholder="کد امنیتی *"
                  autoCapitalize="characters"
                  style={{ 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 8, 
                    paddingVertical: 12, 
                    paddingHorizontal: 10,
                    borderWidth: 1, 
                    borderColor: errors.securityCode ? '#ff0000' : '#ccc',
                    fontSize: 14,
                    fontFamily: 'VazirLight',
                    textAlign: 'right',
                    minHeight: 48
                  }}
                />
              </View>
            </View>
            {errors.securityCode && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.securityCode}
              </Text>
            )}
          </View>
        </View>

        {/* ثبت نام section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            style={{ 
              backgroundColor: loading ? '#90caf9' : '#1976d2', 
              borderRadius: 10, 
              paddingVertical: 12, 
              marginBottom: 10, 
              alignItems: 'center', 
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#1976d2',
              shadowOpacity: 0.3,
              shadowRadius: 4,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ 
                color: '#fff', 
                fontSize: 16, 
                fontWeight: 'bold', 
                fontFamily: 'VazirBold',
                textAlign: 'center' 
              }}>ثبت نام</Text>
            )}
          </TouchableOpacity>

          {/* دکمه ورود به حساب کاربری */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={{ 
              backgroundColor: '#1976d2', 
              borderRadius: 10, 
              paddingVertical: 12, 
              alignItems: 'center', 
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#1976d2',
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              textAlign: 'center' 
            }}>ورود به حساب کاربری</Text>
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

export default Register;
