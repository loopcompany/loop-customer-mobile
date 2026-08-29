// GuideScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
} from 'react-native';
import Footer from './Footer';
import NewStyles from '@styles/NewStyles';
import ScreenTitle from '@components/ScreenTitle';
import Button from '@components/Button';
 // فعال کردن RTL برای زبان فارسی

export default function GuideScreen({ navigation, route }) {
  const category = route?.params?.category || 'لپ تاپ';

  return (
    <ImageBackground
      source={require('@assets/moon.jpg')} // مسیر بک‌گراند خودت
      style={styles.container}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      {/* لوگو بالا */}
      <Image source={require('@assets/logo.png')} style={NewStyles.logo} />

      {/* دکمه نرم افزار */}
      <View style={{ width: '100%', paddingHorizontal:20 }}>
        <Button title={'نرم افزار'} onPress={() => navigation.navigate('SoftwareInstallScreen', { category })}/>
      </View>
      <View style={{ width: '100%', paddingHorizontal:20 }}>
        <Button title={'سخت افزار'} onPress={() => navigation.navigate('HardwareIssueScreen', { category })}/>
      </View>

      {/* دکمه سخت افزار */}
      

      {/* راهنمایی‌ها */}
      <View style={[styles.guideBox, NewStyles.border10]}>
        <Text style={NewStyles.text4}>راهنمای نرم افزار : ...........................</Text>
      </View>

      <View style={[styles.guideBox, NewStyles.border10]}>
        <Text style={NewStyles.text4}>راهنمای سخت افزار : ...........................</Text>
      </View>

      {/* فوتر پشتیبانی */}
      {/* <View style={styles.footer}>
  <Image source={require('@assets/logo.png')} style={styles.footerLogo} />

  <TouchableOpacity style={styles.supportButton}>
    <Text style={styles.supportText}>پشتیبانی</Text>
  </TouchableOpacity>

  <Text style={styles.languageText}>فا</Text>

  <Text style={styles.phoneText}>91693909</Text>
</View> */}
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
        
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 90,
  },
  button: {
    backgroundColor: '#005b9f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
  },
  buttonText: {
    color: 'yellow',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  guideBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    marginVertical: 4,
    width: '90%',
  },
  guideText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  languageText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 8,
  },

  footerLogo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  supportButton: {
    backgroundColor: '#005b9f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  supportText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  phoneText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});