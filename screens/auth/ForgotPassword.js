import React, { useState,useMemo } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useDispatch } from "react-redux";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10 } from "../../theme/Color";
import { authAPI } from "../../services/Api";
import { setAuthLoading, setAuthError, clearAuthError } from "../../slices/authSlice";
import { validateMelicode, validatePhone, validateEmail, showToastOrAlert } from "../../helpers/Common";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";
import { createStyles } from '../../styles/NewStyles';
export default function ForgotPassword({ navigation }) {
    const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const [formData, setFormData] = useState({
        melicode: "",
        phone: "",
        email: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Validate all form fields
    const validateForm = () => {
        const newErrors = {};

        // Validate melicode
        const melicodeValidation = validateMelicode(formData.melicode);
        if (!melicodeValidation.isValid) {
            newErrors.melicode = melicodeValidation.message;
        }

        // Validate phone
        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.isValid) {
            newErrors.phone = phoneValidation.message;
        }

        // Validate email
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.message;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Clear previous errors
        dispatch(clearAuthError());

        // Validate form
        if (!validateForm()) {
            showToastOrAlert(t('Please enter the information correctly'));
            return;
        }

        setIsLoading(true);
        dispatch(setAuthLoading(true));

        try {
            const response = await authAPI.forgotPassword({
                melicode: formData.melicode.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim()
            });

            if (response.success) {
                showToastOrAlert(response.message);

                // Navigate to verification screen with phone number
                setTimeout(() => {
                    navigation.navigate("ResetPasswordScreen", {
                        phone: response.data?.phone || formData.phone,
                        isFromForgotPassword: true
                    });
                }, 1500);
            } else {
                showToastOrAlert(response.message || t('An error occurred'));
                dispatch(setAuthError(response.message));
            }
        } catch (error) {
            console.error('Forgot password error:', error);

            let errorMessage = t('Server connection error');

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.errors) {
                    // Handle validation errors
                    setErrors(errorData.errors);
                    errorMessage = t('The entered information is incorrect');
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            }

            showToastOrAlert(errorMessage);
            dispatch(setAuthError(errorMessage));
        } finally {
            setIsLoading(false);
            dispatch(setAuthLoading(false));
        }
    };

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
            <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} imageStyle={{ opacity: 0.8, }} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit="cover" >
                <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior='padding'>
                    <ScrollView
                        contentContainerStyle={styles.container}
                    >
                        {/* Logo Section */}
                        <View style={[{ flex: 1 }, NewStyles.center]}>
                            <Image
                                source={require("../../assets/logo.png")}
                                style={NewStyles.logo}
                                resizeMode="contain"
                            />
                        </View>


                        {/* Form Section */}
                        <View style={[{ flex: 2, width: '100%', gap: 15, maxWidth: 800 }, NewStyles.center]}>
                            {/* National ID Input */}
                            <View style={styles.inputContainer}>
                                <Text style={[NewStyles.text4, { fontFamily: 'VazirBold' }]}>{t('National ID')}<Text style={NewStyles.title6}>*</Text></Text>

                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.melicode && styles.inputError
                                    ]}
                                    placeholder={t('Enter your national ID')}
                                    placeholderTextColor={themeColor10.bgColor(0.7)}
                                    value={formData.melicode}
                                    onChangeText={(value) => handleInputChange('melicode', value)}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    editable={!isLoading}
                                />
                                {errors.melicode && (
                                    <Text style={styles.errorText}>{errors.melicode}</Text>
                                )}
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputContainer}>
                                <Text style={[NewStyles.text4, { fontFamily: 'VazirBold' }]}>{t('Phone number')}<Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.phone && styles.inputError
                                    ]}
                                    placeholder={t('Enter your phone number')}
                                    placeholderTextColor={themeColor10.bgColor(0.7)}
                                    value={formData.phone}
                                    onChangeText={(value) => handleInputChange('phone', value)}
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    editable={!isLoading}
                                />
                                {errors.phone && (
                                    <Text style={styles.errorText}>{errors.phone}</Text>
                                )}
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Text style={[NewStyles.text4, { fontFamily: 'VazirBold' }]}>{t('Email')}<Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.email && styles.inputError
                                    ]}
                                    placeholder={t('Enter your email address')}
                                    placeholderTextColor={themeColor10.bgColor(0.7)}
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                {errors.email && (
                                    <Text style={styles.errorText}>{errors.email}</Text>
                                )}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <View style={[{ flex: 1, width: '100%' }, NewStyles.center]}>
                            <Button
                                title={isLoading ? t('Sending...') : t('Send recovery code')}
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={isLoading}
                            />

                            {/* Back to Login */}
                            <TouchableOpacity
                                style={[styles.backToLoginContainer]}
                                onPress={() => {
                                    if(Platform.OS == 'web'){
                                        window.history.back()
                                    }else{

                                        navigation.goBack()
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <Text style={styles.backToLoginText}>{t('Back to login')}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    instructionsContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Vazir-Bold',
    },
    instructionsText: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Vazir-Light',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 5,
    },
    inputError: {
        borderColor: '#e74c3c',
        borderWidth: 2,
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 5,
        marginRight: 10,
        fontFamily: 'Vazir-Light',
    },
    backToLoginContainer: {
        marginTop: 15,
        padding: 10,
    },
    backToLoginText: {
        ...NewStyles.title4,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
