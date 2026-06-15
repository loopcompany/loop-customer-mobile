import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ScreenHeaders } from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

const Privacy = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={NewStyles.wrapper}>
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
      />

      <ScrollView style={NewStyles.container} showsVerticalScrollIndicator={false}>

        {/* Header Section with Profile */}
        <View style={{
          backgroundColor: '#4A90E2',
          borderRadius: 15,
          padding: 15,
          marginBottom: 20,
          marginHorizontal: 10
        }}>
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontFamily: 'VazirBold',
            textAlign: 'center',
            backgroundColor: '#2E5B9A',
            paddingVertical: 8,
            borderRadius: 8,
            marginBottom: 15
          }}>حریم خصوصی</Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 15
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'VazirBold',
                marginBottom: 5
              }}>اکبر احمدی</Text>
              <Text style={{
                color: '#E3F2FD',
                fontSize: 14,
                fontFamily: 'VazirLight'
              }}>+۹۸۹۱۹۰۹۹۰۷۰۹</Text>
            </View>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 24, color: '#4A90E2' }}>👤</Text>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={{ paddingHorizontal: 15 }}>

          {/* Organization Name */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="تبلیغات اسلامی تهران"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                color: '#666'
              }}
            />
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="۰۵۰۵۴۴۰۹۹۰۳"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                color: '#666'
              }}
            />
          </View>

          {/* Date */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="۱۴۰۶/۱۰/۱۴"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                color: '#666'
              }}
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="info@clpiran.com"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'left',
                color: '#666'
              }}
            />
          </View>

          {/* Mobile Number */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="+۹۸۹۱۲۶۶۲۴۸۱۴۹"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                color: '#666'
              }}
            />
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 15 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ddd',
            }}>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 12 }}
              >
                <Text style={{ fontSize: 16 }}>👁</Text>
              </TouchableOpacity>
              <TextInput
                value="*********"
                secureTextEntry={!showPassword}
                editable={false}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  textAlign: 'right',
                  color: '#666'
                }}
              />
            </View>
          </View>

          {/* City and Region Selection */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
            gap: 10
          }}>
            <View style={{ flex: 1 }}>
              <TextInput
                value="۵"
                placeholder="منطقه :"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  fontSize: 14,
                  fontFamily: 'VazirLight',
                  textAlign: 'center'
                }}
              />
            </View>
            
          </View>

          {/* Address */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="تهران - میدان ولی عصر - خیابان ولی عصر - پلاک ۵۲ - طبقه ۴"
              multiline
              numberOfLines={2}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                height: 60,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* ID Number */}
          <View style={{ marginBottom: 15 }}>
            <TextInput
              value="۱۳۷۲۴۴۵۹۶۹۲"
              editable={false}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'center',
                color: '#666'
              }}
            />
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: '#ddd',
              marginBottom: 15,
              alignItems: 'center'
            }}
          >
            <Text style={{
              fontSize: 14,
              fontFamily: 'VazirBold',
              color: '#666',
              textAlign: 'center'
            }}>تغییر رمز عبور</Text>
          </TouchableOpacity>

          {/* Password Change Fields */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
            gap: 10
          }}>
            {/* Current Password */}
            <View style={{ flex: 1 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ddd',
              }}>
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ padding: 8 }}
                >
                  <Text style={{ fontSize: 14 }}>👁</Text>
                </TouchableOpacity>
                <TextInput
                  placeholder="رمز عبور جدید"
                  secureTextEntry={!showConfirmPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontFamily: 'VazirLight',
                    textAlign: 'right'
                  }}
                />
              </View>
            </View>

            {/* New Password */}
            <View style={{ flex: 1 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ddd',
              }}>
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{ padding: 8 }}
                >
                  <Text style={{ fontSize: 14 }}>👁</Text>
                </TouchableOpacity>
                <TextInput
                  placeholder="رمز عبور فعلی"
                  secureTextEntry={!showNewPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    fontSize: 12,
                    fontFamily: 'VazirLight',
                    textAlign: 'right'
                  }}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ marginBottom: 20 }}>
            {/* Register/Login Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#4A90E2',
                borderRadius: 8,
                paddingVertical: 15,
                marginBottom: 10,
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>ثبت / ورود به حساب کاربری</Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#FF6B35',
                borderRadius: 8,
                paddingVertical: 15,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>خروج از حساب کاربری</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            marginTop: 10
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 24,
                marginBottom: 5
              }}>🔗</Text>
              <Text style={{
                fontSize: 12,
                fontFamily: 'VazirLight',
                color: '#666'
              }}>اتصال</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 24,
                marginBottom: 5
              }}>📊</Text>
              <Text style={{
                fontSize: 12,
                fontFamily: 'VazirLight',
                color: '#666'
              }}>آمار</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 24,
                marginBottom: 5
              }}>📱</Text>
              <Text style={{
                fontSize: 12,
                fontFamily: 'VazirLight',
                color: '#666'
              }}>موبایل</Text>
            </View>

            <Text style={{
              fontSize: 16,
              fontFamily: 'VazirBold',
              color: '#333'
            }}>21164552</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default Privacy;
