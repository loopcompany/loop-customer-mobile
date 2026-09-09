// screens/IncentivePlansScreen.js
import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './Footer';
import ScreenHeaders from "@components/ScreenHeaders";
import { ScreenStackHeaderBackButtonImage } from 'react-native-screens';
import NewStyles from '@styles/NewStyles';
import { createDirectionalStyles } from '@styles/directionalStyles';
export default function IncentivePlansScreen({ navigation }) {
  return (
    <SafeAreaView style={[NewStyles.container, styles.mainContainer]} edges={{ top: 'off', bottom: 'additive' }}>
      <ScreenHeaders 
        title="طرح‌های تشویقی"  
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.box}>
          <Text style={styles.header}>جعبه جوایز</Text>
          <Text style={styles.description}>
            کاربر گرامی،{'\n'}
            نصب ویندوز (سیستم عامل) و برنامه های کاربردی و درایورها{'\n'}
            بصورت کاملا رایگان{'\n'}

            
            با کد معرف: APAYAPP{'\n'}
            خرید حضوری همراه با ...{'\n'}
            تاریخ انقضا: .........
          </Text>
        </View>

        <View style={styles.footer}>
          {/* <Text style={styles.footerText}>فا</Text>
          <Text style={styles.footerText}>91693909</Text> */}
        </View>
      </View>
      
      
    </SafeAreaView>
  );
}

const styles = createDirectionalStyles((isRTL) => ({
  mainContainer: {
    flex: 1,
    backgroundColor: '#d1e9ff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    backgroundColor: '#d1e9ff',
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    backgroundColor: '#a6d7f7',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#003366',
    borderRadius: 10,
    fontSize: 18,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  header: {
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: '#333',
    textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr',
    lineHeight: 24,
  },
  footer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontWeight: 'bold',
    color: '#003366',
  },
}));
