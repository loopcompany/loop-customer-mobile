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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import jalaali from 'jalaali-js';
import { useDispatch, useSelector } from 'react-redux';
import { updateContractStatus } from '@slices/organizationSlice';
import { useOrganizationAccess } from '@hooks/useOrganizationAccess';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import NewStyles from '@styles/NewStyles';
import { handleError, showAlert, showToastOrAlert } from '@helpers/Common';
import { themeColor0, themeColor1, themeColor10, themeColor11, themeColor12, themeColor13, themeColor14, themeColor2, themeColor3, themeColor4, themeColor6 } from '@theme/Color';
import { imageUri, uri } from '@services/URL';
import Button from '@components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deletingGalleryId, setDeletingGalleryId] = useState(null);

  const token = useSelector((state) => state?.auth?.token);
  const handleDeleteGalleryItem = async (galleryId) => {
    try {
      setDeletingGalleryId(galleryId);

      const res = await axios.post(
        `${uri}/contracts/delete-gallery`,
        {
          gallery_id: galleryId,
          contract_request_id: adminContract?.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      showToastOrAlert(res?.data?.message || t('File deleted successfully.'));

      setGallery((prev) => prev.filter((item) => item.id !== galleryId));
    } catch (err) {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
      handleError(err, t);
    } finally {
      setDeletingGalleryId(null);
    }
  };


  const handlePickInformationFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFiles(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      showAlert(t('Error'), error.message);
    }
  };
  const [adminContract, setAdminContract] = useState(null);
  const [information, setInformation] = useState('');
  const [gallery, setGallery] = useState([]);


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
  const submitInformationForRequest = async () => {
    try {
      setSending(true);

      const formData = new FormData();

      formData.append('information', information);

      // اضافه کردن فایل‌ها
      selectedFiles.forEach((file, index) => {
        if (Platform.OS === 'web') {
          formData.append('files[]', file.file || file, file.name);
        } else {
          formData.append('files[]', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name || `file_${index}`,
          });
        }
      });

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      if (Platform.OS !== 'web') {
        headers['Content-Type'] = 'multipart/form-data';
      }

      const res = await axios.post(
        `${uri}/contracts/submit-information-for-request`,
        formData,
        { headers }
      );

      showToastOrAlert(res?.data?.message);
      setSelectedFiles([]);
      setInformation('');
      loadContractData();

    } catch (err) {
      handleError(err, t);
    } finally {
      setSending(false);
    }
  };

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

  // بارگذاری اطلاعات توافق نامه از سرور
  const loadContractData = async () => {
    try {
      setLoadingContract(true);

      // دریافت آخرین توافق نامه عمومی
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
        setGallery(contract?.gallery || [])

      }

    } catch (error) {
      if (error.response?.status === 403) {
      } else if (error.response?.status === 404) {
        // هیچ توافق نامهی یافت نشد - این عادی است

        setAdminContract(null);
      } else {
        showAlert(t('Error'), error.response?.data?.message || t('Error loading contract information.'));
      }
    } finally {
      setLoadingContract(false);
      setRefreshing(false);
    }
  };

  // دانلود توافق نامه ادمین
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

  // انتخاب فایل توافق نامه امضا شده
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

  // آپلود توافق نامه امضا شده
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

        // 🔥 آپدیت Redux state - توافق نامه الان pending هست
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

                // صبر می‌کنیم تا سرور توافق نامه رو ثبت کنه 
                await new Promise(resolve => setTimeout(resolve, 1000));

                await loadContractData(); // Reload data

                await refetch(); // 🔥 آپدیت کامل وضعیت از API (هم پروفایل هم توافق نامه) 
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
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <CustomStatusBar />
      <ScreenHeaders title={t("Government/organization")} />
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
          <View style={[{ width: '100%', backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, marginBottom: 10 }, NewStyles.border10, NewStyles.center]}>
            <View style={[NewStyles.row, { gap: 10 }]}>
              <Image
                source={require('@assets/images/upload.png')}
                style={{ width: 40, height: 40, }}
              />
              <Text style={NewStyles.title4}>{t("Organization contract")}</Text>
            </View>

            <Ionicons
              name={"chevron-down"}
              size={24}
              color={themeColor1.bgColor(1)}
            />
          </View>
          <TouchableOpacity style={[{ width: '95%', alignSelf: 'center', backgroundColor: themeColor4.bgColor(1) }, NewStyles.border10]} onPress={() => {
            navigation.navigate("OrganizationTermsScreen")
          }}>
            <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ paddingVertical: 10, width: '100%' }, NewStyles.border10, NewStyles.center]}>
              <Text style={[NewStyles.title10, { fontSize: 13, textAlign: 'center' }]}>{t("Terms and Conditions of the Organizational/Corporate Agreement")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.section}>


            {adminContract?.file_url ? (

              <TouchableOpacity
                style={[styles.downloadBtn, NewStyles.border10]}
                onPress={handleDownloadAdminContract}
              >
                <LinearGradient style={[{
                  width: '100%', paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderWidth: 1, borderColor: '#a0c1e9', borderBottomWidth: 3, borderBottomColor: '#a0c1e9',
                }, NewStyles.border10]} colors={[themeColor4.bgColor(1), '#bbcee5']}>

                  <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{t('Preview of the contract')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.emptyCard, (adminContract?.status == '2' || adminContract?.status == '4') && { backgroundColor: themeColor6.bgColor(0.2), borderColor: themeColor6.bgColor(1), borderWidth: 1 }]}>
                {/* <Ionicons name="document-outline" size={60} color="#ccc" /> */}
                {/* <Text style={styles.emptyText}>{t('The contract has not been uploaded yet.')}</Text> */}
                {!adminContract &&

                  <TouchableOpacity style={[{ width: '95%', alignSelf: 'center', backgroundColor: themeColor4.bgColor(1) }, NewStyles.border10]} onPress={() => {
                    setSending(true);
                    submitRequest()
                  }}>
                    <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ paddingVertical: 10, width: '100%' }, NewStyles.border10, NewStyles.center]}>
                      {sending ? <ActivityIndicator size={'small'} color={themeColor10.bgColor(1)} /> : <Text style={[NewStyles.title10, { fontSize: 13, textAlign: 'center' }]}>{t("Sample contract")}</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                }
                {
                  adminContract?.status == '0' && <>
                    <Text style={NewStyles.text10}>{t("Your contract request has been registered and is being reviewed.")}</Text>
                  </>
                }
                {
                  (adminContract?.status == '1' && adminContract?.need_docs) && <>
                    <Text style={[NewStyles.title10, { textAlign: 'center', fontSize: 12 }]}>{adminContract?.need_docs}</Text>
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
                    <TouchableOpacity style={[{ width: '100%', alignSelf: 'center', backgroundColor: themeColor4.bgColor(1), marginTop: 10 }, NewStyles.border10]} onPress={() => {
                      handlePickInformationFiles()
                    }}>
                      <LinearGradient colors={[themeColor4.bgColor(1), themeColor4.bgColor(1)]} style={[{ paddingVertical: 10, width: '100%', gap: 5 }, NewStyles.border10, NewStyles.center, NewStyles.row]}>
                        <Ionicons
                          name={'cloud-upload'}
                          size={20}
                          color={themeColor10.bgColor(1)}
                        />
                        {<Text style={[NewStyles.title10, { fontSize: 12, textAlign: 'center' }]}>{t("Upload comprehensive information/requests/edit contract")}</Text>}
                      </LinearGradient>
                    </TouchableOpacity>




                    {selectedFiles.length > 0 && (
                      <View style={{ marginTop: 10 }}>
                        {selectedFiles.map((file, index) => (
                          <View key={index} style={styles.selectedFileCard}>
                            <Text style={styles.fileName}>{file.name}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedFiles(prev =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <Ionicons name="close-circle" size={22} color="red" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity disabled={sending} style={[{ width: '95%', alignSelf: 'center', backgroundColor: themeColor4.bgColor(1), marginTop: 10 }, NewStyles.border10]} onPress={() => {
                      if (information) {

                        setSending(true)
                        submitInformationForRequest()
                      } else {
                        showToastOrAlert(t('Please enter the requested information first.'))
                      }
                    }}>
                      <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ paddingVertical: 10, width: '100%' }, NewStyles.border10, NewStyles.center]}>
                        {sending ? <ActivityIndicator size={'small'} color={themeColor10.bgColor(1)} /> : <Text style={[NewStyles.title10, { fontSize: 13, textAlign: 'center' }]}>{t("Completion of information / issuance of a specific contract")}</Text>}
                      </LinearGradient>
                    </TouchableOpacity>

                    {gallery?.length > 0 && (
                      <View style={styles.gallerySection}>
                        <Text style={NewStyles.title}>{t('Uploaded attachments')}</Text>

                        {gallery.map((item) => {
                          const fileUrl = `${imageUri}/${item.file_path}`;
                          const fileName = item.file_path?.split('/').pop() || t('File');

                          return (
                            <View key={item.id} style={styles.galleryItemCard}>
                              <View style={styles.galleryItemInfo}>
                                <Ionicons
                                  name={
                                    item.file_path?.toLowerCase().endsWith('.pdf')
                                      ? 'document-text-outline'
                                      : 'image-outline'
                                  }
                                  size={24}
                                  color={themeColor0.bgColor(1)}
                                />

                                <View style={styles.galleryItemTextWrap}>
                                  <Text numberOfLines={1} style={styles.galleryItemName}>
                                    {fileName}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.galleryItemActions}>
                                <TouchableOpacity
                                  style={styles.galleryActionBtn}
                                  onPress={() => Linking.openURL(fileUrl)}
                                >
                                  <Ionicons name="eye-outline" size={18} color={themeColor0.bgColor(1)} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.galleryActionBtn, styles.galleryDeleteBtn]}
                                  disabled={deletingGalleryId === item.id}
                                  onPress={() => {
                                    showAlert(
                                      t('Delete file'),
                                      t('Are you sure you want to delete this file?'),
                                      [
                                        { text: t('Cancel'), style: 'cancel' },
                                        {
                                          text: t('Delete'),
                                          style: 'destructive',
                                          onPress: () => handleDeleteGalleryItem(item.id),
                                        },
                                      ]
                                    );
                                  }}
                                >
                                  {deletingGalleryId === item.id ? (
                                    <ActivityIndicator size="small" color="#f44336" />
                                  ) : (
                                    <Ionicons name="trash-outline" size={18} color="#f44336" />
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
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

          {/* آپلود توافق نامه امضا شده */}
          <View style={styles.section}>


            {/* فایل انتخاب شده */}
            {selectedFile && (
              <View style={[styles.selectedFileCard, { width: '95%', alignSelf: 'center' }]}>
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
            {(!adminContract?.sgned_contract_file_path && adminContract?.file_url && adminContract?.status == '1') &&
              <View  >
                <TouchableOpacity
                  style={[styles.downloadBtn, NewStyles.border10]}
                  onPress={handlePickDocument}
                  disabled={uploadingContract}
                >
                  <LinearGradient style={[{
                    width: '100%', paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderWidth: 1, borderColor: '#a0c1e9', borderBottomWidth: 3, borderBottomColor: '#a0c1e9',
                  }, NewStyles.border10]} colors={[themeColor4.bgColor(1), '#bbcee5']}>
                    <Text style={[NewStyles.title10, { textAlign: 'center' }]}>
                      {selectedFile ? t('Change file') : t('Upload the signed contract')}
                    </Text>
                  </LinearGradient>
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

            {/* توافق نامه آپلود شده قبلی */}
            {adminContract?.signed_contract_file_path && (
              <View style={styles.uploadedSection}>
                <Text style={styles.uploadedLabel}>{t('Uploaded contract:')}</Text>
                <View style={[
                  styles.uploadedCard,
                  (adminContract.status == '3' || adminContract.status == '1') && styles.uploadedCardApproved,
                  (adminContract.status == '2' || adminContract.status == '4') && styles.uploadedCardRejected,
                ]}>
                  <View style={styles.uploadedInfo}>

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

                      {/* دکمه دانلود توافق نامه آپلود شده */}
                    </View>
                  </View>


                  <TouchableOpacity
                    style={[styles.downloadBtn, NewStyles.border10]}
                    onPress={() => Linking.openURL(`${imageUri}/${adminContract.signed_contract_file_path}`)}
                  >
                    <LinearGradient style={[{
                      width: '100%', paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderWidth: 1, borderColor: '#a0c1e9', borderBottomWidth: 3, borderBottomColor: '#a0c1e9',
                    }, NewStyles.border10]} colors={[themeColor4.bgColor(1), '#bbcee5']}>
                      <Text style={[NewStyles.title10, { textAlign: 'center' }]}>
                        {t('View uploaded file')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>


                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    marginTop: 10

  },



  // Empty Card
  emptyCard: {
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10
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
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#ff9800',
  },
  uploadedCardApproved: {
    borderRightColor: '#4caf50',
  },
  uploadedCardRejected: {
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
    ...NewStyles.text3,
    lineHeight: 20,
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
    ...NewStyles.text,
    marginRight: 8,
  },

  // Help Box
  helpBox: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderRightWidth: 4,
    borderRightColor: themeColor11.bgColor(1),
  },
  helpTitle: {
    ...NewStyles.title3,
    marginBottom: 10,
    ...NewStyles.text10,
  },
  helpText: {
    ...NewStyles.text3,
    fontSize: 13,
    marginBottom: 6,
    ...NewStyles.text10,
    lineHeight: 20,
  },
  gallerySection: {
    marginTop: 15,
    width: '100%',
  },

  galleryTitle: {
    ...NewStyles.title3,
    marginBottom: 10,
    ...NewStyles.text10,
  },

  galleryItemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    ...NewStyles.rowWrapper,
  },

  galleryItemInfo: {
    flex: 1,
    ...NewStyles.row,
  },

  galleryItemTextWrap: {
    flex: 1,
    marginRight: 10,
  },

  galleryItemName: {
    ...NewStyles.text3,
    fontSize: 13,
  },

  galleryItemActions: {
    ...NewStyles.row,
    gap: 8,
    marginLeft: 10,
  },

  galleryActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor0.bgColor(0.3),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  galleryDeleteBtn: {
    borderColor: themeColor6.bgColor(1),
  },

});

export default OrganizationContract;

