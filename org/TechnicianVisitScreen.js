import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';

const TechnicianVisitScreen = ({ navigation }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  
  const timeSlots = [
    { id: 1, time: '۱۰ صبح به بعد' },
    { id: 2, time: '۱۲ ظهر به بعد' },
    { id: 3, time: '۱۴ الی ۱۷ عصر' }
  ];

  return (
    <View style={[NewStyles.container, { flex: 1, backgroundColor: '#d1e9ff' }]}> 
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
      />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}>
        {/* Main header - رزرو / مراجعه تکنسین */}
        <View style={{ 
          width: '95%', 
          alignSelf: 'center', 
          backgroundColor: '#1976d2', 
          borderRadius: 12, 
          paddingVertical: 14, 
          marginBottom: 12, 
          alignItems: 'center', 
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#1976d2',
          shadowOpacity: 0.3,
          shadowRadius: 4
        }}>
          <Text style={{ 
            color: '#fff', 
            fontSize: 18, 
            fontWeight: 'bold', 
            fontFamily: 'VazirBold',
            textAlign: 'center' 
          }}>رزرو / مراجعه تکنسین</Text>
        </View>

        {/* Time slot options */}
        <View style={{ width: '95%', alignSelf: 'center', marginBottom: 12 }}>
          {/* زمان نگهداری و سرویس (کوتاه مدت) */}
          <View style={{ 
            backgroundColor: '#c8e6c9',
            borderRadius: 12, 
            paddingVertical: 12, 
            marginBottom: 8, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderWidth: 1, 
            borderColor: '#81c784',
            elevation: 2,
            shadowColor: '#4caf50',
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#2e7d32', 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>زمان نگهداری و سرویس (کوتاه مدت)</Text>
          </View>

          {/* زمان نگهداری و سرویس (بلند مدت) */}
          <View style={{ 
            backgroundColor: '#c8e6c9',
            borderRadius: 12, 
            paddingVertical: 12, 
            marginBottom: 8, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderWidth: 1, 
            borderColor: '#81c784',
            elevation: 2,
            shadowColor: '#4caf50',
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#2e7d32', 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>زمان نگهداری و سرویس (بلند مدت)</Text>
          </View>

          {/* Separator line */}
          <View style={{ 
            height: 2, 
            backgroundColor: '#666', 
            marginVertical: 8, 
            width: '100%' 
          }} />

          {/* زمان نگهداری و سرویس (کوتاه مدت) - repeated */}
          <View style={{ 
            backgroundColor: '#c8e6c9',
            borderRadius: 12, 
            paddingVertical: 12, 
            marginBottom: 8, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderWidth: 1, 
            borderColor: '#81c784',
            elevation: 2,
            shadowColor: '#4caf50',
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#2e7d32', 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>زمان نگهداری و سرویس (کوتاه مدت)</Text>
          </View>

          {/* Yellow note */}
          <View style={{ 
            backgroundColor: '#ffeb3b', 
            borderRadius: 8, 
            paddingVertical: 8, 
            paddingHorizontal: 12, 
            marginBottom: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ffc107'
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: '#333', 
              fontFamily: 'VazirLight', 
              textAlign: 'center' 
            }}>راهنمای زمان نگهداری کوتاه مدت</Text>
          </View>
        </View>

        {/* تاریخ section */}
        <View style={{ width: '95%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{ 
            backgroundColor: '#f5f5f5', 
            borderRadius: 12, 
            paddingVertical: 12, 
            marginBottom: 8, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderWidth: 1, 
            borderColor: '#ddd'
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#333', 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>تاریخ</Text>
          </View>

          {/* Time slots */}
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 }}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  { 
                    backgroundColor: selectedTimeSlot === slot.id ? '#4caf50' : '#f5f5f5',
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: selectedTimeSlot === slot.id ? '#4caf50' : '#ddd',
                    flex: 1,
                    marginHorizontal: 2,
                    alignItems: 'center'
                  }
                ]}
                onPress={() => setSelectedTimeSlot(slot.id)}
              >
                <Text style={[
                  { 
                    fontSize: 13,
                    fontFamily: 'VazirBold',
                    color: selectedTimeSlot === slot.id ? '#fff' : '#333',
                    textAlign: 'center'
                  }
                ]}>
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Separator line */}
          <View style={{ 
            height: 1, 
            backgroundColor: '#666', 
            marginVertical: 8, 
            width: '100%' 
          }} />
        </View>

        {/* بارگزاری نامه (اختیاری) - قابل کلیک برای آپلود */}
        <View style={{ width: '95%', alignSelf: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={async () => {
              try {
                const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
                if (res.type === 'success') setSelectedLetter(res);
              } catch (e) {
                console.warn('pick letter error', e);
              }
            }}
            style={{ 
              backgroundColor: '#f5f5f5', 
              borderRadius: 12, 
              paddingVertical: 12, 
              marginBottom: 8, 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderWidth: 1, 
              borderColor: '#ddd'
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#333', 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>بارگزاری نامه (اختیاری)</Text>
          </TouchableOpacity>

          {/* Description text */}
          <View style={{ 
            backgroundColor: '#f9f9f9', 
            borderRadius: 8, 
            paddingVertical: 10, 
            paddingHorizontal: 12, 
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{ 
              fontSize: 11, 
              color: '#666', 
              fontFamily: 'VazirLight', 
              textAlign: 'right',
              lineHeight: 16
            }}>
              بین مراجعه داشتن / اطلاعات تکنیکی در درخواست قویت با تاسیسات، تیم و ایمنی هنده
              با مجموعه (پنل سازمانی / شرکت کوتاه مدت) برگزاری تصفیه
            </Text>
          </View>

          {selectedLetter ? (
            <View style={{ paddingVertical: 8, paddingHorizontal: 10 }}>
              <Text style={{ color: '#333', fontSize: 13 }}>فایل انتخاب شده: {selectedLetter.name}</Text>
            </View>
          ) : null}
        </View>

        {/* ادامه رزرو / مراجعه تکنسین section */}


      </ScrollView>
      
    </View>
  );
};

export default TechnicianVisitScreen;