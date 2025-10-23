import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import ScreenTitle from '../components/ScreenTitle';
import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor10 } from '../theme/Color';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';

export default function DeviceOrderSummary({ navigation }) {
  const [visibleSection, setVisibleSection] = useState(null);

  const toggleSection = (section) => {
    setVisibleSection((prev) => (prev === section ? null : section));
  };

  const sections = [
    { key: 'check', label: 'بررسی / جایگزین زمانی / پیش رسید' },
    { key: 'techInfo', label: 'اطلاعات تکنسین' },
    { key: 'progress', label: 'در حال انجام / اتمام' },
    { key: 'loop', label: 'اعزام به لوپ / هزینه ها / مدت زمان انجام' },
    { key: 'followup', label: 'پیگیری / زمان عودت' },
    { key: 'parts', label: 'قطعات / هزینه ها / نماینده' },
    { key: 'payment', label: 'پرداخت هزینه' },
    { key: 'delivery', label: 'دریافت محصول / اتمام' },
    { key: 'invoice', label: 'فاکتور' },
    { key: 'survey', label: 'نظرسنجی / امتیازدهی' },
  ];

  return (
    <ImageBackground source={require('../assets/moon.jpg')} style={NewStyles.container}>
      <CustomStatusBar />
      {/* <View style={{ padding: 10 }}>
        <ScreenTitle title={'سفارش‌های جاری من'} />
      </View> */}
      <ScreenHeaders title={'سفارش های جاری من'}/>
      <ScrollView contentContainerStyle={styles.container}>

        {sections.map((section) => (
          <FormSection
            key={section.key}
            label={section.label}
            visible={visibleSection === section.key}
            onPress={() => toggleSection(section.key)}
            sectionKey={section.key}
          />
        ))}

        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.sectionButtonText}>بازگشت به صفحه اصلی</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </ImageBackground>
  );
}

