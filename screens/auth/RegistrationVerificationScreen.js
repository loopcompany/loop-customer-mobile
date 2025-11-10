import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../helpers/Common';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import Button from '../../components/Button';
import CustomStatusBar from '../../components/CustomStatusBar';
import ScreenHeaders from '../../components/ScreenHeaders';
import { authAPI } from '../../services/Api';
import TokenManager from '../../services/TokenManager';
import { setToken } from '../../slices/authSlice';
import { fetchUser } from '../../slices/userSlice';
import { showToastOrAlert, formatTime } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from 'expo-image';

export default function RegistrationVerificationScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { phone, userData } = route.params || {};

  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  // CodeField hooks
  const ref = useBlurOnFulfill({ value: verificationCode, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: verificationCode,
    setValue: setVerificationCode,
  });

  // Timer for resend code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (verificationCode.length === 6) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('لطفاً کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the correct format that matches the API
      const response = await authAPI.verifyPhone({
        phone: phone,
        code: verificationCode
      });

      if (response.success) {
        // Save user token and data
        console.log(response.data);

        if (response.data?.token) {
          // Use TokenManager for consistent token storage
          await TokenManager.saveAuthData(response.data.token, response.data.user);

          // Update Redux store
          dispatch(setToken(response.data.token));
          dispatch(fetchUser(response.data.token));
        }

        showToastOrAlert('شماره موبایل با موفقیت تایید شد');
        navigation.navigate('MainApp', { screen: 'FolderScreen' }); // Navigate to main app
      } else {
        setError(response.message || 'کد وارد شده صحیح نیست');
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Verification error:', error);

      let errorMessage = 'خطا در تایید کد. لطفاً مجدداً تلاش کنید';

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          // Handle Laravel validation errors
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors[0] || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Show specific error for 422
        if (error.response?.status === 422) {
          errorMessage = errorMessage || 'اطلاعات وارد شده صحیح نیست';
        }
      }

      setError(errorMessage);
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await authAPI.resendCode(phone);

      if (response.success) {
        setTimer(120);
        setCanResend(false);
        setError('');
        showToastOrAlert('کد تایید مجدداً ارسال شد');
      } else {
        setError(response.message || 'خطا در ارسال مجدد کد');
      }
    } catch (error) {
      console.error('Resend code error:', error);

      let errorMessage = 'خطا در ارسال مجدد کد';

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          // Handle Laravel validation errors
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors[0] || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMobile = () => {
    showAlert(
      'ویرایش شماره موبایل',
      'آیا می‌خواهید شماره موبایل را ویرایش کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { text: 'بله', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders
        title="تایید شماره موبایل"
        onPressLeft={() => navigation.goBack()}
        showLeftIcon={true}
      />
      <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit={"cover"}>

        <CustomStatusBar />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >


            <View style={[styles.card, NewStyles.center]}>
              {/* Instructions */}
              <View style={styles.instructionContainer}>
                <Text style={NewStyles.title4}>
                  کد تایید ارسال شده را وارد کنید
                </Text>
                <Text style={NewStyles.text4}>
                  کد 6 رقمی به شماره موبایل
                </Text>
                <TouchableOpacity onPress={handleEditMobile}>
                  <Text style={styles.mobileNumber}>
                    {phone}
                  </Text>
                </TouchableOpacity>
                <Text style={NewStyles.text4}>
                  ارسال شده است
                </Text>
              </View>

              {/* Code Input Field */}
              <View style={styles.codeContainer}>
                <CodeField
                  ref={ref}
                  {...props}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  cellCount={6}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.select({
                    android: 'sms-otp',
                    default: 'one-time-code',
                  })}
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

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={NewStyles.text4}>
                    ارسال مجدد کد در {formatTime(timer)}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>
                      ارسال مجدد کد
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <Button
                title="تایید"
                loading={loading}
                onPress={handleVerifyCode}
                style={styles.verifyButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: '95%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.8),
    textAlign: 'center',
  },
  mobileNumber: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  codeCell: {
    width: 45,
    height: 50,
    backgroundColor: themeColor3.bgColor(0.7),
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
  codeCellFocused: {
    borderColor: themeColor1.bgColor(1),
    backgroundColor: themeColor3.bgColor(0.9),
  },
  errorText: {
    color: '#ff4444',
    fontFamily: 'VazirLight',
    fontSize: 14,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColor1.bgColor(1),
    borderRadius: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
  },
  verifyButton: {
    width: '100%',
    marginTop: 10,
  },
});
