import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Footer from '../../screens/Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

const Register = ({ navigation }) => {
  const [profileName, setProfileName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [nationalNumber, setNationalNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('تهران');
  const [region, setRegion] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');
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

  // Initialize captcha on component mount
  useEffect(() => {
    setDisplayedCaptcha(generateCaptcha());
  }, []);

  // DropDown states
  const [nationalNumberDropdown, setNationalNumberDropdown] = useState(false);
  const [phoneNumberDropdown, setPhoneNumberDropdown] = useState(false);
  const [organizationPhoneDropdown, setOrganizationPhoneDropdown] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);

  const handleRegister = () => {
    if (!profileName || !organizationName || !familyName) {
      Alert.alert('خطا', 'لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }
    // Handle registration logic here
    Alert.alert('موفق', 'ثبت نام با موفقیت انجام شد');
    navigation.navigate('Login');
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
        {/* Main header - اطلاعات تکمیلی */}
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
          }}>اطلاعات تکمیلی</Text>
        </View>

        {/* Form Container */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          
          {/* پروفایل من - with icon */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="پروفایل من"
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
            <View style={{ 
              position: 'absolute', 
              left: 12, 
              top: 10, 
              zIndex: 1 
            }}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
          </View>

          {/* نام سازمان */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationName}
              onChangeText={setOrganizationName}
              placeholder="نام سازمان * :"
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

          {/* نام و نام خانوادگی مدیر */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="نام و نام خانوادگی مدیر * :"
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
  <View style={{ marginBottom: 8 }}>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder=" شماره ملی مدیر * :"
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

          {/* شماره ملی مدیر */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={nationalNumber}
              onChangeText={setNationalNumber}
               placeholder="شماره تلفن همراه، مدیر | ۰ ۱ رقمی"
              keyboardType="numeric"
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
            <TouchableOpacity 
              onPress={() => setNationalNumberDropdown(!nationalNumberDropdown)}
              style={{ 
                position: 'absolute', 
                left: 8, 
                top: 8, 
                zIndex: 1,
                backgroundColor: '#ffeb3b',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2
              }}
            >
              <Text style={{ fontSize: 10, color: '#333', fontFamily: 'VazirBold' }}>iran 98+</Text>
            </TouchableOpacity>
          </View>

          {/* شماره تلفن همراه، مدیر */}
        

          {/* متولد */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="متولد * : روز / ماه / سال"
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

          {/* آدرس ایمیل سازمان */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationEmail}
              onChangeText={setOrganizationEmail}
              placeholder="آدرس ایمیل سازمان * :"
              keyboardType="email-address"
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

          {/* شماره تلفن ثابت سازمان */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <View style={{ flex: 2 }}>
              <TextInput
                value={organizationPhoneNumber}
                onChangeText={setOrganizationPhoneNumber}
                placeholder=":شماره تلفن ثابت سازمان * "
                keyboardType="phone-pad"
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
            <View style={{ 
              backgroundColor: '#ffeb3b',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              minWidth: 50
            }}>
              <Text style={{ fontSize: 10, color: '#333', fontFamily: 'VazirBold' }}>21-</Text>
              <Text style={{ fontSize: 8, color: '#333', fontFamily: 'VazirBold' }}>iran 98+</Text>
            </View>
          </View>

          {/* رمز عبور */}
          <View style={{ marginBottom: 8, position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder=":رمز عبور * "
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

          {/* شهر و منطقه */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={region}
                onChangeText={setRegion}
                placeholder="منطقه * :"
                keyboardType="numeric"
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
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => setCityDropdown(!cityDropdown)}
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 8, 
                  paddingVertical: 5, 
                  paddingHorizontal: 12,
                  borderWidth: 1, 
                  borderColor: '#ccc',
                  height: 40,
                  justifyContent: 'center'
                }}
              >
                <Text style={{ 
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  textAlign: 'right',
                  color: city ? '#333' : '#999'
                }}>
                  {city || 'شهر : تهران'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* آدرس سازمان */}
          <View style={{ marginBottom: 8 }}>
            <TextInput
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
              placeholder="آدرس سازمان * :"
              multiline
              numberOfLines={2}
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
                height: 60,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* کد پستی سازمان */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value={organizationPostalCode}
              onChangeText={setOrganizationPostalCode}
              placeholder="کد پستی سازمان * :"
              keyboardType="numeric"
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

        {/* ثبت نام section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <TouchableOpacity 
            onPress={handleRegister}
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
            }}>ثبت نام</Text>
          </TouchableOpacity>

          {/* دکمه ورود به حساب کاربری */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={{ 
              backgroundColor: '#1976d2', 
              borderRadius: 10, 
              paddingVertical: 12, 
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
            }}>ورود به حساب کاربری</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      
    </View>
  );
};

export default Register;
