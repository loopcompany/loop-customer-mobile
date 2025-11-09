import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, } from "react-native";
import { useDispatch } from "react-redux";
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

export default function ResetPasswordScreen({ navigation, route }) {
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
    if (value.length !== 6) {
      setError('لطفاً کد 6 رقمی را کامل وارد کنید');
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
        setError("شماره موبایل یا کد وارد نشده است");
        return;
      }

      if (!phone.match(/^09\d{9}$/)) {
        setError("فرمت شماره موبایل صحیح نیست");
        return;
      }

      const response = await authAPI.verifyResetCode({
        phone: phone,
        code: code,
      });

      if (response.success) {
        // Save auth data using TokenManager
        const token = response.data?.token;
        const user = response.data?.user;

        if (token && user) {
          await TokenManager.saveAuthData(token, user);
          dispatch(setToken(token));

          showToastOrAlert("ورود موفقیت‌آمیز! در حال هدایت...");

          // Navigate to main app
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp', params: { screen: 'FolderScreen' } }],
            });
          }, 1500);
        }
      } else {
        setError(response.message || "کد وارد شده صحیح نیست");
        setValue('');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      setError('خطا در تایید کد. لطفاً مجدداً تلاش کنید');
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
      const response = await authAPI.resendResetCode(params?.phone);

      if (response.success) {
        setTimer(120);
        setCanResend(false);
        setError('');
        showToastOrAlert(response.message || "کد مجدداً ارسال شد");
      } else {
        setError(response.message || "خطا در ارسال مجدد کد");
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError("خطا در ارسال مجدد کد");
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
        title="بازیابی رمز عبور"
        onPressLeft={() => navigation.goBack()}
        showLeftIcon={true}
      />
      <ImageBackground cachePolicy={'memory-disk'} source={require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit="contain" >
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
                  کد بازیابی ارسال شده را وارد کنید
                </Text>
                <Text style={NewStyles.text4}>
                  کد 6 رقمی به شماره موبایل
                </Text>
                <TouchableOpacity onPress={handleEditMobile}>
                  <Text style={styles.mobileNumber}>
                    {params?.phone}
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
                  value={value}
                  onChangeText={(text) => {
                    setValue(text);
                    if (error) setError(""); // Clear error when user starts typing
                  }}
                  cellCount={6}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.select({
                    android: "sms-otp",
                    default: "one-time-code",
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
    maxWidth:500
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

