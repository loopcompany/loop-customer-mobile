import React, { useState, useReducer } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
// CodeField imports removed - using InviteCodeInput component instead
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10, themeColor4, themeColor0, themeColor3, themeColor6 } from "../../theme/Color";
import { authAPI } from "../../services/Api";
import { showToastOrAlert } from "../../helpers/Common";
import CustomStatusBar from "../../components/CustomStatusBar";
import InviteCodeInput from "../../components/InviteCodeInput";
import LocationPicker from "../../components/LocationPicker";
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from "expo-image";
// Form state management with useReducer
const initialState = {
    melicode: '',
    phone: '',
    email: '',
    otherReferralCode: '',
    captchaInput: '',
    captcha: Math.floor(1000 + Math.random() * 9000).toString(),
    province: null,
    city: null,
    region: null,
    errors: {},
    isLoading: false,
};

const formReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                [action.field]: action.value,
                errors: { ...state.errors, [action.field]: null }
            };
        case 'SET_ERROR':
            return {
                ...state,
                errors: { ...state.errors, [action.field]: action.error }
            };
        case 'SET_ERRORS':
            return { ...state, errors: action.errors };
        case 'SET_LOADING':
            return { ...state, isLoading: action.isLoading };
        case 'GENERATE_CAPTCHA':
            return {
                ...state,
                captcha: Math.floor(1000 + Math.random() * 9000).toString(),
                captchaInput: ''
            };
        case 'CLEAR_FORM':
            return { ...initialState, captcha: state.captcha };
        default:
            return state;
    }
};

