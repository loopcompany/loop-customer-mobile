import React, { useState, useReducer } from "react";
import { Text, TextInput, Image, Platform, StyleSheet, ScrollView, View, TouchableOpacity, KeyboardAvoidingView, } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import TransparentButton from "../../components/TransparentButton";
import Button from "../../components/Button";
import CustomStatusBar from "../../components/CustomStatusBar";
import { authAPI } from "../../services/Api";
import TokenManager from "../../services/TokenManager";
import { showToastOrAlert } from "../../helpers/Common";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor10, themeColor4 } from "../../theme/Color";
import { useTranslation } from "react-i18next";
import { setToken, setUserType } from "../../slices/authSlice";
import { fetchUser } from "../../slices/userSlice";
import { fetchAddresses } from "../../slices/addressSlice";
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from "expo-image";
const initialState = {
  phone: '',
  password: '',
  rememberMe: false,
  captchaInput: '',
  captcha: Math.floor(1000 + Math.random() * 9000).toString(),
  errors: {},
  isLoading: false,
  loginAttempts: 0,
  lastAttemptTime: null,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: null }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'GENERATE_CAPTCHA':
      return {
        ...state,
        captcha: Math.floor(1000 + Math.random() * 9000).toString(),
        captchaInput: ''
      };
    case 'INCREMENT_ATTEMPTS':
      return {
        ...state,
        loginAttempts: state.loginAttempts + 1,
        lastAttemptTime: new Date().getTime()
      };
    case 'RESET_ATTEMPTS':
      return { ...state, loginAttempts: 0, lastAttemptTime: null };
    case 'CLEAR_FORM':
      return { ...initialState, captcha: state.captcha };
    default:
      return state;
  }
};

