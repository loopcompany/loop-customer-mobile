import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';

const DiscountCodeScreen = ({ navigation }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [operatorInfo, setOperatorInfo] = useState({
    title: '',
    name: '',
    nationalId: '',
    mobileNumber: '',
    birthDate: ''
  });

  return (
    <View style={[NewStyles.container, { flex: 1, backgroundColor: '#d1e9ff' }]}> 
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}>
        
        {/* تخفیف پنل / کد تخفیف Header */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <View style={{ 
            backgroundColor: '#1976d2', 
            borderRadius: 12, 
            paddingVertical: 14, 
            alignItems: 'center', 
            justifyContent: 'center',
            elevation: 3,
            shadowColor: '#1976d2',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            position: 'relative'
          }}>
            <Text style={{ 
              color: '#fff', 
              fontSize: 18, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              textAlign: 'center' 
            }}>تخفیف پنل / کد تخفیف</Text>
            {/* Yellow arrow down */}
            <View style={{
              position: 'absolute',
              bottom: -8,
              alignSelf: 'center',
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#ffeb3b'
            }} />
          </View>
        </View>

        {/* راهنمای احتساب - Yellow Banner */}
        <View style={{ 
          width: '100%',
          backgroundColor: '#ffeb3b',
          paddingVertical: 8,
          marginBottom: 15,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10
        }}>
          {/* Dotted line */}
          <View style={{
            flex: 1,
            borderTopWidth: 2,
            borderTopColor: '#000',
            borderStyle: 'dotted',
            marginRight: 10
          }} />
          <Text style={{
            fontSize: 12,
            fontFamily: 'VazirBold',
            color: '#000',
            textAlign: 'center'
          }}>
            راهنمای احتساب درصد تخفیف پنل / کد تخفیف ۱
          </Text>
        </View>

        {/* احتساب درصد تخفیف پنل */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <TouchableOpacity style={{ 
            backgroundColor: '#e8f5e8', 
            borderRadius: 12, 
            paddingVertical: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#81c784',
            elevation: 2
          }}>
            <Text style={{ 
              color: '#2e7d32', 
              fontSize: 16, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              textAlign: 'center' 
            }}>احتساب درصد تخفیف پنل</Text>
          </TouchableOpacity>
        </View>

        {/* کد تخفیف */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={discountCode}
            onChangeText={setDiscountCode}
            placeholder="کد تخفیف"
            placeholderTextColor="#999"
          />
        </View>

        {/* اطلاعات اپراتور Header */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <View style={{ 
            backgroundColor: '#1976d2', 
            borderRadius: 12, 
            paddingVertical: 14, 
            alignItems: 'center', 
            justifyContent: 'center',
            elevation: 3,
            shadowColor: '#1976d2',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            position: 'relative'
          }}>
            <Text style={{ 
              color: '#fff', 
              fontSize: 18, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              textAlign: 'center' 
            }}>اطلاعات اپراتور</Text>
            {/* Yellow arrow down */}
            <View style={{
              position: 'absolute',
              bottom: -8,
              alignSelf: 'center',
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#ffeb3b'
            }} />
          </View>
        </View>

        {/* راهنمای اطلاعات اپراتور - Yellow Banner */}
        <View style={{ 
          width: '100%',
          backgroundColor: '#ffeb3b',
          paddingVertical: 8,
          marginBottom: 15,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10
        }}>
          {/* Dotted line */}
          <View style={{
            flex: 1,
            borderTopWidth: 2,
            borderTopColor: '#000',
            borderStyle: 'dotted',
            marginRight: 10
          }} />
          <Text style={{
            fontSize: 12,
            fontFamily: 'VazirBold',
            color: '#000',
            textAlign: 'center'
          }}>
            راهنمای اطلاعات اپراتور ۱
          </Text>
        </View>

        {/* فیلدهای ورودی */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={operatorInfo.title}
            onChangeText={(text) => setOperatorInfo({ ...operatorInfo, title: text })}
            placeholder="عنوان شغلی اپراتور : *"
            placeholderTextColor="#999"
          />
        </View>

        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={operatorInfo.name}
            onChangeText={(text) => setOperatorInfo({ ...operatorInfo, name: text })}
            placeholder="نام و نام خانوادگی اپراتور : *"
            placeholderTextColor="#999"
          />
        </View>

        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={operatorInfo.nationalId}
            onChangeText={(text) => setOperatorInfo({ ...operatorInfo, nationalId: text })}
            placeholder="شماره ملی اپراتور : *"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={operatorInfo.mobileNumber}
            onChangeText={(text) => setOperatorInfo({ ...operatorInfo, mobileNumber: text })}
            placeholder="شماره تلفن موبایل اپراتور : *"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
          <TextInput
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              paddingVertical: 12, 
              paddingHorizontal: 12,
              borderWidth: 1, 
              borderColor: '#ccc',
              fontSize: 14,
              fontFamily: 'VazirLight',
              textAlign: 'right',
              color: '#333'
            }}
            value={operatorInfo.birthDate}
            onChangeText={(text) => setOperatorInfo({ ...operatorInfo, birthDate: text })}
            placeholder="متولد : روز / ماه / سال"
            placeholderTextColor="#999"
          />
        </View>

        {/* دکمه ثبت / ادامه */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('List')}
            style={{ 
              backgroundColor: '#1976d2', 
              borderRadius: 12, 
              paddingVertical: 14, 
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
              fontSize: 18, 
              fontWeight: 'bold', 
              fontFamily: 'VazirBold',
              textAlign: 'center' 
            }}>ثبت / ادامه</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <Footer />
    </View>
  );
};

export default DiscountCodeScreen;