import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken, setUserType } from '@slices/authSlice';
import { setOrganizationData } from '@slices/organizationSlice';
import { fetchAddresses } from '@slices/addressSlice';
import Footer from '@screens/Footer';
import ScreenHeaders from '@components/ScreenHeaders';
import NewStyles from '@styles/NewStyles';
import { themeColor0, themeColor3 } from '@theme/Color';
import CustomStatusBar from '@components/CustomStatusBar';
import HintBadge from '@components/HintBadge';
import { uri } from '@services/URL';
import { showAlert } from '@helpers/Common';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
const Login = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  // const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const dispatch = useDispatch();
  const [organizationCode, setOrganizationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [securityCode, setSecurityCode] = useState('');

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

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors = {};
    if (!organizationCode) {
      newErrors.organizationCode = t('Organization code is required');
    }

    if (!password) {
      newErrors.password = t('Password is required');
    } else if (password.length < 8) {
      newErrors.password = t('Password must be at least 8 characters');
    }

    // Validate captcha
    if (!securityCode) {
      newErrors.securityCode = t('Security code is required');
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      newErrors.securityCode = t('Security code is incorrect');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert(t('Error'), t('Please fill in all the required fields.'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${uri}/organization/login`, {
        organization_code: organizationCode,
        password: password,
      });

      if (response.data.status === 'success') {

        // Save token and user data
        if (rememberPassword) {
          await AsyncStorage.setItem('userToken', response.data.data.token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));

        await AsyncStorage.setItem('organizationData', JSON.stringify(response.data.data.organization));

        await AsyncStorage.setItem('accountType', 'organization');

        await AsyncStorage.setItem('organizationCode', organizationCode);

        // Dispatch to Redux
        dispatch(setToken(response.data.data.token));

        dispatch(setUserType('organization'));

        dispatch(setOrganizationData(response.data.data.organization));
        console.log('📦 [Login] اطلاعات سازمان به Redux ارسال شد:', response.data.data.organization);

        dispatch(fetchAddresses(response.data.data.token));
        console.log('📦 [Login] بارگذاری آدرس‌ها آغاز شد');

        if (rememberPassword) {
          await AsyncStorage.setItem('savedOrganizationCode', organizationCode);
          console.log('💾 [Login] savedOrganizationCode ذخیره شد');
        }

        console.log('✅ [Login] تمام اطلاعات با موفقیت ذخیره شد');

        // Clear navigation state from AsyncStorage to ensure fresh start
        try {
          await AsyncStorage.removeItem('NAVIGATION_STATE_V1');
          console.log('🗑️ [Login] Navigation state cleared from AsyncStorage');
        } catch (error) {
          console.error('Error clearing navigation state:', error);
        }

        // Show success message and navigate
        showAlert(
          t('success'),
          t('Login successful'),
          [
            {
              text: t('Confirm'),
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'List' }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        const errorData = error.response.data;

        if (errorData.error === 'organization_not_found') {
          setErrors({ organizationCode: t('Organization code not found') });
          showAlert(t('Error'), t('Organization code not found'));
        } else if (errorData.error === 'phone_not_verified') {
          showAlert(
            t('Notice'),
            t('Phone number is not verified yet. Please verify your phone number first.')
          );
        } else if (errorData.error === 'invalid_password') {
          setErrors({ password: t('Password is incorrect') });
          showAlert(t('Error'), t('Password is incorrect'));
        } else if (errorData.error === 'account_disabled') {
          showAlert(t('Error'), t('Your account has been disabled. Please contact support'));
        } else {
          showAlert(t('Error'), errorData.message || t('Login error'));
        }
      } else {
        showAlert(t('Error'), t('Error connecting to server. Please check your internet connection'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('OrganizationForgotPassword');
  };

  const handleSecurityCode = () => {
    // Handle security code logic
    showAlert(t('Security code'), t('Security code sent'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#d1e9ff' }}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t('Organization / Government')}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main header - ورود به حساب کاربری */}
          <View style={{
            width: '90%',
            alignSelf: 'center',
            backgroundColor: '#1976d2',
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 12,
            marginBottom: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            elevation: 3,
            shadowColor: '#1976d2',
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={{
              flex: 1,
              color: '#fff',
              fontSize: 16,
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>{t('Login to account')}</Text>
            <HintBadge
              hint={t("To find out and send and receive the contract, refer to the application menu or the contract start field section.")}
              title={t('Login to account')}
              size={22}
            />
          </View>

          <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
            {/* کد سازمانی */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.title, NewStyles.row]}>{t('Organization code')} <Text style={NewStyles.title6}>*</Text></Text>
              <TextInput
                value={organizationCode}
                onChangeText={setOrganizationCode}
                placeholder={t('Organization code *')}
                placeholderTextColor="#999"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: errors.organizationCode ? '#ff0000' : '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 45
                }}
              />
              {errors.organizationCode && (
                <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                  {errors.organizationCode}
                </Text>
              )}
            </View>

            {/* رمز عبور */}
            <Text style={NewStyles.title}>{t('Password')} <Text style={NewStyles.title6}>*</Text></Text>
            <View style={[{
              marginBottom: 8, gap: 8, backgroundColor: '#f5f5f5',
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: errors.password ? '#ff0000' : '#ccc',
            }, NewStyles.row]}>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('Password * (at least 8 characters)')}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={{
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  ...NewStyles.text10,
                  height: 45,
                  flex: 1
                }}
              />
              {/* Eye icon for password visibility */}
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
              {errors.password && (
                <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* ذخیره رمز عبور - Checkbox */}
            <TouchableOpacity
              onPress={() => setRememberPassword(!rememberPassword)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row-reverse',
                gap: 8,
                alignItems: 'center',
                marginBottom: 12,
                alignSelf: 'flex-end',
                paddingVertical: 4
              }}
            >
              <Text style={{
                fontSize: 12,
                color: '#555',
                fontFamily: 'VazirLight'
              }}>{t('Remember password')}</Text>
              <View style={{
                width: 18,
                height: 18,
                borderWidth: 1.5,
                borderColor: rememberPassword ? '#1976d2' : '#bbb',
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: rememberPassword ? '#1976d2' : 'transparent'
              }}>
                {rememberPassword && (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            {/* Security Code Input and Captcha */}
            <View style={{ marginBottom: 8 }}>
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
                    height: 45,
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
                    placeholder={t('Security code')}
                    placeholderTextColor="#999"
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
                      textAlign: 'center',
                      height: 45
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

          {/* ورود section */}
          <View style={{ width: '90%', alignSelf: 'center' }}>
            <TouchableOpacity
              onPress={handleLogin}
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
                  fontFamily: 'VazirBold',
                  textAlign: 'center'
                }}>{t('Login')}</Text>
              )}
            </TouchableOpacity>

            {/* Info text */}
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={{
                  fontSize: 11,
                  color: '#000000ff',
                  fontFamily: 'VazirLight',
                  textAlign: 'center',
                  marginBottom: 2,
                  lineHeight: 16
                }}>{t('Forgot your password?   Password recovery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { navigation.navigate('Register') }}>
                <Text style={{
                  fontSize: 11,
                  color: '#000000ff',
                  fontFamily: 'VazirLight',
                  textAlign: 'center',
                  lineHeight: 16
                }}>{t("Don't have an account? Sign up")}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