export default function LoginScreen({ navigation }) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const reduxDispatch = useDispatch();
  const { t } = useTranslation();
  // Form validation
  const validateForm = () => {
    const errors = {};

    // Phone validation (11 digits starting with 09)
    if (!state.phone) {
      errors.phone = 'شماره موبایل الزامی است';
    } else if (state.phone.length !== 11 || !/^09\d{9}$/.test(state.phone)) {
      errors.phone = 'شماره موبایل باید 11 رقم و با 09 شروع شود';
    }

    // Password validation
    if (!state.password) {
      errors.password = 'رمز عبور الزامی است';
    } else if (state.password.length < 6) {
      errors.password = 'رمز عبور باید حداقل 6 کاراکتر باشد';
    }

    // Captcha validation
    if (!state.captchaInput) {
      errors.captchaInput = 'کد امنیتی الزامی است';
    } else if (state.captchaInput !== state.captcha) {
      errors.captchaInput = 'کد امنیتی صحیح نیست';
    }

    return errors;
  };

  // Check if user can attempt login (rate limiting)
  const canAttemptLogin = () => {
    if (state.loginAttempts >= 5) {
      const now = new Date().getTime();
      const timeDiff = now - state.lastAttemptTime;
      const minutesPassed = timeDiff / (1000 * 60);

      if (minutesPassed < 15) {
        const remainingMinutes = Math.ceil(15 - minutesPassed);
        showToastOrAlert(`بعد از ${remainingMinutes} دقیقه مجدداً تلاش کنید`);
        return false;
      } else {
        dispatch({ type: 'RESET_ATTEMPTS' });
      }
    }
    return true;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!canAttemptLogin()) return;

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });

    try {
      const credentials = {
        phone: state.phone,
        password: state.password,
      };

      const response = await authAPI.login(credentials);

      if (response.success) {
        // Reset login attempts on success
        dispatch({ type: 'RESET_ATTEMPTS' });

        // Save user token and data
        const userData = response.data.user;
        const token = response.data.token;

        // Always save token for current session


        // Save additional data and enable auto-login only if user wants to remember login
        if (state.rememberMe) {
          await AsyncStorage.setItem('savedPhone', state.phone);
          await AsyncStorage.setItem('rememberLogin', 'true');
          await AsyncStorage.setItem('autoLoginEnabled', 'true');
          await TokenManager.saveAuthData(token, userData);
          console.log('✅ Auto-login enabled and login data saved');
        } else {
          // Remove any previous auto-login settings
          await AsyncStorage.removeItem('savedPhone');
          await AsyncStorage.removeItem('rememberLogin');
          await AsyncStorage.removeItem('autoLoginEnabled');
          console.log('✅ Token saved but auto-login disabled');
        }

        // Update Redux store
        reduxDispatch(setToken(token));
        reduxDispatch(setUserType('individual')); // کاربر فردی
        reduxDispatch(fetchUser(token));
        reduxDispatch(fetchAddresses(token));

        showToastOrAlert('ورود با موفقیت انجام شد');

        // Navigate to main app
        navigation.navigate('FolderScreen');

      } else {
        dispatch({ type: 'INCREMENT_ATTEMPTS' });

        if (response.requires_verification) {
          showToastOrAlert('لطفاً ابتدا شماره موبایل خود را تایید کنید');

          // Navigate to verification screen
          navigation.navigate('RegistrationVerificationScreen', {
            phone: state.phone,
            isFromLogin: true
          });
        } else {
          dispatch({
            type: 'SET_ERROR',
            field: 'general',
            error: response.message || 'شماره موبایل یا رمز عبور اشتباه است'
          });
        }
      }
    } catch (error) {
      console.log('Login error:', error);
      dispatch({ type: 'INCREMENT_ATTEMPTS' });

      let errorMessage = 'خطا در ورود. لطفاً مجدداً تلاش کنید';

      if (error.response?.status === 401) {
        errorMessage = 'شماره موبایل یا رمز عبور اشتباه است';
      } else if (error.response?.status === 403) {
        errorMessage = 'دسترسی مسدود شده است';
      } else if (error.response?.status === 429) {
        errorMessage = 'درخواست‌های زیاد. لطفاً کمی صبر کنید';
      }

      dispatch({ type: 'SET_ERROR', field: 'general', error: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const generateCaptcha = () => {
    dispatch({ type: 'GENERATE_CAPTCHA' });
  };

  // Load saved credentials on component mount
  React.useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const rememberLogin = await AsyncStorage.getItem('rememberLogin');
        const savedPhone = await AsyncStorage.getItem('savedPhone');

        if (rememberLogin === 'true' && savedPhone) {
          dispatch({ type: 'SET_FIELD', field: 'phone', value: savedPhone });
          dispatch({ type: 'SET_FIELD', field: 'rememberMe', value: true });
        }
      } catch (error) {
        console.log('Error loading saved credentials:', error);
      }
    };

    loadSavedCredentials();
  }, []);

  // Check for auto-login on component mount
  React.useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        // First check if auto-login is explicitly enabled by user
        const autoLoginEnabled = await AsyncStorage.getItem('autoLoginEnabled');

        // If auto-login is not explicitly enabled, clear any existing tokens
        if (autoLoginEnabled !== 'true') {
          console.log('Auto-login not enabled by user, clearing tokens');
          await TokenManager.clearAuthData();
          return;
        }

        const savedToken = await TokenManager.getToken();

        if (savedToken) {
          // Validate token with backend
          try {
            const response = await authAPI.validateToken(savedToken);
            if (response.success) {
              // Token is valid, auto-login user
              const userData = await TokenManager.getUserData();

              // Update Redux store
              reduxDispatch(setToken(savedToken));
              reduxDispatch(setUserType('individual')); // کاربر فردی
              reduxDispatch(fetchUser(savedToken));

              showToastOrAlert('ورود خودکار انجام شد');

              // Navigate to main app
              navigation.navigate('FolderScreen');
              return;
            }
          } catch (error) {
            console.log('Token validation failed, clearing auto-login:', error);
            // Clear invalid token and auto-login flag
            await TokenManager.clearAuthData();
          }
        } else {
          console.log('No token found, clearing auto-login flag');
          // If no token but auto-login is enabled, clear the flag
          await AsyncStorage.removeItem('autoLoginEnabled');
        }
      } catch (error) {
        console.log('Error checking auto-login:', error);
      }
    };

    checkAutoLogin();
  }, []);
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit={"cover"}>
      <CustomStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={[{ flex: 1, backgroundColor: themeColor0.bgColor(0.22), width: '100%' }, NewStyles.center]} >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode={"contain"}
          />

          {/* General Error Message */}
          {state.errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.errors.general}</Text>
            </View>
          )}

          {/* Login Attempts Warning */}
          {state.loginAttempts >= 3 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                {state.loginAttempts}/5 تلاش ناموفق. پس از 5 تلاش، 15 دقیقه منتظر بمانید.
              </Text>
            </View>
          )}

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[
                NewStyles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                { textAlign: 'right' },
                state.errors.phone && styles.inputError
              ]}
              placeholder="شماره موبایل (09XXXXXXXXX)"
              placeholderTextColor={themeColor10.bgColor(0.9)}
              value={state.phone}
              onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'phone', value })}
              keyboardType="phone-pad"
              maxLength={11}
              accessibilityLabel="شماره موبایل"
              accessibilityHint="شماره موبایل 11 رقمی خود را با 09 وارد کنید"
            />
            {state.errors.phone && (
              <Text style={styles.fieldErrorText}>{state.errors.phone}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[
                NewStyles.textInput,
                NewStyles.border10,
                NewStyles.text10,
                { textAlign: 'right' },
                state.errors.password && styles.inputError
              ]}
              placeholder="رمز عبور (حداقل 6 کاراکتر)"
              placeholderTextColor={themeColor10.bgColor(0.7)}
              secureTextEntry
              value={state.password}
              onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'password', value })}
              accessibilityLabel="رمز عبور"
              accessibilityHint="رمز عبور حداقل 6 کاراکتری خود را وارد کنید"
            />
            {state.errors.password && (
              <Text style={styles.fieldErrorText}>{state.errors.password}</Text>
            )}

            {/* Remember Me & Forgot Password */}
            <View style={NewStyles.rowWrapper}>
              <View style={NewStyles.row}>
                <TouchableOpacity
                  onPress={() => dispatch({
                    type: 'SET_FIELD',
                    field: 'rememberMe',
                    value: !state.rememberMe
                  })}
                  style={styles.checkbox}
                >
                  <View
                    style={
                      state.rememberMe ? styles.checkboxChecked : styles.checkboxEmpty
                    }
                  />
                </TouchableOpacity>
                <Text style={NewStyles.title4}>ذخیره اطلاعات ورود</Text>
              </View>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={NewStyles.title4}>فراموشی رمز عبور</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Captcha */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              {/* Captcha Input */}
              <TextInput
                style={[
                  NewStyles.textInput,
                  NewStyles.text10,
                  NewStyles.border10,
                  { width: '40%', textAlign: 'center' },
                  state.errors.captchaInput && styles.inputError
                ]}
                placeholder="کد امنیتی"
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={state.captchaInput}
                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'captchaInput', value })}
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="کد امنیتی"
              />

              {/* Refresh Button */}
              <TouchableOpacity onPress={generateCaptcha} style={styles.refreshButton}>
                <Ionicons name="reload" size={18} color={themeColor4.bgColor(1)} />
              </TouchableOpacity>

              {/* Captcha Display */}
              <View style={styles.captchaImage}>
                <Text style={styles.captchaText}>{state.captcha}</Text>
              </View>
            </View>
            {state.errors.captchaInput && (
              <Text style={styles.fieldErrorText}>{state.errors.captchaInput}</Text>
            )}
          </View>

          {/* Login Button */}
          <Button
            style={{ width: "100%" }}
            title={"ورود"}
            loading={state.isLoading}
            onPress={handleLogin}
            disabled={state.isLoading}
          />

          {/* Register Link */}
          <TransparentButton
            customTextStyle={{ color: themeColor4.bgColor(1), textDecorationLine: 'underline' }}
            title={"ثبت نام کاربر جدید"}
            onPress={() => {
              navigation.navigate("MainSignIn");
            }}
            disabled={state.isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
    gap: 5,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ff4444',
    fontFamily: 'VazirLight',
    fontSize: 14,
    textAlign: 'center',
  },
  warningContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    color: '#ffc107',
    fontFamily: 'VazirLight',
    fontSize: 12,
    textAlign: 'center',
  },
  fieldErrorText: {
    color: '#ff4444',
    fontFamily: 'VazirLight',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  checkbox: {
    marginHorizontal: 5,
  },
  checkboxEmpty: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: themeColor4.bgColor(1),
    borderRadius: 4,
  },
  checkboxChecked: {
    width: 18,
    height: 18,
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 4,
  },
  captchaImage: {
    width: 100,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb'
  },
  captchaText: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: '#333'
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
