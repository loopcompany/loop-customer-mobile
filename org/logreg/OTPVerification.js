import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { uri } from '../../services/URL';
import { showAlert } from '../../helpers/Common';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import NewStyles from '../../styles/NewStyles';
import { themeColor4 } from '../../theme/Color';

const OTPVerification = ({ route, navigation }) => {
  const { phone, organizationCode, userId, organizationId } = route.params;

  const CELL_COUNT = 6;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  
  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

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

  const handleVerify = async () => {
    if (code.length !== 6) {
      showAlert('خطا', 'لطفا کد 6 رقمی را وارد کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${uri}/organization/verify-phone`, {
        phone: phone,
        code: code,
      });

      console.log('✅ Verification response:', response.data);

      if (response.data.status === 'success') {
        // Save organization info (token might not be provided in verify step)
        await AsyncStorage.setItem('accountType', 'organization');
        await AsyncStorage.setItem('userType', 'organization');
        await AsyncStorage.setItem('organizationCode', organizationCode);
        
        // Save token only if provided
        if (response.data.data?.token) {
          await AsyncStorage.setItem('userToken', response.data.data.token);
        }
        
        // Save user data only if provided
        if (response.data.data?.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
        }
        
        // Save userId and organizationId
        if (userId) {
          await AsyncStorage.setItem('userId', userId.toString());
        }
        if (organizationId) {
          await AsyncStorage.setItem('organizationId', organizationId.toString());
        }

        showAlert(
          'موفق',
          `شماره موبایل با موفقیت تایید شد.\nکد سازمانی شما: ${organizationCode}\n\nلطفا با این کد وارد شوید.`,
          [
            {
              text: 'ورود',
              onPress: () => {
                // Navigate to Login screen
                navigation.navigate('Login');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        showAlert(
          'خطا در تایید',
          error.response.data.message || 'کد تایید اشتباه است. لطفا مجددا تلاش کنید.'
        );
      } else if (error.request) {
        console.error('Request error:', error.request);
        showAlert('خطا', 'سرور پاسخگو نیست. لطفا اتصال اینترنت را بررسی کنید.');
      } else {
        console.error('Unknown error:', error.message);
        showAlert('خطا', error.message || 'خطای نامشخص رخ داد');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      showAlert('توجه', `لطفا ${timer} ثانیه صبر کنید`);
      return;
    }

    setResendLoading(true);

    try {
      const response = await axios.post(`${uri}/organization/resend-code`, {
        phone: phone,
      });

      if (response.data.status === 'success') {
        showAlert('موفق', 'کد تایید مجددا ارسال شد');
        setTimer(120); // Reset timer
        setCode(''); // Clear inputs
      }
    } catch (error) {
      console.error('Resend error:', error);
      showAlert('خطا', error.response?.data?.message || 'خطا در ارسال مجدد کد');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title="تایید شماره موبایل"
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
          <View style={{ 
            backgroundColor: '#1976d2', 
            borderRadius: 10, 
            paddingVertical: 15, 
            marginBottom: 30, 
            alignItems: 'center',
            elevation: 3,
          }}>
            <Text style={{ 
              color: '#fff', 
              fontSize: 18, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              marginBottom: 8
            }}>
              کد تایید ارسال شد
            </Text>
            <Text style={{ 
              color: '#fff', 
              fontSize: 14, 
              fontFamily: 'VazirLight',
            }}>
              کد 6 رقمی ارسال شده به {phone} را وارد کنید
            </Text>
          </View>

          {/* Organization Code Display */}
          <View style={{ 
            backgroundColor: themeColor4.bgColor(1), 
            borderRadius: 10, 
            padding: 15, 
            marginBottom: 30,
            alignItems: 'center',
            elevation: 2,
          }}>
            <Text style={{ 
              fontSize: 14, 
              fontFamily: 'VazirLight',
              color: '#666',
              marginBottom: 8
            }}>
              کد سازمانی شما:
            </Text>
            <Text style={{ 
              fontSize: 32, 
              fontFamily: 'VazirBold',
              color: '#1976d2',
              letterSpacing: 8
            }}>
              {organizationCode}
            </Text>
            <Text style={{ 
              ...NewStyles.title6,
              marginTop: 8,
              textAlign: 'center'
            }}>
              این کد را برای ورود به سیستم نیاز دارید
            </Text>
          </View>

          {/* OTP Input */}
          <View style={{ marginBottom: 30 }}>
            <CodeField
              ref={ref}
              {...props}
              value={code}
              onChangeText={setCode}
              cellCount={CELL_COUNT}
              rootStyle={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  onLayout={getCellOnLayoutHandler(index)}
                  style={{
                    width: 45,
                    height: 55,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isFocused ? '#1976d2' : (symbol ? '#1976d2' : '#ccc'),
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: 'VazirBold',
                      textAlign: 'center',
                      color: '#000',
                    }}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Timer */}
          {timer > 0 && (
            <Text style={{
              textAlign: 'center',
              fontSize: 14,
              fontFamily: 'VazirLight',
              color: '#666',
              marginBottom: 20
            }}>
              زمان باقیمانده: {formatTime(timer)}
            </Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            style={{
              backgroundColor: loading || code.length !== 6 ? '#90caf9' : '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              marginBottom: 15,
              alignItems: 'center',
              elevation: 3,
              opacity: loading || code.length !== 6 ? 0.7 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'VazirBold'
              }}>
                تایید
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
              alignItems: 'center',
              borderWidth: 2,
              borderColor: timer > 0 ? '#ccc' : '#1976d2',
              opacity: timer > 0 ? 0.5 : 1
            }}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#1976d2" />
            ) : (
              <Text style={{
                color: timer > 0 ? '#999' : '#1976d2',
                fontSize: 14,
                fontFamily: 'VazirBold'
              }}>
                ارسال مجدد کد
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OTPVerification;
