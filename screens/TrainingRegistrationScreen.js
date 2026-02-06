// screens/TrainingRegistrationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaders from "../components/ScreenHeaders";
import { themeColor14, themeColor1, themeColor4 } from "../theme/Color";
import Footer from "./Footer";
import NewStyles from "../styles/NewStyles";
import { educationRegistrationAPI } from "../services/Api";
import { showToastOrAlert } from "../helpers/Common";
import Button from "../components/Button";

export default function TrainingRegistrationScreen({ navigation }) {
  const [form, setForm] = useState({
    telephone: '',
    phone: '',
    address: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validatePhone = (phone) => {
    // شماره موبایل باید 11 رقمی و با 09 شروع شود
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateTelephone = (telephone) => {
    // شماره تلفن ثابت باید 11 رقمی و با 0 شروع شود
    const telephoneRegex = /^0[0-9]{10}$/;
    return telephoneRegex.test(telephone);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.telephone.trim()) {
      showToastOrAlert('لطفاً شماره تلفن ثابت را وارد کنید');
      return;
    }

    if (!validateTelephone('021' + form.telephone)) {
      showToastOrAlert('فرمت شماره تلفن صحیح نیست. باید 11 رقم و با 0 شروع شود (مثال: 02112345678)');
      return;
    }

    if (!form.phone.trim()) {
      showToastOrAlert('لطفاً شماره موبایل را وارد کنید');
      return;
    }

    if (!validatePhone(form.phone)) {
      showToastOrAlert('فرمت شماره موبایل صحیح نیست. باید 11 رقم و با 09 شروع شود (مثال: 09123456789)');
      return;
    }

    if (!form.address.trim()) {
      showToastOrAlert('لطفاً آدرس را وارد کنید');
      return;
    }

    if (form.address.length > 191) {
      showToastOrAlert('آدرس نباید بیشتر از 191 کاراکتر باشد');
      return;
    }

    if (form.description.length > 191) {
      showToastOrAlert('توضیحات نباید بیشتر از 191 کاراکتر باشد');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        telephone: "021" + form.telephone.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        description: form.description.trim() || undefined, // اختیاری
      };

      console.log('Submitting education registration with payload:', payload);
      const response = await educationRegistrationAPI.create(payload);

      if (response.success) {
        showToastOrAlert(response.message || 'درخواست ثبت‌نام آموزشی با موفقیت ثبت شد');

        // Reset form
        setForm({
          telephone: '',
          phone: '',
          address: '',
          description: '',
        });

        // Optional: Navigate back or to success screen
        // navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting education registration:', error);
      const resp = error.response?.data;
      let errorMessage = 'خطا در ثبت درخواست';

      if (resp) {
        if (resp.message) {
          errorMessage = resp.message;
        } else if (resp.error_code) {
          errorMessage = resp.error_code;
        } else if (resp.errors && typeof resp.errors === 'object') {
          // نمایش اولین خطای validation
          const firstKey = Object.keys(resp.errors)[0];
          const errs = resp.errors[firstKey];
          if (Array.isArray(errs)) {
            errorMessage = errs.join('\n');
          } else {
            errorMessage = String(errs);
          }
        }
        console.debug('Education registration API response status:', error.response?.status, resp);
      } else {
        errorMessage = error.message || errorMessage;
      }

      showToastOrAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <ScreenHeaders
        title="ثبت نام دوره‌های آموزشی"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={[NewStyles.wrapper]}>


          <View style={styles.infoBox}>
            <Text style={[NewStyles.text10, { lineHeight: 24 }]}>
              📌 مراحل ثبت‌نام:{'\n'}
              • شماره تلفن ثابت (02112345678){'\n'}
              • شماره موبایل (09123456789){'\n'}
              • آدرس کامل محل سکونت یا کار{'\n'}
              • توضیحات و علایق آموزشی
            </Text>
          </View>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>شماره تلفن ثابت<Text style={NewStyles.title6}>*</Text></Text>

          <View style={[NewStyles.row, { gap: 10 }]}>
            <TextInput
              placeholder="شماره تلفن ثابت (مثال: 02112345678)"
              value={form.telephone}
              onChangeText={(t) => handleChange('telephone', t)}
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { width: 'auto', flex: 1 }]}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={8}
            />
            <TextInput style={[NewStyles.text10, styles.prefixInput,]} value="021" editable={false} />

          </View>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>شماره موبایل<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder="شماره موبایل (مثال: 09123456789)"
            value={form.phone}
            onChangeText={(t) => handleChange('phone', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={11}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>آدرس کامل<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder="آدرس کامل (حداکثر 191 کاراکتر)"
            value={form.address}
            onChangeText={(t) => handleChange('address', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 100, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
            maxLength={191}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>توضیحات و علایق آموزشی (اختیاری)</Text>

          <TextInput
            placeholder="توضیحات و علایق آموزشی (اختیاری - حداکثر 191 کاراکتر)"
            value={form.description}
            onChangeText={(t) => handleChange('description', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 120, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
            maxLength={191}
          />

          <View style={styles.spacer} />



          <Button title={'ثبت درخواست'} onPress={handleSubmit} loading={isSubmitting} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: themeColor4.bgColor(0.5),
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  prefixInput: {
    width: 70,
    backgroundColor: '#ddd',
    textAlign: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  spacer: {
    height: 20,
  },
  submitBtn: {
    backgroundColor: themeColor1.bgColor(1),
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: themeColor4.bgColor(0.5),
  },
});
