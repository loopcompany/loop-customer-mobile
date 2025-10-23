// FeedbackSurveyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  I18nManager,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import Footer from './Footer';

I18nManager.forceRTL(false); // راست‌چین

export default function FeedbackSurveyScreen() {
  const [scores, setScores] = useState({
    app: '',
    technician: '',
    support: '',
  });
  const [desc, setDesc] = useState('');

  const setRating = (key, value) => {
    setScores({ ...scores, [key]: value });
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
       <ScreenHeaders title={"سفارش های جاری من "}  onPressLeft={() => navigation.navigate('FolderScreen')} />
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.subTitle}>نظرسنجی / عملکرد</Text>
        <Text style={styles.description}>
          کاربر گرامی، ضمن تشکر از اعتماد شما، لطفاً میزان رضایت خود از عملکرد لوپ را انتخاب نمایید.
        </Text>

        {/* اپلیکیشن لوپ */}
        <Text style={styles.category}>اپلیکیشن لوپ</Text>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.app === label && styles.activeButton,
              ]}
              onPress={() => setRating('app', label)}
            >
              <Text style={styles.rateText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* تکنسین لوپ */}
        <Text style={styles.category}>تکنسین لوپ</Text>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.technician === label && styles.activeButton,
              ]}
              onPress={() => setRating('technician', label)}
            >
              <Text style={styles.rateText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* پشتیبانی لوپ */}
        <Text style={styles.category}>پشتیبانی لوپ</Text>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.support === label && styles.activeButton,
              ]}
              onPress={() => setRating('support', label)}
            >
              <Text style={styles.rateText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* توضیح بیشتر */}
        <Text style={styles.commentLabel}>توضیح بیشتری دارید؟ بنویسید:</Text>
        <TextInput
          placeholder="توضیحات..."
          style={styles.commentInput}
          multiline
          value={desc}
          onChangeText={setDesc}
        />
      </View>

      <View style={styles.spacer} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>ثبت نظرسنجی</Text>
        </TouchableOpacity>
      </View>

      {/* فوتر */}
      {/* <View style={styles.footer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.footerLogo}
        />
        <Text style={styles.footerText}>21164552</Text>
      </View> */}
    </ScrollView>
    <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0f0ff',
  },
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#e0f0ff',
  },
  title: {
    backgroundColor: '#005b9f',
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  subTitle: {
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  category: {
    backgroundColor: '#ffeb3b',
    padding: 10,
    textAlign: 'center',
    borderRadius: 8,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  rateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rateButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#2196f3',
  },
  rateText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  commentLabel: {
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  commentInput: {
    backgroundColor: '#fff',
    height: 100,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    textAlign: 'right',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
