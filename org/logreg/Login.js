import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Footer from '../../screens/Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

const Login = ({ navigation }) => {
  const [organizationCode, setOrganizationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

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

  const handleLogin = () => {
    if (!organizationCode || !password) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }
    if (securityCode.toLowerCase() !== displayedCaptcha.toLowerCase()) {
      Alert.alert('خطا', 'کد امنیتی صحیح نیست');
      return;
    }
    // Handle login logic here
    navigation.navigate('Method');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPasswordScreen');
  };

  const handleSecurityCode = () => {
    // Handle security code logic
    Alert.alert('کد امنیتی', 'کد امنیتی ارسال شد');
  };

  return (
    <View style={[NewStyles.container, { flex: 1, backgroundColor: '#d1e9ff' }]}> 
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}>
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
              placeholder="کد سازمانی  *"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 10, 
                paddingHorizontal: 12,
                borderWidth: 1, 
                borderColor: '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                height: 40
              }}
            />
          </View>

          {/* رمز عبور */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="رمز عبور * "
              secureTextEntry={!showPassword}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8, 
                paddingVertical: 10, 
                paddingHorizontal: 12,
                paddingLeft: 45,
                borderWidth: 1, 
                borderColor: '#ccc',
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
              <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 8 }}>
            {/* بروچر - دکمه سمت چپ */}
            <TouchableOpacity 
              onPress={() => setDisplayedCaptcha(generateCaptcha())}
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
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 8, 
                  paddingVertical: 8, 
                  paddingHorizontal: 10,
                  borderWidth: 1, 
                  borderColor: '#ccc',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  textAlign: 'right',
                  height: 36
                }}
              />
            </View>
          </View>
        </View>

        {/* ورود section */}
        <View style={{ width: '90%', alignSelf: 'center' }}>
          <TouchableOpacity 
            onPress={handleLogin}
            style={{ 
              backgroundColor: '#1976d2', 
              borderRadius: 10, 
              paddingVertical: 12, 
              marginBottom: 10, 
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
            }}>ورود</Text>
          </TouchableOpacity>

          {/* Info text */}
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <TouchableOpacity onPress={()=>{navigation.navigate('ResetPasswordScreen')}}>
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
      <Footer />
    </View>
  );
};

export default Login;