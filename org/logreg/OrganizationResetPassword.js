import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import { uri } from '@services/URL';
import { showAlert } from '@helpers/Common';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { themeColor0, themeColor4 } from '@theme/Color';
import { useSelector } from 'react-redux';
import {
  restartOtpRetriever,
  startOtpRetriever,
  stopOtpRetriever,
  subscribeOtp,
} from '@screens/auth/OtpRetriever';
const OrganizationResetPassword = ({ route, navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const { organizationCode, phone } = route.params;
  const hashApp = useSelector(state => state.hashApp?.hash);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [errors, setErrors] = useState({});
  const ref = useBlurOnFulfill({ value: code, cellCount: 6 });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  useEffect(() => {
    const unsubscribe = subscribeOtp(otp => {
      setCode(otp);
      setErrors(currentErrors => ({ ...currentErrors, code: null }));
    });

    if (Platform.OS === 'android') {
      startOtpRetriever().catch(otpError => {
        console.warn('Unable to start SMS Retriever:', otpError);
      });
    }

    return () => {
      unsubscribe();
      stopOtpRetriever();
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) return undefined;

    const timeout = setTimeout(() => {
      setTimer(currentTimer => Math.max(currentTimer - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCodeChange = text => {
    const normalizedCode = String(text || '')
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/\D/g, '')
      .slice(0, 6);

    setCode(normalizedCode);

    if (errors.code) {
      setErrors(currentErrors => ({ ...currentErrors, code: null }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!/^\d{6}$/.test(code)) {
      newErrors.code = t('Please enter the complete 6-digit code');
    }

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = t('Password is required');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('Password must be at least 8 characters');
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = t('Please enter Password Confirmation.');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('Password and repeat password do not match.');
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
      console.log('📤 Resetting password...');
      console.log('Data:', {
        organization_code: organizationCode,
        phone: phone,
        code: code,
      });

      const response = await axios.post(
        `${uri}/organization/reset-password`,
        {
          organization_code: organizationCode,
          phone: phone,
          code: code,
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
        stopOtpRetriever({ clearPending: true });
        showAlert(
          t('success'),
          t('Your password has been successfully changed. Please log in with the new information.'),
          [
            {
              text: t('Login'),
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);

      let errorMessage = t('Error changing password');

      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.message || t('The verification code is incorrect or expired.');

        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        errorMessage = t('Error connecting to server. Please check your internet connection');
      } else {
        console.error('Unknown error:', error.message);
        errorMessage = error.message || t('An unexpected error occurred!');
      }

      showAlert(t('Error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      showAlert(t('Notice'), `${t('Please wait')} ${formatTime(timer)}`);
      return;
    }

    setResendLoading(true);
    setCode('');
    setErrors(currentErrors => ({ ...currentErrors, code: null }));

    try {
      if (Platform.OS === 'android') {
        try {
          await restartOtpRetriever();
        } catch (otpError) {
          console.warn('Unable to restart SMS Retriever:', otpError);
        }
      }

      const response = await axios.post(
        `${uri}/organization/forgot-password`,
        {
          organization_code: organizationCode,
          mobile: phone,
          hashApp: hashApp?.[0] ?? '',
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
        showAlert(t('success'), t('Verification code resent'));
        setTimer(120);
      } else {
        stopOtpRetriever({ clearPending: true });
        showAlert(t('Error'), response.data.message || t('Error resending code'));
      }
    } catch (error) {
      stopOtpRetriever({ clearPending: true });
      console.error('❌ Resend code error:', error);
      showAlert(t('Error'), error.response?.data?.message || t('Error resending code'));
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
        title={t('Change Password')}
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
              {t('Recovery code sent')}
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
                ...NewStyles.title10
              }}
            >
              {t('Organization code')}:
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
            style={NewStyles.text10}
          >
            {t('Verification code')} *
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 5,
              gap: 10,
            }}
          >

            <CodeField
              ref={ref}
              {...props}
              value={code}
              onChangeText={handleCodeChange}
              cellCount={6}
              maxLength={6}
              keyboardType="number-pad"
              inputMode="numeric"
              textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
              importantForAutofill={Platform.OS === 'android' ? 'yes' : undefined}
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[
                    styles.codeCell,
                    isFocused && styles.codeCellFocused,
                    NewStyles.border10
                  ]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
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
              style={[NewStyles.text10, {
                textAlign: 'center',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 20,
              }]}
            >
              {t('Resend code in')}: {formatTime(timer)}
            </Text>
          )}

          {/* New Password */}
          <View style={{ marginBottom: 15 }}>
            <Text
              style={NewStyles.text10}
            >
              {t('New Password')} *
            </Text>
            <View style={[NewStyles.row, {
              gap: 5, backgroundColor: themeColor4.bgColor(0.7),
              paddingHorizontal: 20,
            }, NewStyles.border10]}>
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: null });
                  }
                }}
                placeholder={t('Password must be at least 8 characters')}
                secureTextEntry={!showPassword}
                style={[NewStyles.text10, { flex: 1, height: 45 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
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
          <View style={{ marginBottom: 15 }}>
            <Text
              style={NewStyles.text10}
            >
              {t('Confirm Password')} *
            </Text>
            <View style={[NewStyles.row, {
              gap: 5, backgroundColor: themeColor4.bgColor(0.7),
              paddingHorizontal: 20,
            }, NewStyles.border10]}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                placeholder={t('Confirm Password')}
                secureTextEntry={!showConfirmPassword}
                style={[NewStyles.text10, { flex: 1, height: 45 }]}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
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
                {t('Change Password')}
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
                  // ...NewStyles.text
                }}
              >
                {t('Resend Code')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrganizationResetPassword;

const createLocalStyles = (NewStyles) => StyleSheet.create({
  codeCell: {
    width: 45,
    height: 50,
    backgroundColor: themeColor4.bgColor(0.7),
    fontSize: 20,
    color: themeColor0.bgColor(1),
    fontFamily: 'VazirBold',
    textAlign: 'center',
    lineHeight: 50,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
})