// screens/TechnicianBookingScreen.js

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
import { useTranslation } from 'react-i18next';

export default function TechnicianBookingScreen({navigation}) {
  const { t } = useTranslation();
  const [timeSlot, setTimeSlot] = useState('10-12');
  const [gender, setGender] = useState('Male');

  const timeOptions = ['10-12', '12-14', '14-16', '16-18'];
  const genders = ['Male', 'Female'];

  return (
    <ImageBackground
      source={require('../assets/moon.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("Technician Visit Booking")}</Text>

        {/* انتخاب زمان */}
        <View style={styles.timeRow}>
          {timeOptions.map((slot) => (
            <TouchableOpacity
              key={slot}
              onPress={() => setTimeSlot(slot)}
              style={[
                styles.timeButton,
                timeSlot === slot && styles.timeSelected,
              ]}
            >
              <Text style={styles.timeText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* تاریخ و آدرس */}
        <TextInput
          style={styles.input}
          placeholder={t("Visit Date (e.g. 1403/04/15)")}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder={t("Visit Address")}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder={t("Phone Number")}
          placeholderTextColor="#aaa"
        />

        {/* جنسیت تکنسین */}
        <View style={styles.genderRow}>
          {genders.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              style={[
                styles.genderButton,
                gender === g && styles.genderSelected,
              ]}
            >
              <Text style={styles.genderText}>{t(g)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* کد تخفیف */}
        <TextInput
          style={styles.input}
          placeholder={t("Discount Code (Optional)")}
          placeholderTextColor="#aaa"
        />

        {/* دکمه انتخاب تکنسین */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>{t("Select Technician")}</Text>
        </TouchableOpacity>

        {/* دکمه نرم‌افزار چاپگر */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>{t("Printer Software")}</Text>
        </TouchableOpacity>

        {/* متن هشدار زرد */}
        <Text style={styles.notice}>
          {t("(Connect to Printer Software section)")}
        </Text>

        {/* دکمه ثبت نهایی */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>{t("Submit / Continue")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* فوتر */}
      <View style={styles.footer}>
        <Image source={require('../assets/logo.png')} style={styles.footerLogo} />
        <Text style={styles.support}>{t("Support")}</Text>
        <Text style={styles.language}>{t("FA")}</Text>
        <Text style={styles.phone}>21164552</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    backgroundColor: '#003366',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    backgroundColor: '#005b9f',
  },
  timeSelected: {
    backgroundColor: '#00ffff',
  },
  timeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    textAlign: 'right',
  },
  genderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  genderButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    width: '48%',
  },
  genderSelected: {
    backgroundColor: '#2196f3',
  },
  genderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  actionButton: {
    backgroundColor: '#1e88e5',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notice: {
    marginTop: 10,
    color: '#ffeb3b',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  support: {
    color: '#fff',
    fontSize: 14,
  },
  language: {
    color: '#fff',
    fontSize: 16,
  },
  phone: {
    color: '#fff',
    fontSize: 16,
  },
});
