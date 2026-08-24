// screens/OrderSummaryScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import Footer from '@screens/Footer';
import NewStyles from '@styles/NewStyles';
import CustomStatusBar from '@components/CustomStatusBar';
import ScreenTitle from '@components/ScreenTitle';
import { notificationAPI } from '@services/NotificationService';
import { showToastOrAlert } from '@helpers/Common';

export default function OrderSummaryScreen({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderDetails = {
    type: 'سفارش نرم‌افزاری - نصب ویندوز 10',
    date: '1403/03/01',
    time: '14:00',
    address: 'تهران، خیابان انقلاب، کوچه دانش، پلاک ۲',
    phone: '09123456789',
    status: 'در حال بررسی',
    price: 450000,
    currency: 'تومان',
  };

  return (
    <ImageBackground
      source={require('@assets/moon.jpg')}
      style={NewStyles.container}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <CustomStatusBar />
      <View style={{ padding: 10 }}>
        <ScreenTitle title={'پیش‌نمایش نهایی ثبت سفارش'} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.card}>
          <Text style={NewStyles.title10}>نوع سفارش:</Text>
          <Text style={NewStyles.text10}>{orderDetails.type}</Text>

          <Text style={NewStyles.title10}>تاریخ مراجعه:</Text>
          <Text style={NewStyles.text10}>{orderDetails.date}</Text>

          <Text style={NewStyles.title10}>ساعت مراجعه:</Text>
          <Text style={NewStyles.text10}>{orderDetails.time}</Text>

          <Text style={NewStyles.title10}>آدرس:</Text>
          <Text style={NewStyles.text10}>{orderDetails.address}</Text>

          <Text style={NewStyles.title10}>شماره تماس:</Text>
          <Text style={NewStyles.text10}>{orderDetails.phone}</Text>

          <Text style={NewStyles.title10}>هزینه:</Text>
          <Text style={[NewStyles.text11, styles.priceText]}>
            {orderDetails.price?.toLocaleString('fa-IR')} {orderDetails.currency}
          </Text>

          <Text style={NewStyles.title10}>وضعیت سفارش:</Text>
          <Text style={[NewStyles.text11]}>
            {orderDetails.status}
          </Text>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={NewStyles.text4}>ویرایش اطلاعات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={async () => {
            setIsSubmitting(true);
            try {
              const orderNumber = '984876565';
              const orderData = {
                phone: orderDetails.phone,
                type: orderDetails.type,
                date: orderDetails.date,
                customerName: 'مشتری',
                price: orderDetails.price,
              };

              await notificationAPI.sendOrderConfirmation(orderNumber, orderData);
              showToastOrAlert('سفارش با موفقیت ثبت شد. پیامک تایید برای شما ارسال شد.');

              navigation.replace('OrderTrackingScreen', {
                orderData: {
                  orderNumber: orderNumber,
                  userId: '211-5015',
                  phone: orderDetails.phone,
                  date: orderDetails.date,
                }
              });
            } catch (error) {
              console.error('Error submitting order:', error);
              showToastOrAlert('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.');
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={NewStyles.text4}>ثبت نهایی سفارش</Text>
          )}
        </TouchableOpacity>


      </ScrollView>
      
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
    backgroundColor: '#003366',
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 45,
    marginBottom: 25,
    width: '100%',

  },
  label: {
    color: '#000',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
    alignSelf: 'flex-end',
  },
  value: {
    color: '#333',
    fontSize: 14,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  editButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',

  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  support: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  language: {
    color: '#fff',
    fontSize: 16,
  },
  phone: {
    color: '#fff',
    fontSize: 16,
  },
  priceText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
