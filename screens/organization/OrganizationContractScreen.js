import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomStatusBar from '../../components/CustomStatusBar';
import ScreenHeaders from '../../components/ScreenHeaders';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { showAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor2, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, themeColor10, themeColor11, themeColor14 } from '../../theme/Color';
import { NewStyles } from '../../styles/NewStyles';
import { uri } from '../../services/URL';

/**
 * صفحه مدیریت توافق نامه کاربران سازمانی
 */
const OrganizationContractScreen = () => {
  const navigation = useNavigation();
  const { token } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  /**
   * دریافت اطلاعات توافق نامه از سرور
   */
  const fetchContract = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${uri}/organization/contract`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        setContractData(data);
        setContractStatus(data.status);
      } else {
        showAlert('خطا', response.data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);

      if (error.response?.status === 401) {
        showAlert('خطا', 'لطفا مجدداً وارد شوید');
      } else if (error.response?.status === 404) {
        // هنوز توافق نامهی آپلود نشده
        setContractStatus('not_uploaded');
      } else {
        showAlert('خطا', 'خطا در دریافت اطلاعات توافق نامه');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * دانلود فایل توافق نامه نمونه
   */
  const downloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);

      const response = await axios.get(`${uri}/organization/contract/template`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success && response.data.data.template_url) {
        const templateUrl = response.data.data.template_url;

        // باز کردن لینک در مرورگر
        const supported = await Linking.canOpenURL(templateUrl);
        if (supported) {
          await Linking.openURL(templateUrl);
        } else {
          showAlert('خطا', 'امکان باز کردن لینک وجود ندارد');
        }
      } else {
        showAlert('خطا', 'خطا در دریافت فایل نمونه');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showAlert('خطا', 'خطا در دانلود فایل نمونه');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  /**
   * انتخاب فایل توافق نامه
   */
  const selectFile = async () => {
    console.log('🔵 selectFile function called!'); // چک می‌کنیم تابع اصلاً صدا زده میشه یا نه

    try {
      console.log('🟢 Opening document picker...');

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('📁 Document Picker Result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        console.log('📄 Selected file:', {
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri
        });

        // بررسی حجم فایل (حداکثر 10 مگابایت)
        if (file.size > 10 * 1024 * 1024) {
          console.log('❌ File too large:', file.size);
          showAlert('خطا', 'حجم فایل نباید از 10 مگابایت بیشتر باشد');
          return;
        }

        // بررسی نوع فایل
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        console.log('🔍 Checking mimeType:', file.mimeType, 'against allowed types:', allowedTypes);

        if (!allowedTypes.includes(file.mimeType)) {
          console.log('❌ Invalid mimeType:', file.mimeType);
          showAlert('خطا', `فقط فایل‌های PDF و تصاویر مجاز هستند\n\nنوع فایل شما: ${file.mimeType}`);
          return;
        }

        console.log('✅ File validation passed, setting selectedFile');
        setSelectedFile(file);
        showAlert('موفقیت', `فایل "${file.name}" انتخاب شد`);
      } else {
        console.log('⚠️ File selection canceled or no file selected');
        console.log('Result details:', {
          canceled: result.canceled,
          hasAssets: !!result.assets,
          assetsLength: result.assets?.length
        });
      }
    } catch (error) {
      console.error('❌ Error selecting file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      showAlert('خطا', 'خطا در انتخاب فایل: ' + error.message);
    }
  };

  /**
   * آپلود توافق نامه
   */
  const uploadContract = async () => {
    if (!selectedFile) {
      showAlert('خطا', 'لطفا ابتدا فایل توافق نامه را انتخاب کنید');
      return;
    }

    try {
      setUploading(true);

      // ایجاد FormData
      const formData = new FormData();
      formData.append('contract', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.name,
      });

      const response = await axios.post(`${uri}/organization/contract`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 60000, // 60 ثانیه timeout
      });

      if (response.data.success) {
        setContractStatus('pending');
        setSelectedFile(null);

        showAlert('موفقیت', 'توافق نامه شما با موفقیت آپلود شد و در انتظار تایید است', [
          {
            text: t("Ok"),
            onPress: () => fetchContract() // بارگذاری مجدد اطلاعات
          }
        ]);
      } else {
        showAlert('خطا', response.data.message || 'خطا در آپلود توافق نامه');
      }
    } catch (error) {
      console.error('Error uploading contract:', error);

      if (error.response?.status === 422) {
        showAlert('خطا', 'فایل انتخابی معتبر نیست');
      } else if (error.response?.status === 413) {
        showAlert('خطا', 'حجم فایل بیش از حد مجاز است');
      } else if (error.response?.status === 401) {
        showAlert('خطا', 'لطفا مجدداً وارد شوید');
      } else {
        showAlert('خطا', 'خطا در آپلود توافق نامه. لطفا اتصال اینترنت خود را بررسی کنید');
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * مشاهده توافق نامه آپلود شده
   */
  const viewContract = async () => {
    if (!contractData?.file_url) {
      showAlert('خطا', 'فایل توافق نامه موجود نیست');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(contractData.file_url);
      if (supported) {
        await Linking.openURL(contractData.file_url);
      } else {
        showAlert('خطا', 'امکان باز کردن فایل وجود ندارد');
      }
    } catch (error) {
      console.error('Error opening contract file:', error);
      showAlert('خطا', 'خطا در باز کردن فایل');
    }
  };

  /**
   * گرفتن رنگ وضعیت
   */
  const getStatusColor = () => {
    switch (contractStatus) {
      case 'approved': return themeColor7.color;
      case 'pending': return themeColor11.color;
      case 'rejected': return themeColor6.color;
      case 'not_uploaded': return themeColor3.color;
      default: return themeColor3.color;
    }
  };

  /**
   * گرفتن متن وضعیت
   */
  const getStatusText = () => {
    switch (contractStatus) {
      case 'approved': return 'تایید شده';
      case 'pending': return 'در انتظار بررسی';
      case 'rejected': return 'رد شده - نیاز به آپلود مجدد';
      case 'not_uploaded': return 'آپلود نشده';
      default: return 'نامشخص';
    }
  };

  /**
   * گرفتن آیکون وضعیت
   */
  const getStatusIcon = () => {
    switch (contractStatus) {
      case 'approved': return 'check-circle';
      case 'pending': return 'hourglass-empty';
      case 'rejected': return 'cancel';
      case 'not_uploaded': return 'cloud-upload';
      default: return 'help-outline';
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />
      <ScreenHeaders
        title="مدیریت توافق نامه"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* نمایش وضعیت فعلی */}
        <View style={[styles.statusContainer, { borderLeftColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            <Icon name={getStatusIcon()} size={32} color={getStatusColor()} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>وضعیت توافق نامه</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          {/* نمایش تاریخ آپلود */}
          {contractData?.uploaded_at && (
            <Text style={styles.uploadDate}>
              آپلود شده در: {new Date(contractData.uploaded_at).toLocaleDateString('fa-IR')}
            </Text>
          )}

          {/* نمایش دلیل رد */}
          {contractStatus === 'rejected' && contractData?.rejection_reason && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>دلیل رد:</Text>
              <Text style={styles.rejectionText}>{contractData.rejection_reason}</Text>
            </View>
          )}
        </View>

        {/* راهنمای توافق نامه */}
        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>راهنمای آپلود توافق نامه</Text>
          <View style={styles.guideSteps}>
            <View style={styles.guideStep}>
              <Icon name="download" size={20} color={themeColor0.color} />
              <Text style={styles.guideStepText}>
                1. فایل نمونه توافق نامه را دانلود کنید
              </Text>
            </View>
            <View style={styles.guideStep}>
              <Icon name="edit" size={20} color={themeColor0.color} />
              <Text style={styles.guideStepText}>
                2. توافق نامه را تکمیل و امضا کنید
              </Text>
            </View>
            <View style={styles.guideStep}>
              <Icon name="scanner" size={20} color={themeColor0.color} />
              <Text style={styles.guideStepText}>
                3. فایل را اسکن یا عکس‌برداری کنید
              </Text>
            </View>
            <View style={styles.guideStep}>
              <Icon name="cloud-upload" size={20} color={themeColor0.color} />
              <Text style={styles.guideStepText}>
                4. فایل را آپلود کنید
              </Text>
            </View>
          </View>
        </View>

        {/* دکمه دانلود فایل نمونه */}
        <Button
          title={downloadingTemplate ? 'در حال دانلود...' : 'دانلود فایل نمونه توافق نامه'}
          onPress={downloadTemplate}
          loading={downloadingTemplate}
          disabled={downloadingTemplate}
          backgroundColor={themeColor2.bgColor(1)}
          textColor={themeColor4.bgColor(1)}
          style={styles.downloadButton}
          iconName="download"
        />

        {/* انتخاب فایل */}
        {(contractStatus === 'not_uploaded' || contractStatus === 'rejected' || contractStatus === null) && (
          <>
            <View style={styles.uploadContainer}>
              <Text style={styles.uploadTitle}>آپلود توافق نامه</Text>

              {selectedFile ? (
                <View style={styles.selectedFileContainer}>
                  <Icon name="description" size={40} color={themeColor0.color} />
                  <View style={styles.selectedFileInfo}>
                    <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                    <Text style={styles.selectedFileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} مگابایت
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Icon name="close" size={24} color={themeColor6.color} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectFileButton} onPress={selectFile}>
                  <Icon name="folder-open" size={40} color={themeColor0.color} />
                  <Text style={styles.selectFileText}>انتخاب فایل توافق نامه</Text>
                  <Text style={styles.selectFileHint}>
                    فرمت‌های مجاز: PDF, JPG, PNG (حداکثر 10MB)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* دکمه آپلود - همیشه نمایش داده میشه */}
            <Button
              title={
                uploading ? 'در حال آپلود...' :
                  selectedFile ? 'آپلود توافق نامه' :
                    'ابتدا فایل را انتخاب کنید'
              }
              onPress={uploadContract}
              loading={uploading}
              disabled={uploading || !selectedFile}
              backgroundColor={selectedFile ? themeColor0.bgColor(1) : themeColor5.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
              style={styles.uploadButton}
            />
          </>
        )}

        {/* مشاهده توافق نامه آپلود شده */}
        {contractData && contractData.file_url && (
          <Button
            title="مشاهده توافق نامه آپلود شده"
            onPress={viewContract}
            backgroundColor={themeColor1.bgColor(1)}
            textColor={themeColor4.bgColor(1)}
            style={styles.viewButton}
            iconName="visibility"
          />
        )}

        {/* اطلاعات مهم */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>نکات مهم:</Text>
          <Text style={styles.infoText}>
            • توافق نامه باید به صورت کامل تکمیل و امضا شده باشد{'\n'}
            • کیفیت تصویر باید واضح و خوانا باشد{'\n'}
            • حجم فایل نباید از 10 مگابایت بیشتر باشد{'\n'}
            • پس از آپلود، توافق نامه توسط تیم بررسی می‌شود{'\n'}
            • در صورت رد، می‌توانید مجدداً آپلود کنید
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
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusInfo: {
    flex: 1,
    marginRight: 15,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Vazir-Light',
    color: themeColor3.color,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Vazir-Bold',
    textAlign: 'right',
    marginTop: 5,
  },
  uploadDate: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor3.color,
    textAlign: 'right',
    marginTop: 10,
  },
  rejectionContainer: {
    backgroundColor: themeColor6.bgColor(0.1),
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  rejectionTitle: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor6.color,
    textAlign: 'right',
    marginBottom: 8,
  },
  rejectionText: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor6.color,
    textAlign: 'right',
    lineHeight: 22,
  },
  guideContainer: {
    backgroundColor: themeColor14.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  guideTitle: {
    fontSize: 18,
    fontFamily: 'Vazir-Bold',
    color: themeColor10.color,
    textAlign: 'center',
    marginBottom: 20,
  },
  guideSteps: {
    gap: 15,
  },
  guideStep: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  guideStepText: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor10.color,
    marginRight: 12,
    flex: 1,
    textAlign: 'right',
  },
  downloadButton: {
    marginBottom: 25,
  },
  uploadContainer: {
    backgroundColor: themeColor5.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Vazir-Bold',
    color: themeColor10.color,
    textAlign: 'center',
    marginBottom: 20,
  },
  selectFileButton: {
    borderWidth: 2,
    borderColor: themeColor0.color,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    backgroundColor: themeColor4.bgColor(1),
  },
  selectFileText: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor0.color,
    marginTop: 10,
    textAlign: 'center',
  },
  selectFileHint: {
    fontSize: 12,
    fontFamily: 'Vazir-Light',
    color: themeColor3.color,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedFileContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    padding: 15,
  },
  selectedFileInfo: {
    flex: 1,
    marginRight: 15,
  },
  selectedFileName: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor10.color,
    textAlign: 'right',
  },
  selectedFileSize: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor3.color,
    textAlign: 'right',
    marginTop: 4,
  },
  uploadButton: {
    marginBottom: 20,
  },
  viewButton: {
    marginBottom: 25,
  },
  infoContainer: {
    backgroundColor: themeColor11.bgColor(0.1),
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor11.color,
    textAlign: 'right',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Vazir-Light',
    color: themeColor10.color,
    textAlign: 'right',
    lineHeight: 22,
  },
});

export default OrganizationContractScreen;