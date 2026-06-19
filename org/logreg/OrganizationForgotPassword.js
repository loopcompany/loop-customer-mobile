import React, { useState,useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { uri } from '../../services/URL';
import { showAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';
import NewStyles from '../../styles/NewStyles';
import { createStyles } from '../../styles/NewStyles';
const OrganizationForgotPassword = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const [organizationCode, setOrganizationCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate organization code (6 digits)
    if (!organizationCode) {
      newErrors.organizationCode = t('Organization code is required');
    } else if (organizationCode.length !== 6 || !/^\d{6}$/.test(organizationCode)) {
      newErrors.organizationCode = t('Organization code must be 6 digits');
    }

    // Validate mobile number
    if (!mobileNumber) {
      newErrors.mobileNumber = t('Mobile number is required');
    } else if (!/^09\d{9}$/.test(mobileNumber)) {
      newErrors.mobileNumber = t('Mobile format is incorrect. Must be 11 digits starting with 09 (example: 09123456789)');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('📤 Sending forgot password request...');
      console.log('Data:', { organization_code: organizationCode, mobile: mobileNumber });

      const response = await axios.post(
        `${uri}/organization/forgot-password`,
        {
          organization_code: organizationCode.trim(),
          mobile: mobileNumber.trim(),
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ Response:', response.data);

      if (response.data.status === 'success') {
        showAlert(
          t('success'),
          response.data.message || t('Recovery code has been sent to your mobile number.'),
          [
            {
              text: t('Next'),
              onPress: () => {
                navigation.navigate('OrganizationResetPassword', {
                  organizationCode: organizationCode,
                  phone: mobileNumber,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);

      let errorMessage = t('Error submitting request');

      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.message || t('The entered information is incorrect');

        // Set specific field errors if provided
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        errorMessage = t('Error connecting to server. Please check your internet connection');
      } else {
        console.error('Unknown error:', error.message);
        errorMessage = error.message || t('An unexpected error occurred!');
      }

      showAlert(t('Error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title={t('Password recovery')}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 30, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '90%', alignSelf: 'center' }}>
          {/* Header */}
          <View
            style={{
              backgroundColor: '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              marginBottom: 30,
              alignItems: 'center',
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'VazirBold',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('Organization password recovery')}
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontFamily: 'VazirLight',
                textAlign: 'center',
                paddingHorizontal: 20,
              }}
            >
              {t('Enter organization code and admin mobile number')}
            </Text>
          </View>

          {/* Organization Code Input */}
          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'VazirBold',
                color: '#333',
                marginBottom: 8,
                ...NewStyles.title10,
              }}
            >
              {t('Organization code')} *
            </Text>
            <TextInput
              value={organizationCode}
              onChangeText={(text) => {
                setOrganizationCode(text);
                if (errors.organizationCode) {
                  setErrors({ ...errors, organizationCode: null });
                }
              }}
              placeholder={t('Organization code *')}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: errors.organizationCode ? '#ff0000' : '#ccc',
                fontSize: 12,
                fontFamily: 'VazirLight',
                textAlign: 'center',
                letterSpacing: 2,
              }}
            />
            {errors.organizationCode && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.organizationCode}
              </Text>
            )}
          </View>

          {/* Mobile Number Input */}
          <View style={{ marginBottom: 25 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'VazirBold',
                color: '#333',
                marginBottom: 8,
                   ...NewStyles.title10,
              }}
            >
              {t('Admin mobile number')} *
            </Text>
            <TextInput
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                if (errors.mobileNumber) {
                  setErrors({ ...errors, mobileNumber: null });
                }
              }}
              placeholder={t('Mobile number (example: 09123456789)')}
              keyboardType="phone-pad"
              maxLength={11}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: errors.mobileNumber ? '#ff0000' : '#ccc',
                fontSize: 16,
                fontFamily: 'VazirLight',
                textAlign: 'center',
              }}
            />
            {errors.mobileNumber && (
              <Text
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                  fontFamily: 'VazirLight',
                  marginTop: 5,
                  textAlign: 'right',
                }}
              >
                {errors.mobileNumber}
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: '#e3f2fd',
              borderRadius: 8,
              padding: 15,
              marginBottom: 25,
              borderLeftWidth: 4,
              borderLeftColor: '#1976d2',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'VazirLight',
                color: '#1565c0',
                lineHeight: 22,
                   ...NewStyles.text,
              }}
            >
              {t('💡 The recovery code will be sent to the mobile number registered in the organization admin account.')}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#90caf9' : '#1976d2',
              borderRadius: 10,
              paddingVertical: 15,
              alignItems: 'center',
              elevation: 3,
              marginBottom: 15,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'VazirBold',
                }}
              >
                {t('Send recovery code')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS == 'web') {
                window.history.back()
              } else {
                navigation.goBack()
              }
            }}
            style={{
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: '#1976d2',
                fontSize: 14,
                fontFamily: 'VazirLight',
              }}
            >
              {t('Back to login')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrganizationForgotPassword;