export default function MainSignIn({ navigation }) {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const inviteLetter = 'L'; // Static invite letter

    // Form validation
    const validateForm = () => {
        const errors = {};

        // Melicode validation (10 digits)
        if (!state.melicode) {
            errors.melicode = 'کد ملی الزامی است';
        } else if (state.melicode.length !== 10 || !/^\d{10}$/.test(state.melicode)) {
            errors.melicode = 'کد ملی باید 10 رقم باشد';
        }

        // Phone validation (11 digits starting with 09)
        if (!state.phone) {
            errors.phone = 'شماره موبایل الزامی است';
        } else if (state.phone.length !== 11 || !/^09\d{9}$/.test(state.phone)) {
            errors.phone = 'شماره موبایل باید 11 رقم و با 09 شروع شود';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!state.email) {
            errors.email = 'آدرس ایمیل الزامی است';
        } else if (!emailRegex.test(state.email)) {
            errors.email = 'فرمت ایمیل صحیح نیست';
        }

        // Location validation
        if (!state.province) {
            errors.province = 'انتخاب استان الزامی است';
        }
        if (!state.city) {
            errors.city = 'انتخاب شهر الزامی است';
        }
        if (!state.region) {
            errors.region = 'انتخاب منطقه الزامی است';
        }

        // Captcha validation
        if (!state.captchaInput) {
            errors.captchaInput = 'کد امنیتی الزامی است';
        } else if (state.captchaInput !== state.captcha) {
            errors.captchaInput = 'کد امنیتی صحیح نیست';
        }

        return errors;
    };

    // Handle form submission
    const handleRegistration = async () => {
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', errors });
            return;
        }

        dispatch({ type: 'SET_LOADING', isLoading: true });

        try {
            const userData = {
                melicode: state.melicode,
                phone: state.phone,
                email: state.email,
                province_id: state.province?.id,
                city_id: state.city?.id,
                region_id: state.region?.id,
                other_referral_code: state.otherReferralCode ? `${inviteLetter}${state.otherReferralCode}` : null,
            };

            const response = await authAPI.register(userData);

            if (response.success) {
                showToastOrAlert('کد تایید به شماره موبایل شما ارسال شد');

                // Navigate to verification screen
                navigation.navigate('RegistrationVerificationScreen', {
                    phone: state.phone,
                    userData
                });
            } else {
                dispatch({
                    type: 'SET_ERROR',
                    field: 'general',
                    error: response.message || 'خطا در ثبت نام'
                });
            }
        } catch (error) {
            console.log('Registration error:', error);
            let errorMessage = 'خطا در ثبت نام. لطفاً مجدداً تلاش کنید';

            if (error.response?.data?.errors) {
                // Handle field-specific errors from backend
                const backendErrors = {};
                Object.keys(error.response.data.errors).forEach(field => {
                    backendErrors[field] = error.response.data.errors[field][0];
                });
                dispatch({ type: 'SET_ERRORS', errors: backendErrors });
                return;
            }

            dispatch({ type: 'SET_ERROR', field: 'general', error: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false });
        }
    };

    const generateCaptcha = () => {
        dispatch({ type: 'GENERATE_CAPTCHA' });
    };

    return (
        <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit={"cover"}>
            <CustomStatusBar />
            <KeyboardAvoidingView
                behavior={'padding'}
                style={{ flex: 1, width: '100%' }}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={[styles.card, NewStyles.center]}>
                        <Image source={require("../../assets/logo.png")} style={styles.logoSmall} resizeMode="contain" />

                        {/* General Error Message */}
                        {state.errors.general && (
                            <Text style={styles.errorText}>{state.errors.general}</Text>
                        )}

                        {/* Melicode (National ID) */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    NewStyles.textInput,
                                    NewStyles.text10,
                                    NewStyles.border10,
                                    { width: '100%', textAlign: 'right' },
                                    state.errors.melicode && styles.inputError
                                ]}
                                placeholder="کد ملی"
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                value={state.melicode}
                                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'melicode', value })}
                                keyboardType="number-pad"
                                maxLength={10}
                                accessibilityLabel="کد ملی"
                                accessibilityHint="کد ملی 10 رقمی خود را وارد کنید"
                            />
                            {state.errors.melicode && (
                                <Text style={styles.fieldErrorText}>{state.errors.melicode}</Text>
                            )}
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    NewStyles.textInput,
                                    NewStyles.text10,
                                    NewStyles.border10,
                                    { width: '100%', textAlign: 'right' },
                                    state.errors.phone && styles.inputError
                                ]}
                                placeholder="شماره موبایل : 09XXXXXXXXX"
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                value={state.phone}
                                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'phone', value })}
                                keyboardType="phone-pad"
                                maxLength={11}
                                accessibilityLabel="شماره موبایل"
                                accessibilityHint="شماره موبایل 11 رقمی خود را با 09 وارد کنید"
                            />
                            {state.errors.phone && (
                                <Text style={styles.fieldErrorText}>{state.errors.phone}</Text>
                            )}
                        </View>

                        {/* Other Referral Code using reusable component */}
                        <InviteCodeInput
                            value={state.otherReferralCode}
                            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'otherReferralCode', value })}
                            prefix={inviteLetter}
                            hasError={!!state.errors.otherReferralCode}
                            errorMessage={state.errors.otherReferralCode}
                        />

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    NewStyles.textInput,
                                    NewStyles.text10,
                                    NewStyles.border10,
                                    { width: '100%', textAlign: 'right' },
                                    state.errors.email && styles.inputError
                                ]}
                                placeholder="آدرس ایمیل*"
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                value={state.email}
                                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'email', value })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                accessibilityLabel="آدرس ایمیل"
                                accessibilityHint="آدرس ایمیل معتبر خود را وارد کنید"
                            />
                            {state.errors.email && (
                                <Text style={styles.fieldErrorText}>{state.errors.email}</Text>
                            )}
                        </View>

                        {/* Location Picker - Province, City, Region */}
                        <View style={styles.inputContainer}>
                            <LocationPicker
                                selectedProvince={state.province}
                                selectedCity={state.city}
                                selectedRegion={state.region}
                                onProvinceChange={(province) => dispatch({ type: 'SET_FIELD', field: 'province', value: province })}
                                onCityChange={(city) => dispatch({ type: 'SET_FIELD', field: 'city', value: city })}
                                onRegionChange={(region) => dispatch({ type: 'SET_FIELD', field: 'region', value: region })}
                                errors={{
                                    province: state.errors.province,
                                    city: state.errors.city,
                                    region: state.errors.region
                                }}
                                required={true}
                            />
                        </View>

                        {/* Captcha */}
                        <View style={styles.inputContainer}>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        { width: '50%', textAlign: 'right' },
                                        state.errors.captchaInput && styles.inputError
                                    ]}
                                    placeholderTextColor={themeColor10.bgColor(0.6)}
                                    placeholder="کد امنیتی"
                                    value={state.captchaInput}
                                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'captchaInput', value })}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <TouchableOpacity onPress={generateCaptcha}>
                                        <Ionicons name={"reload"} size={24} color={themeColor4.bgColor(1)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.captchaBox} onPress={generateCaptcha}>
                                        <Text style={{ fontSize: 16, fontFamily: 'VazirBold' }}>{state.captcha}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {state.errors.captchaInput && (
                                <Text style={styles.fieldErrorText}>{state.errors.captchaInput}</Text>
                            )}
                        </View>

                        {/* Submit Button */}
                        <Button
                            title="ثبت نام"
                            loading={state.isLoading}
                            onPress={handleRegistration}
                            style={styles.submitButton}
                        />

                        {/* Login Link */}
                        <TouchableOpacity
                            style={{ marginTop: 15 }}
                            onPress={() => navigation.navigate('LoginScreen')}
                            disabled={state.isLoading}
                        >
                            <Text style={styles.loginLinkText}>
                                قبلاً ثبت نام کرده‌اید؟ ورود به حساب کاربری
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
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
        width: '100%'
    },
    logo: {
        width: 200,
        height: 100,
    },
    logoSmall: {
        width: 140,
        height: 70,
        marginBottom: 6
    },
    input: {
        backgroundColor: "#000",
        color: "#fff",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: "#00f",
        marginVertical: 10,
        width: "100%",
        fontSize: 16,
        textAlign: "right",
    },
    submitButton: {
        backgroundColor: "#3366ff",
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 50,
        marginTop: 30,
        shadowColor: "#00f",
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 5,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        width: '90%',
        // backgroundColor: 'rgba(0,0,0,0.55)',
        paddingVertical: 24,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        maxWidth: 800,

    },
    codeBox: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    codePrefixBox: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#ffffff22',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    }
    ,
    captchaBox: {
        width: 90,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbb'
    }
    ,
    codeSelector: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center'
    },
    // inviteCodeCell styles moved to InviteCodeInput component
    mobileInput: {
        flex: 1,
        textAlign: 'right'
    },
    inputContainer: {
        width: '100%',
        marginBottom: 10,
    },
    inputError: {
        borderColor: '#ff4444',
        borderWidth: 2,
    },
    errorText: {
        color: '#ff4444',
        fontFamily: 'VazirLight',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 10,
        borderRadius: 8,
    },
    fieldErrorText: {
        color: '#ff4444',
        fontFamily: 'VazirLight',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 5,
    },
    submitButton: {
        width: '100%',
        marginTop: 20,
        backgroundColor: themeColor0.bgColor(1),
    },
    loginLinkText: {
        color: themeColor4.bgColor(1),
        fontFamily: 'VazirLight',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
