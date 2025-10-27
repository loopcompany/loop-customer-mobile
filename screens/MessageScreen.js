import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from "../components/ScreenHeaders";
import Footer from './Footer';


export default function MessageScreen({ navigation }) {
  const [messageToSend, setMessageToSend] = useState('');
  const [receivedMessage, setReceivedMessage] = useState('');

  return (
    <SafeAreaView style={{flex:1}} edges={{ top: 'off', bottom: 'additive' }}>
<ScreenHeaders 
  title={'پیام ها '} 
  onPressLeft={() => navigation.goBack()} 
  onPressRight={() => navigation.navigate('NextScreen')} 
/>
    <ScrollView contentContainerStyle={styles.container}>

      {/* باکس ارسال پیام */}
      <Text style={[NewStyles.text10,{margin:10}]}>ارسال پیام به لوپ</Text>
      <TextInput
        style={styles.textBox}
        placeholder="پیام خود را وارد کنید..."
        placeholderTextColor="#888"
        value={messageToSend}
        onChangeText={setMessageToSend}
        multiline
      />
      <TouchableOpacity style={styles.sendButton}>
        <Text style={[NewStyles.text4, {textAlign:'center'}]}>ارسال پیام</Text>
      </TouchableOpacity>

      {/* باکس دریافت پیام */}
      <Text style={[NewStyles.text10,{margin:10}]}>دریافت پیام از لوپ</Text>
      <View style={styles.receivedBox}>
        <Text style={[NewStyles.text10]}>
          {/* پیام دریافتی می‌تونه از سمت سرور بیاد */}
          {receivedMessage || 'در حال حاضر پیامی دریافت نشده است.'}
        </Text>
      </View>


    </ScrollView>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d1e9ff',
    padding: 20,
    // paddingBottom: 100,
    // alignItems: 'stretch',
    flex:1
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: '#FFFF',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#005b9f',
  },
  arrow: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    justifyContent:'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    textAlign: 'right',
  },
  textBox: {
    height: '30%',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 12,
    textAlignVertical: 'top',
    textAlign: 'right',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#005b9f',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  receivedBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    minHeight: '30%',
    justifyContent: 'center',
  },
  receivedText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  footerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
