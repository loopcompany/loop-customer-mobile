import React from 'react';
import { View, Text, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';



export default function TransactionsScreen() {
  const transactions = [
    { date: '1403/09/23', time: '15:34', amount: '7,500,000', type: 'اعتباری' },
    { date: '1403/09/23', time: '15:34', amount: '7,500,000', type: 'برگشت به حساب' },
    { date: '1403/09/23', time: '16:01', amount: '2,500,000', type: 'اعتباری' },
  ];

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
        <ScreenHeaders title={"سفارش ها/ تراکنش ها"}/>
    <ScrollView contentContainerStyle={styles.container}>
    

      <Text style={styles.header}>تراکنش‌ها</Text>
      {transactions.map((item, index) => (
        <View key={index} style={[styles.transactionBox, item.type === 'برگشت به حساب' && styles.refund]}>
          <Text style={[NewStyles.text10, {textAlign:'center'}]}>{item.date}  {item.time}</Text>
          <Text style={[NewStyles.text10, {textAlign:'center'}]}>{item.amount} ریال</Text>
          <Text style={[NewStyles.text10, {textAlign:'center'}]}>{item.type}</Text>
        </View>
      ))}
    </ScrollView>
    
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#cfe8ff',
    flexGrow: 1,
    width:'100%',
    // resizeMode:cover,
  },
  header: {
    fontSize: 18,
    backgroundColor: '#005b9f',
    color: '#fff',
    padding: 10,
    textAlign: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  transactionBox: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    
  },
  refund: {
    backgroundColor: '#ffeb3b',
  },
  text: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    
  },
});
