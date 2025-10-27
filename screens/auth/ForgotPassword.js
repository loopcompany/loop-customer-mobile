import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView
} from "react-native";
import { useDispatch } from "react-redux";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10 } from "../../theme/Color";
import { authAPI } from "../../services/Api";
import { setAuthLoading, setAuthError, clearAuthError } from "../../slices/authSlice";
import { validateMelicode, validatePhone, validateEmail, showToastOrAlert } from "../../helpers/Common";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword({ navigation }) {
    const dispatch = useDispatch();
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
            showToastOrAlert("لطفاً اطلاعات را به درستی وارد کنید");
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
                showToastOrAlert(response.message || "خطایی رخ داده است");
                dispatch(setAuthError(response.message));
            }
        } catch (error) {
            console.error('Forgot password error:', error);

            let errorMessage = "خطا در ارتباط با سرور";

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.errors) {
                    // Handle validation errors
                    setErrors(errorData.errors);
                    errorMessage = "اطلاعات وارد شده صحیح نیست";
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
            <ImageBackground source={require("../../assets/moon.jpg")} style={styles.background}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
                    <ScrollView
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
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
                        <View style={[{ flex: 2, width: '100%', gap: 15 }, NewStyles.center]}>
                            {/* National ID Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.melicode && styles.inputError
                                    ]}
                                    placeholder="کد ملی خود را وارد کنید"
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
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.phone && styles.inputError
                                    ]}
                                    placeholder="شماره موبایل خود را وارد کنید"
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
                                <TextInput
                                    style={[
                                        NewStyles.textInput,
                                        NewStyles.text10,
                                        NewStyles.border10,
                                        errors.email && styles.inputError
                                    ]}
                                    placeholder="آدرس ایمیل خود را وارد کنید"
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
                                title={isLoading ? "در حال ارسال..." : "ارسال کد بازیابی"}
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={isLoading}
                            />

                            {/* Back to Login */}
                            <TouchableOpacity
                                style={[styles.backToLoginContainer]}
                                onPress={() => navigation.goBack()}
                                disabled={isLoading}
                            >
                                <Text style={styles.backToLoginText}>بازگشت به ورود</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
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