const FormSection = ({ label, visible, onPress, sectionKey }) => (
  <>
    <TouchableOpacity style={styles.sectionButton} onPress={onPress}>
      <Text style={NewStyles.text4}>{label}</Text>
    </TouchableOpacity>
    {visible && (
      <View style={styles.sectionContent}>

        {sectionKey === 'check' && (
          <>
            <View style={styles.noticeBox}>
              <Text style={NewStyles.text10}>
                کاربر گرامی، سفارش شما در حال بررسی توسط لوپ می‌باشد. از صبر و شکیبایی شما سپاسگزاریم.
              </Text>
            </View>

            <View style={styles.whiteBox}>
              <Text style={NewStyles.text10}>توضیحات لوپ</Text>
            </View>

            <Text style={NewStyles.text10}>تاریخ و ساعت مراجعه تکنسین / جایگزین زمانی</Text>

            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={styles.smallWhiteBox}>
                <Text style={NewStyles.text10}>۱۲ الی ۱۴</Text>
              </View>
              <View style={styles.smallWhiteBox}>
                <Text style={NewStyles.text10}>۱۴۰۳/۱۰/۱۱</Text>
              </View>
            </View>

            <View style={styles.centerBox}>
              <Text style={NewStyles.text10}>پیش رسید</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="توضیحات دیگری دارید؟ بنویسید:"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                multiline
                numberOfLines={4}
                verticalAlign='top'
                textAlignVertical='top'
                style={[NewStyles.text10, NewStyles.border10, NewStyles.text10]}
              />
            </View>


            <TouchableOpacity style={styles.submitButton}>
              <Text style={NewStyles.text4}>ثبت سفارش</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton}>
              <Text style={NewStyles.text10}>لغو سفارش</Text>
            </TouchableOpacity>
          </>
        )}


        {sectionKey === 'techInfo' && (
          <>
            <View style={styles.techImageCircle}>
              <Image
                source={require('../assets/technician.png')}
                style={styles.techImage}
              />
            </View>
            <Text style={[NewStyles.text10, { textAlign: 'center' }]}>اکبر امدادی</Text>
            <Text style={[NewStyles.text10, { textAlign: 'center' }]}>تکنسین جامع میدانی</Text>
            <View style={styles.dottedLine} />
            <View style={styles.techInfoRow}>
              <View style={styles.techInfoItem}>
                <Text style={[NewStyles.text10]}>کد تکنسین</Text>
                <Text style={[NewStyles.text10]}>۲۱۶-۰۰۰۰-۱۵۴۲</Text>
              </View>
              <View style={styles.techInfoItem}>
                <Text style={[NewStyles.text10]}>شروع فعالیت</Text>
                <Text style={[NewStyles.text10]}>۱۴۰۳/۰۹/۲۰</Text>
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.buttonWhite}>
                <Text style={[NewStyles.text10]}>تماس با تکنسین</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonWhite}>
                <Text style={[NewStyles.text10]}>پیام به تکنسین</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonWhite}>
                <Text style={[NewStyles.text10]}>ارسال به دوستان</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonWhite}>
                <Text style={[NewStyles.text10]}>اسکن QR کد</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {sectionKey === 'progress' && (
          <>
            <View style={styles.noticeBox}>
              <Text style={[NewStyles.text10]}>
                کاربر گرامی، در صورت عدم تطابق مشخصات کاربر تکنسین با اطلاعات ثبت شده، لطفاً به پشتیبانی لوپ اطلاع دهید.
              </Text>
            </View>

            <TouchableOpacity style={styles.confirmButton}>
              <Text style={[NewStyles.text10]}>تأیید حضور تکنسین</Text>
            </TouchableOpacity>

            <View style={styles.dottedLine}>
              <TouchableOpacity style={styles.grayButton}>
                <Text style={[NewStyles.text10]}>مشخصات تکنسین درست است</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dottedLine}>
              <TouchableOpacity style={styles.grayButton}>
                <Text style={[NewStyles.text10]}>مشخصات تکنسین درست نیست</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={[NewStyles.text10]}>شرایط و قوانین اعزام محصول</Text>
            </TouchableOpacity>
          </>
        )}

        {sectionKey === 'loop' && (
          <>
            <View style={styles.noticeBox}>
              <Text style={NewStyles.text10}>
                کاربر گرامی ، محصول آورده شده در حال بررسی و عیب یابی توسط کارشناس مرتبط می باشد. از صبر و شکیبایی شما سپاسگزاریم.
              </Text>
            </View>

            <View style={styles.whiteBox}>
              <Text style={NewStyles.text10}>توضیحات کارشناس لوپ</Text>
            </View>

            <View style={[styles.row, { alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }]}>
              <View>
                <Text style={styles.timeTitle}>اعلام هزینه تقریبی :</Text>
              </View>

              <View style={styles.smallWhiteBox}>
                <Text style={NewStyles.text10}>پیش رسید سفارش</Text>
              </View>

            </View>

            <View style={[styles.row, { alignItems: 'center', marginBottom: 10 }]}> 
              <Text style={styles.timeTitle}>مدت زمان تقریبی انجام سفارش</Text>
              <View style={[styles.smallWhiteBox, { width: "40%" }]}>
                <Text style={NewStyles.text10}>2 روز کاری</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="درخواست / توضیحات بنویسید:"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                multiline
                numberOfLines={3}
                style={[NewStyles.text10]}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.buttonBlue}>
                <Text style={[NewStyles.text4, { color: '#fff' }]}>می پذیرم</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonYellow}>
                <Text style={[NewStyles.text4, { color: '#000' }]}>لغو سفارش / عودت</Text>
              </TouchableOpacity>
            </View>


          </>
        )}

        {sectionKey === 'followup' && (
          <>
            <View style={styles.noticeBox}>
              <Text style={NewStyles.text10}>
                کاربر گرامی ، محصول آورده شده در حال انجام توسط کارشناس مربوطه می باشد. از صبر و شکیبایی شما سپاسگزاریم.
              </Text>
            </View>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 10 }]}> 
              <Text style={[NewStyles.text4]}>در زمان عودت با من تماس گرفته شود</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whiteBorderButton}>
              <Text style={[NewStyles.text10]}>در چه تاریخی محصول عودت داده می شود؟</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whiteBorderButton}>
              <Text style={[NewStyles.text10]}>عجله دارم ، سریع تر انجام شود</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="درخواست / توضیحات بنویسید:"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                multiline
                numberOfLines={3}
                style={[NewStyles.text10]}
              />
            </View>

            <View style={[styles.row, { marginTop: 8 }]}> 
              <View style={styles.smallWhiteBox}>
                <Text style={NewStyles.text10}>۱۴۰۳/۰۹/۲۸</Text>
              </View>
              <View style={styles.smallWhiteBox}>
                <Text style={NewStyles.text10}>۱۲ الی ۱۶</Text>
              </View>
            </View>
          </>
        )}

        {sectionKey === 'parts' && (
          <>
            <View style={styles.blueHeader}>
              <Text style={[NewStyles.text4, { color: '#fff' }]}>قطعات / هزینه ها / نماینده</Text>
            </View>

            <View style={{ height: 8 }} />

            <View style={styles.smallButtonsRow}>
              <TouchableOpacity style={{margin:10}}>
                <Text style={[NewStyles.text10]}>تعمیری/تعویضی/سایر</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallWhiteBtn,{width:"50%"}]}>
                <Text style={[NewStyles.text10]}> توضیحات کارشناس اعزامی</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 8 }} />

            <View style={NewStyles.rowWrapper}>
              <Text style={[NewStyles.text10]}>مبلغ کل :</Text>
              <View style={styles.amountBox}>
                <Text style={[NewStyles.text10]}>رسید سفارش</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="درخواست / توضیحات بنویسید :"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                multiline
                numberOfLines={3}
                textAlignVertical='top'
                style={[NewStyles.text10, { minHeight: 70 }]}
              />
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={[NewStyles.text10]}>معرفی نماینده جهت دریافت محصول : آقا / خانم</Text>
            </View>

            <TextInput
              placeholder="نام نماینده"
              placeholderTextColor={themeColor10.bgColor(0.7)}
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />

            <View style={styles.phoneRow}>

              <TextInput
                placeholder="XXXXXXXX"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                style={[NewStyles.textInput, NewStyles.border10, { flex: 1, marginRight: 8 }]}
                keyboardType='phone-pad'
              />
                            <View style={styles.phonePrefix}>
                <Text style={NewStyles.text10}>09</Text>
              </View>
            </View>
          </>
        )}

        {sectionKey === 'delivery' && (
          <>
            <View style={styles.centerBox}>
              <Text style={[NewStyles.text4, { color: '#003366' }]}>دریافت محصول / سفارش</Text>
            </View>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 8 }]}> 
              <Text style={[NewStyles.text4]}>محصول را با تست سلامت دریافت کردم</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 8 }]}> 
              <Text style={[NewStyles.text4]}>محصول را بدون تست سلامت دریافت کردم</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 8 }]}> 
              <Text style={[NewStyles.text4]}>محصول را تحویل گرفتم، اما دارای نواقص فنی می‌باشد</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 8 }]}> 
              <Text style={[NewStyles.text4]}>محصول پس از تست به لوپ عودت داده شد</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonYellow, { marginBottom: 10 }]}> 
              <Text style={[NewStyles.text4]}>محصول را طبق درخواست خودم، دریافت کردم</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="درخواست / توضیحات بنویسید :"
                placeholderTextColor={themeColor10.bgColor(0.7)}
                multiline
                numberOfLines={3}
                style={[NewStyles.text10, { minHeight: 80 }]}
              />
            </View>
          </>
        )}

        {sectionKey === 'payment' && (
          <>
            <View style={styles.priceRow}>
              <Text style={[NewStyles.text10]}>جمع مبلغ کل:</Text>
              <View style={styles.priceBox}>
                <Text style={[NewStyles.text10]}>۵٬۰۰۰٬۰۰۰ ریال</Text>
              </View>
            </View>

            <View style={styles.walletButtons}>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={[NewStyles.text4]}>کسر هزینه از کیف پول</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={[NewStyles.text4]}>شارژ کیف پول</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.payButton}>
              <Text style={[NewStyles.text4]}>پرداخت آنلاین</Text>
            </TouchableOpacity>
          </>
        )}


        {!['check', 'techInfo'].includes(sectionKey) && (
          <Text style={[NewStyles.text10, { textAlign: 'center' }]}> 

          </Text>
        )}
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },

  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#003366',
  },

  sectionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },

  sectionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },

  sectionContent: {
    backgroundColor: '#fff8dc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  noticeBox: {
    backgroundColor: '#ffee58',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },

  whiteBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  smallWhiteBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
  },

  centerBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },

  timeTitle: {
    color: '#003366',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'right',
  },

  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 10,
    paddingBottom: 10,
  },

  whiteBorderButton: {
    backgroundColor: '#fff',
    borderColor: '#999',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },

  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  priceBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#aaa',
  },

  walletButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  walletButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },

  payButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  submitButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  buttonBlue: {
    backgroundColor: '#00771eff',
    paddingVertical: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },

  buttonYellow: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },

  /* parts-specific styles */
  blueHeader: {
    backgroundColor: '#0d47a1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },

  smallButtonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },

  smallWhiteBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#999',
    marginLeft: 8,
  },

  inlineRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  amountBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#999',
  },

  phoneRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },

  phonePrefix: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },

});
