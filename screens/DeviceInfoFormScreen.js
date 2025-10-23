// screens/DeviceInfoFormScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';

export default function DeviceInfoFormScreen() {
  const [deviceName, setDeviceName] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [issueDesc, setIssueDesc] = useState('');

  return (
    <ImageBackground
      source={require('../assets/moon.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>اطلاعات دستگاه و توضیح ایراد</Text>

        <TextInput
          style={styles.input}
          placeholder="نام دستگاه"
          placeholderTextColor="#fff"
          value={deviceName}
          onChangeText={setDeviceName}
        />

        <TextInput
          style={styles.input}
          placeholder="مدل دستگاه"
          placeholderTextColor="#fff"
          value={model}
          onChangeText={setModel}
        />

        <TextInput
          style={styles.input}
          placeholder="شماره سریال"
          placeholderTextColor="#fff"
          value={serial}
          onChangeText={setSerial}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="توضیحات کامل ایراد..."
          placeholderTextColor="#fff"
          value={issueDesc}
          onChangeText={setIssueDesc}
          multiline
        />

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>ارسال اطلاعات</Text>
        </TouchableOpacity>

        
        <View style={styles.footer}>
          <Image source={require('../assets/logo.png')} style={styles.footerLogo} />
          <Text style={styles.support}>پشتیبانی</Text>
          <Text style={styles.language}>فا</Text>
          <Text style={styles.phone}>21164552</Text>
        </View>
        
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    backgroundColor: '#005b9f',
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ffeb3b',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  support: {
    color: '#fff',
    fontWeight: 'bold',
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
