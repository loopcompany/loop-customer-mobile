import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4 } from '../../theme/Color';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import Footer from '../Footer';
import useLogout from '../../hooks/useLogout';
import { uri } from '../../services/URL';
import { jalaliToGregorian } from '../../helpers/Common';

const OrganizationProfile = () => {
  const navigation = useNavigation();
  const { logoutWithConfirmation, isLoggingOut } = useLogout();

  // Form states - مطابق با فیلدهای ثبت‌نام
  const [profileImage, setProfileImage] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState({});
  const [datePickerModal, setDatePickerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadOrganizationProfile();
  }, []);

  // بارگذاری اطلاعات پروفایل
  const loadOrganizationProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('خطا', 'لطفا ابتدا وارد شوید');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${uri}/organization/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        setOrganizationName(data.organization_name || '');
        setFamilyName(data.manager_full_name || '');
        setNationalCode(data.manager_national_code || '');
        setMobileNumber(data.manager_mobile || '');
        setOrganizationPhoneNumber(data.organization_phone || '');
        setBirthDate(data.manager_birthdate || '');
        setOrganizationEmail(data.organization_email || '');
        setCity(data.city || '');
        setRegion(data.region || '');
        setOrganizationAddress(data.organization_address || '');
        setOrganizationPostalCode(data.postal_code || '');
        
        if (data.profile_image) {
          setProfileImage({ uri: `${uri}/storage/${data.profile_image}` });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('خطا', 'خطا در بارگذاری اطلاعات');
    } finally {
      setLoadingProfile(false);
    }
  };

  // انتخاب تصویر پروفایل
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('خطا', 'دسترسی به گالری مورد نیاز است');
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
      console.error('Error picking image:', error);
      Alert.alert('خطا', 'خطا در انتخاب تصویر');
    }
  };

  // به‌روزرسانی پروفایل
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطا', 'لطفا ابتدا وارد شوید');
        return;
      }

      const formData = new FormData();

      // اضافه کردن تصویر در صورت تغییر
      if (profileImage && profileImage.uri && !profileImage.uri.startsWith('http')) {
        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('profile_image', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      // اضافه کردن سایر فیلدها
      formData.append('organization_name', organizationName);
      formData.append('organization_email', organizationEmail);
      formData.append('organization_phone', organizationPhoneNumber);
      formData.append('organization_address', organizationAddress);
      formData.append('manager_full_name', familyName);
      formData.append('city', city);
      formData.append('region', region);
      formData.append('postal_code', organizationPostalCode);

      if (birthDate) {
        const gregorianDate = jalaliToGregorian(birthDate);
        formData.append('manager_birthdate', gregorianDate);
      }

      const response = await axios.post(
        `${uri}/organization/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        Alert.alert('موفق', 'پروفایل با موفقیت به‌روزرسانی شد');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل';
      Alert.alert('خطا', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // تغییر رمز عبور
  const handleChangePassword = async () => {
    try {
      // اعتبارسنجی
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

      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        `${uri}/organization/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        Alert.alert('موفق', 'رمز عبور با موفقیت تغییر کرد');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'خطا در تغییر رمز عبور';
      Alert.alert('خطا', errorMessage);
    } finally {
      setLoading(false);
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
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#d1e9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title="پروفایل سازمانی"
        onPressLeft={() => navigation.goBack()}
      />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header با دکمه ویرایش */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>اطلاعات سازمان</Text>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Ionicons 
              name={isEditing ? "checkmark-circle" : "create-outline"} 
              size={24} 
              color={themeColor1.bgColor(1)} 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'انصراف' : 'ویرایش'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          
          {/* تصویر پروفایل */}
          <TouchableOpacity 
            onPress={isEditing ? pickImage : null}
            disabled={!isEditing}
            style={styles.imageContainer}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage.uri }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={{ fontSize: 40 }}>🏢</Text>
              </View>
            )}
            {isEditing && (
              <Text style={styles.imageText}>
                {profileImage ? 'تغییر تصویر' : 'انتخاب تصویر'}
              </Text>
            )}
          </TouchableOpacity>

          {/* نام سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>نام سازمان *</Text>
            <TextInput
              value={organizationName}
              onChangeText={setOrganizationName}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* نام مدیر */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>نام و نام خانوادگی مدیر *</Text>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* کد ملی - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>شماره ملی مدیر</Text>
            <TextInput
              value={nationalCode}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
          </View>

          {/* شماره موبایل - غیرقابل ویرایش */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>شماره موبایل مدیر</Text>
            <TextInput
              value={mobileNumber}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
          </View>

          {/* تاریخ تولد */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>تاریخ تولد مدیر</Text>
            <TouchableOpacity
              onPress={isEditing ? () => setDatePickerModal(true) : null}
              disabled={!isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            >
              <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
                {birthDate || 'انتخاب تاریخ'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ایمیل سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>ایمیل سازمان *</Text>
            <TextInput
              value={organizationEmail}
              onChangeText={setOrganizationEmail}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* تلفن ثابت سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>تلفن ثابت سازمان *</Text>
            <TextInput
              value={organizationPhoneNumber}
              onChangeText={setOrganizationPhoneNumber}
              editable={isEditing}
              keyboardType="phone-pad"
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* شهر و منطقه */}
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.label}>شهر *</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                editable={isEditing}
                style={[styles.input, !isEditing && styles.inputDisabled]}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>منطقه *</Text>
              <TextInput
                value={region}
                onChangeText={setRegion}
                editable={isEditing}
                style={[styles.input, !isEditing && styles.inputDisabled]}
              />
            </View>
          </View>

          {/* آدرس سازمان */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>آدرس سازمان *</Text>
            <TextInput
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
              editable={isEditing}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* کد پستی */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>کد پستی سازمان *</Text>
            <TextInput
              value={organizationPostalCode}
              onChangeText={setOrganizationPostalCode}
              editable={isEditing}
              keyboardType="numeric"
              maxLength={10}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
          </View>

          {/* دکمه ذخیره تغییرات */}
          {isEditing && (
            <TouchableOpacity 
              onPress={handleUpdateProfile}
              disabled={loading}
              style={styles.saveButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
              )}
            </TouchableOpacity>
          )}

          {/* بخش تغییر رمز عبور */}
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>تغییر رمز عبور</Text>

            {/* رمز عبور فعلی */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>رمز عبور فعلی</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* رمز عبور جدید */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>رمز عبور جدید</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            {/* تکرار رمز عبور */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>تکرار رمز عبور جدید</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* دکمه تغییر رمز */}
            <TouchableOpacity 
              onPress={handleChangePassword}
              disabled={loading}
              style={styles.changePasswordButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>تغییر رمز عبور</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* دکمه خروج */}
          <TouchableOpacity 
            onPress={logoutWithConfirmation}
            disabled={isLoggingOut}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>خروج از حساب</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* DatePicker Modal */}
      <DatePickerModal 
        datePickerModal={datePickerModal}
        setDatePickerModal={setDatePickerModal}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
      />

      <Footer />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirLight',
    marginRight: 6,
  },
  formContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    fontFamily: 'VazirLight',
    textAlign: 'right',
    minHeight: 40,
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#666',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
  },
  passwordSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#1976d2',
    marginBottom: 15,
    textAlign: 'right',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    fontFamily: 'VazirLight',
    textAlign: 'right',
    minHeight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    left: 12,
    top: 9,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    fontFamily: 'VazirLight',
    marginTop: 4,
    textAlign: 'right',
  },
  changePasswordButton: {
    backgroundColor: '#ff9800',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirBold',
    marginRight: 8,
  },
});

export default OrganizationProfile;
