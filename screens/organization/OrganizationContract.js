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

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import NewStyles from '../../styles/NewStyles';
import { showAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor3, themeColor4 } from '../../theme/Color';
import { uri } from '../../services/URL';

const OrganizationContract = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [loadingContract, setLoadingContract] = useState(true);
  const [uploadingContract, setUploadingContract] = useState(false);
  
  // Contract data from admin
  const [adminContract, setAdminContract] = useState(null);
  
  // User uploaded contract
  const [uploadedContract, setUploadedContract] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadContractData();
  }, []);

  // بارگذاری اطلاعات قرارداد از سرور
  const loadContractData = async () => {
    try {
      setLoadingContract(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        showAlert('خطا', 'لطفا ابتدا وارد شوید');
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

      if (latestContractResponse.data.success) {
        const contract = latestContractResponse.data.data;
        setAdminContract({
          id: contract.id,
          title: contract.title,
          description: contract.description,
          file_url: contract.pdf_url,
          file_name: contract.title + '.pdf',
          uploaded_at: new Date(contract.created_at).toLocaleDateString('fa-IR'),
        });
      }

      // دریافت لیست قراردادهای سازمان
      const orgContractsResponse = await axios.get(`${uri}/organization/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (orgContractsResponse.data.success && orgContractsResponse.data.data.length > 0) {
        // آخرین قرارداد آپلود شده
        const latestUpload = orgContractsResponse.data.data[0];
        setUploadedContract({
          id: latestUpload.id,
          file_url: latestUpload.contract_url,
          file_name: 'قرارداد امضا شده',
          uploaded_at: new Date(latestUpload.uploaded_at).toLocaleDateString('fa-IR'),
          status: latestUpload.status,
          status_label: latestUpload.status_label,
          rejection_reason: latestUpload.rejection_reason,
          reviewed_at: latestUpload.reviewed_at ? new Date(latestUpload.reviewed_at).toLocaleDateString('fa-IR') : null,
          can_edit: latestUpload.can_edit,
        });
      }

    } catch (error) {
      console.error('Error loading contract:', error);
      
      if (error.response?.status === 403) {
        showAlert('خطا', 'فقط کاربران سازمانی می‌توانند قراردادها را مشاهده کنند');
        navigation.goBack();
      } else if (error.response?.status === 404) {
        // هیچ قراردادی یافت نشد - این عادی است
        setAdminContract(null);
      } else {
        showAlert('خطا', error.response?.data?.message || 'خطا در بارگذاری اطلاعات قرارداد');
      }
    } finally {
      setLoadingContract(false);
    }
  };

  // دانلود قرارداد ادمین
  const handleDownloadAdminContract = async () => {
    try {
      if (!adminContract || !adminContract.file_url) {
        showAlert('خطا', 'فایل قرارداد موجود نیست');
        return;
      }

      const supported = await Linking.canOpenURL(adminContract.file_url);
      
      if (supported) {
        await Linking.openURL(adminContract.file_url);
      } else {
        showAlert('خطا', 'امکان باز کردن لینک وجود ندارد');
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      showAlert('خطا', 'خطا در دانلود قرارداد');
    }
  };

  // انتخاب فایل قرارداد امضا شده
  const handlePickDocument = async () => {
    try {
      // بررسی امکان آپلود
      if (uploadedContract && uploadedContract.status === 'approved') {
        showAlert('توجه', 'شما یک قرارداد تایید شده دارید و امکان بارگذاری مجدد وجود ندارد.');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (max 500MB according to API docs)
        if (file.size > 500 * 1024 * 1024) {
          showAlert('خطا', 'حجم فایل نباید بیشتر از 500 مگابایت باشد');
          return;
        }

        // Check file type
        if (file.mimeType !== 'application/pdf') {
          showAlert('خطا', 'فقط فایل‌های PDF مجاز هستند');
          return;
        }

        setSelectedFile(file);
        showAlert('موفق', `فایل ${file.name} انتخاب شد`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showAlert('خطا', 'خطا در انتخاب فایل');
    }
  };

  // آپلود قرارداد امضا شده
  const handleUploadContract = async () => {
    try {
      if (!selectedFile) {
        showAlert('خطا', 'لطفا ابتدا فایل قرارداد امضا شده را انتخاب کنید');
        return;
      }

      setUploadingContract(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        showAlert('خطا', 'لطفا ابتدا وارد شوید');
        return;
      }

      const formData = new FormData();
      
      formData.append('contract_file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name || 'contract.pdf',
      });

      const response = await axios.post(
        `${uri}/organization/contracts/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.success) {
        showAlert(
          'موفق', 
          response.data.message || 'قرارداد با موفقیت بارگذاری شد و در انتظار تایید است.', 
          [
            { 
              text: 'باشه', 
              onPress: () => {
                setSelectedFile(null);
                loadContractData(); // Reload data
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('Error uploading contract:', error);
      
      if (error.response?.status === 400) {
        showAlert('خطا', error.response.data.message || 'شما یک قرارداد تایید شده دارید و امکان بارگذاری مجدد وجود ندارد.');
      } else if (error.response?.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        showAlert('خطای اعتبارسنجی', errorMessages);
      } else if (error.response?.status === 404) {
        showAlert('خطا', 'اطلاعات سازمان یافت نشد.');
      } else {
        showAlert('خطا', error.response?.data?.message || 'خطا در آپلود قرارداد');
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
        <ScreenHeaders navigation={navigation} screenTitle="قراردادنامه" />
        <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <ScreenHeaders navigation={navigation} screenTitle="قراردادنامه سازمانی" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* توضیحات */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={themeColor1.bgColor(1)} />
          <Text style={styles.infoText}>
            در این بخش می‌توانید قرارداد همکاری سازمانی را مشاهده و دانلود کنید و سپس قرارداد امضا شده را بارگذاری نمایید.
          </Text>
        </View>

        {/* قرارداد ادمین */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={themeColor1.bgColor(1)} />
            <Text style={styles.sectionTitle}>قرارداد همکاری</Text>
          </View>

          {adminContract ? (
            <View style={styles.contractCard}>
              <View style={styles.contractInfo}>
                <Ionicons name="document" size={40} color={themeColor1.bgColor(1)} />
                <View style={styles.contractDetails}>
                  <Text style={styles.contractFileName}>{adminContract.file_name}</Text>
                  <Text style={styles.contractDate}>تاریخ بارگذاری: {adminContract.uploaded_at}</Text>
                </View>
              </View>

              <View style={styles.contractActions}>
                <TouchableOpacity 
                  style={styles.downloadBtn}
                  onPress={handleDownloadAdminContract}
                >
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.downloadBtnText}>دانلود و مشاهده</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>قرارداد هنوز بارگذاری نشده است</Text>
            </View>
          )}
        </View>

        {/* آپلود قرارداد امضا شده */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color={themeColor4.bgColor(1)} />
            <Text style={styles.sectionTitle}>بارگذاری قرارداد امضا شده</Text>
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
                {selectedFile ? 'تغییر فایل' : 'انتخاب فایل'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity 
                style={[styles.uploadBtn, uploadingContract && styles.uploadBtnDisabled]}
                onPress={handleUploadContract}
                disabled={uploadingContract}
              >
                {uploadingContract ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                )}
                <Text style={styles.uploadBtnText}>
                  {uploadingContract ? 'در حال آپلود...' : 'آپلود قرارداد'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* قرارداد آپلود شده قبلی */}
          {uploadedContract && (
            <View style={styles.uploadedSection}>
              <Text style={styles.uploadedLabel}>قرارداد آپلود شده:</Text>
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
                      تاریخ آپلود: {uploadedContract.uploaded_at}
                    </Text>
                    {uploadedContract.reviewed_at && (
                      <Text style={styles.uploadedDate}>
                        تاریخ بررسی: {uploadedContract.reviewed_at}
                      </Text>
                    )}
                    <Text style={[
                      styles.uploadedStatus,
                      uploadedContract.status === 'approved' && styles.statusApproved,
                      uploadedContract.status === 'rejected' && styles.statusRejected,
                      uploadedContract.status === 'pending' && styles.statusPending,
                    ]}>
                      وضعیت: {uploadedContract.status_label}
                    </Text>
                    
                    {/* نمایش دلیل رد */}
                    {uploadedContract.status === 'rejected' && uploadedContract.rejection_reason && (
                      <View style={styles.rejectionBox}>
                        <Text style={styles.rejectionTitle}>دلیل رد:</Text>
                        <Text style={styles.rejectionText}>{uploadedContract.rejection_reason}</Text>
                      </View>
                    )}
                    
                    {/* دکمه دانلود قرارداد آپلود شده */}
                    <TouchableOpacity 
                      style={styles.viewUploadedBtn}
                      onPress={() => Linking.openURL(uploadedContract.file_url)}
                    >
                      <Ionicons name="eye-outline" size={18} color={themeColor1.bgColor(1)} />
                      <Text style={styles.viewUploadedBtnText}>مشاهده فایل آپلود شده</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* راهنمایی */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>راهنما:</Text>
            <Text style={styles.helpText}>• ابتدا قرارداد همکاری را دانلود و مطالعه کنید</Text>
            <Text style={styles.helpText}>• قرارداد را امضا کنید (به صورت دیجیتال یا اسکن)</Text>
            <Text style={styles.helpText}>• فایل امضا شده را بارگذاری کنید</Text>
            <Text style={styles.helpText}>• فرمت مجاز: فقط PDF</Text>
            <Text style={styles.helpText}>• حداکثر حجم فایل: 500 مگابایت</Text>
            <Text style={styles.helpText}>• در صورت رد شدن، می‌توانید مجدداً آپلود کنید</Text>
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
    backgroundColor: '#90caf9',
  },
  uploadBtnText: {
    color: '#fff',
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

