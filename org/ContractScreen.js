import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1 } from '../theme/Color';
import ScreenTitle from '../components/ScreenTitle';
import CustomStatusBar from '../components/CustomStatusBar';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import { SafeAreaView } from 'react-native-safe-area-context';

const ContractScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      if (result.type === 'success') {
        setSelectedFile(result);
      }
    } catch (e) {
      console.warn('document pick error', e);
    }
  };

  return (
    <SafeAreaView edges={{top:'off', bottom:'off'}} style={[NewStyles.container]}>
      <ScreenHeaders
        title="سازمانی / دولتی"
      />
      <ScrollView>
        <CustomStatusBar />
        {/* هدر استاندارد با ScreenHeaders */}
        {/* بلوک آبی عنوان توافق نامه */}
        <View style={[NewStyles.center, { width: '95%', alignSelf: 'center', marginTop: 10, backgroundColor: themeColor0.bgColor(1), borderRadius: 16, marginBottom: 10, paddingVertical: 12 }]}>
          <Text style={[NewStyles.title1, { color: '#fff', fontSize: 18 }]}>توافق نامه</Text>

        </View>
        {/* دکمه قوانین و شرایط */}
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#e0f2f1', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>قوانین و شرایط توافق نامه سازمانی / شرکتی</Text>
        </TouchableOpacity>
        {/* دکمه نمونه توافق نامه */}
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#b2e0c7', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>نمونه توافق نامه معین</Text>
        </TouchableOpacity>
        {/* راهنمای زرد */}
        <TouchableOpacity onPress={pickDocument} style={[NewStyles.center, { width: '95%', alignSelf: 'center', backgroundColor: '#ffe600', borderRadius: 8, marginBottom: 10, paddingVertical: 6 }]}>
          <Text style={[NewStyles.text3, { fontWeight: 'bold', fontSize: 13 }]}>بارگذاری اطلاعات جامع / درخواست ها / ویرایش توافق نامه</Text>
        </TouchableOpacity>
        {selectedFile ? (
          <View style={[NewStyles.center, { width: '95%', alignSelf: 'center', marginBottom: 10 }]}>
            <Text style={[NewStyles.text3, { fontSize: 13 }]}>فایل انتخاب شده: {selectedFile.name}</Text>
          </View>
        ) : null}
        {/* توضیحات راهنما */}
        <View style={[NewStyles.center, { width: '95%', alignSelf: 'center', marginBottom: 10 }]}>
          <Text style={[NewStyles.text3, { fontSize: 13, textAlign: 'right' }]}>نامه / اطلاعات جامع / درخواست های خود را با سربرگ مهر و امضاء شده با موضوع (توافق نامه معین / ویرایش توافق نامه) بارگذاری نمایید</Text>
        </View>
        {/* دکمه‌های اصلی */}
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#e0f2f1', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>تکمیل اطلاعات / صدور توافق نامه معین</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#e0f2f1', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>پیش نمایش توافق نامه معین</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#e0f2f1', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>صدور توافق نامه معین</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[NewStyles.button, NewStyles.shadow, { width: '95%', alignSelf: 'center', backgroundColor: '#e0f2f1', borderRadius: 12, marginBottom: 8, paddingVertical: 10 }]}>
          <Text style={[NewStyles.title, { color: themeColor0.bgColor(1), fontSize: 15 }]}>نمایش / ذخیره توافق نامه معین</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* فوتر استاندارد */}

    </SafeAreaView>
  );
};

export default ContractScreen;