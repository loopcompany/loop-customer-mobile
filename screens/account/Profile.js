import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, I18nManager, Platform, Alert, KeyboardAvoidingView, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewStyles from '../../styles/NewStyles';
import Button from '../../components/Button';
import useLogout from '../../hooks/useLogout';
import { themeColor0, themeColor1, themeColor10, themeColor4, themeColor6 } from '../../theme/Color';
import ScreenHeaders from '../../components/ScreenHeaders';
import Footer from '../Footer';
import { userAPI } from '../../services/Api';
import TokenManager from '../../services/TokenManager';
import { showToastOrAlert } from '../../helpers/Common';
import DatePickerModal from '../../components/DatePickerModal';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
    const navigation = useNavigation();
    const { logoutWithConfirmation, logoutFromAllDevicesWithConfirmation, isLoggingOut } = useLogout();
    const [datePickerModal, setDatePickerModal] = useState(false);
    // Profile data states
    const [profileData, setProfileData] = useState({
        name: '',
        last_name: '',
        phone: '',
        email: '',
        melicode: '',
        mobile_number: '',
        phone_number: '',
        postal_code: '',
        city: '',
        region: '',
        home_address: '',
        work_address: '',
        card_number: '',
        sheba_number: ''
    });

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    });
    // Password validation errors from API
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: ''
    });

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [birthDate, setBirthDate] = useState('');
    const [captcha, setCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
    const [captchaInput, setCaptchaInput] = useState('');
    const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
    // Load profile data on component mount
    useEffect(() => {
        loadProfile();
        loadAutoLoginStatus();
        generateCaptcha(); // Generate a fresh captcha on component mount
    }, []);

    // Load auto-login status
    const loadAutoLoginStatus = async () => {
        try {
            const enabled = await AsyncStorage.getItem('autoLoginEnabled');
            setAutoLoginEnabled(enabled === 'true');
        } catch (error) {
            console.log('Error loading auto-login status:', error);
        }
    };

    // Toggle auto-login
    const toggleAutoLogin = async () => {
        try {
            const newStatus = !autoLoginEnabled;
            setAutoLoginEnabled(newStatus);
            
            if (newStatus) {
                // First check if user has a valid token
                const currentToken = await TokenManager.getToken();
                if (!currentToken) {
                    showToastOrAlert('ابتدا وارد شوید تا ورود خودکار فعال شود');
                    setAutoLoginEnabled(false);
                    return;
                }
                
                await AsyncStorage.setItem('autoLoginEnabled', 'true');
                await AsyncStorage.setItem('rememberLogin', 'true');
                showToastOrAlert('ورود خودکار فعال شد');
            } else {
                await AsyncStorage.removeItem('autoLoginEnabled');
                showToastOrAlert('ورود خودکار غیرفعال شد');
            }
        } catch (error) {
            console.log('Error toggling auto-login:', error);
            showToastOrAlert('خطا در تغییر تنظیمات');
        }
    };

    // Load user profile
    const loadProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            if (response.success && response.data?.user) {
                const user = response.data.user;
                setProfileData({
                    name: user.name || '',
                    last_name: user.last_name || '',
                    phone: user.phone || '',
                    email: user.email || '',
                    melicode: user.melicode || '',
                    mobile_number: user.mobile_number || '',
                    phone_number: user.phone_number || '',
                    postal_code: user.postal_code || '',
                    city: user.city || '',
                    region: user.region || '',
                    home_address: user.home_address || '',
                    work_address: user.work_address || '',
                    card_number: user.card_number || '',
                    sheba_number: user.sheba_number || ''
                });

                // Set birth date if available
                if (user.birth_date) {
                    setBirthDate(user.birth_date);
                }
            }
        } catch (error) {
            showToastOrAlert('خطا در بارگذاری اطلاعات پروفایل');
        }
    };

    // Update profile data
    const updateProfile = async () => {
        try {
            setIsLoading(true);

            // Prepare data for API (remove empty fields and phone as it's readonly)
            const updateData = {};
            Object.keys(profileData).forEach(key => {
                if (key !== 'phone' && profileData[key] && profileData[key].trim() !== '') {
                    updateData[key] = profileData[key].trim();
                }
            });

            // Add birth date if selected
            if (birthDate && birthDate.trim() !== '') {
                console.log('Original birthDate value:', birthDate);
                console.log('Trimmed birthDate value:', birthDate.trim());
                updateData.birth_date = birthDate.trim();
                console.log('Sending birth_date to API:', updateData.birth_date);
            }

            if (Object.keys(updateData).length === 0) {
                showToastOrAlert('هیچ اطلاعاتی برای بروزرسانی وجود ندارد');
                return;
            }

            console.log('Complete updateData to be sent to API:', updateData);

            const response = await userAPI.updateProfile(updateData);

            if (response.success) {
                showToastOrAlert(response.message);

                // Update local state with response data
                if (response.data?.user) {
                    const user = response.data.user;
                    setProfileData(prev => ({
                        ...prev,
                        name: user.name || prev.name,
                        last_name: user.last_name || prev.last_name,
                        email: user.email || prev.email,
                        melicode: user.melicode || prev.melicode,
                        mobile_number: user.mobile_number || prev.mobile_number,
                        phone_number: user.phone_number || prev.phone_number,
                        postal_code: user.postal_code || prev.postal_code,
                        city: user.city || prev.city,
                        region: user.region || prev.region,
                        home_address: user.home_address || prev.home_address,
                        work_address: user.work_address || prev.work_address,
                        card_number: user.card_number || prev.card_number,
                        sheba_number: user.sheba_number || prev.sheba_number
                    }));

                    // Update birth date if returned from API
                    if (user.birth_date) {
                        setBirthDate(user.birth_date);
                    }
                }

                // Check if verification is required
                if (response.requires_verification) {
                    showToastOrAlert('کد تایید به شماره جدید ارسال شد');
                    // Could navigate to verification screen here if needed
                }
            }
        } catch (error) {

            if (error.response?.status === 422) {
                // Handle validation errors
                const errors = error.response.data.errors;
                if (errors) {
                    const firstError = Object.values(errors)[0][0];
                    showToastOrAlert(firstError);
                }
            } else if (error.response?.status === 400) {
                showToastOrAlert(error.response.data.message || 'خطا در بروزرسانی اطلاعات');
            } else {
                showToastOrAlert('خطا در بروزرسانی اطلاعات');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Change password
    const changePassword = async () => {
        try {
            // reset previous field errors
            setPasswordErrors({ currentPassword: '', newPassword: '' });
            // Validate captcha
            if (captchaInput !== captcha) {
                showToastOrAlert('کد امنیتی اشتباه است');
                generateCaptcha();
                setCaptchaInput('');
                return;
            }

            if (!passwordData.currentPassword || !passwordData.newPassword) {
                showToastOrAlert('لطفاً رمز عبور فعلی و جدید را وارد کنید');
                return;
            }

            if (passwordData.newPassword.length < 8) {
                showToastOrAlert('رمز عبور جدید باید حداقل 8 کاراکتر باشد');
                return;
            }

            setIsLoadingPassword(true);

            const response = await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.success) {
                showToastOrAlert(response.message);
                // Clear password fields
                setPasswordData({ currentPassword: '', newPassword: '' });
                setCaptchaInput('');
                generateCaptcha();
            }
        } catch (error) {

            // Handle validation errors and show inline messages
            if (error.response?.status === 400) {
                showToastOrAlert('رمز عبور فعلی اشتباه است');
            } else if (error.response?.status === 422) {
                const errors = error.response.data.errors || {};
                // Map backend keys to our fields
                const newErrors = { currentPassword: '', newPassword: '' };
                if (errors.current_password) {
                    newErrors.currentPassword = errors.current_password[0];
                }
                // some backends return 'password', some 'new_password'
                if (errors.password) {
                    newErrors.newPassword = errors.password[0];
                } else if (errors.new_password) {
                    newErrors.newPassword = errors.new_password[0];
                }

                // If we have any field errors, show them inline; otherwise show generic
                if (newErrors.currentPassword || newErrors.newPassword) {
                    setPasswordErrors(newErrors);
                } else {
                    // fallback: show first validation message if available
                    const firstErr = Object.values(errors)[0];
                    if (Array.isArray(firstErr) && firstErr.length > 0) showToastOrAlert(firstErr[0]);
                    else showToastOrAlert('خطا در اعتبارسنجی اطلاعات');
                }
            } else {
                showToastOrAlert('خطا در تغییر رمز عبور');
            }

            generateCaptcha();
            setCaptchaInput('');
        } finally {
            setIsLoadingPassword(false);
        }
    };

    const generateCaptcha = () => {
        const n = Math.floor(1000 + Math.random() * 9000).toString();
        setCaptcha(n);
    };
    
    return (

        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
            <ScreenHeaders title={"پروفایل من"} />
            <KeyboardAvoidingView style={{flex:1}} behavior='padding'>
                <ScrollView contentContainerStyle={styles.container}>

                    <View style={styles.header}>

                        <Text style={[NewStyles.text10]}>پروفایل من</Text>

                    </View>
                    <View style={{ gap: 10 }}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="نام *"
                            value={profileData.name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="نام خانوادگی *"
                            value={profileData.last_name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, last_name: text }))}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="شماره موبایل"
                            keyboardType="phone-pad"
                            value={profileData.phone}
                            editable={false}
                            selectTextOnFocus={false}
                        />

                        {/* تاریخ تولد */}
                        <TouchableOpacity onPress={() => setDatePickerModal(true)} style={[NewStyles.textInput, NewStyles.border10]}>
                            <Text style={NewStyles.text10}>
                                {birthDate}
                            </Text>
                        </TouchableOpacity>


                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="آدرس ایمیل"
                            keyboardType="email-address"
                            value={profileData.email}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                        />

                        {/* شماره ثابت */}
                        <View style={styles.row}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, { flex: 1 }]}
                                placeholder="شماره تماس ثابت"
                                keyboardType="number-pad"
                                value={profileData.phone_number}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone_number: text }))}
                            />
                            {/* <TextInput style={styles.prefixInput} value="021" editable={false} /> */}
                        </View>

                        {/* موبایل دوم با پیش‌شماره */}
                        <View style={styles.row}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, { flex: 1 }]}
                                placeholder="شماره موبایل دوم"
                                keyboardType="number-pad"
                                value={profileData.mobile_number}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, mobile_number: text }))}
                            />
                            {/* <TextInput style={styles.prefixInput} value="09" editable={false} /> */}
                        </View>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="کدپستی "
                            keyboardType="number-pad"
                            value={profileData.postal_code}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, postal_code: text }))}
                        />

                        {/* شهر و منطقه */}
                        <View style={styles.row}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { flex: 1 }]}
                                placeholder="شهر "
                                value={profileData.city}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, city: text }))}
                            />
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { flex: 1 }]}
                                placeholder="منطقه"
                                value={profileData.region}
                                keyboardType='number-pad'
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, region: text }))}
                            />
                        </View>

                        {/* آدرس منزل */}
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="آدرس منزل"
                            multiline
                            value={profileData.home_address}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, home_address: text }))}
                        />

                        {/* محل کار */}
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="آدرس محل کار"
                            multiline
                            value={profileData.work_address}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, work_address: text }))}
                        />

                        {/* معرفی به دوستان */}
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="شماره کارت کاربر:(اختیاری)"
                            value={profileData.card_number}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, card_number: text }))}
                            keyboardType="number-pad"
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder="شماره شبا کاربر:(اختیاری)"
                            value={profileData.sheba_number}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, sheba_number: text }))}
                        />
                    </View>
                    <Button
                        style={{ backgroundColor: themeColor4.bgColor(1) }}
                        title={isLoading ? 'در حال ذخیره...' : 'ذخیره اطلاعات پروفایل'}
                        onPress={updateProfile}
                        disabled={isLoading}
                    />

                    <View style={[NewStyles.row, { marginVertical: 10, gap: 10, alignItems: 'flex-start' }]}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'right' }]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                placeholder="رمز عبور فعلی"
                                secureTextEntry
                                value={passwordData.currentPassword}
                                onChangeText={(text) => {
                                    // clear current password field error while typing
                                    if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                                    setPasswordData(prev => ({ ...prev, currentPassword: text }));
                                }}
                            />
                            {passwordErrors.currentPassword ? (
                                <Text style={{ ...NewStyles.text6, fontSize: 12, marginTop: 6, textAlign: 'right' }}>{passwordErrors.currentPassword}</Text>
                            ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'right' }]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                placeholder="رمز عبور جدید"
                                secureTextEntry
                                value={passwordData.newPassword}
                                onChangeText={(text) => {
                                    // clear new password field error while typing
                                    if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                                    setPasswordData(prev => ({ ...prev, newPassword: text }));
                                }}
                            />
                            {passwordErrors.newPassword ? (
                                <Text style={{ ...NewStyles.text6, fontSize: 12, marginTop: 6, textAlign: 'right' }}>{passwordErrors.newPassword}</Text>
                            ) : null}
                        </View>
                    </View>
                    <View style={[NewStyles.row, { marginTop: 10, gap: 30 }]}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '50%', textAlign: 'right' }]}
                            placeholderTextColor={themeColor10.bgColor(0.9)}
                            placeholder="کد امنیتی"
                            value={captchaInput}
                            onChangeText={setCaptchaInput}
                        />
                        <View style={{ ...NewStyles.row, gap: 5 }}>
                            <TouchableOpacity onPress={generateCaptcha}>
                                <Ionicons name="reload" size={24} color={themeColor0.bgColor(1)} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.captchaBox} onPress={generateCaptcha}>
                                <Text style={{ fontSize: 16, fontFamily: 'VazirBold' }}>{captcha}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button
                        style={{ backgroundColor: themeColor4.bgColor(1) }}
                        title={isLoadingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                        onPress={changePassword}
                        disabled={isLoadingPassword}
                    />

                    {/* Auto-login setting */}
                    <View style={[NewStyles.row, { marginVertical: 15, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }]}>
                        <TouchableOpacity
                            onPress={toggleAutoLogin}
                            style={styles.checkbox}
                        >
                            <View
                                style={
                                    autoLoginEnabled ? styles.checkboxChecked : styles.checkboxEmpty
                                }
                            />
                        </TouchableOpacity>
                        <Text style={[NewStyles.text10, { flex: 1, textAlign: 'right', marginRight: 10 }]}>
                            ورود خودکار (بدون نیاز به رمز عبور)
                        </Text>
                    </View>

                    
                    <Button
                        style={{ backgroundColor: themeColor0.bgColor(1) }}
                        title='ذخیره اطلاعات'
                    />
                    <Button
                        style={{ backgroundColor: themeColor6.bgColor(1) }}
                        title={isLoggingOut ? 'در حال خروج...' : 'خروج از حساب کاربری'}
                        onPress={logoutWithConfirmation}
                        disabled={isLoggingOut}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            
            <View>
                <DatePickerModal birthDate={birthDate} setBirthDate={setBirthDate} setDatePickerModal={setDatePickerModal} datePickerModal={datePickerModal} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#e0f0ff',
        alignItems: 'stretch',
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        // backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#005b9f',
        // backgroundColor: '#fff',
    },
    icon: {
        width: 60,
        height: 80,
        resizeMode: 'contain',
    },
    input: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
        textAlign: 'right',
    },
    row: {
        flexDirection: 'row-reverse',
        gap: 10,
        marginBottom: 10,
    },
    prefixInput: {
        width: 70,
        backgroundColor: '#ddd',
        textAlign: 'center',
        borderRadius: 10,
        paddingVertical: 10,
    },
    changePassBtn: {
        backgroundColor: '#FFA726',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
    },
    changePassText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoutBtn: {
        backgroundColor: '#D32F2F',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
    },
    logoutText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',

    },
    phone: {
        fontSize: 16,
        color: '#005b9f',
    },
    dateText: {
        color: '#005b9f',
        fontSize: 16,
        textAlign: 'right',
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
    },
    checkbox: {
        marginHorizontal: 5,
    },
    checkboxEmpty: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: themeColor4.bgColor(1),
        borderRadius: 4,
    },
    checkboxChecked: {
        width: 18,
        height: 18,
        backgroundColor: themeColor1.bgColor(1),
        borderRadius: 4,
    },
});
