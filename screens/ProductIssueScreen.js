// ProductIssueScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import Footer from './Footer';

I18nManager.forceRTL(false);

export default function ProductIssueScreen() {
  const [form, setForm] = useState({
    name: '',
    orderDate: '',
    completeDate: '',
    orderNumber: '',
    techCode: '',
    amount: '',
    desc: '',
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container} >
      <ScreenHeaders title={'عیب سرویس / محصول'} />
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.subTitle}>ثبت محصول / سرویس ⬇️</Text>

      <TextInput
        placeholder="نام محصول / سرویس"
        value={form.name}
        onChangeText={(t) => handleChange('name', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="تاریخ ثبت سفارش"
        value={form.orderDate}
        onChangeText={(t) => handleChange('orderDate', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="تاریخ دریافت / انجام"
        value={form.completeDate}
        onChangeText={(t) => handleChange('completeDate', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="شماره سفارش"
        value={form.orderNumber}
        onChangeText={(t) => handleChange('orderNumber', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="کد تکنسین"
        value={form.techCode}
        onChangeText={(t) => handleChange('techCode', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="مبلغ پرداختی"
        value={form.amount}
        onChangeText={(t) => handleChange('amount', t)}
        style={styles.input}
      />
      <TextInput
        placeholder="توضیحات"
        value={form.desc}
        onChangeText={(t) => handleChange('desc', t)}
        style={[styles.input, styles.textArea]}
        multiline
      />

      <View style={styles.spacer} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>ثبت</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.footer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
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
    backgroundColor: '#e0f0ff',
  },
  container: {
    flexGrow: 1,
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
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  saveBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
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
