import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken, setUserType } from '../../slices/authSlice';
import { setOrganizationData } from '../../slices/organizationSlice';
import Footer from '../../screens/Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { uri } from '../../services/URL';
import { showAlert } from '../../helpers/Common';

const Login = ({ navigation }) => {
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
      newErrors.organizationCode = 'کد سازمانی الزامی است';
    } else if (organizationCode.length !== 6) {
      newErrors.organizationCode = 'کد سازمانی باید 6 رقم باشد';
    }

    if (!password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (password.length < 8) {
      newErrors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    }

    // Validate captcha
    if (!securityCode) {
      newErrors.securityCode = 'کد امنیتی الزامی است';
    } else if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      newErrors.securityCode = 'کد امنیتی صحیح نیست';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert('خطا', 'لطفا تمام فیلدها را به درستی پر کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${uri}/organization/login`, {
        organization_code: organizationCode,
        password: password,
      });

      if (response.data.status === 'success') {
        console.log('✅ [Login] ورود موفق - شروع ذخیره‌سازی اطلاعات...');
        console.log('🔑 [Login] توکن دریافتی:', response.data.data.token ? `${response.data.data.token.substring(0, 20)}...` : 'null');
        
        // Save token and user data
        await AsyncStorage.setItem('userToken', response.data.data.token);
        console.log('💾 [Login] userToken ذخیره شد');
        
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
        console.log('💾 [Login] userData ذخیره شد');
        
        await AsyncStorage.setItem('organizationData', JSON.stringify(response.data.data.organization));
        console.log('💾 [Login] organizationData ذخیره شد');
        
        await AsyncStorage.setItem('accountType', 'organization');
        console.log('💾 [Login] accountType ذخیره شد: organization');
        
        await AsyncStorage.setItem('organizationCode', organizationCode);
        console.log('💾 [Login] organizationCode ذخیره شد');
        
        // Dispatch to Redux
        dispatch(setToken(response.data.data.token));
        console.log('📦 [Login] توکن به Redux ارسال شد');
        
        dispatch(setUserType('organization'));
        console.log('📦 [Login] userType به Redux ارسال شد: organization');
        
        dispatch(setOrganizationData(response.data.data.organization));
        console.log('📦 [Login] اطلاعات سازمان به Redux ارسال شد:', response.data.data.organization);

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
          'موفق',
          'ورود با موفقیت انجام شد',
          [
            {
              text: 'تایید',
              onPress: () => {
                // Navigate to FolderScreen inside MainApp
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainApp',
                      state: {
                        routes: [{ name: 'FolderScreen' }],
                        index: 0,
                      },
                    },
                  ],
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
          setErrors({ organizationCode: 'کد سازمانی یافت نشد' });
          showAlert('خطا', 'کد سازمانی یافت نشد');
        } else if (errorData.error === 'phone_not_verified') {
          showAlert(
            'توجه',
            'شماره موبایل هنوز تایید نشده است. لطفا ابتدا شماره موبایل خود را تایید کنید.'
          );
        } else if (errorData.error === 'invalid_password') {
          setErrors({ password: 'رمز عبور اشتباه است' });
          showAlert('خطا', 'رمز عبور اشتباه است');
        } else if (errorData.error === 'account_disabled') {
          showAlert('خطا', 'حساب کاربری شما غیرفعال شده است. لطفا با پشتیبانی تماس بگیرید');
        } else {
          showAlert('خطا', errorData.message || 'خطا در ورود');
        }
      } else {
        showAlert('خطا', 'خطا در ارتباط با سرور');
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
    showAlert('کد امنیتی', 'کد امنیتی ارسال شد');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#d1e9ff' }}>
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
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
          }}>ورود به حساب کاربری</Text>
        </View>

        {/* Form Container */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          {/* کد سازمانی */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationCode}
              onChangeText={setOrganizationCode}
              placeholder="کد سازمانی * (6 رقم)"
              keyboardType="numeric"
              maxLength={6}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 10, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: errors.organizationCode ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                height: 40
              }}
            />
            {errors.organizationCode && (
              <Text style={{ color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' }}>
                {errors.organizationCode}
              </Text>
            )}
          </View>

          {/* رمز عبور */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="رمز عبور * (حداقل 8 کاراکتر)"
              secureTextEntry={!showPassword}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 10, 
                paddingHorizontal: 12,
                paddingLeft: 45,
                borderWidth: 1, 
                borderColor: errors.password ? '#ff0000' : '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                height: 40
              }}
            />
            {/* Eye icon for password visibility */}
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                left: 12, 
                top: 10, 
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

          {/* ذخیره رمز عبور - Checkbox */}
          <TouchableOpacity 
            onPress={() => setRememberPassword(!rememberPassword)}
            style={{ 
              alignItems: 'center', 
              marginBottom: 12,
              alignSelf: 'flex-end'
            }}
          >
            <View style={{ 
              backgroundColor: '#ffeb3b', 
              borderRadius: 6, 
              paddingHorizontal: 10, 
              paddingVertical: 4,
              flexDirection: 'row-reverse',
              gap:10,
              alignItems: 'center'
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: '#333', 
                fontFamily: 'VazirBold',
                marginRight: 4
              }}>ذخیره رمز عبور</Text>
              <View style={{
                width: 16,
                height: 16,
                borderWidth: 1.5,
                borderColor: '#333',
                borderRadius: 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: rememberPassword ? '#333' : 'transparent'
              }}>
                {rememberPassword && (
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
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
                <TextInput
                  value={securityCode}
                  onChangeText={setSecurityCode}
                  placeholder="کد امنیتی"
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
                    textAlign: 'right',
                    height: 36
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
                fontWeight: 'bold', 
                fontFamily: 'VazirBold',
                textAlign: 'center' 
              }}>ورود</Text>
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
            }}>رمز عبور خود را فراموش کرده اید؟   بازگردانی رمز عبور</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{navigation.navigate('Register')}}>
            <Text style={{ 
              fontSize: 11, 
              color: '#000000ff', 
              fontFamily: 'VazirLight',
              textAlign: 'center',
              lineHeight: 16
            }}>حساب کاربری ندارید؟ ثبت نام کنید</Text>
            </TouchableOpacity>
          </View>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;