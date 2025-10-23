// screens/OrderTrackingScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import Footer from './Footer';
import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import ScreenTitle from '../components/ScreenTitle';
export default function OrderTrackingScreen() {
  return (
    <ImageBackground
      source={require('../assets/moon.jpg')}
      style={NewStyles.container}
    >
      <CustomStatusBar />
      <View style={{ padding: 10 }}>
        <ScreenTitle title={'شماره پیگیری ثبت سفارش'} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.card}>
          <Text style={NewStyles.text10}>کاربر گرامی</Text>
          <Text style={NewStyles.text10}>ضمن تشکر از اعتماد شما</Text>
          <Text style={NewStyles.text10}>سفارش شما</Text>
          <Text style={NewStyles.text10}>شماره سفارش: 984876565</Text>
          <Text style={NewStyles.text10}>کد کاربری: 211-5015</Text>
          <Text style={NewStyles.text10}>و شماره تماس: 09123456789</Text>
          <Text style={NewStyles.text10}>
            در تاریخ 1402/01/01 ثبت و در دست بررسی می‌باشد.
          </Text>
          <Text style={NewStyles.text10}>
            شما می‌توانید مراحل سفارش خود را در بخش پیگیری سفارش‌های جاری در اپلیکیشن لوپ پیگیری کنید.
          </Text>
          <Text style={NewStyles.text10}>
            اطمینان به شما داده می‌شود سفارش شما با نهایت دقت انجام می‌گیرد.
          </Text>
        </View>

        <TouchableOpacity style={styles.greenButton}>
          <Text style={NewStyles.text4}>پیگیری سفارش های جاری</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.blueButton}>
          <Text style={NewStyles.text4}>ثبت سفارش جدید</Text>
        </TouchableOpacity>

        {/* Footer */}
        {/* <View style={styles.footer}>
          <Image source={require('../assets/logo.png')} style={styles.footerLogo} />
          <Text style={styles.supportText}>پشتیبانی</Text>
          <Text style={styles.language}>فا</Text>
          <Text style={styles.phone}>21164552</Text>
        </View> */}
      </ScrollView>
      <Footer />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    backgroundColor: '#ADD8E6',
    color: '#000',
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 50,
    width: '100%',
  },
  cardText: {
    fontSize: 14,
    color: '#000',
    marginVertical: 4,
    lineHeight: 22,
    textAlign: 'right',
  },
  greenButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  supportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  language: {
    color: '#fff',
    fontSize: 16,
  },
  phone: {
    color: '#fff',
    fontSize: 16,
  },
});
