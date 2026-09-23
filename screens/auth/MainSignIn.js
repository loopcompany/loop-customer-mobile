import React, { useState, useReducer, useMemo, useEffect, useCallback } from "react";
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
    Linking,
} from "react-native";
// CodeField imports removed - using InviteCodeInput component instead
import Button from "@components/Button";
import NewStyles from "@styles/NewStyles";
import { themeColor10, themeColor4, themeColor0, themeColor3, themeColor6, colors } from "@theme/Color";
import { spacing } from "@theme/Spacing";
import { radius } from "@theme/Radius";
import { fontSize, getFontFamily } from "@theme/Typography";
import { authAPI } from "@services/Api";
import { showToastOrAlert, langIsRTL } from "@helpers/Common";
import CustomStatusBar from "@components/CustomStatusBar";
import InviteCodeInput from "@components/InviteCodeInput";
import LocationPicker from "@components/LocationPicker";
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";
import { createStyles } from '@styles/NewStyles';
import { restartOtpRetriever, stopOtpRetriever } from "./OtpRetriever";
import { useSelector, useDispatch } from "react-redux";
import { fetchPdfDocs } from "@slices/pdfDocumentSlice";
import { imageUri } from "@services/URL";
import FooterSpacer from '@components/FooterSpacer';
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
    acceptTerms: false

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
    const storeDispatch = useDispatch();
    const hashApp = useSelector(state => state.hashApp?.hash)
    // `pdf.user` is the customer-app terms & conditions PDF (see slices/pdfDocumentSlice.js)
    const termsPdfPath = useSelector(state => state.pdf?.data?.user)
    // console.log(hashApp?.[0]);

    const inviteLetter = 'L'; // Static invite letter
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const isRtl = langIsRTL(i18n.language);
    const styles = useMemo(() => createLocalStyles(NewStyles, isRtl, i18n.language), [NewStyles, isRtl, i18n.language]);

    // The PDF list is normally fetched on Landing; refetch when this screen is
    // opened directly by URL (web) so the terms link still resolves.
    useEffect(() => {
        if (!termsPdfPath) {
            storeDispatch(fetchPdfDocs());
        }
    }, [termsPdfPath, storeDispatch]);

    const toggleAcceptTerms = useCallback(() => {
        dispatch({ type: 'SET_FIELD', field: 'acceptTerms', value: !state.acceptTerms });
    }, [state.acceptTerms]);

    const openTermsPdf = useCallback(async () => {
        if (!termsPdfPath) {
            showToastOrAlert(t('Terms and conditions file is not available.'));
            return;
        }
        try {
            await Linking.openURL(`${imageUri}/${termsPdfPath}`);
        } catch (error) {
            console.warn('Unable to open terms PDF:', error);
            showToastOrAlert(t('Terms and conditions file is not available.'));
        }
    }, [termsPdfPath, t]);

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!state.acceptTerms) {

            errors.acceptTerms = t('Acceptance of the rules and regulations is mandatory.');
        }

        // Melicode validation (10 digits)
        if (!state.melicode) {
            errors.melicode = t("National ID is required");
        } else if (state.melicode.length !== 10 || !/^\d{10}$/.test(state.melicode)) {
            errors.melicode = t("National ID must be 10 digits");
        }

        // Phone validation (11 digits starting with 09)
        if (!state.phone) {
            errors.phone = t("Mobile number is required");
        } else if (state.phone.length !== 11 || !/^09\d{9}$/.test(state.phone)) {
            errors.phone = t("Mobile number must be 11 digits and start with 09");
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!state.email) {
            errors.email = t("Email address is required");
        } else if (!emailRegex.test(state.email)) {
            errors.email = t("Invalid email format");
        }

        // Location validation
        // if (!state.province) {
        //     errors.province = t("Province is required");
        // }
        // if (!state.city) {
        //     errors.city = t("City is required");
        // }
        // if (!state.region) {
        //     errors.region = t("Region is required");
        // }

        // Captcha validation
        if (!state.captchaInput) {
            errors.captchaInput = t("Security code is required");
        } else if (state.captchaInput !== state.captcha) {
            errors.captchaInput = t("Security code is incorrect");
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
            try {
                await restartOtpRetriever();
            } catch (otpError) {
                console.log('SMS Retriever start error:', otpError);
            }

            const userData = {
                melicode: state.melicode,
                phone: state.phone,
                email: state.email,
                province_id: state.province?.id,
                city_id: state.city?.id,
                region_id: state.region?.id,
                other_referral_code: state.otherReferralCode ? `${inviteLetter}${state.otherReferralCode}` : null,
                hashApp: hashApp?.[0]
            };

            const response = await authAPI.register(userData);

            if (response.success) {
                showToastOrAlert(t("Verification code sent to your mobile number"));

                // Navigate to verification screen
                navigation.navigate('RegistrationVerificationScreen', {
                    phone: state.phone,
                    userData
                });
            } else {
                stopOtpRetriever({ clearPending: true });
                dispatch({
                    type: 'SET_ERROR',
                    field: 'general',
                    error: response.message || t("Registration failed")
                });
            }
        } catch (error) {
            stopOtpRetriever({ clearPending: true });
            console.log('Registration error:', error);
            let errorMessage = t("Registration failed. Please try again");

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
        <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('@assets/loopbackground.webp') : require("@assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} imageStyle={{ opacity: 0.8, }} contentPosition={'center'} contentFit={"cover"}>
            <CustomStatusBar />
            <KeyboardAvoidingView
                behavior={'padding'}
                style={{ flex: 1, width: '100%' }}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={[styles.card, NewStyles.center]}>
                        <Image source={require("@assets/logo.png")} style={styles.logoSmall} resizeMode="contain" />

                        {/* General Error Message */}
                        {state.errors.general && (
                            <Text style={styles.errorText}>{state.errors.general}</Text>
                        )}

                        {/* Melicode (National ID) */}
                        <View style={styles.inputContainer}>
                            <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start', width: '100%' }}>
                                <Text style={NewStyles.title4}>{t("National ID")} <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        { width: '100%', textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' },
                                        state.errors.melicode && styles.inputError
                                    ]}
                                    placeholder={t("National ID")}
                                    placeholderTextColor={themeColor10.bgColor(0.6)}
                                    value={state.melicode}
                                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'melicode', value })}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    accessibilityLabel={t("National ID")}
                                    accessibilityHint={t("Enter your 10-digit national ID")}
                                />
                                {state.errors.melicode && (
                                    <Text style={styles.fieldErrorText}>{state.errors.melicode}</Text>
                                )}
                            </View>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputContainer}>
                            <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start', width: '100%' }}>
                                <Text style={NewStyles.title4}>{t("Mobile number")} <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        { width: '100%', textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' },
                                        state.errors.phone && styles.inputError
                                    ]}
                                    placeholder={t("Mobile number: 09XXXXXXXXX")}
                                    placeholderTextColor={themeColor10.bgColor(0.6)}
                                    value={state.phone}
                                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'phone', value })}
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    accessibilityLabel={t("Mobile number")}
                                    accessibilityHint={t("Enter your 11-digit mobile number starting with 09")}
                                />
                                {state.errors.phone && (
                                    <Text style={styles.fieldErrorText}>{state.errors.phone}</Text>
                                )}
                            </View>
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
                            <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start', width: '100%' }}>
                                <Text style={NewStyles.title4}>{t("Email address")} <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        { width: '100%', textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' },
                                        state.errors.email && styles.inputError
                                    ]}
                                    placeholder={t("Email address*")}
                                    placeholderTextColor={themeColor10.bgColor(0.6)}
                                    value={state.email}
                                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'email', value })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    accessibilityLabel={t("Email address")}
                                    accessibilityHint={t("Enter a valid email address")}
                                />
                                {state.errors.email && (
                                    <Text style={styles.fieldErrorText}>{state.errors.email}</Text>
                                )}
                            </View>
                        </View>

                        {/* Location Picker - Province, City, Region */}
                        {/* <View style={styles.inputContainer}>
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
                        </View> */}

                        {/* Captcha */}
                        <View style={styles.inputContainer}>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        { width: '50%', textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' },
                                        state.errors.captchaInput && styles.inputError
                                    ]}
                                    placeholderTextColor={themeColor10.bgColor(0.6)}
                                    placeholder={t("Security code")}
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
                        <View style={styles.termsSection}>

                            <View style={[NewStyles.row, styles.termsRow]}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={toggleAcceptTerms}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: state.acceptTerms }}
                                    aria-checked={state.acceptTerms}
                                    accessibilityLabel={t("By continuing, I accept Loop's Terms of Use and Privacy Policy.")}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        state.acceptTerms && styles.checkboxChecked,
                                        !!state.errors.acceptTerms && styles.checkboxError,
                                    ]}>
                                        {state.acceptTerms && (
                                            <Ionicons name="checkmark" size={18} color={colors.primary.color} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.termsText}>
                                    {t('By continuing, I accept')}{' '}
                                    <Text
                                        style={styles.termsLink}
                                        onPress={openTermsPdf}
                                        suppressHighlighting
                                        accessibilityRole="link"
                                    >
                                        {t("Loop's Terms of Use and Privacy Policy")}
                                    </Text>
                                    {t('terms acceptance suffix')}
                                </Text>
                            </View>
                            {state.errors.acceptTerms && (
                                <Text style={styles.fieldErrorText}>
                                    {state.errors.acceptTerms}
                                </Text>
                            )}
                        </View>


                        {/* Submit Button */}
                        <Button
                            title={t("Sign up")}
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
                                {t("Already registered? Sign in to your account")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginTop: 15 }}
                            onPress={() => {
                                Linking.openURL('https://accounts.google.com/signup/v2/webcreateaccount?service=mail')
                            }}
                            disabled={state.isLoading}
                        >
                            <Text style={styles.loginLinkText}>
                                {t("Create email")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                  <FooterSpacer />
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const createLocalStyles = (NewStyles, isRtl, lang) => StyleSheet.create({
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
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        width: '100%',
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
        textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr'
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
        textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr',
        marginTop: 5,
    },
    submitButton: {
        width: '100%',
        marginTop: 20,
        backgroundColor: themeColor0.bgColor(1),
    },
    loginLinkText: {
        color: themeColor4.bgColor(1),
        fontFamily: getFontFamily('light', lang),
        fontSize: fontSize.sm,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    termsSection: {
        width: '100%',
        paddingHorizontal: '5%',
        marginTop: spacing.sm,
    },
    termsRow: {
        alignItems: 'flex-start',
        backgroundColor: colors.white.bgColor(0.08),
        borderWidth: 1,
        borderColor: colors.white.bgColor(0.25),
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    checkboxTouchable: {
        paddingTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: radius.sm - 2,
        borderWidth: 2,
        borderColor: colors.white.bgColor(0.9),
        backgroundColor: colors.white.bgColor(0.12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.accent.bgColor(1),
        borderColor: colors.accent.bgColor(1),
    },
    checkboxError: {
        borderColor: colors.error.bgColor(1),
    },
    termsText: {
        flex: 1,
        color: colors.white.bgColor(1),
        fontFamily: getFontFamily('light', lang),
        fontSize: fontSize.xs + 1,
        lineHeight: 22,
        textAlign: isRtl ? 'right' : 'left',
        writingDirection: isRtl ? 'rtl' : 'ltr',
    },
    termsLink: {
        color: colors.accent.bgColor(1),
        fontFamily: getFontFamily('bold', lang),
        textDecorationLine: 'underline',
    },
});
