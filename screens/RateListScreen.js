// RateListScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';

I18nManager.forceRTL(false);

export default function RateListScreen() {
  const rates = new Array(12).fill('---'); // فرضی، چون محتوای نرخ‌نامه در عکس نیست

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={'نرخنامه'} />
    <ScrollView contentContainerStyle={styles.container}>
    
      <Text style={styles.subTitle}>نرخنامه اتحادیه لوپ ۱۴۰۳ ⬇️</Text>

      {rates.map((item, index) => (
        <View key={index} style={styles.rateRow}>
          <Text style={styles.rateText}>{item}</Text>
        </View>
      ))}

      {/* <View style={styles.footer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.phone}>21164552</Text>
      </View> */}
    </ScrollView>
    <Footer/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0f0ff',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#005b9f',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  subTitle: {
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  rateRow: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
