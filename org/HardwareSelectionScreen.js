import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';

const HardwareSelectionScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('لپ تاپ');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [generalNeed, setGeneralNeed] = useState('');
  const [description, setDescription] = useState('');
  const [quantities, setQuantities] = useState({
    'کارکرده': 0,
    'اکبند': 2
  });

  const categories = [
    'لپ تاپ',
    'کیس',
    'مانیتور',
    'آل این وان',
    'هارد دیسک',
    'پرینتر',
    'لوازم جانبی'
  ];

  const handleQuantityChange = (item, increment) => {
    setQuantities(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + increment)
    }));
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
        {/* Main header - تامین قطعات / کالا - Dropdown */}
        <TouchableOpacity 
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ 
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
            shadowRadius: 4,
            flexDirection: 'row'
          }}
        >
          <Text style={{ 
            color: '#fff', 
            fontSize: 18, 
            fontWeight: 'bold', 
            fontFamily: 'VazirBold',
            textAlign: 'center',
            flex: 1
          }}>+ تامین قطعات / کالا</Text>
          <Text style={{ 
            color: '#fff', 
            fontSize: 20, 
            fontWeight: 'bold',
            marginLeft: 10
          }}>{isDropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* دسته بندی قطعه / کالای مورد نیاز - Only show when dropdown is open */}
        {isDropdownOpen && (
          <View style={{ width: '95%', alignSelf: 'center', marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: '#333', 
              fontFamily: 'VazirBold', 
              textAlign: 'center',
              marginBottom: 8
            }}>دسته بندی قطعه / کالای مورد نیاز</Text>

            {/* Dropdown category selector */}
            <View style={{ 
              backgroundColor: '#f5f5f5', 
              borderRadius: 12, 
              paddingVertical: 12, 
              paddingHorizontal: 16,
              marginBottom: 12, 
              borderWidth: 1, 
              borderColor: '#ddd',
              minHeight: 120
            }}>
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => {
                    setSelectedCategory(category);
                    setIsDropdownOpen(false);
                  }}
                  style={{ 
                    paddingVertical: 4,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ 
                    fontSize: 14, 
                    color: selectedCategory === category ? '#1976d2' : '#333', 
                    fontFamily: selectedCategory === category ? 'VazirBold' : 'VazirLight',
                    textAlign: 'center' 
                  }}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Rest of the form - always visible */}
        <View style={{ width: '95%', alignSelf: 'center', marginBottom: 12 }}>

          {/* قیرخ کلی نیاز - Text Input */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: '#333', 
              fontFamily: 'VazirBold', 
              textAlign: 'right',
              marginBottom: 6
            }}>شرح کلی نیاز</Text>
            <TextInput
              value={generalNeed}
              onChangeText={setGeneralNeed}
              placeholder="شرح کلی نیاز خود را وارد کنید..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 12, 
                padding: 12, 
                borderWidth: 1, 
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 80
              }}
            />
          </View>

          {/* کارکرده / اکبند buttons with quantities */}
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 12 }}>
            {/* کارکرده */}
            <View style={{ flex: 1, marginRight: 4 }}>
              <TouchableOpacity style={{ 
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#ddd',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Text style={{ 
                  fontSize: 16,
                  fontFamily: 'VazirBold',
                  color: '#333',
                  textAlign: 'center'
                }}>کارکرده</Text>
              </TouchableOpacity>

              {/* Quantity controls for کارکرده */}
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity 
                  onPress={() => handleQuantityChange('کارکرده', 1)}
                  style={{ 
                    backgroundColor: '#4caf50',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>

                <View style={{ 
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  minWidth: 40,
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    fontSize: 16,
                    fontFamily: 'VazirBold',
                    color: '#333'
                  }}>{quantities['کارکرده']}</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => handleQuantityChange('کارکرده', -1)}
                  style={{ 
                    backgroundColor: '#f44336',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* اکبند */}
            <View style={{ flex: 1, marginLeft: 4 }}>
              <TouchableOpacity style={{ 
                backgroundColor: '#e3f2fd',
                borderRadius: 8,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#1976d2',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Text style={{ 
                  fontSize: 16,
                  fontFamily: 'VazirBold',
                  color: '#1976d2',
                  textAlign: 'center'
                }}>اکبند</Text>
              </TouchableOpacity>

              {/* Quantity controls for اکبند */}
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity 
                  onPress={() => handleQuantityChange('اکبند', 1)}
                  style={{ 
                    backgroundColor: '#4caf50',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>

                <View style={{ 
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  minWidth: 40,
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    fontSize: 16,
                    fontFamily: 'VazirBold',
                    color: '#333'
                  }}>{quantities['اکبند']}</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => handleQuantityChange('اکبند', -1)}
                  style={{ 
                    backgroundColor: '#f44336',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* توضیحات - Text Input */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: '#333', 
              fontFamily: 'VazirBold', 
              textAlign: 'right',
              marginBottom: 6
            }}>توضیحات :</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="توضیحات اضافی را وارد کنید..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 12, 
                padding: 12, 
                borderWidth: 1, 
                borderColor: '#ddd',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'right',
                minHeight: 100
              }}
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ width: '95%', alignSelf: 'center', gap: 8 }}>
          {/* مدور پیش رسید */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#4caf50', 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center', 
              elevation: 2,
              shadowColor: '#4caf50',
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
            onPress={() => {}}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>صدور پیش رسید</Text>
          </TouchableOpacity>

          {/* نمایش پیش رسید */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1976d2', 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center', 
              elevation: 2,
              shadowColor: '#1976d2',
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
            onPress={() => {}}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>نمایش پیش رسید</Text>
          </TouchableOpacity>

          {/* ثبت سفارش */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#4caf50', 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center', 
              elevation: 2,
              shadowColor: '#4caf50',
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
            onPress={() => navigation.navigate('OrderSummary')}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>ثبت سفارش</Text>
          </TouchableOpacity>

          {/* لغو سفارش */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#ff9800', 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center', 
              elevation: 2,
              shadowColor: '#ff9800',
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontFamily: 'VazirBold', 
              textAlign: 'center' 
            }}>لغو سفارش</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      
    </View>
  );
};

export default HardwareSelectionScreen;