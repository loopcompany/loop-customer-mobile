// screens/TrainingRegistrationScreen.js
import React, { useState,useMemo } from "react";
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
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaders from "../components/ScreenHeaders";
import { themeColor14, themeColor1, themeColor4 } from "../theme/Color";
import Footer from "./Footer";
import NewStyles from "../styles/NewStyles";
import { educationRegistrationAPI } from "../services/Api";
import { showToastOrAlert } from "../helpers/Common";
import Button from "../components/Button";
import { createStyles } from '../styles/NewStyles';
export default function TrainingRegistrationScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
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
      showToastOrAlert(t('Please enter landline phone number'));
      return;
    }

    if (!validateTelephone('021' + form.telephone)) {
      showToastOrAlert(t('Phone format is incorrect. Must be 11 digits starting with 0 (example: 02112345678)'));
      return;
    }

    if (!form.phone.trim()) {
      showToastOrAlert(t('Please enter mobile number'));
      return;
    }

    if (!validatePhone(form.phone)) {
      showToastOrAlert(t('Mobile format is incorrect. Must be 11 digits starting with 09 (example: 09123456789)'));
      return;
    }

    if (!form.address.trim()) {
      showToastOrAlert(t('Please enter address'));
      return;
    }

    if (form.address.length > 191) {
      showToastOrAlert(t('Address must not exceed 191 characters'));
      return;
    }

    if (form.description.length > 191) {
      showToastOrAlert(t('Description must not exceed 191 characters'));
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
        showToastOrAlert(response.message || t('Training registration request submitted successfully'));

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
      let errorMessage = t('Error submitting request');

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
        title={t("Registration for Training Courses")}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={[NewStyles.wrapper]}>


          <View style={styles.infoBox}>
            <Text style={[NewStyles.text10, { lineHeight: 24 }]}>
              {t('📌 Registration Steps:\n• Landline phone number (02112345678)\n• Mobile number (09123456789)\n• Complete residential or work address\n• Description and educational interests')}
            </Text>
          </View>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Landline Number')}<Text style={NewStyles.title6}>*</Text></Text>

          <View style={[ { gap: 10 ,flexDirection:"row-reverse"}]}>
            <TextInput
              placeholder={t('Landline phone number ')}
              value={form.telephone}
              onChangeText={(t) => handleChange('telephone', t)}
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { width: 'auto', flex: 1,fontsize:1 }]}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={8}
            />
            <TextInput style={[NewStyles.text10, styles.prefixInput,]} value="021" editable={false} />

          </View>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Mobile Number')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder={t('Mobile number (example: 09123456789)')}
            value={form.phone}
            onChangeText={(t) => handleChange('phone', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={11}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Full Address')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder={t('Full address (max 191 characters)')}
            value={form.address}
            onChangeText={(t) => handleChange('address', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 100, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
            maxLength={191}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Description and educational interests (optional)')}</Text>

          <TextInput
            placeholder={t('Description and educational interests (optional - max 191 characters)')}
            value={form.description}
            onChangeText={(t) => handleChange('description', t)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 120, textAlignVertical: 'top' }]}
            placeholderTextColor="#999"
            multiline
            maxLength={191}
          />

          <View style={styles.spacer} />



          <Button title={t('Submit Request')} onPress={handleSubmit} loading={isSubmitting} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
