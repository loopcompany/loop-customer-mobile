import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { uri } from '../../services/URL';
import { showAlert } from '../../helpers/Common';

const OrganizationForgotPassword = ({ navigation }) => {
  const [organizationCode, setOrganizationCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate organization code (6 digits)
    if (!organizationCode) {
      newErrors.organizationCode = 'کد سازمانی الزامی است';
    } else if (organizationCode.length !== 6 || !/^\d{6}$/.test(organizationCode)) {
      newErrors.organizationCode = 'کد سازمانی باید 6 رقم باشد';
    }

    // Validate mobile number
    if (!mobileNumber) {
      newErrors.mobileNumber = 'شماره موبایل الزامی است';
    } else if (!/^09\d{9}$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('📤 Sending forgot password request...');
      console.log('Data:', { organization_code: organizationCode, mobile: mobileNumber });

      const response = await axios.post(
        `${uri}/organization/forgot-password`,
        {
          organization_code: organizationCode.trim(),
          mobile: mobileNumber.trim(),
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ Response:', response.data);

      if (response.data.status === 'success') {
        showAlert(
          'موفق',
          response.data.message || 'کد بازیابی رمز عبور به شماره موبایل شما ارسال شد.',
          [
            {
              text: 'ادامه',
              onPress: () => {
                navigation.navigate('OrganizationResetPassword', {
                  organizationCode: organizationCode,
                  phone: mobileNumber,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);

      let errorMessage = 'خطا در ارسال درخواست';

      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.message || 'اطلاعات وارد شده صحیح نیست';

        // Set specific field errors if provided
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        errorMessage = 'سرور پاسخگو نیست. لطفا اتصال اینترنت را بررسی کنید.';
      } else {
        console.error('Unknown error:', error.message);
        errorMessage = error.message || 'خطای نامشخص رخ داد';
      }

      showAlert('خطا', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title="فراموشی رمز عبور"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 30, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '90%', alignSelf: 'center' }}>
          {/* Header */}
          <View
            style={{
              backgroundColor: '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              marginBottom: 30,
              alignItems: 'center',
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'VazirBold',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              بازیابی رمز عبور سازمانی
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'center',
                paddingHorizontal: 20,
              }}
            >
              کد سازمانی و شماره موبایل مدیر را وارد کنید
            </Text>
          </View>

          {/* Organization Code Input */}
          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'VazirBold',
                color: '#333',
                marginBottom: 8,
                textAlign: 'right',
              }}
            >
              کد سازمانی *
            </Text>
            <TextInput
              value={organizationCode}
              onChangeText={(text) => {
                setOrganizationCode(text);
                if (errors.organizationCode) {
                  setErrors({ ...errors, organizationCode: null });
                }
              }}
              placeholder="کد 6 رقمی سازمان"
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: errors.organizationCode ? '#ff0000' : '#ccc',
                fontSize: 16,
                fontFamily: 'VazirLight',
                textAlign: 'center',
                letterSpacing: 8,
              }}
            />
            {errors.organizationCode && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.organizationCode}
              </Text>
            )}
          </View>

          {/* Mobile Number Input */}
          <View style={{ marginBottom: 25 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'VazirBold',
                color: '#333',
                marginBottom: 8,
                textAlign: 'right',
              }}
            >
              شماره موبایل مدیر *
            </Text>
            <TextInput
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                if (errors.mobileNumber) {
                  setErrors({ ...errors, mobileNumber: null });
                }
              }}
              placeholder="09123456789"
              keyboardType="phone-pad"
              maxLength={11}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: errors.mobileNumber ? '#ff0000' : '#ccc',
                fontSize: 16,
                fontFamily: 'VazirLight',
                textAlign: 'center',
              }}
            />
            {errors.mobileNumber && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.mobileNumber}
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: '#e3f2fd',
              borderRadius: 8,
              padding: 15,
              marginBottom: 25,
              borderLeftWidth: 4,
              borderLeftColor: '#1976d2',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'VazirLight',
                color: '#1565c0',
                lineHeight: 22,
                textAlign: 'right',
              }}
            >
              💡 کد بازیابی به شماره موبایل ثبت شده در حساب مدیر سازمان ارسال خواهد
              شد.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#90caf9' : '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              alignItems: 'center',
              elevation: 3,
              marginBottom: 15,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'VazirBold',
                }}
              >
                ارسال کد بازیابی
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: '#1976d2',
                fontSize: 14,
                fontFamily: 'VazirLight',
              }}
            >
              بازگشت به صفحه ورود
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrganizationForgotPassword;

