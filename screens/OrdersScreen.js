import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';
export default function OrdersScreen() {
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
         <ScreenHeaders title="تراکنش ها/سفارش‌ها" />
    <ScrollView contentContainerStyle={styles.container}>
   
      <Text style={styles.header}>سفارش‌ها</Text>

      <View style={styles.orderCard}>
        <Text style={[NewStyles.text10]}>اکبر امدادی</Text>
        <Text style={[NewStyles.text10]}>کد پیگیری: 211-004</Text>
        <Text style={[NewStyles.text10]}>تاریخ سفارش: 1403/09/26</Text>
        <Text style={[NewStyles.text10]}>مدل: K555L - ASUS</Text>
        <Text style={[NewStyles.text10]}>مبلغ: 7,500,000 ریال</Text>
        <Text style={[NewStyles.text10]}>نوع خدمت: سخت‌افزار</Text>
        <Text style={[NewStyles.text10]}>وضعیت: در حال پیگیری</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={[NewStyles.text4, {textAlign:'center'}]}>مشاهده سفارش</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={[NewStyles.text4, {textAlign:'center'}]}>مشاهده رسید</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    <Footer/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d0f2ff',
    padding: 20,
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#005b9f',
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontSize: 18,
    borderRadius: 10,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    textAlign: 'right',
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'right',
    color: '#333',
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionBtn: {
    backgroundColor: '#005b9f',
    padding: 10,
    borderRadius: 8,
    width: '48%',
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
