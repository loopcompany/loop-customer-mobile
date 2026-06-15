// ViolationReportScreen.js

import React, { useState,useMemo } from 'react';
import { View, TextInput, ScrollView, StyleSheet, I18nManager, KeyboardAvoidingView, Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor4, themeColor10 } from '../../theme/Color';
import Button from '../../components/Button';
import violationReportAPI from '../../services/ViolationReportApi';
import { showToastOrAlert } from '../../helpers/Common';
import DatePickerModal from '../../components/DatePickerModal';
import { Text } from 'react-native';
import { createStyles } from '../../styles/NewStyles';


export default function ViolationReportScreen({ navigation }) {
const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const [form, setForm] = useState({
    type: '',
    technician: '',
    date: '',
    amount: '',
    desc: '',
  });
  const [loading, setLoading] = useState(false);
  const [datePickerModal, setDatePickerModal] = useState(false);
  const handleChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.date || !form.amount || !form.desc || !form.type) {
      showToastOrAlert(t('Please enter violation type, date, amount and description'));
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
        showToastOrAlert(response.message || t('Violation report registered successfully'));
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

      let errorMessage = t('Error registering violation report');

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
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t("Violation Report/Tracking")} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Violation Type')} <Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            style={[styles.input,{fontSize:10}]}
            placeholder={t('From technician / Loop support / Transaction / Specify')}
            placeholderTextColor={themeColor10.bgColor(0.6)}
            value={form.type}
            onChangeText={(text) => handleChange('type', text)}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Technician Name / Code')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('Technician Name / Code')}
            placeholderTextColor={themeColor10.bgColor(0.6)}
            value={form.technician}
            onChangeText={(text) => handleChange('technician', text)}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Registration Date')}<Text style={NewStyles.title6}>*</Text></Text>

          <Pressable style={styles.input} onPress={() => setDatePickerModal(true)}>
            <Text style={[NewStyles.text10, { color: themeColor10.bgColor(0.6) }]}>{form.date ? form.date : t('Registration Date')}</Text>
          </Pressable>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Transaction Amount')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            style={styles.input}
            placeholder={t('Transaction Amount')}
            placeholderTextColor={themeColor10.bgColor(0.6)}
            keyboardType="numeric"
            value={form.amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            onChangeText={(text) => handleChange('amount', text?.replace(/,/g, ""))}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Description')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder={t('Description')}
            placeholderTextColor={themeColor10.bgColor(0.6)}
            multiline
            value={form.desc}
            maxLength={191}
            onChangeText={(text) => handleChange('desc', text)}
          />
          <View style={styles.buttonContainer}>
            <Button
              title={t('Submit')}
              loading={loading}
              disabled={loading}
              onPress={handleSubmit}
            />
            <Button
              title={t('Tracking')}
              onPress={() => navigation.navigate('ViolationReportsListScreen')}
            />
          </View>
        </ScrollView>
        <DatePickerModal
          datePickerModal={datePickerModal}
          setDatePickerModal={setDatePickerModal}
          birthDate={form.date}
          onDateChange={(date) => handleChange('date', date)}
          setBirthDate={(date) => handleChange('date', date)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom:100
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
    alignItems:'center'
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
