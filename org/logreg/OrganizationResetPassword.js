import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { uri } from '../../services/URL';

const OrganizationResetPassword = ({ route, navigation }) => {
  const { organizationCode, phone } = route.params;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [errors, setErrors] = useState({});
  const inputRefs = useRef([]);

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Clear error
    if (errors.code) {
      setErrors({ ...errors, code: null });
    }

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate code
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      newErrors.code = 'لطفا کد 6 رقمی را وارد کنید';
    }

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = 'رمز عبور جدید الزامی است';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const verificationCode = code.join('');

      console.log('📤 Resetting password...');
      console.log('Data:', {
        organization_code: organizationCode,
        phone: phone,
        code: verificationCode,
      });

      const response = await axios.post(
        `${uri}/organization/reset-password`,
        {
          organization_code: organizationCode,
          phone: phone,
          code: verificationCode,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ Password reset response:', response.data);

      if (response.data.status === 'success') {
        Alert.alert(
          'موفق',
          'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید با رمز جدید وارد شوید.',
          [
            {
              text: 'ورود',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);

      let errorMessage = 'خطا در تغییر رمز عبور';

      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.message || 'کد تایید اشتباه است یا منقضی شده';

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

      Alert.alert('خطا', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      Alert.alert('توجه', `لطفا ${formatTime(timer)} صبر کنید`);
      return;
    }

    setResendLoading(true);

    try {
      const response = await axios.post(
        `${uri}/organization/forgot-password`,
        {
          organization_code: organizationCode,
          mobile: phone,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data.status === 'success') {
        Alert.alert('موفق', 'کد تایید مجددا ارسال شد');
        setTimer(120);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('❌ Resend code error:', error);
      Alert.alert('خطا', error.response?.data?.message || 'خطا در ارسال مجدد کد');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title="تغییر رمز عبور"
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
              کد بازیابی ارسال شد
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'center',
              }}
            >
              کد 6 رقمی ارسال شده به {phone} را وارد کنید
            </Text>
          </View>

          {/* Organization Code Display */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 15,
              marginBottom: 25,
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'VazirLight',
                color: '#666',
                marginBottom: 8,
              }}
            >
              کد سازمانی:
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontFamily: 'VazirBold',
                color: '#1976d2',
                letterSpacing: 8,
              }}
            >
              {organizationCode}
            </Text>
          </View>

          {/* OTP Input */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'VazirBold',
              color: '#333',
              marginBottom: 10,
              textAlign: 'right',
            }}
          >
            کد تایید *
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 5,
              gap: 10,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 45,
                  height: 55,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: code[index] ? '#1976d2' : '#ccc',
                  fontSize: 22,
                  fontFamily: 'VazirBold',
                  textAlign: 'center',
                  elevation: 2,
                }}
              />
            ))}
          </View>
          {errors.code && (
            <Text
              style={{
                color: '#ff0000',
                fontSize: 12,
                fontFamily: 'VazirLight',
                marginTop: 5,
                marginBottom: 15,
                textAlign: 'right',
              }}
            >
              {errors.code}
            </Text>
          )}

          {/* Timer */}
          {timer > 0 && (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontFamily: 'VazirLight',
                color: '#666',
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              زمان باقیمانده: {formatTime(timer)}
            </Text>
          )}

          {/* New Password */}
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
              رمز عبور جدید *
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: null });
                  }
                }}
                placeholder="حداقل 8 کاراکتر"
                secureTextEntry={!showPassword}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  paddingRight: 45,
                  borderWidth: 1,
                  borderColor: errors.newPassword ? '#ff0000' : '#ccc',
                  fontSize: 16,
                  fontFamily: 'VazirLight',
                  textAlign: 'right',
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.newPassword}
              </Text>
            )}
          </View>

          {/* Confirm Password */}
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
              تکرار رمز عبور جدید *
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                placeholder="تکرار رمز عبور"
                secureTextEntry={!showConfirmPassword}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  paddingRight: 45,
                  borderWidth: 1,
                  borderColor: errors.confirmPassword ? '#ff0000' : '#ccc',
                  fontSize: 16,
                  fontFamily: 'VazirLight',
                  textAlign: 'right',
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#90caf9' : '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              marginBottom: 15,
              alignItems: 'center',
              elevation: 3,
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
                تغییر رمز عبور
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resendLoading || timer > 0}
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingVertical: 15,
              borderWidth: 1,
              borderColor: timer > 0 ? '#ccc' : '#1976d2',
              alignItems: 'center',
              opacity: timer > 0 ? 0.5 : 1,
            }}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#1976d2" />
            ) : (
              <Text
                style={{
                  color: timer > 0 ? '#999' : '#1976d2',
                  fontSize: 14,
                  fontWeight: 'bold',
                  fontFamily: 'VazirBold',
                }}
              >
                ارسال مجدد کد
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrganizationResetPassword;
