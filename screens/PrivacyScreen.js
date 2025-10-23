// screens/PrivacyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  I18nManager,
  Platform,
  Alert,
} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import Button from '../components/Button';
import { themeColor0, themeColor10, themeColor4, themeColor6 } from '../theme/Color';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';
// I18nManager.forceRTL(true);

export default function PrivacyScreen() {
  const navigation = useNavigation();

  const [birthDate, setBirthDate] = useState(new Date());
  const [captcha, setCaptcha] = useState('8699');
  const [showPicker, setShowPicker] = useState(false);
  const generateCaptcha = () => {
    const n = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(n);
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('خروج', 'شما از حساب کاربری خارج شدید');
    navigation.navigate('LoginScreen'); // تغییر بده اگه صفحه لاگینت چیز دیگه‌ایه
  };

  return (
    
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScreenHeaders title={"حریم خصوصی"}/>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <View style={styles.header}>
          <Image source={require('../assets/next.png')} style={styles.icon} />
          <Text style={[NewStyles.text10]}> حریم خصوصی</Text>
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </View> */}
  
        {/* آیکن دوربین و عنوان */}
        <View style={styles.header}>

          <Text style={[NewStyles.text10]}>پروفایل من</Text>

        </View>
        <View style={{ gap: 10 }}>
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="نام و نام خانوادگی *" />
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="شماره موبایل" keyboardType="phone-pad" />

          {/* تاریخ تولد */}
          <TouchableOpacity onPress={() => setShowPicker(true)} style={NewStyles.textInput}>
            <Text style={styles.dateText}>
              {birthDate.toLocaleDateString('fa-IR')}
            </Text>
          </TouchableOpacity>


          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="آدرس ایمیل" keyboardType="email-address" />
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="رمز عبور" secureTextEntry />

          {/* شماره ثابت */}
          <View style={styles.row}>
            <TextInput style={styles.prefixInput} value="021" editable={false} />
            <TextInput style={[NewStyles.textInput,NewStyles.border10, { flex: 1 }]} placeholder="شماره تماس موبایل" keyboardType="number-pad" />
          </View>

          {/* موبایل با پیش‌شماره */}
          <View style={styles.row}>
            <TextInput style={styles.prefixInput} value="09" editable={false} />
            <TextInput style={[NewStyles.textInput,NewStyles.border10,{ flex: 1 }]} placeholder="شماره تماس ثابت" keyboardType="number-pad" />
          </View>
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="کدپستی " secureTextEntry />

          {/* شهر و منطقه */}
          <View style={styles.row}>
            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { flex: 1 }]} placeholder="شهر " secureTextEntry />
            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { flex: 1 }]} placeholder="منطقه" secureTextEntry />
          </View>

          {/* آدرس منزل */}
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="آدرس منزل" multiline />

          {/* محل کار */}
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="آدرس محل کار" multiline />

          {/* معرفی به دوستان */}
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="شماره کارت کاربر:(اختیاری)" />
          <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholder="شماره شبا کاربر:(اختیاری)" />
        </View>
          <Button
          style={{ backgroundColor: themeColor4.bgColor(1) }}
          title='  معرفی به دوستان/ دریافت کد جایزه'
        />
        {/* دکمه تغییر رمز */}
        {/* <TouchableOpacity style={styles.changePassBtn}>
        <Text style={styles.changePassText}>تغییر رمز عبور</Text>
      </TouchableOpacity> */}
        <View style={[NewStyles.row,{margin:10,gap:10}]}>
          <TextInput style={[NewStyles.textInput, { height: 40 }, NewStyles.text10, NewStyles.border10, { width: '50%', textAlign: 'right' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder="رمز عبور فعلی" />
          <TextInput style={[NewStyles.textInput, { height: 40 }, NewStyles.text10, NewStyles.border10, { width: '50%', textAlign: 'right' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder="رمز عبور جدید" />
        </View>
        {/* Captcha + Security Code buttons */}
        <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 30 }}>
      <TextInput style={[NewStyles.textInput, { height: 40 }, NewStyles.text10, NewStyles.border10, { width: '50%', textAlign: 'right' }]} placeholderTextColor={themeColor10.bgColor(0.9)} placeholder="کد امنیتی" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>

            <TouchableOpacity onPress={generateCaptcha}>

              <Text style={{ fontSize: 18, color: '#fff' }}>↺</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captchaBox} onPress={generateCaptcha}>
              <Text style={{ fontSize: 16, fontFamily: 'VazirBold' }}>{captcha}</Text>
            </TouchableOpacity>

      

          </View>
        </View>

        <Button
        style={{ backgroundColor: themeColor4.bgColor(1) }}
          title='تغییر رمز عبور'
        />
        {/* دکمه خروج */}
        {/* <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>🚪 خروج از حساب کاربری</Text>
      </TouchableOpacity> */}
              <Button
               style={{ backgroundColor: themeColor0.bgColor(1) }}
          title='ثبت/ورود به حساب کاربری'
        />
        <Button
         style={{ backgroundColor: themeColor6.bgColor(1) }}
          title=' خروج از حساب کاربری '
        />
        {/* پشتیبانی و لوگو */}
        {/* <View style={styles.footer}>
   <Footer/>
      </View> */}

      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0f0ff',
    alignItems: 'stretch',
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
  }
});
