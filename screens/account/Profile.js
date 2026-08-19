import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, I18nManager, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import NewStyles from '@styles/NewStyles';
import Button from '@components/Button';
import useLogout from '@hooks/useLogout';
import { themeColor0, themeColor1, themeColor10, themeColor4, themeColor6 } from '@theme/Color';
import ScreenHeaders from '@components/ScreenHeaders';
import Footer from '@screens/Footer';
import { userAPI } from '@services/Api';
import TokenManager from '@services/TokenManager';
import { isLocalUri, showToastOrAlert } from '@helpers/Common';
import DatePickerModal from '@components/DatePickerModal';
import { Ionicons } from '@expo/vector-icons';
import OrganizationProfile from './OrganizationProfile';
import * as ImagePicker from 'expo-image-picker';
import { imageUri } from '@services/URL';
import { createStyles } from '@styles/NewStyles';
import LocationPicker from '@components/LocationPicker';
import { fetchUser } from '@slices/userSlice';
export default function Profile() {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles])
    const navigation = useNavigation();
    const { logoutWithConfirmation, logoutFromAllDevicesWithConfirmation, isLoggingOut } = useLogout();
    const [datePickerModal, setDatePickerModal] = useState(false);
    const [checkingUserType, setCheckingUserType] = useState(true);
    const [userType, setUserType] = useState(null);
    const [pickedImageUri, setPickedImageUri] = useState(null);
    // Get user type from Redux
    const userTypeFromRedux = useSelector(state => state.auth.userType);
    const user = useSelector(state => state.user?.data)
    const token = useSelector(state => state.auth?.token)
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
        region_id: '',
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

    const dispatch = useDispatch()
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [birthDate, setBirthDate] = useState('');
    const [captcha, setCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
    const [captchaInput, setCaptchaInput] = useState('');
    const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [birthDateChanged, setBirthDateChanged] = useState(false); 
    const [errorTxt, setErrorTxt] = useState({
        name: '',
        last_name: '',
        email: '',
        region_id: '',
    })
    // Helper function to get full image URL
    const getImageUrl = (path) => {
        if (!path) {
            return null;
        }

        // اگر URI محلی است (file://, blob:, content://)
        if (path.startsWith('file://') || path.startsWith('blob:') || path.startsWith('content://')) {
            return path;
        }

        // اگر URL کامل است (http, https)
        if (path.startsWith('http')) {
            return path;
        }

        // اگر relative path است از سرور
        const fullUrl = `${imageUri}/${path}`;
        return fullUrl;
    };

    // Check user type on mount
    useEffect(() => {
        if (user?.account_type) {
            setUserType(user?.account_type)
        }
    }, [user?.account_type]);


    // Load profile data on component mount
    useEffect(() => {
        if (userType === 'individual' || !userType) {
            loadProfile();
            loadAutoLoginStatus();
            generateCaptcha(); // Generate a fresh captcha on component mount
        }
    }, [userType]);

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
                    showToastOrAlert(t('Please log in first to enable auto-login'));
                    setAutoLoginEnabled(false);
                    return;
                }

                await AsyncStorage.setItem('autoLoginEnabled', 'true');
                await AsyncStorage.setItem('rememberLogin', 'true');
                showToastOrAlert(t('Auto-login enabled'));
            } else {
                await AsyncStorage.removeItem('autoLoginEnabled');
                showToastOrAlert(t('Auto-login disabled'));
            }
        } catch (error) {
            console.log('Error toggling auto-login:', error);
            showToastOrAlert(t('Error changing settings'));
        }
    };

    // Pick profile image
    const pickProfileImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showToastOrAlert(t('Gallery access is required to select a photo'));
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                console.log('📷 Selected image URI:', selectedImage.uri);
                console.log('📱 Platform:', Platform.OS);
                setProfileImage(selectedImage.uri);
                setPickedImageUri(selectedImage.uri);
                showToastOrAlert(t('Image selected. To save, click Save Profile Information button'));
            }
        } catch (error) {
            console.log('Error picking image:', error);
            showToastOrAlert(t('Error selecting image'));
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
                    region_id: user.region_id || '',
                    home_address: user.home_address || '',
                    work_address: user.work_address || '',
                    card_number: user.card_number || '',
                    sheba_number: user.sheba_number || ''
                });

                // Set birth date if available
                if (user.birth_date) {
                    setBirthDate(user.birth_date);
                }

                // Set profile image if available
                if (user.profile_photo_path) {
                    setProfileImage(user.profile_photo_path);
                    setPickedImageUri(null);
                }
            }
        } catch (error) {
            showToastOrAlert(t('Error loading profile information'));
        }
    };
    const validateForm = () => {
        const errors = {};

        // Phone validation (11 digits starting with 09)
        if (!profileData.name) {
            errors.name = t("Please enter your name.");
        }

        // Password validation
        if (!profileData.last_name) {
            errors.last_name = t("Please enter your last name.");
        }
        if (!profileData.email) {
            errors.email = t('Please enter your Email Address.');
        }


        if (!profileData.region_id) {
            errors.region_id = t('Please select your region.');
        }

        return errors;
    };

    // Update profile data
    const updateProfile = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setErrorTxt(errors)
            return;
        } else {

            try {
                setIsLoading(true);

                // بررسی اینکه آیا عکس جدید انتخاب شده
                const hasNewImage = isLocalUri(pickedImageUri);

                if (hasNewImage) {
                    // استفاده از FormData برای آپلود عکس
                    const formData = new FormData();

                    // Laravel نیاز به _method برای PUT با FormData دارد
                    formData.append('_method', 'PUT');

                    // اضافه کردن عکس با نام profile_image
                    if (Platform.OS === 'web') {
                        // برای وب: تبدیل blob به File
                        try {
                            const response = await fetch(profileImage);
                            const blob = await response.blob();
                            const fileName = `profile_${Date.now()}.${blob.type.split('/')[1]}`;
                            const file = new File([blob], fileName, { type: blob.type });
                            formData.append("profile_photo_path", file);
                            console.log('📷 Web: Image converted to File object');
                        } catch (err) {
                            console.error('❌ Error converting image:', err);
                            showToastOrAlert(t('Error processing image'));
                            return;
                        }
                    } else {
                        // برای موبایل: از URI استفاده می‌کنیم
                        let finalUri = profileImage;
                        if (Platform.OS === "android" && !finalUri.startsWith("file://")) {
                            finalUri = "file://" + finalUri;
                        }

                        const fileName = finalUri.split("/").pop();
                        const ext = fileName.split('.').pop();
                        const type = `image/${ext}`;

                        formData.append("profile_photo_path", {
                            uri: finalUri,
                            name: fileName,
                            type,
                        });
                        console.log('📱 Native: Image added to FormData');
                    }

                    // اضافه کردن همه فیلدهای پروفایل (سرور نیاز دارد حداقل یک فیلد داشته باشیم)
                    let addedFields = 0;
                    Object.keys(profileData).forEach(key => {
                        if (key == 'region_id') {
                            if (profileData[key]?.id) {
                                formData.append('region_id', profileData[key]?.id);
                                formData.append('region', profileData[key]?.code);
                            }
                        } else if (key !== 'phone') {
                            const value = (profileData[key] || '').toString().trim();
                            formData.append(key, value);
                            if (value) addedFields++;
                            console.log(`📝 Field ${key}: ${value || '(empty)'}`);
                        }
                    });
                    // اضافه کردن تاریخ تولد (تبدیل - به /)
                    
                    if (birthDate && birthDate.trim() !== '') {
                        // سرور انتظار فرمت 1370/05/15 دارد (با /)
                        const formattedDate = birthDate.trim().replace(/-/g, '/');
                        formData.append('birth_date', formattedDate);
                        addedFields++;
                        console.log(`📝 Field birth_date: ${formattedDate} (original: ${birthDate})`);
                    }


                    const response = await userAPI.updateProfile(formData);

                    if (response.success) {
                        showToastOrAlert(response.message);


                        // بروزرسانی state محلی
                        if (response.user) {
                            const user = response.user;


                            // بروزرسانی عکس پروفایل
                            if (user.profile_photo_path) {
                                setProfileImage(user.profile_photo_path);
                                console.log('✅ Profile image updated to:', user.profile_photo_path);
                            } else {
                                console.log('⚠️ No profile_photo_path in response');
                            }

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
                                region_id: user.region_id || prev.region_id,
                                home_address: user.home_address || prev.home_address,
                                work_address: user.work_address || prev.work_address,
                                card_number: user.card_number || prev.card_number,
                                sheba_number: user.sheba_number || prev.sheba_number
                            }));

                            if (user.birth_date) {
                                setBirthDate(user.birth_date);
                            }
                        }

                        if (response.requires_verification) {
                            showToastOrAlert('کد تایید به شماره جدید ارسال شد');
                        }
                    }
                } else {
                    // بدون عکس - فقط JSON
                    const updateData = {};
                    Object.keys(profileData).forEach(key => {
                        if (key == 'region_id') {
                            if (profileData[key]?.id) {
                                updateData['region_id'] = profileData[key]?.id
                                updateData['region'] = profileData[key]?.code
                            }
                        } else if (key !== 'phone' && profileData[key] && profileData[key].trim() !== '') {
                            updateData[key] = profileData[key].trim();
                        }
                    });

                    if (birthDateChanged && birthDate && birthDate.trim() !== '') {
                        // سرور انتظار فرمت 1370/05/15 دارد (با /)
                        updateData.birth_date = birthDate.trim().replace(/-/g, '/');
                    }
                    console.log('====================================');
                    console.log("birthDate:", birthDate, birthDateChanged);
                    console.log('====================================');

                    if (Object.keys(updateData).length === 0) {
                        showToastOrAlert(t('No information to update'));
                        return;
                    }


                    const response = await userAPI.updateProfile(updateData);

                    if (response.success) {
                        showToastOrAlert(response.message);

                        setBirthDateChanged(false);

                        if (response.user) {
                            const user = response.user;

                            if (user.profile_photo_path) {
                                setProfileImage(user.profile_photo_path);
                            }

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
                                region_id: user.region_id || prev.region_id,
                                home_address: user.home_address || prev.home_address,
                                work_address: user.work_address || prev.work_address,
                                card_number: user.card_number || prev.card_number,
                                sheba_number: user.sheba_number || prev.sheba_number
                            }));

                            if (user.birth_date) {
                                setBirthDate(user.birth_date);
                            }
                        }

                        if (response.requires_verification) {
                            showToastOrAlert('کد تایید به شماره جدید ارسال شد');
                        }
                    }
                }
            } catch (error) {

                if (error.message === 'Network Error' || !error.response) {
                    showToastOrAlert(t('Error connecting to server. Please check your internet connection'));
                } else if (error.response?.status === 401) {
                    showToastOrAlert(t('Your session has expired. Please log in again'));
                } else if (error.response?.status === 403) {
                    showToastOrAlert(error.response.data.message || 'دسترسی شما محدود شده است');
                } else if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    if (errors && typeof errors === 'object') {
                        const firstErrorKey = Object.keys(errors)[0];
                        const firstError = errors[firstErrorKey][0];
                        showToastOrAlert(firstError);
                    } else {
                        showToastOrAlert(error.response.data.message || t('Error validating information'));
                    }
                } else if (error.response?.status === 400) {
                    showToastOrAlert(error.response.data.message || t('Error updating information'));
                } else if (error.response?.status === 413) {
                    showToastOrAlert(t('Image file size exceeds limit (max 5MB)'));
                } else if (error.response?.status >= 500) {
                    showToastOrAlert(t('Server error. Please try again later'));
                } else {
                    showToastOrAlert(error.response?.data?.message || 'خطا در بروزرسانی اطلاعات');
                }
            } finally {
                setIsLoading(false);
                dispatch(fetchUser(token))
            }
        }
    };
    // Change password
    const changePassword = async () => {
        try {
            // reset previous field errors
            setPasswordErrors({ currentPassword: '', newPassword: '' });
            // Validate captcha
            if (captchaInput !== captcha) {
                showToastOrAlert(t('Security code is incorrect'));
                generateCaptcha();
                setCaptchaInput('');
                return;
            }

            if (!passwordData.currentPassword || !passwordData.newPassword) {
                showToastOrAlert(t('Please enter current and new password'));
                return;
            }

            if (passwordData.newPassword.length < 8) {
                showToastOrAlert(t('New password must be at least 8 characters'));
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
            console.log(error)

            // Handle validation errors and show inline messages
            if (error.response?.status === 400) {
                showToastOrAlert(t('Current password is incorrect'));
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
                showToastOrAlert(t('Error changing password'));
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

    // Show loading while checking user type
    if (!user?.account_type) {

        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={[NewStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
                <Text style={{ marginTop: 10, fontFamily: 'VazirLight' }}>{t('Loading...')}</Text>
            </SafeAreaView>
        );
    }

    // Show OrganizationProfile for organization users
    if (userType !== 'individual') { 
        return <OrganizationProfile />;
    }

    return (

        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
            <ScreenHeaders title={t("My Profile")} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
                <ScrollView contentContainerStyle={styles.container}>


                    {/* Profile Image Section */}
                    <View style={styles.profileImageContainer}>
                        <TouchableOpacity
                            style={styles.profileImageWrapper}
                            onPress={pickProfileImage}
                        >
                            {profileImage ? (
                                <Image
                                    source={{ uri: getImageUrl(profileImage) }}
                                    style={styles.profileImagePreview}
                                    onError={(e) => console.log('❌ Image load error:', e.nativeEvent.error, 'URI was:', getImageUrl(profileImage))}
                                    onLoad={() => console.log('✅ Image loaded successfully:', getImageUrl(profileImage))}
                                />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={50} color={themeColor10.bgColor(0.4)} />
                                </View>
                            )}

                        </TouchableOpacity>
                        <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 10, fontSize: 12, color: themeColor10.bgColor(0.6) }]}>
                            {t('Click to change profile picture')}
                        </Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        <Text style={NewStyles.text10}>{t('First Name')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, errorTxt?.name && { borderColor: themeColor6.bgColor(1), borderWidth: 1, backgroundColor: themeColor6.bgColor(0.1) }]}
                            placeholder={t('First Name')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            value={profileData.name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                        />
                        {errorTxt?.name &&
                            <Text style={[NewStyles.text6, { fontSize: 12 }]}>{t(errorTxt?.name)}</Text>
                        }
                        <Text style={NewStyles.text10}>{t('Last Name')}</Text>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, errorTxt?.last_name && { borderColor: themeColor6.bgColor(1), borderWidth: 1, backgroundColor: themeColor6.bgColor(0.1) }]}
                            placeholder={t('Last Name')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            value={profileData.last_name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, last_name: text }))}
                        />
                        {errorTxt?.last_name &&
                            <Text style={[NewStyles.text6, { fontSize: 12 }]}>{t(errorTxt?.last_name)}</Text>
                        }
                        <Text style={NewStyles.text10}>{t('Mobile Number')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('Mobile Number')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            keyboardType="phone-pad"
                            value={profileData.phone}
                            editable={false}
                            selectTextOnFocus={false}
                        />

                        {/* تاریخ تولد */}
                        <Text style={NewStyles.text10}>{t('Birth Date')}</Text>
                        <TouchableOpacity onPress={() => setDatePickerModal(true)} style={[NewStyles.textInput, NewStyles.border10]}>
                            <Text style={[NewStyles.text10, { color: birthDate ? themeColor10.bgColor(0.6) : themeColor10.bgColor(1) }]}>
                                {birthDate || t('Birth Date')}
                            </Text>
                        </TouchableOpacity>

                        <Text style={NewStyles.text10}>{t('Email Address')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, errorTxt?.email && { borderColor: themeColor6.bgColor(1), borderWidth: 1, backgroundColor: themeColor6.bgColor(0.1) }]}
                            placeholder={t('Email Address')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            keyboardType="email-address"
                            value={profileData.email}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                        />
                        {errorTxt?.email &&
                            <Text style={[NewStyles.text6, { fontSize: 12 }]}>{t(errorTxt?.email)}</Text>
                        }

                        {/* شماره ثابت */}
                        <Text style={NewStyles.text10}>{t('Landline Number')}</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, { flex: 1 }, NewStyles.text10]}
                                placeholder={t('Landline Number')}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                keyboardType="number-pad"
                                value={profileData.phone_number}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone_number: text }))}
                            />
                            <TextInput style={[NewStyles.text10, styles.prefixInput,]} value="021" editable={false} />
                        </View>

                        {/* موبایل دوم با پیش‌شماره */}
                        <Text style={NewStyles.text10}>{t('Second Mobile Number')}</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, { flex: 1 }, NewStyles.text10]}
                                placeholder={t('Second Mobile Number')}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                keyboardType="number-pad"
                                value={profileData.mobile_number}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, mobile_number: text }))}
                            />
                            {/* <TextInput style={styles.prefixInput} value="09" editable={false} /> */}
                        </View>
                        <Text style={NewStyles.text10}>{t('Postal Code')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('Postal Code')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            keyboardType="number-pad"
                            value={profileData.postal_code}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, postal_code: text }))}
                        />

                        {/*منطقه */}

                        {/* <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text10}>{t('District')}</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { flex: 1 }]}
                                placeholder={t('District')}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                value={profileData.region}
                                keyboardType='number-pad'
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, region: text }))}
                            />
                        </View> */}
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text10}>{t('District')}</Text>
                            <LocationPicker
                                selectedProvince={null}
                                selectedCity={null}
                                selectedRegion={profileData.region_id}
                                onProvinceChange={(province) => {

                                }}
                                onCityChange={(city) => { }}
                                onRegionChange={(region) => {
                                    setProfileData(prev => ({ ...prev, region_id: region }))
                                }}
                                errors={{

                                }}
                                required={true}
                            />
                        </View>
                        {errorTxt?.region_id &&
                            <Text style={[NewStyles.text6, { fontSize: 12 }]}>{t(errorTxt?.region_id)}</Text>
                        }

                        {/* آدرس منزل */}
                        <Text style={NewStyles.text10}>{t('Home Address')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('Home Address')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            multiline
                            value={profileData.home_address}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, home_address: text }))}
                        />

                        {/* محل کار */}
                        <Text style={NewStyles.text10}>{t('Work Address')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('Work Address')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            multiline
                            value={profileData.work_address}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, work_address: text }))}
                        />

                        {/* معرفی به دوستان */}
                        <Text style={NewStyles.text10}>{t('User Card Number')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('User Card Number (optional)')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            value={profileData.card_number}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, card_number: text }))}
                            keyboardType="number-pad"
                        />
                        <Text style={NewStyles.text10}>{t('User SHEBA Number')}</Text>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                            placeholder={t('User SHEBA Number (optional)')}
                            placeholderTextColor={themeColor10.bgColor(0.6)}
                            value={profileData.sheba_number}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, sheba_number: text }))}
                        />
                    </View>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Button
                            style={{ backgroundColor: themeColor4.bgColor(1) }}
                            title={isLoading ? t('Saving...') : t('Save Profile Information')}
                            onPress={updateProfile}
                            disabled={isLoading}
                        />
                    </View>

                    <View style={[NewStyles.row, { marginVertical: 10, gap: 10, alignItems: 'flex-start' }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text10}>{t('Current Password')}</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'right' }]}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                placeholder={t('Current Password')}
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
                            <Text style={NewStyles.text10}>{t('New Password')}</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'right' }]}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                placeholder={t('New Password')}
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
                    <View style={[NewStyles.row, { marginTop: 10, gap: 30, alignItems: 'flex-end' }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text10}>{t('Security Code')}</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '100%', textAlign: 'right' }]}
                                placeholderTextColor={themeColor10.bgColor(0.6)}
                                placeholder={t('Security Code')}
                                value={captchaInput}
                                onChangeText={setCaptchaInput}
                            />
                        </View>
                        <View style={{ ...NewStyles.row, gap: 5 }}>
                            <TouchableOpacity onPress={generateCaptcha}>
                                <Ionicons name="reload" size={24} color={themeColor0.bgColor(1)} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.captchaBox} onPress={generateCaptcha}>
                                <Text style={{ fontSize: 16, fontFamily: 'VazirBold' }}>{captcha}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Button
                            style={{ backgroundColor: themeColor4.bgColor(1) }}
                            title={isLoadingPassword ? t('Changing...') : t('Change Password')}
                            onPress={changePassword}
                            disabled={isLoadingPassword}
                        />
                    </View>

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
                            {t('Automatic login (without password)')}
                        </Text>
                    </View>



                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Button
                            style={{ backgroundColor: themeColor6.bgColor(1) }}
                            title={isLoggingOut ? t('Logging out...') : t('Log Out')}
                            onPress={logoutWithConfirmation}
                            disabled={isLoggingOut}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View>
                <DatePickerModal
                    birthDate={birthDate}
                    setBirthDate={setBirthDate}
                    setDatePickerModal={setDatePickerModal}
                    datePickerModal={datePickerModal}
                    onDateChange={(date) => {
                        console.log('📅 Birth date changed to:', date);
                        setBirthDateChanged(true);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#e0f0ff',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        paddingBottom: 100
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
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImageWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: themeColor4.bgColor(1),
        backgroundColor: '#fff',
    },
    profileImagePreview: {
        width: '100%',
        height: '100%',
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColor10.bgColor(0.1),
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: themeColor4.bgColor(1),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000000ff',
    },
});
