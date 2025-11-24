import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import { themeColor1 } from '../../theme/Color';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import LocationPicker from '../../components/LocationPicker';
import { showAlert } from '../../helpers/Common';
import useLogout from '../../hooks/useLogout';
import { uri, imageUri } from '../../services/URL';
import { fetchOrganizationUser } from '../../slices/organizationUserSlice';

const OrganizationProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { logoutWithConfirmation, isLoggingOut } = useLogout();

  // Redux state
  const token = useSelector(state => state.auth?.token);
  const organizationUser = useSelector(state => state.organizationUser?.data);
  const loadingProfile = useSelector(state => state.organizationUser?.loading);

  // Form states
  const [updating, setUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [datePickerModal, setDatePickerModal] = useState(false);
  
  // Location picker states
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Load data on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchOrganizationUser(token));
    } else {
      showAlert('خطا', 'لطفا ابتدا وارد شوید');
      navigation.navigate('Login');
    }
  }, [token, dispatch]);

  // Update form fields when Redux data changes
  useEffect(() => {
    if (organizationUser) {
      setOrganizationName(organizationUser.organization_name || '');
      setFamilyName(organizationUser.manager_full_name || '');
      setNationalCode(organizationUser.manager_national_code || '');
      setMobileNumber(organizationUser.manager_mobile || '');
      setOrganizationPhoneNumber(organizationUser.organization_phone || '');
      
      // تبدیل فرمت تاریخ از YYYY-MM-DD به YYYY/MM/DD برای DatePicker شمسی
      if (organizationUser.manager_birthdate) {
        setBirthDate(organizationUser.manager_birthdate.replace(/-/g, '/'));
      }
      
      setOrganizationEmail(organizationUser.organization_email || '');
      setOrganizationAddress(organizationUser.organization_address || '');
      setOrganizationPostalCode(organizationUser.postal_code || '');
      
      // Set location IDs - LocationPicker will fetch the names
      if (organizationUser.province_id) {
        setSelectedProvince({
          id: organizationUser.province_id,
          title: '' // LocationPicker will populate this
        });
      }
      if (organizationUser.city_id) {
        setSelectedCity({
          id: organizationUser.city_id,
          title: '' // LocationPicker will populate this
        });
      }
      if (organizationUser.region_id) {
        setSelectedRegion({
          id: organizationUser.region_id,
          title: '' // LocationPicker will populate this
        });
      }
      
      if (organizationUser.profile_image) {
        setProfileImage({ uri: organizationUser.profile_image });
      } else {
        setProfileImage(null);
      }
    }
  }, [organizationUser]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        showAlert('خطا', 'دسترسی به گالری مورد نیاز است');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      showAlert('خطا', 'خطا در انتخاب تصویر');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setErrors({});
      setUpdating(true);
      
      if (!token) {
        showAlert('خطا', 'لطفا ابتدا وارد شوید');
        return;
      }

      const hasNewImage = profileImage && profileImage.uri && !profileImage.uri.startsWith('http');
      
      // استفاده از FormData برای آپلود فایل
      const formData = new FormData();
      
      formData.append('organization_name', organizationName);
      formData.append('organization_email', organizationEmail);
      formData.append('organization_phone', organizationPhoneNumber);
      formData.append('organization_address', organizationAddress);
      formData.append('manager_full_name', familyName);
      formData.append('postal_code', organizationPostalCode);
      
      // فقط ارسال location IDs
      if (selectedProvince && selectedProvince.id) {
        formData.append('province_id', selectedProvince.id);
      }
      if (selectedCity && selectedCity.id) {
        formData.append('city_id', selectedCity.id);
      }
      if (selectedRegion && selectedRegion.id) {
        formData.append('region_id', selectedRegion.id);
      }
      if (selectedRegion && selectedRegion.id) {
        formData.append('region_id', selectedRegion.id);
      }
      
      // تاریخ شمسی - تبدیل فرمت از YYYY/MM/DD به YYYY-MM-DD برای API
      if (birthDate) {
        formData.append('manager_birthdate', birthDate.replace(/\//g, '-'));
      }
      
      // آپلود تصویر
      if (hasNewImage) {
        if (Platform.OS === 'web') {
          // برای وب - تبدیل به blob
          const response = await fetch(profileImage.uri);
          const blob = await response.blob();
          formData.append('profile_image', blob, 'profile.jpg');
        } else {
          // برای موبایل
          const uriParts = profileImage.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('profile_image', {
            uri: profileImage.uri,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      }

      // ارسال مستقیم با axios
      const response = await axios.post(
        uri + '/organization/update-profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        showAlert('موفق', response.data.message || 'پروفایل با موفقیت به‌روزرسانی شد');
        // رفرش داده‌ها از سرور
        dispatch(fetchOrganizationUser(token));
      } else {
        showAlert('خطا', response.data.message || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل';
      
      // نمایش خطاهای validation
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const firstError = Object.values(error.response.data.errors)[0];
        showAlert('خطا', Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        showAlert('خطا', errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const newErrors = {};
      if (!currentPassword) {
        newErrors.currentPassword = 'رمز عبور فعلی الزامی است';
      }
      if (!newPassword) {
        newErrors.newPassword = 'رمز عبور جدید الزامی است';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'رمز عبور جدید باید حداقل 8 کاراکتر باشد';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'تکرار رمز عبور مطابقت ندارد';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setPasswordLoading(true);
      if (!token) {
        showAlert('خطا', 'لطفا ابتدا وارد شوید');
        setPasswordLoading(false);
        return;
      }
      const passwordEndpoint = uri + '/profile/password';
      const response = await axios.patch(
        passwordEndpoint,
        { 
          current_password: currentPassword, 
          password: newPassword,
          password_confirmation: confirmPassword 
        },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.data.success) {
        showAlert('موفق', response.data.message || 'رمز عبور با موفقیت تغییر یافت');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'خطا در تغییر رمز عبور';
      showAlert('خطا', errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d1e9ff' }}>
        <CustomStatusBar />
        <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
        <Text style={{ marginTop: 10, fontFamily: 'VazirLight', fontSize: 14 }}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#d1e9ff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <CustomStatusBar />
      <ScreenHeaders title="پروفایل سازمانی" onPressLeft={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>اطلاعات سازمان</Text>
        </View>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}><Text style={{ fontSize: 40 }}>🏢</Text></View>
            )}
            <Text style={styles.imageText}>{profileImage ? 'تغییر تصویر' : 'انتخاب تصویر'}</Text>
          </TouchableOpacity>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>نام سازمان *</Text>
            <TextInput value={organizationName} onChangeText={setOrganizationName} style={styles.input} />
            {errors.organization_name && <Text style={styles.errorText}>{errors.organization_name[0]}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>نام و نام خانوادگی مدیر *</Text>
            <TextInput value={familyName} onChangeText={setFamilyName} style={styles.input} />
            {errors.manager_full_name && <Text style={styles.errorText}>{errors.manager_full_name[0]}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>شماره ملی مدیر</Text>
            <TextInput value={nationalCode} editable={false} style={[styles.input, styles.inputDisabled]} />
            <Text style={styles.helperText}>شماره ملی قابل ویرایش نیست</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>شماره موبایل مدیر</Text>
            <TextInput value={mobileNumber} editable={false} style={[styles.input, styles.inputDisabled]} />
            <Text style={styles.helperText}>شماره موبایل قابل ویرایش نیست</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>تاریخ تولد مدیر</Text>
            <TouchableOpacity onPress={() => setDatePickerModal(true)} style={styles.input}>
              <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>{birthDate || 'انتخاب تاریخ'}</Text>
            </TouchableOpacity>
            {errors.manager_birthdate && <Text style={styles.errorText}>{errors.manager_birthdate[0]}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>ایمیل سازمان *</Text>
            <TextInput value={organizationEmail} onChangeText={setOrganizationEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            {errors.organization_email && <Text style={styles.errorText}>{errors.organization_email[0]}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>تلفن ثابت سازمان *</Text>
            <TextInput value={organizationPhoneNumber} onChangeText={setOrganizationPhoneNumber} keyboardType="phone-pad" style={styles.input} />
            {errors.organization_phone && <Text style={styles.errorText}>{errors.organization_phone[0]}</Text>}
          </View>
          
          {/* استان، شهر و منطقه با LocationPicker */}
          <View style={styles.fieldContainer}>
            <LocationPicker
              selectedProvince={selectedProvince}
              selectedCity={selectedCity}
              selectedRegion={selectedRegion}
              onProvinceChange={setSelectedProvince}
              onCityChange={setSelectedCity}
              onRegionChange={setSelectedRegion}
              errors={{
                province: errors.province,
                city: errors.city,
                region: errors.region
              }}
              required={false}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>آدرس سازمان *</Text>
            <TextInput value={organizationAddress} onChangeText={setOrganizationAddress} multiline numberOfLines={3} style={[styles.input, styles.textArea]} />
            {errors.organization_address && <Text style={styles.errorText}>{errors.organization_address[0]}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>کد پستی سازمان *</Text>
            <TextInput value={organizationPostalCode} onChangeText={setOrganizationPostalCode} keyboardType="numeric" maxLength={10} style={styles.input} />
            {errors.postal_code && <Text style={styles.errorText}>{errors.postal_code[0]}</Text>}
          </View>
          
          <TouchableOpacity onPress={handleUpdateProfile} disabled={updating} style={styles.saveButton}>
            {updating ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.saveButtonText}>ذخیره تغییرات</Text>)}
          </TouchableOpacity>
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>تغییر رمز عبور</Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>رمز عبور فعلی</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry={!showCurrentPassword} style={styles.passwordInput} />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>رمز عبور جدید</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} style={styles.passwordInput} />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>تکرار رمز عبور جدید</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} style={styles.passwordInput} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
            <TouchableOpacity onPress={handleChangePassword} disabled={passwordLoading} style={styles.changePasswordButton}>
              {passwordLoading ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.saveButtonText}>تغییر رمز عبور</Text>)}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={logoutWithConfirmation} disabled={isLoggingOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>خروج از حساب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <DatePickerModal datePickerModal={datePickerModal} setDatePickerModal={setDatePickerModal} birthDate={birthDate} setBirthDate={setBirthDate} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerContainer: { width: '90%', alignSelf: 'center', backgroundColor: '#1976d2', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 },
  headerTitle: { color: '#fff', fontSize: 16, fontFamily: 'VazirBold' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editButtonText: { color: '#fff', fontSize: 14, fontFamily: 'VazirLight', marginRight: 6 },
  formContainer: { width: '90%', alignSelf: 'center', marginBottom: 12 },
  imageContainer: { marginBottom: 20, alignItems: 'center', paddingVertical: 15, backgroundColor: '#f5f5f5', borderRadius: 8 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
  placeholderImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imageText: { fontSize: 14, fontFamily: 'VazirLight', color: '#666' },
  fieldContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontFamily: 'VazirLight', color: '#333', marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', fontSize: 14, fontFamily: 'VazirLight', textAlign: 'right', minHeight: 40 },
  inputDisabled: { backgroundColor: '#e8e8e8', color: '#666' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateText: { fontSize: 14, fontFamily: 'VazirLight', color: '#333' },
  placeholderText: { color: '#999' },
  helperText: { fontSize: 12, fontFamily: 'VazirLight', color: '#666', marginTop: 4, textAlign: 'right' },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  halfField: { flex: 1 },
  saveButton: { backgroundColor: '#1976d2', borderRadius: 10, paddingVertical: 12, marginTop: 10, marginBottom: 20, alignItems: 'center', elevation: 3 },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: 'VazirBold' },
  passwordSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 2, borderTopColor: '#e0e0e0' },
  sectionTitle: { fontSize: 16, fontFamily: 'VazirBold', color: '#1976d2', marginBottom: 15, textAlign: 'right' },
  passwordInputContainer: { position: 'relative' },
  passwordInput: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, paddingLeft: 45, borderWidth: 1, borderColor: '#ccc', fontSize: 14, fontFamily: 'VazirLight', textAlign: 'right', minHeight: 40 },
  eyeIcon: { position: 'absolute', left: 12, top: 9 },
  errorText: { color: '#ff0000', fontSize: 12, fontFamily: 'VazirLight', marginTop: 4, textAlign: 'right' },
  changePasswordButton: { backgroundColor: '#ff9800', borderRadius: 10, paddingVertical: 12, marginTop: 15, marginBottom: 15, alignItems: 'center', elevation: 3 },
  logoutButton: { backgroundColor: '#f44336', borderRadius: 10, paddingVertical: 12, marginTop: 10, marginBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 3 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontFamily: 'VazirBold', marginRight: 8 },
});

export default OrganizationProfile;