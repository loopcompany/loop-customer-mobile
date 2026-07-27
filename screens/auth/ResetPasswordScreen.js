import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import NewStyles from "../../styles/NewStyles";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from "react-native-confirmation-code-field";
import { themeColor0, themeColor1, themeColor3, themeColor10 } from "../../theme/Color";
import { setToken } from "../../slices/authSlice";
import { authAPI } from "../../services/Api";
import TokenManager from "../../services/TokenManager";
import Button from "../../components/Button";
import CustomStatusBar from "../../components/CustomStatusBar";
import ScreenHeaders from "../../components/ScreenHeaders";
import { showToastOrAlert, formatTime, showAlert } from "../../helpers/Common";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "expo-image";
import { restartOtpRetriever, startOtpRetriever, stopOtpRetriever, subscribeOtp } from "./OtpRetriever";

export default function ResetPasswordScreen({ navigation, route }) {
  const { t } = useTranslation();
  const params = route?.params;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes like RegistrationVerificationScreen
  const [canResend, setCanResend] = useState(false);

  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Subscribe to OTP messages. The listener may have started in ForgotPassword
  // before the recovery SMS was requested.
  useEffect(() => {
    const unsubscribe = subscribeOtp((otp) => {
      setError('');
      setValue(otp);
    });

    if (Platform.OS === 'android') {
      startOtpRetriever().catch((otpError) => {
        console.warn('OTP Retriever start error:', otpError);
      });
    }

    return () => {
      unsubscribe();
      stopOtpRetriever({ clearPending: true });
    };
  }, []);

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
    if (value.length === 6) {
      codeVerification();
    }
  }, [value]);

  // Verify the reset code
  const codeVerification = async () => {
    if (loading) return;

    if (value.length !== 6) {
      setError(t('Please enter the complete 6-digit code'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate input before sending
      const phone = params?.phone?.toString().trim();
      const code = value?.toString().trim();

      // Check if phone and code are valid
      if (!phone || !code) {
        setError(t("Mobile number or code not entered"));
        return;
      }

      if (!phone.match(/^09\d{9}$/)) {
        setError(t("6"));
        return;
      }

      const response = await authAPI.verifyResetCode({
        phone: phone,
        code: code,
      });

      if (response.success) {
        stopOtpRetriever({ clearPending: true });

        // Save auth data using TokenManager
        const token = response.data?.token;
        const user = response.data?.user;

        if (token && user) {
          await TokenManager.saveAuthData(token, user);
          dispatch(setToken(token));

          showToastOrAlert(t("Login successful! Redirecting..."));

          // Navigate to main app
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'FolderScreen' }],
            });
          }, 1500);
        }
      } else {
        setError(response.message || t("The code entered is incorrect"));
        setValue('');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      setError(t('Error verifying code. Please try again'));
      setValue('');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        try {
          await restartOtpRetriever();
        } catch (otpError) {
          console.warn('OTP Retriever restart error:', otpError);
        }
      }

      const response = await authAPI.resendResetCode(params?.phone);

      if (response.success) {
        setTimer(120);
        setCanResend(false);
        setError('');
        showToastOrAlert(response.message || t("Verification code resent"));
      } else {
        stopOtpRetriever({ clearPending: true });
        setError(response.message || t("Error resending code"));
      }
    } catch (error) {
      stopOtpRetriever({ clearPending: true });
      console.error('Resend code error:', error);
      setError(t("Error resending code"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditMobile = () => {
    showAlert(
      t('Edit mobile number'),
      t('Do you want to edit the mobile number?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Yes'), onPress: () => {
            if (Platform.OS == 'web') {
              window.history.back()
            } else {
              navigation.goBack()
            }
          }
        }
      ]
    );
  };
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders
        title={t("Reset Password")}
        showLeftIcon={true}
      />
      <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit="cover" >
        <CustomStatusBar />
        <KeyboardAvoidingView
          behavior={'padding'}
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
                  {t("Enter the reset code sent")}
                </Text>
                <Text style={NewStyles.text4}>
                  {t("6-digit code to mobile number")}
                </Text>
                <TouchableOpacity onPress={handleEditMobile}>
                  <Text style={styles.mobileNumber}>
                    {params?.phone}
                  </Text>
                </TouchableOpacity>
                <Text style={NewStyles.text4}>
                  {t("has been sent")}
                </Text>
              </View>

              {/* Code Input Field */}
              <View style={styles.codeContainer}>
                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={(text) => {
                    setValue(String(text || '').replace(/\D/g, '').slice(0, 6));
                    if (error) setError('');
                  }}
                  cellCount={6}
                  maxLength={6}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                  autoComplete={Platform.select({
                    android: 'sms-otp',
                    ios: 'one-time-code',
                    default: 'off',
                  })}
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

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={NewStyles.text4}>
                    {t("Resend code in")} {formatTime(timer)}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>
                      {t("Resend Code")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <Button
                title={t("Verify")}
                loading={loading}
                onPress={codeVerification}
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
    maxWidth: 500
  },
  instructionContainer: {
    alignItems: 'center',
    gap: 8,
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

