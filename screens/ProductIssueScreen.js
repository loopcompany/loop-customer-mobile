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
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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



export default function ProductIssueScreen({ navigation }) {
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
    setForm({ ...form, [key]: value });
  };

  const handleOrderSelect = (item) => {
    setSelectedOrder(item);
    // پر کردن خودکار فیلدها با اطلاعات سفارش
    setForm(prev => ({
      ...prev,
      orderNumber: item.order_id.toString(),
      techCode: item.technician_referral_code || '',
      amount: item.final_paid_amount ? item.final_paid_amount.toString() : '',
      name: item.product_name || '', // فقط وقتی پر باشه پر می‌کنه
      orderDate: item.created_at ? formatDate(item.created_at) : '',
      completeDate: item.finished_at ? formatDate(item.finished_at) : '',
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedOrder) {
      showToastOrAlert('لطفاً یک سفارش انتخاب کنید');
      return;
    }

    if (!form.name || form.name.trim().length < 3) {
      showToastOrAlert('لطفاً نام محصول/سرویس را وارد کنید (حداقل 3 کاراکتر)');
      return;
    }

    if (!form.desc || form.desc.trim().length < 10) {
      showToastOrAlert('لطفاً توضیحات را وارد کنید (حداقل 10 کاراکتر)');
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
        showToastOrAlert(response.message || 'گزارش خرابی با موفقیت ثبت شد');

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
      let errorMessage = 'خطا در ثبت گزارش خرابی';

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
            errorMessage = 'خطای ناشناخته از سرور';
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
      <ScreenHeaders title={'عیب سرویس / محصول'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView contentContainerStyle={[NewStyles.wrapper]}>

          <TextInput placeholder="نام محصول / سرویس" value={form.name} onChangeText={(t) => handleChange('name', t)} style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholderTextColor="#999" />

          <TouchableOpacity style={[NewStyles.textInput, NewStyles.border10]} onPress={() => setOrderDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !form.orderDate && styles.placeholder]}>
              {form.orderDate || 'تاریخ ثبت سفارش'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[NewStyles.textInput, NewStyles.border10]}onPress={() => setCompleteDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !form.completeDate && styles.placeholder]}>
              {form.completeDate || 'تاریخ دریافت / انجام'}
            </Text>
          </TouchableOpacity>

          <OrderDropdown
            value={selectedOrder?.value}
            onChange={handleOrderSelect}
            placeholder="انتخاب شماره سفارش"
          />

          <TextInput
            placeholder="کد تکنسین"
            value={form.techCode}
            onChangeText={(t) => handleChange('techCode', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="مبلغ پرداختی"
            value={form.amount}
            onChangeText={(t) => handleChange('amount', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <TextInput
            placeholder="توضیحات"
            value={form.desc}
            onChangeText={(t) => handleChange('desc', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 120, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
          />

          <View style={styles.spacer} />

         
          <Button title={'ثبت'} onPress={handleSubmit} loading={isSubmitting} />

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

const styles = StyleSheet.create({
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
