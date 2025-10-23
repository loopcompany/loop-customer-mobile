// CanceledOrdersScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';

I18nManager.forceRTL(false); // برای راست‌چین کردن آیتم‌ها

export default function CanceledOrdersScreen() {
  const canceledOrders = [
    {
      id: 1,
      date: '1403/04/07',
      code: '211-001',
      model: 'K555L',
      device: 'ASUS',
      price: '۷۵۰۰۰۰۰',
      canceledDate: '1403/04/10',
    },
    {
      id: 2,
      date: '1403/04/01',
      code: '211-002',
      model: 'ThinkPad',
      device: 'Lenovo',
      price: '۸۵۰۰۰۰۰',
      canceledDate: '1403/04/05',
    },
  ];

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={'لغو شده ها'}/>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[NewStyles.text10, {textAlign:'center'}]}>لغو شده</Text>
      </View>

      {canceledOrders.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={[NewStyles.text10]}>
            تاریخ ثبت سفارش: <Text style={styles.value}>{item.date}</Text>
          </Text>
          <Text style={[NewStyles.text10]}>
            کد پیگیری: <Text style={[NewStyles.text10]}>{item.code}</Text>
          </Text>
          <Text style={[NewStyles.text10]}>
            نام دستگاه: <Text style={[NewStyles.text10]}>{item.device}</Text>
          </Text>
          <Text style={[NewStyles.text10]}>
            مدل دستگاه: <Text style={[NewStyles.text10]}>{item.model}</Text>
          </Text>
          <Text style={[NewStyles.text10]}>
            مبلغ پرداختی: <Text style={[NewStyles.text10]}>{item.price} ریال</Text>
          </Text>
          <Text style={[NewStyles.text10]}>
            تاریخ لغو: <Text style={[NewStyles.text10]}>{item.canceledDate}</Text>
          </Text>

          <TouchableOpacity style={styles.viewBtn}>
            <Text style={[NewStyles.text10, {textAlign:'center'}]}>مشاهده سفارش</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
    <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0f0ff',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#fcd600',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    textAlign: 'right',
  },
  value: {
    fontWeight: 'bold',
    color: '#000',
  },
  viewBtn: {
    marginTop: 10,
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});
