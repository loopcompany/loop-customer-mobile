import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';

import CustomStatusBar from '../../components/CustomStatusBar';
import ScreenHeaders from '../../components/ScreenHeaders';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { showAlert } from '../../helpers/Common';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, themeColor10, themeColor11, themeColor14 } from '../../theme/Color';
import { NewStyles } from '../../styles/NewStyles';
import OrganizationService from '../../services/OrganizationService';
import { 
  setProfileData, 
  setProfileLoading, 
  setProfileError,
  updateProfileStatus 
} from '../../slices/organizationSlice';

/**
 * صفحه ویرایش پروفایل کاربران سازمانی
 */
const OrganizationProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { token } = useSelector(state => state.auth);
  const { 
    profileData: reduxProfileData, 
    profileLoading, 
    profileError 
  } = useSelector(state => state.organization);
  
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    organization_name: '',
    organization_code: '',
    phone: '',
    email: '',
    address: '',
    manager_name: '',
    national_id: '',
    registration_number: '',
  });
  const [errors, setErrors] = useState({});
  
  // Sync with Redux data when it changes
  useEffect(() => {
    if (reduxProfileData) {
      setProfileData({
        organization_name: reduxProfileData.organization_name || '',
        organization_code: reduxProfileData.organization_code || '',
        phone: reduxProfileData.phone || '',
        email: reduxProfileData.email || '',
        address: reduxProfileData.address || '',
        manager_name: reduxProfileData.manager_name || '',
        national_id: reduxProfileData.national_id || '',
        registration_number: reduxProfileData.registration_number || '',
      });
    }
  }, [reduxProfileData]);

  /**
   * دریافت اطلاعات پروفایل از سرور
   */
  const fetchProfile = async () => {
    if (!token) return;
    
    dispatch(setProfileLoading(true));
    
    const result = await OrganizationService.getProfile(token);
    
    if (result.success) {
      dispatch(setProfileData(result.data));
    } else {
      dispatch(setProfileError(result.error));
      showAlert('خطا', result.error);
    }
  };

  /**
   * بروزرسانی فیلد در state
   */
  const updateField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // پاک کردن خطا برای این فیلد
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * اعتبارسنجی داده‌ها
   */
  const validateData = () => {
    const validation = OrganizationService.validateProfileData(profileData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * ذخیره اطلاعات پروفایل
   */
  const saveProfile = async () => {
    if (!validateData()) {
      showAlert('خطا', 'لطفا تمام فیلدهای الزامی را به درستی پر کنید');
      return;
    }
    
    setSaving(true);
    
    const result = await OrganizationService.updateProfile(token, profileData);
    
    if (result.success) {
      // بروزرسانی Redux state
      dispatch(setProfileData(result.data));
      dispatch(updateProfileStatus('pending')); // وضعیت به pending تغییر می‌کند
      
      showAlert('موفقیت', result.message || 'اطلاعات شما با موفقیت ذخیره شد', [
        {
          text: 'باشه',
          onPress: () => navigation.goBack()
        }
      ]);
    } else {
      // مدیریت خطاهای validation
      if (result.validationErrors && Object.keys(result.validationErrors).length > 0) {
        setErrors(result.validationErrors);
      }
      
      showAlert('خطا', result.error);
    }
    
    setSaving(false);
  };

  /**
   * گرفتن رنگ وضعیت
   */
  const getStatusColor = () => {
    const status = reduxProfileData?.status;
    switch (status) {
      case 'approved': return themeColor7.color;
      case 'pending': return themeColor11.color;
      case 'rejected': return themeColor6.color;
      default: return themeColor3.color;
    }
  };

  /**
   * گرفتن متن وضعیت
   */
  const getStatusText = () => {
    const status = reduxProfileData?.status;
    switch (status) {
      case 'approved': return 'تایید شده';
      case 'pending': return 'در انتظار بررسی';
      case 'rejected': return 'رد شده - نیاز به اصلاح';
      default: return 'تکمیل نشده';
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (profileLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />
      <ScreenHeaders 
        title="اطلاعات پروفایل سازمانی"
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* نمایش وضعیت فعلی */}
        {reduxProfileData?.status && (
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Icon name="info-outline" size={24} color={getStatusColor()} />
              <Text style={styles.statusLabel}>وضعیت پروفایل:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
              </View>
            </View>
            {reduxProfileData?.rejection_reason && (
              <Text style={styles.rejectionReason}>
                دلیل رد: {reduxProfileData.rejection_reason}
              </Text>
            )}
          </View>
        )}

        {/* فرم اطلاعات شرکت */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات شرکت</Text>
          
          <Input
            label="نام شرکت *"
            value={profileData.company_name}
            onChangeText={(text) => updateField('company_name', text)}
            placeholder="نام کامل شرکت را وارد کنید"
            error={errors.company_name}
          />
          
          <Input
            label="شماره ثبت شرکت *"
            value={profileData.company_registration_number}
            onChangeText={(text) => updateField('company_registration_number', text)}
            placeholder="شماره ثبت رسمی شرکت"
            keyboardType="numeric"
            error={errors.company_registration_number}
          />
          
          <Input
            label="آدرس شرکت *"
            value={profileData.company_address}
            onChangeText={(text) => updateField('company_address', text)}
            placeholder="آدرس کامل شرکت"
            multiline={true}
            numberOfLines={3}
            error={errors.company_address}
          />
          
          <Input
            label="تلفن شرکت *"
            value={profileData.company_phone}
            onChangeText={(text) => updateField('company_phone', text)}
            placeholder="021-12345678"
            keyboardType="phone-pad"
            error={errors.company_phone}
          />
          
          <Input
            label="نوع کسب و کار *"
            value={profileData.business_type}
            onChangeText={(text) => updateField('business_type', text)}
            placeholder="مثال: خدمات فنی، ساختمان، ..."
            error={errors.business_type}
          />
          
          <Input
            label="وب‌سایت"
            value={profileData.website}
            onChangeText={(text) => updateField('website', text)}
            placeholder="https://example.com"
            keyboardType="url"
            error={errors.website}
          />
        </View>

        {/* فرم اطلاعات مدیر */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات مدیر</Text>
          
          <Input
            label="نام و نام خانوادگی مدیر *"
            value={profileData.manager_name}
            onChangeText={(text) => updateField('manager_name', text)}
            placeholder="نام کامل مدیر شرکت"
            error={errors.manager_name}
          />
          
          <Input
            label="شماره موبایل مدیر *"
            value={profileData.manager_phone}
            onChangeText={(text) => updateField('manager_phone', text)}
            placeholder="09123456789"
            keyboardType="phone-pad"
            error={errors.manager_phone}
          />
          
          <Input
            label="ایمیل مدیر *"
            value={profileData.manager_email}
            onChangeText={(text) => updateField('manager_email', text)}
            placeholder="manager@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.manager_email}
          />
        </View>

        {/* توضیحات */}
        <View style={styles.section}>
          <Input
            label="توضیحات شرکت"
            value={profileData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="توضیح مختصر در مورد فعالیت‌های شرکت"
            multiline={true}
            numberOfLines={4}
            error={errors.description}
          />
        </View>

        {/* دکمه ذخیره */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
            onPress={saveProfile}
            loading={saving}
            disabled={saving}
            backgroundColor={themeColor0.bgColor(1)}
            textColor={themeColor4.bgColor(1)}
          />
        </View>

        {/* راهنما */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            * فیلدهای الزامی هستند. پس از ذخیره، اطلاعات شما توسط ادمین بررسی و تایید خواهد شد.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    backgroundColor: themeColor5.bgColor(1),
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    fontFamily: 'Vazir-Light',
    color: themeColor10.color,
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Vazir-Bold',
    color: themeColor4.bgColor(1),
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Vazir-Bold',
    color: themeColor10.color,
    marginBottom: 15,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  helpContainer: {
    backgroundColor: themeColor14.bgColor(1),
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor3.color,
    textAlign: 'right',
    lineHeight: 22,
  },
});

export default OrganizationProfileScreen;