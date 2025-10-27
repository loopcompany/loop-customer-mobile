// ViolationReportScreen.js

import React, { useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet, I18nManager, KeyboardAvoidingView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import violationReportAPI from '../../services/ViolationReportApi';
import { showToastOrAlert } from '../../helpers/Common';



export default function ViolationReportScreen({navigation}) {
  const [form, setForm] = useState({
    type: '',
    technician: '',
    date: '',
    amount: '',
    desc: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.date || !form.amount || !form.desc) {
      showToastOrAlert('لطفاً تاریخ، مبلغ و توضیحات را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        subject: form.type,
        name: form.technician,
        date: form.date,
        amount: form.amount,
        description: form.desc,
      };

      const response = await violationReportAPI.submitReport(reportData);
      
      if (response.status === 'success') {
        showToastOrAlert(response.message || 'گزارش تخلف با موفقیت ثبت شد');
        // Reset form
        setForm({
          type: '',
          technician: '',
          date: '',
          amount: '',
          desc: '',
        });
      }
    } catch (error) {
      console.error('Violation report error:', error);
      
      let errorMessage = 'خطا در ثبت گزارش تخلف';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          // Handle Laravel validation errors
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors[0] || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      showToastOrAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={"ثبت تخلف/پیگیری ها"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView contentContainerStyle={styles.container}>
          <TextInput 
            style={styles.input} 
            placeholder="از تکنسین / پشتیبان لوپ / تراکنش / مشخص کنید" 
            value={form.type}
            onChangeText={(text) => handleChange('type', text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="نام / کد تکنسین" 
            value={form.technician}
            onChangeText={(text) => handleChange('technician', text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="تاریخ ثبت" 
            value={form.date}
            onChangeText={(text) => handleChange('date', text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="مبلغ تراکنش" 
            keyboardType="numeric" 
            value={form.amount}
            onChangeText={(text) => handleChange('amount', text)} 
          />
          <TextInput 
            style={[styles.input, styles.textarea]} 
            placeholder="توضیحات" 
            multiline 
            value={form.desc}
            onChangeText={(text) => handleChange('desc', text)} 
          />
          <View style={styles.buttonContainer}>
            <Button 
              title={'ثبت'} 
              loading={loading}
              disabled={loading}
              onPress={handleSubmit}
            />
            <Button 
              title={'پیگیری‌ها'} 
              onPress={() => navigation.navigate('ViolationReportsListScreen')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },

  input: {
    ...NewStyles.textInput,
    backgroundColor: themeColor4.bgColor(1),
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    ...NewStyles.text10
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
