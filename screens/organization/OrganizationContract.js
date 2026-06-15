import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
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
import { createStyles } from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import NewStyles from '../../styles/NewStyles';
import { handleError, showAlert, showToastOrAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import { imageUri, uri } from '../../services/URL';
import Button from './../../components/Button';

const OrganizationContract = ({ navigation }) => {
  const dispatch = useDispatch();
  const reduxContractStatus = useSelector(state => state.organization.contractStatus);
  const { refetch } = useOrganizationAccess();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingContract, setLoadingContract] = useState(true);
  const [uploadingContract, setUploadingContract] = useState(false);
  const token = useSelector((state) => state?.auth?.token);


  const [adminContract, setAdminContract] = useState(null);
  const [information, setInformation] = useState('');


  const [uploadedContract, setUploadedContract] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const submitRequest = () => {
    axios.get(`${uri}/contracts/submit-contract-request`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
      .then((res) => {
        showToastOrAlert(res?.data?.message)
      })
      .catch((err) => {

        handleError(err, t)
      })
      .finally(() => {
        setSending(false)
        loadContractData();
      })
  }
  const submitInformationForRequest = () => {
    axios.post(`${uri}/contracts/submit-information-for-request`, { information: information }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
      .then((res) => {
        showToastOrAlert(res?.data?.message)
      })
      .catch((err) => {

        handleError(err, t)
      })
      .finally(() => {
        setSending(false)
        loadContractData();
      })
  }

  const toJalaliDate = (dateString) => {
    try {
      if (!dateString) return '';

      const date = new Date(dateString);


      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString;
      }

      const jalaaliDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());


      const year = jalaaliDate.jy.toString();
      const month = jalaaliDate.jm.toString().padStart(2, '0');
      const day = jalaaliDate.jd.toString().padStart(2, '0');


      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const jalaliDateStr = `${year}/${month}/${day}`;

      return jalaliDateStr.replace(/[0-9]/g, (digit) => persianNumbers[parseInt(digit)]);
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    loadContractData();
  }, []);

  // بارگذاری اطلاعات قرارداد از سرور
  const loadContractData = async () => {
    try {
      setLoadingContract(true);

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
          status: contract.status,
          need_docs: contract.need_docs,
          reject_reason: contract.reject_reason,
          reject_contract_reason: contract.reject_contract_reason,
          file_url: contract.contract_file_path,
          title: contract.title,
          signed_contract_file_path: contract.signed_contract_file_path,
          status_label: contract.status_label,
          file_name: t("Contract file"),
          uploaded_by_admin_at: toJalaliDate(contract.uploaded_by_admin_at),
          uploaded_at: toJalaliDate(contract.uploaded_at),
        });
        setInformation(contract?.information)

      }

    } catch (error) {
      if (error.response?.status === 403) {
      } else if (error.response?.status === 404) {
        // هیچ قراردادی یافت نشد - این عادی است

        setAdminContract(null);
      } else {
        showAlert(t('Error'), error.response?.data?.message || t('Error loading contract information.'));
      }
    } finally {
      setLoadingContract(false);
      setRefreshing(false);
    }
  };

  // دانلود قرارداد ادمین
  const handleDownloadAdminContract = async () => {
    try {
      if (!adminContract || !adminContract.file_url) {
        showAlert(t('Error'), t('Contract file is not available.'));
        return;
      }

      const supported = await Linking.canOpenURL(`${imageUri}/${adminContract.file_url}`);

      if (supported) {
        await Linking.openURL(`${imageUri}/${adminContract.file_url}`);
      } else {
        showAlert(t('Error'), t('Unable to open the link.'));
      }
    } catch (error) {
      showAlert(t('Error'), t('Error downloading contract.'));
    }
  };

  // انتخاب فایل قرارداد امضا شده
  const handlePickDocument = async () => {


    try {
      // بررسی امکان آپلود
      if (uploadedContract && uploadedContract.status === 'approved') {
        showAlert(t('Attention'), t('You already have an approved contract and re-upload is not allowed.'));
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
          showAlert(t('Error'), t('File size must not exceed 500 MB.'));
          return;
        }

        // Check file type
        if (file.mimeType !== 'application/pdf') {
          showAlert(t('Error'), t('Only PDF files are allowed.'));
          return;
        }

        // 🌐 در وب، باید File object واقعی رو هم ذخیره کنیم
        if (Platform.OS === 'web' && file.file) {
          setSelectedFile({
            ...file,
            file: file.file // File object واقعی برای آپلود
          });
        } else {
          setSelectedFile(file);
        }

        showAlert(t('Success'), t('File {{name}} selected', { name: file.name }));
      } else {
      }
    } catch (error) {

      showAlert(t('Error'), `${t('Error selecting file')}: ${error.message}`);
    }
  };

  // آپلود قرارداد امضا شده
  const handleUploadContract = async () => {

    try {
      if (!selectedFile) {
        showAlert(t('Error'), t('Please select a signed contract file first.'));
        return;
      }

      setUploadingContract(true);

      if (!token) {
        console.log('❌ No token found');
        showAlert(t('Error'), t('Please log in first.'));
        setUploadingContract(false);
        return;
      }

      const formData = new FormData();

      // 🌐 Platform-specific file handling
      if (Platform.OS === 'web') {
        // در وب، selectedFile.file یک File object واقعی است 

        // بررسی وجود file object
        if (selectedFile.file) {
          formData.append('contract_file', selectedFile.file, selectedFile.name);
        } else if (selectedFile.uri) {
          // fallback: اگر file object نداریم، از uri استفاده می‌کنیم (fetch blob) 
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          formData.append('contract_file', blob, selectedFile.name || 'contract.pdf');
        } else {
          throw new Error(t('Invalid file.'));
        }
      } else {
        // در React Native، از uri استفاده می‌کنیم 
        const fileData = {
          uri: selectedFile.uri,
          type: 'application/pdf',
          name: selectedFile.name || 'contract.pdf',
        };
        formData.append('contract_file', fileData);
      }

      const uploadUrl = `${uri}/organization/contracts/upload`;

      // 🌐 Headers - در وب نباید Content-Type دستی تنظیم بشه
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // فقط در React Native باید Content-Type تنظیم بشه
      if (Platform.OS !== 'web') {
        headers['Content-Type'] = 'multipart/form-data';
      }


      const response = await axios.post(uploadUrl, formData, {
        headers,
        timeout: 30000, // 30 second timeout
      });


      if (response.data.success) {

        // 🔥 آپدیت Redux state - قرارداد الان pending هست
        dispatch(updateContractStatus('pending'));

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
                await new Promise(resolve => setTimeout(resolve, 1000));

                await loadContractData(); // Reload data

                await refetch(); // 🔥 آپدیت کامل وضعیت از API (هم پروفایل هم قرارداد) 
              }
            }
          ]
        );
      }

    } catch (error) {

      if (error.response?.status === 400) {
        showAlert(t('Error'), error.response.data.message || t('You already have an approved contract and re-upload is not allowed.'));
      } else if (error.response?.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        showAlert(t('Validation error'), errorMessages);
      } else if (error.response?.status === 404) {
        showAlert(t('Error'), t('Organization information not found.'));
      } else if (error.response?.status === 401) {
        showAlert(t('Error'), t('Authentication failed. Please log in again.'));
      } else if (error.response?.status === 413) {
        showAlert(t('Error'), t('File size exceeds the allowed limit.'));
      } else if (error.code === 'ECONNABORTED') {
        showAlert(t('Error'), t('Request timed out. Please try again.'));
      } else if (error.message.includes('Network Error')) {
        showAlert(t('Error'), t('Error connecting to server. Please check your internet connection'));
      } else {
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


  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Organization contract')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadContractData()
            }}
          />}
        >
          {/* توضیحات */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color={themeColor0.bgColor(1)} />
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

            {adminContract?.file_url ? (
              <View style={styles.contractCard}>
                <View style={styles.contractInfo}>
                  <Ionicons name="document" size={40} color={themeColor1.bgColor(1)} />
                  <View style={styles.contractDetails}>
                    {adminContract.title &&<Text style={styles.contractFileName}>{adminContract.title}</Text>}
                    <Text style={styles.contractFileName}>{adminContract.file_name}</Text>
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
              <View style={[styles.emptyCard, (adminContract?.status == '2' || adminContract?.status == '4') && { backgroundColor: themeColor6.bgColor(0.2), borderColor: themeColor6.bgColor(1), borderWidth: 1 }]}>
                {/* <Ionicons name="document-outline" size={60} color="#ccc" /> */}
                {/* <Text style={styles.emptyText}>{t('The contract has not been uploaded yet.')}</Text> */}
                {!adminContract &&
                  <>
                    <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                      {t("To enter into an organizational contract with the Loop platform, first submit a request.")}
                    </Text>
                    <Button
                      title={t("Submit request")}
                      loading={sending}
                      onPress={() => {
                        setSending(true);
                        submitRequest()
                      }}
                    />
                  </>}
                {
                  adminContract?.status == '0' && <>
                    <Text style={NewStyles.text10}>{t("Your contract request has been registered and is being reviewed.")}</Text>
                  </>
                }
                {
                  (adminContract?.status == '1' && adminContract?.need_docs) && <>
                    <Text style={NewStyles.text10}>{t("Your contract request has been approved.Please submit the requested information to prepare the contract file.")}</Text>
                    <Text style={NewStyles.text10}>{adminContract?.need_docs}</Text>
                    <TextInput
                      value={information}
                      style={[NewStyles.textInput, NewStyles.text10, { minHeight: 80, marginTop: 10 }, NewStyles.border10]}
                      multiline={true}
                      textAlignVertical='top'
                      verticalAlign='top'
                      placeholderTextColor={themeColor3.bgColor(1)}
                      placeholder={t('Information requested')}
                      onChangeText={(text) => {
                        setInformation(text)
                      }}
                    />
                    <Button
                      loading={sending}
                      onPress={() => {
                        if (information) {

                          setSending(true)
                          submitInformationForRequest()
                        } else {
                          showToastOrAlert(t('Please enter the requested information first.'))
                        }
                      }}
                      title={t("Send information")}
                    />
                  </>
                }
                {
                  (adminContract?.status == '2' || adminContract?.status == '4') &&
                  <>

                    <Text style={[NewStyles.title6, { textAlign: 'center' }]}>{adminContract?.status == '2' ? t('Your request was rejected for the following reason:') : t('The contract was rejected for the following reason:')}</Text>
                    <Text style={NewStyles.text6}>{adminContract?.status == '2' ? adminContract?.reject_reason : adminContract?.reject_contract_reason}</Text>
                  </>
                }
              </View>
            )}
          </View>

          {/* آپلود قرارداد امضا شده */}
          <View style={styles.section}>
            {(!adminContract?.signed_contract_file_path && adminContract?.file_url && adminContract?.status == '1') && <View style={styles.sectionHeader}>
              <Ionicons name="cloud-upload-outline" size={24} color={themeColor4.bgColor(1)} />
              <Text style={styles.sectionTitle}>{t('Upload signed contract')}</Text>
            </View>}

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
            {(!adminContract?.signed_contract_file_path && adminContract?.file_url && adminContract?.status == '1') && <View style={styles.uploadActions}>
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


              {
                selectedFile &&
                <View style={{ flex: 1 }}>
                  <Button
                    onPress={handleUploadContract}
                    loading={uploadingContract}
                    title={uploadingContract ? t('Uploading...') : t('Send')}
                  />
                </View>
              }
            </View>}

            {/* قرارداد آپلود شده قبلی */}
            {adminContract?.signed_contract_file_path && (
              <View style={styles.uploadedSection}>
                <Text style={styles.uploadedLabel}>{t('Uploaded contract:')}</Text>
                <View style={[
                  styles.uploadedCard,
                  (adminContract.status == '3' || adminContract.status == '1') && styles.uploadedCardApproved,
                  (adminContract.status == '2' || adminContract.status == '4') && styles.uploadedCardRejected,
                ]}>
                  <View style={styles.uploadedInfo}>
                    <Ionicons
                      name={
                        (adminContract.status == '3' || adminContract.status == '1') ? 'checkmark-circle' :
                          (adminContract.status == '2' || adminContract.status == '4') ? 'close-circle' :
                            'time-outline'
                      }
                      size={30}
                      color={
                        (adminContract.status == '3' || adminContract.status == '1') ? '#4caf50' :
                          (adminContract.status == '2' || adminContract.status == '4') ? '#f44336' :
                            '#ff9800'
                      }
                    />
                    <View style={styles.uploadedDetails}>
                      <Text style={styles.uploadedFileName}>{adminContract.file_name}</Text>
                      <Text style={styles.uploadedDate}>
                        {t('Upload date:')} {adminContract.uploaded_at}
                      </Text>
                      {adminContract.reviewed_at && (
                        <Text style={styles.uploadedDate}>
                          {t('Review date')}: {adminContract.reviewed_at}
                        </Text>
                      )}
                      <Text style={[
                        styles.uploadedStatus,
                        (adminContract.status == '3' || adminContract.status == '1') && styles.statusApproved,
                        (adminContract.status == '2' || adminContract.status == '4') && styles.statusRejected,
                        adminContract.status == '0' && styles.statusPending,
                      ]}>
                        {t('Status')}: {adminContract.status_label}
                      </Text>

                      {/* نمایش دلیل رد */}
                      {adminContract.status === '2' && adminContract.reject_reason && (
                        <View style={styles.rejectionBox}>
                          <Text style={styles.rejectionTitle}>{t('Rejection reason')}</Text>
                          <Text style={styles.rejectionText}>{adminContract.reject_reason}</Text>
                        </View>
                      )}

                      {/* دکمه دانلود قرارداد آپلود شده */}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewUploadedBtn}
                    onPress={() => Linking.openURL(`${imageUri}/${adminContract.signed_contract_file_path}`)}
                  >
                    <Ionicons name="eye-outline" size={18} color={themeColor1.bgColor(1)} />
                    <Text style={styles.viewUploadedBtnText}>{t('View uploaded file')}</Text>
                  </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </View>
  );
};

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
    ...NewStyles.text10,
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',

  },

  // Info Box
  infoBox: {
    ...NewStyles.row,
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    ...NewStyles.text10,
    lineHeight: 22,
    writingDirection: 'rtl',
  },

  // Section
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    ...NewStyles.row,
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: '#333',
    marginRight: 8,
    ...NewStyles.text10,
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
    ...NewStyles.row,
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
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },
  contractDate: {
    fontSize: 13,
    ...NewStyles.text10,
    ...NewStyles.row,
  },
  contractActions: {
    marginTop: 10,
  },
  downloadBtn: {
    ...NewStyles.row,
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
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#999',
    ...NewStyles.text3,
    writingDirection: 'rtl',
  },

  // Selected File Card
  selectedFileCard: {
    ...NewStyles.row,
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
    ...NewStyles.row,
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
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: '#666',
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },

  // Upload Actions
  uploadActions: {
    ...NewStyles.row,
    gap: 10,
    marginBottom: 15,
  },
  selectFileBtn: {
    flex: 1,
    ...NewStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 50,
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
    ...NewStyles.row,
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
    ...NewStyles.text10,
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
    ...NewStyles.row,
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
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },
  uploadedDate: {
    fontSize: 12,
    marginBottom: 4,
    ...NewStyles.text10,
  },
  uploadedStatus: {
    fontSize: 13,
    fontFamily: 'VazirBold',
    ...NewStyles.text10,
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
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },
  rejectionText: {
    fontSize: 13,
    fontFamily: 'VazirLight',
    color: '#666',
    ...NewStyles.text10,
    lineHeight: 20,
    writingDirection: 'rtl',
  },

  // View Uploaded Button
  viewUploadedBtn: {
    ...NewStyles.row,
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
    ...NewStyles.text10,
    writingDirection: 'rtl',
  },
  helpText: {
    fontSize: 13,
    fontFamily: 'VazirLight',
    color: '#666',
    marginBottom: 6,
    ...NewStyles.text10,
    lineHeight: 20,
    writingDirection: 'rtl',
  },
});

export default OrganizationContract;

