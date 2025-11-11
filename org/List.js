import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';

const List = ({ navigation }) => {

  const handleNavigation = (screenName) => {
    // Navigate to respective screen
    navigation.navigate(screenName);
  };

  const menuItems = [
    { id: 1, title: 'قرارداد نامه', screen: 'ContractScreen' },
    { id: 2, title: 'انتخاب جامع', screen: 'ComprehensiveSelectionScreen' },
    { id: 3, title: 'تامین قطعات / کالا', screen: 'HardwareSelectionScreen' },
    { id: 4, title: 'رزرو / مراجعه تکنسین', screen: 'TechnicianVisitScreen' },
    { id: 5, title: 'انتخاب تکنسین', screen: 'Choosingatechnician' },
    { id: 6, title: 'تخفیف پنل / کد تخفیف', screen: 'DiscountCodeScreen' },
    { id: 7, title: 'اطلاعات اپراتور', screen: 'OperatorInfoScreen' },
    { id: 8, title: 'نمایش / استعلام / ثبت سفارش', screen: 'OrderMenuScreen' }
  ];

  return (
    <View style={[NewStyles.container, { flex: 1, backgroundColor: '#d1e9ff' }]}> 
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}>
        
        {/* Menu Items */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNavigation(item.screen)}
              style={{ 
                width: '100%',
                backgroundColor: '#1976d2', 
                borderRadius: 12, 
                paddingVertical: 15, 
                marginBottom: 12, 
                alignItems: 'center', 
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#1976d2',
                shadowOpacity: 0.3,
                shadowRadius: 5,
                position: 'relative'
              }}
            >
              <Text style={{ 
                color: '#fff', 
                fontSize: 16, 
                fontWeight: 'bold', 
                fontFamily: 'VazirBold',
                textAlign: 'center' 
              }}>{item.title}</Text>
              
              {/* Yellow arrow down */}

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
      
    </View>
  );
};

export default List;
