// ViolationReportScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  I18nManager,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { FlatList } from 'react-native-gesture-handler';
import Footer from './Footer';

I18nManager.forceRTL(false); // RTL فعال

export default function ViolationReportScreen() {
  const [form, setForm] = useState({
    type: '',
    technician: '',
    date: '',
    amount: '',
    desc: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={"ثبت تخلف/پیگیری ها"}/>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ثبت تخلف / انتقاد</Text>

      <TextInput
        style={styles.input}
        placeholder="از تکنسین / پشتیبان لوپ / تراکنش / مشخص کنید"
        onChangeText={(text) => handleChange('type', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="نام / کد تکنسین"
        onChangeText={(text) => handleChange('technician', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="تاریخ ثبت"
        onChangeText={(text) => handleChange('date', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="مبلغ تراکنش"
        keyboardType="numeric"
        onChangeText={(text) => handleChange('amount', text)}
      />
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="توضیحات"
        multiline
        onChangeText={(text) => handleChange('desc', text)}
      />

      <View style={styles.spacer} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerText}>ثبت</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackText}>پیگیری ها</Text>
        </TouchableOpacity>
      </View>

      {/* دکمه‌های میانبر */}


      {/* فوتر */}
      {/* <View style={styles.footer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.footerLogo}
        />
        <Text style={styles.phone}>21164552</Text>
      </View> */}
    </ScrollView>
    <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e0f0ff',
    alignItems: 'stretch',
  },
  title: {
    backgroundColor: '#005b9f',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    textAlign: 'right',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  registerButton: {
    backgroundColor: '#005b9f',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  registerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#005b9f',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  trackText: {
    color: '#fff',
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  quickBtn: {
    backgroundColor: '#c0e5cc',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  quickBtnText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  phone: {
    fontWeight: 'bold',
    color: '#000',
  },
});
  