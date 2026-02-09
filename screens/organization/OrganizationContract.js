import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import jalaali from 'jalaali-js';
import { useDispatch, useSelector } from 'react-redux';
import { updateContractStatus } from '../../slices/organizationSlice';
import { useOrganizationAccess } from '../../hooks/useOrganizationAccess';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import NewStyles from '../../styles/NewStyles';
import { showAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4 } from '../../theme/Color';
import { uri } from '../../services/URL';

const OrganizationContract = ({ navigation }) => {
  const dispatch = useDispatch();
  const reduxContractStatus = useSelector(state => state.organization.contractStatus);
  const { refetch } = useOrganizationAccess(); // برای رفرش کردن وضعیت کامل (پروفایل + قرارداد)
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [loadingContract, setLoadingContract] = useState(true);
  const [uploadingContract, setUploadingContract] = useState(false);

  // Contract data from admin
  const [adminContract, setAdminContract] = useState(null);

  // User uploaded contract
  const [uploadedContract, setUploadedContract] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper function برای تبدیل تاریخ میلادی به شمسی
  const toJalaliDate = (dateString) => {
    try {
      if (!dateString) return '';

      const date = new Date(dateString);

      // بررسی اعتبار تاریخ
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString;
      }

      const jalaaliDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());

      // فرمت: ۱۴۰۳/۰۸/۲۱ (اعداد فارسی)
      const year = jalaaliDate.jy.toString();
      const month = jalaaliDate.jm.toString().padStart(2, '0');
      const day = jalaaliDate.jd.toString().padStart(2, '0');

      // تبدیل اعداد انگلیسی به فارسی
      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const jalaliDateStr = `${year}/${month}/${day}`;

      return jalaliDateStr.replace(/[0-9]/g, (digit) => persianNumbers[parseInt(digit)]);
    } catch (error) {
      console.error('Error converting date to Jalaali:', error);
      return dateString;
    }
  };

  useEffect(() => {
    loadContractData();
  }, []);

  // بارگذاری اطلاعات قرارداد از سرور
  const loadContractData = async () => {
    try {
      console.log('🔄 loadContractData called');
      setLoadingContract(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        showAlert(t('Error'), t('Please log in first.'));
        navigation.navigate('Login');
        return;
      }

      // دریافت آخرین قرارداد عمومی
      const latestContractResponse = await axios.get(`${uri}/contracts/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      console.log('📄 Admin contract response:', latestContractResponse.data);

      if (latestContractResponse.data.success) {
        const contract = latestContractResponse.data.data;
        setAdminContract({
          id: contract.id,
          title: contract.title,
          description: contract.description,
          file_url: contract.pdf_url,
          file_name: contract.title + '.pdf',
          uploaded_at: toJalaliDate(contract.created_at),
        });
      }

      // دریافت لیست قراردادهای سازمان
      const orgContractsResponse = await axios.get(`${uri}/organization/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      console.log('📋 Organization contracts response:', orgContractsResponse.data);

      if (orgContractsResponse.data.success && orgContractsResponse.data.data.length > 0) {
        // آخرین قرارداد آپلود شده
        const latestUpload = orgContractsResponse.data.data[0];
        console.log('📤 Latest uploaded contract:', latestUpload);

        const uploadedData = {
          id: latestUpload.id,
          file_url: latestUpload.contract_url,
          file_name: t('Signed contract'),
          uploaded_at: toJalaliDate(latestUpload.uploaded_at),
          status: latestUpload.status,
          status_label: latestUpload.status_label,
          rejection_reason: latestUpload.rejection_reason,
          reviewed_at: latestUpload.reviewed_at ? toJalaliDate(latestUpload.reviewed_at) : null,
          can_edit: latestUpload.can_edit,
        };

        console.log('✅ Setting uploadedContract:', uploadedData);
        console.log('📅 Date conversion test:', {
          original_uploaded_at: latestUpload.uploaded_at,
          converted_uploaded_at: uploadedData.uploaded_at,
          original_reviewed_at: latestUpload.reviewed_at,
          converted_reviewed_at: uploadedData.reviewed_at
        });
        setUploadedContract(uploadedData);

        // 🔥 آپدیت Redux state با وضعیت واقعی قرارداد از API
        if (latestUpload.status) {
          dispatch(updateContractStatus(latestUpload.status));
          console.log('✅ Redux contractStatus updated from API to:', latestUpload.status);
        }
      } else {
        console.log('⚠️ No uploaded contracts found');
        setUploadedContract(null);

        // اگه قراردادی نداریم، وضعیت رو 'not_uploaded' بزاریم
        dispatch(updateContractStatus('not_uploaded'));
        console.log('✅ Redux contractStatus updated to: not_uploaded');
      }

    } catch (error) {
      console.error('❌ Error loading contract:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 403) {
        showAlert(t('Error'), t('Only organization users can view contracts.'));
        if (Platform.OS == 'web') {
          window.history.back()
        } else {
          navigation.goBack()
        }
      } else if (error.response?.status === 404) {
        // هیچ قراردادی یافت نشد - این عادی است
        console.log('⚠️ 404 - No contracts found (normal)');
        setAdminContract(null);
      } else {
        showAlert(t('Error'), error.response?.data?.message || t('Error loading contract information.'));
      }
    } finally {
      setLoadingContract(false);
      console.log('✅ loadContractData finished');
    }
  };

  // دانلود قرارداد ادمین
  const handleDownloadAdminContract = async () => {
    try {
      if (!adminContract || !adminContract.file_url) {
        showAlert(t('Error'), t('Contract file is not available.'));
        return;
      }

      const supported = await Linking.canOpenURL(adminContract.file_url);

      if (supported) {
        await Linking.openURL(adminContract.file_url);
      } else {
        showAlert(t('Error'), t('Unable to open the link.'));
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      showAlert(t('Error'), t('Error downloading contract.'));
    }
  };

  // انتخاب فایل قرارداد امضا شده
  const handlePickDocument = async () => {
    console.log('🔵 handlePickDocument called!');
    console.log('🔍 Current state:', {
      loading,
      uploadingContract,
      uploadedContract: uploadedContract ? {
        status: uploadedContract.status,
        filename: uploadedContract.filename
      } : null,
      selectedFile: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size
      } : null
    });

    try {
      // بررسی امکان آپلود
      if (uploadedContract && uploadedContract.status === 'approved') {
        console.log('⚠️ Upload blocked - contract already approved');
        showAlert(t('Attention'), t('You already have an approved contract and re-upload is not allowed.'));
        return;
      }

      console.log('🟢 Opening DocumentPicker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      console.log('📁 DocumentPicker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        console.log('📄 File selected:', {
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri,
          hasFileObject: !!file.file
        });

        // Check file size (max 500MB according to API docs)
        if (file.size > 500 * 1024 * 1024) {
          console.log('❌ File too large:', file.size);
          showAlert(t('Error'), t('File size must not exceed 500 MB.'));
          return;
        }

        // Check file type
        if (file.mimeType !== 'application/pdf') {
          console.log('❌ Invalid mimeType:', file.mimeType);
          showAlert(t('Error'), t('Only PDF files are allowed.'));
          return;
        }

        console.log('✅ Validation passed, setting selectedFile');

        // 🌐 در وب، باید File object واقعی رو هم ذخیره کنیم
        if (Platform.OS === 'web' && file.file) {
          console.log('📁 Web: Storing File object');
          setSelectedFile({
            ...file,
            file: file.file // File object واقعی برای آپلود
          });
        } else {
          setSelectedFile(file);
        }

        showAlert(t('Success'), t('File {{name}} selected', { name: file.name }));
      } else {
        console.log('⚠️ File selection canceled or no file');
        console.log('Result details:', {
          canceled: result.canceled,
          hasAssets: !!result.assets,
          assetsLength: result.assets?.length
        });
      }
    } catch (error) {
      console.error('❌ Error picking document:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      showAlert(t('Error'), `${t('Error selecting file')}: ${error.message}`);
    }
  };

  // آپلود قرارداد امضا شده
  const handleUploadContract = async () => {
    console.log('🔵 handleUploadContract called!');
    console.log('🔍 Upload state check:', {
      selectedFile: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.mimeType,
        uri: selectedFile.uri
      } : null,
      uploadingContract,
      loading
    });

    try {
      if (!selectedFile) {
        console.log('❌ No file selected');
        showAlert(t('Error'), t('Please select a signed contract file first.'));
        return;
      }

      setUploadingContract(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        console.log('❌ No token found');
        showAlert(t('Error'), t('Please log in first.'));
        setUploadingContract(false);
        return;
      }

      console.log('🔑 Token found, preparing FormData...');
      const formData = new FormData();

      // 🌐 Platform-specific file handling
      if (Platform.OS === 'web') {
        // در وب، selectedFile.file یک File object واقعی است
        console.log('📁 Web: Appending File object directly');

        // بررسی وجود file object
        if (selectedFile.file) {
          formData.append('contract_file', selectedFile.file, selectedFile.name);
          console.log('✅ File appended:', {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.mimeType
          });
        } else if (selectedFile.uri) {
          // fallback: اگر file object نداریم، از uri استفاده می‌کنیم (fetch blob)
          console.log('⚠️ No file object, fetching blob from URI...');
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          formData.append('contract_file', blob, selectedFile.name || 'contract.pdf');
          console.log('✅ Blob appended from URI');
        } else {
          throw new Error(t('Invalid file.'));
        }
      } else {
        // در React Native، از uri استفاده می‌کنیم
        console.log('� Mobile: Using URI-based file data');
        const fileData = {
          uri: selectedFile.uri,
          type: 'application/pdf',
          name: selectedFile.name || 'contract.pdf',
        };
        formData.append('contract_file', fileData);
        console.log('✅ File data appended:', fileData);
      }

      const uploadUrl = `${uri}/organization/contracts/upload`;
      console.log('🌐 Upload URL:', uploadUrl);
      console.log('🔄 Starting upload...');

      // 🌐 Headers - در وب نباید Content-Type دستی تنظیم بشه
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // فقط در React Native باید Content-Type تنظیم بشه
      if (Platform.OS !== 'web') {
        headers['Content-Type'] = 'multipart/form-data';
      }

      console.log('📤 Request headers:', headers);

      const response = await axios.post(uploadUrl, formData, {
        headers,
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ Upload request completed!');

      console.log('📤 Upload API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('✅ Upload successful!');
        console.log('Response data:', response.data);

        // 🔥 آپدیت Redux state - قرارداد الان pending هست
        dispatch(updateContractStatus('pending'));
        console.log('✅ Redux contractStatus updated to: pending');

        // بررسی اینکه واقعاً آپدیت شد یا نه
        setTimeout(() => {
          console.log('🔍 Checking Redux after dispatch - reduxContractStatus:', reduxContractStatus);
        }, 100);

        showAlert(
          t('Success'),
          response.data.message || t('Contract uploaded successfully and is pending approval.'),
          [
            {
              text: t('Ok'),
              onPress: async () => {
                console.log('🔄 Clearing selectedFile and reloading data...');
                setSelectedFile(null);

                // صبر می‌کنیم تا سرور قرارداد رو ثبت کنه
                console.log('⏳ Waiting 1 second before reloading...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                console.log('🔄 Now calling loadContractData...');
                await loadContractData(); // Reload data

                console.log('🔄 Now calling refetch to update profileStatus + contractStatus...');
                await refetch(); // 🔥 آپدیت کامل وضعیت از API (هم پروفایل هم قرارداد)
                console.log('✅ Full status refreshed from API');
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Upload Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      if (error.response?.status === 400) {
        console.log('❌ 400 Bad Request');
        showAlert(t('Error'), error.response.data.message || t('You already have an approved contract and re-upload is not allowed.'));
      } else if (error.response?.status === 422) {
        console.log('❌ 422 Validation Error');
        // Validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        showAlert(t('Validation error'), errorMessages);
      } else if (error.response?.status === 404) {
        console.log('❌ 404 Not Found');
        showAlert(t('Error'), t('Organization information not found.'));
      } else if (error.response?.status === 401) {
        console.log('❌ 401 Unauthorized');
        showAlert(t('Error'), t('Authentication failed. Please log in again.'));
      } else if (error.response?.status === 413) {
        console.log('❌ 413 File Too Large');
        showAlert(t('Error'), t('File size exceeds the allowed limit.'));
      } else if (error.code === 'ECONNABORTED') {
        console.log('❌ Request Timeout');
        showAlert(t('Error'), t('Request timed out. Please try again.'));
      } else if (error.message.includes('Network Error')) {
        console.log('❌ Network Error');
        showAlert(t('Error'), t('Error connecting to server. Please check your internet connection'));
      } else {
        console.log('❌ Other Error');
        showAlert(t('Error'), error.response?.data?.message || error.message || t('Error uploading contract'));
      }
    } finally {
      setUploadingContract(false);
    }
  };

  // حذف فایل انتخاب شده
  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  if (loadingContract) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <CustomStatusBar />
        <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
        <Text style={styles.loadingText}>{t('Loading...')}</Text>
      </View>
    );
  }

  console.log('🎨 Rendering - uploadedContract:', uploadedContract ? 'EXISTS' : 'NULL');
  console.log('🎨 uploadedContract details:', uploadedContract);

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Organization contract')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* توضیحات */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={themeColor1.bgColor(1)} />
          <Text style={styles.infoText}>
            {t('In this section, you can view and download the organizational cooperation contract and then upload the signed contract.')}
          </Text>
        </View>

        {/* قرارداد ادمین */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={themeColor1.bgColor(1)} />
            <Text style={styles.sectionTitle}>{t('Cooperation contract')}</Text>
          </View>

          {adminContract ? (
            <View style={styles.contractCard}>
              <View style={styles.contractInfo}>
                  <Ionicons name="document" size={40} color={themeColor1.bgColor(1)} />
                  <View style={styles.contractDetails}>
                    <Text style={styles.contractFileName}>{adminContract.file_name}</Text>
                    <Text style={styles.contractDate}>{t('Upload date:')} {adminContract.uploaded_at}</Text>
                  </View>
                </View>

              <View style={styles.contractActions}>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={handleDownloadAdminContract}
                >
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.downloadBtnText}>{t('Download and view')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>{t('The contract has not been uploaded yet.')}</Text>
            </View>
          )}
        </View>

        {/* آپلود قرارداد امضا شده */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color={themeColor4.bgColor(1)} />
            <Text style={styles.sectionTitle}>{t('Upload signed contract')}</Text>
          </View>

          {/* فایل انتخاب شده */}
          {selectedFile && (
            <View style={styles.selectedFileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-attach" size={30} color={themeColor4.bgColor(1)} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveSelectedFile}>
                <Ionicons name="close-circle" size={24} color="#ff0000" />
              </TouchableOpacity>
            </View>
          )}

          {/* دکمه‌های عملیات */}
          <View style={styles.uploadActions}>
            <TouchableOpacity
              style={styles.selectFileBtn}
              onPress={handlePickDocument}
              disabled={uploadingContract}
            >
              <Ionicons name="folder-open-outline" size={20} color={themeColor1.bgColor(1)} />
              <Text style={styles.selectFileBtnText}>
                {selectedFile ? t('Change file') : t('Select file')}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleUploadContract}
                disabled={uploadingContract}
              >
                {uploadingContract ? (
                  <ActivityIndicator size="small" color="#000000ff" />
                ) : (
                  <Ionicons name="cloud-upload" size={20} color="#000000ff" />
                )}
                <Text style={styles.uploadBtnText}>
                  {uploadingContract ? t('Uploading...') : t('Upload contract')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* قرارداد آپلود شده قبلی */}
          {uploadedContract && (
            <View style={styles.uploadedSection}>
              <Text style={styles.uploadedLabel}>{t('Uploaded contract:')}</Text>
              <View style={[
                styles.uploadedCard,
                uploadedContract.status === 'approved' && styles.uploadedCardApproved,
                uploadedContract.status === 'rejected' && styles.uploadedCardRejected,
              ]}>
                <View style={styles.uploadedInfo}>
                  <Ionicons
                    name={
                      uploadedContract.status === 'approved' ? 'checkmark-circle' :
                        uploadedContract.status === 'rejected' ? 'close-circle' :
                          'time-outline'
                    }
                    size={30}
                    color={
                      uploadedContract.status === 'approved' ? '#4caf50' :
                        uploadedContract.status === 'rejected' ? '#f44336' :
                          '#ff9800'
                    }
                  />
                  <View style={styles.uploadedDetails}>
                    <Text style={styles.uploadedFileName}>{uploadedContract.file_name}</Text>
                    <Text style={styles.uploadedDate}>
                      {t('Upload date:')} {uploadedContract.uploaded_at}
                    </Text>
                    {uploadedContract.reviewed_at && (
                      <Text style={styles.uploadedDate}>
                        {t('Review date:')} {uploadedContract.reviewed_at}
                      </Text>
                    )}
                    <Text style={[
                      styles.uploadedStatus,
                      uploadedContract.status === 'approved' && styles.statusApproved,
                      uploadedContract.status === 'rejected' && styles.statusRejected,
                      uploadedContract.status === 'pending' && styles.statusPending,
                    ]}>
                      {t('Status:')} {uploadedContract.status_label}
                    </Text>

                    {/* نمایش دلیل رد */}
                    {uploadedContract.status === 'rejected' && uploadedContract.rejection_reason && (
                      <View style={styles.rejectionBox}>
                        <Text style={styles.rejectionTitle}>{t('Rejection reason')}</Text>
                        <Text style={styles.rejectionText}>{uploadedContract.rejection_reason}</Text>
                      </View>
                    )}

                    {/* دکمه دانلود قرارداد آپلود شده */}
                    <TouchableOpacity
                      style={styles.viewUploadedBtn}
                      onPress={() => Linking.openURL(uploadedContract.file_url)}
                    >
                      <Ionicons name="eye-outline" size={18} color={themeColor1.bgColor(1)} />
                      <Text style={styles.viewUploadedBtnText}>{t('View uploaded file')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* راهنمایی */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>{t('Guide:')}</Text>
            <Text style={styles.helpText}>{t('- First, download and read the cooperation contract')}</Text>
            <Text style={styles.helpText}>{t('- Sign the contract (digitally or by scan)')}</Text>
            <Text style={styles.helpText}>{t('- Upload the signed file')}</Text>
            <Text style={styles.helpText}>{t('- Allowed format: PDF only')}</Text>
            <Text style={styles.helpText}>{t('- Maximum file size: 500 MB')}</Text>
            <Text style={styles.helpText}>{t('- If rejected, you can upload again')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    writingDirection: 'rtl',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row-reverse',
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderRightWidth: 4,
    borderRightColor: themeColor1.bgColor(1),
  },
  infoText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
    textAlign: 'right',
    lineHeight: 22,
    writingDirection: 'rtl',
  },

  // Section
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: '#333',
    marginRight: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Contract Card
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  contractDetails: {
    flex: 1,
    marginRight: 15,
  },
  contractFileName: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  contractDate: {
    fontSize: 13,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  contractActions: {
    marginTop: 10,
  },
  downloadBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'VazirBold',
    marginRight: 8,
    writingDirection: 'rtl',
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#999',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Selected File Card
  selectedFileCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 2,
    borderColor: themeColor4.bgColor(1),
  },
  fileInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Upload Actions
  uploadActions: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 15,
  },
  selectFileBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: themeColor1.bgColor(1),
  },
  selectFileBtnText: {
    color: themeColor1.bgColor(1),
    fontSize: 15,
    fontFamily: 'VazirBold',
    marginRight: 8,
    writingDirection: 'rtl',
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  uploadBtnDisabled: {
    backgroundColor: '#999999',
    opacity: 1,
  },
  uploadBtnText: {
    color: themeColor10.bgColor(1),
    fontSize: 15,
    fontFamily: 'VazirBold',
    marginRight: 8,
    writingDirection: 'rtl',
  },

  // Uploaded Contract
  uploadedSection: {
    marginTop: 20,
  },
  uploadedLabel: {
    fontSize: 15,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  uploadedCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#ff9800',
  },
  uploadedCardApproved: {
    backgroundColor: '#e8f5e9',
    borderRightColor: '#4caf50',
  },
  uploadedCardRejected: {
    backgroundColor: '#ffebee',
    borderRightColor: '#f44336',
  },
  uploadedInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  uploadedDetails: {
    flex: 1,
    marginRight: 12,
  },
  uploadedFileName: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  uploadedDate: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: '#666',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  uploadedStatus: {
    fontSize: 13,
    fontFamily: 'VazirBold',
    textAlign: 'right',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  statusApproved: {
    color: '#4caf50',
  },
  statusRejected: {
    color: '#f44336',
  },
  statusPending: {
    color: '#ff9800',
  },

  // Rejection Reason
  rejectionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  rejectionTitle: {
    fontSize: 13,
    fontFamily: 'VazirBold',
    color: '#f44336',
    marginBottom: 5,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rejectionText: {
    fontSize: 13,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    lineHeight: 20,
    writingDirection: 'rtl',
  },

  // View Uploaded Button
  viewUploadedBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: themeColor1.bgColor(1),
  },
  viewUploadedBtnText: {
    color: themeColor1.bgColor(1),
    fontSize: 14,
    fontFamily: 'VazirBold',
    marginRight: 8,
    writingDirection: 'rtl',
  },

  // Help Box
  helpBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderRightWidth: 4,
    borderRightColor: '#ff9800',
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  helpText: {
    fontSize: 13,
    fontFamily: 'VazirLight',
    color: '#666',
    marginBottom: 6,
    textAlign: 'right',
    lineHeight: 20,
    writingDirection: 'rtl',
  },
});

export default OrganizationContract;

