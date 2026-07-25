// ProductIssueScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import Footer from './Footer';
import OrderDropdown from '../components/OrderDropdown';
import DatePickerModal from '../components/DatePickerModal';
import { formatDate } from '../helpers/Common';
import { faultReportAPI } from '../services/Api';
import { showToastOrAlert } from '../helpers/Common';
import { themeColor1, themeColor4 } from '../theme/Color';
import Button from '../components/Button';
import { createStyles } from '../styles/NewStyles';


export default function ProductIssueScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [form, setForm] = useState({
    name: '',
    orderDate: '',
    completeDate: '',
    orderNumber: '',
    techCode: '',
    amount: '',
    desc: '',
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date picker states
  const [orderDatePickerVisible, setOrderDatePickerVisible] = useState(false);
  const [completeDatePickerVisible, setCompleteDatePickerVisible] = useState(false);

  const handleChange = (key, value) => {
    if (key === 'amount') {
      // Remove commas before setting the value
      value = value.replace(/,/g, '');
    }
    setForm({ ...form, [key]: value });
  };

  const handleOrderSelect = (item) => {
    setSelectedOrder(item);
    console.log(JSON.stringify(item, null, 2));

    // Auto-fill fields with order information
    setForm(prev => ({
      ...prev,
      orderNumber: item.order_id.toString(),
      techCode: item.technician_referral_code || '',
      amount: item.final_paid_amount ? item.final_paid_amount.toString() : '',
      name: item.product_name || '',
      orderDate: item.created_at ? formatDate(item.created_at) : '',
      completeDate: item.finished_at ? formatDate(item.finished_at) : '',
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedOrder) {
      showToastOrAlert(t('Please select an order'));
      return;
    }

    if (!form.name || form.name.trim().length < 3) {
      showToastOrAlert(t('Please enter product/service name (minimum 3 characters)'));
      return;
    }

    if (!form.desc || form.desc.trim().length < 10) {
      showToastOrAlert(t('Please enter description (minimum 10 characters)'));
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        order_id: selectedOrder.order_id,
        product_name: form.name,
        ordered_at: form.orderDate,
        delivered_at: form.completeDate,
        technician_code: form.techCode,
        paid_price: form.amount,
        description: form.desc,
      };

      console.log('Submitting fault report with payload:', payload);
      const response = await faultReportAPI.create(payload);

      if (response.success) {
        showToastOrAlert(response.message || t('Fault report successfully submitted'));

        // Reset form
        setForm({
          name: '',
          orderDate: '',
          completeDate: '',
          orderNumber: '',
          techCode: '',
          amount: '',
          desc: '',
        });
        setSelectedOrder(null);

        // Navigate back or to reports list
        // navigation.goBack();
      }
    } catch (error) {
      // Detailed error handling: surface server message, validation errors or fallback to generic
      console.error('Error submitting fault report:', error);
      const resp = error.response?.data;
      let errorMessage = t('Error submitting fault report');

      if (resp) {
        // Prefer the server message
        if (resp.message) {
          errorMessage = resp.message;
        } else if (resp.error_code) {
          errorMessage = resp.error_code;
        } else if (resp.errors && typeof resp.errors === 'object') {
          // Join first field's errors into a readable string
          const firstKey = Object.keys(resp.errors)[0];
          const errs = resp.errors[firstKey];
          if (Array.isArray(errs)) {
            errorMessage = errs.join('\n');
          } else {
            errorMessage = String(errs);
          }
        } else {
          // Fallback: stringify the whole response (dev only)
          try {
            errorMessage = JSON.stringify(resp);
          } catch (e) {
            errorMessage = t('Unknown server error');
          }
        }
        // Log status code and full response for debugging
        console.debug('Fault report API response status:', error.response?.status, resp);
      } else {
        // No response (network or other axios error)
        errorMessage = error.message || errorMessage;
      }

      showToastOrAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={{ top: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Service / Product Fault')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView contentContainerStyle={[NewStyles.wrapper, { paddingBottom: 100 }]}>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Order Number')} </Text>

          <OrderDropdown
            value={selectedOrder?.value}
            onChange={handleOrderSelect}
            placeholder={t('Select Order Number')}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Product / Service Name')} </Text>

          <TextInput placeholder={t('Product / Service Name')} editable={false} value={form.name} onChangeText={(text) => handleChange('name', text)} style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholderTextColor="#999" />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Order Registration Date')} </Text>

          <TouchableOpacity disabled={true} style={[NewStyles.textInput, NewStyles.border10]} onPress={() => setOrderDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !form.orderDate && styles.placeholder]}>
              {form.orderDate || t('Order Registration Date')}
            </Text>
          </TouchableOpacity>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Delivery / Completion Date')}</Text>

          <TouchableOpacity disabled={true} style={[NewStyles.textInput, NewStyles.border10]} onPress={() => setCompleteDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !form.completeDate && styles.placeholder]}>
              {form.completeDate || t('Delivery / Completion Date')}
            </Text>
          </TouchableOpacity>

          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Technician Code')}</Text>

          <TextInput
            placeholder={t('Technician Code')}
            value={form.techCode}
            onChangeText={(text) => handleChange('techCode', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            editable={false}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Paid Amount')}</Text>

          <TextInput
            placeholder={t('Paid Amount')}
            value={form.amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            onChangeText={(text) => handleChange('amount', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            keyboardType="numeric"
            editable={false}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Description')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder={t('Description')}
            value={form.desc}
            onChangeText={(text) => handleChange('desc', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 120, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
          />

          <View style={styles.spacer} />


          <Button title={t('Submit')} onPress={handleSubmit} loading={isSubmitting} />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      <DatePickerModal
        datePickerModal={orderDatePickerVisible}
        setDatePickerModal={setOrderDatePickerVisible}
        birthDate={form.orderDate}
        setBirthDate={(date) => setForm(prev => ({ ...prev, orderDate: date }))}
      />

      <DatePickerModal
        datePickerModal={completeDatePickerVisible}
        setDatePickerModal={setCompleteDatePickerVisible}
        birthDate={form.completeDate}
        setBirthDate={(date) => setForm(prev => ({ ...prev, completeDate: date }))}
      />

    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  placeholder: {
    color: '#999',
  },
  spacer: {
    height: 20,
  },
  saveBtn: {
    backgroundColor: themeColor1.bgColor(1),
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: themeColor4.bgColor(0.5),
  },
});
