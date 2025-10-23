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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Footer from './Footer';
import NewStyles from '../styles/NewStyles';
import ScreenTitle from '../components/ScreenTitle';
import { themeColor10, themeColor4 } from '../theme/Color';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function PartsSupplyScreen() {
  const [category, setCategory] = useState(null);
  const [condition, setCondition] = useState('آکبند');
  const [newCount, setNewCount] = useState(1);
  const [usedCount, setUsedCount] = useState(1);
  const [desc, setDesc] = useState('');

  const categories = [
    { label: 'لپ تاپ', value: '1' },
    { label: 'کیس', value: '2' },
    { label: 'مانیتور', value: '3' },
    { label: 'آل این وان', value: '4' },
    { label: 'هارد دیسک', value: '5' },
    { label: 'پرینتر', value: '6' },
    { label: 'لوازم جانبی', value: '7' },
  ];

  const currentCount = condition === 'آکبند' ? newCount : usedCount;
  const setCurrentCount =
    condition === 'آکبند' ? setNewCount : setUsedCount;

  return (
    <ImageBackground
      source={require('../assets/moon.jpg')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ padding: 10 }}>
          <ScreenTitle title={'تأمین قطعه / کالا'} />
        </View>
        <ScrollView contentContainerStyle={styles.container}>


          {/* دسته‌بندی قطعه */}
          <View style={styles.dropdownContainer}>
            <Text style={NewStyles.text4}>دسته‌بندی قطعه</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={[NewStyles.text10, styles.placeholderStyle]}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={NewStyles.text10}
              data={categories}
              search
              maxHeight={300}
              labelField="label"
              valueField="label"
              placeholder="انتخاب کنید"
              searchPlaceholder="جستجو..."
              value={category}
              onChange={(item) => {
                setCategory(item.label);
              }}
            />
          </View>

          {/* شرح کالا */}
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholder="شرح کالای مورد نیاز"
            placeholderTextColor={themeColor10.bgColor(0.7)}
          />

          {/* وضعیت کالا */}
          <View style={styles.conditionRow}>
            <TouchableOpacity
              style={[
                styles.conditionButton,
                condition === 'کارکرده' && styles.conditionActive,
              ]}
              onPress={() => setCondition('کارکرده')}
            >
              <Text style={NewStyles.text10}>کارکرده</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.conditionButton,
                condition === 'آکبند' && styles.conditionActive,
              ]}
              onPress={() => setCondition('آکبند')}
            >
              <Text style={NewStyles.text10}>آکبند</Text>
            </TouchableOpacity>
          </View>

          {/* تعداد */}
          <View style={styles.quantityBox}>
            <TouchableOpacity
              onPress={() => setCurrentCount(currentCount + 1)}
              style={[styles.arrowButton, NewStyles.border5, NewStyles.center]}
            >
              <Ionicons name="add" size={24} color={themeColor4.bgColor(1)} />

            </TouchableOpacity>

            <Text style={styles.quantityText}>{currentCount}</Text>

            <TouchableOpacity
              onPress={() => {
                if (currentCount > 1) setCurrentCount(currentCount - 1);
              }}
              style={[styles.arrowButton, NewStyles.border5, NewStyles.center]}
            >
              <Ionicons name="remove" size={24} color={themeColor4.bgColor(1)} />
            </TouchableOpacity>
          </View>

          {/* توضیحات */}
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 150 }]}
            verticalAlign='top'
            textAlignVertical='top'
            placeholder="توضیحات بیشتر..."
            placeholderTextColor={themeColor10.bgColor(0.7)}
            value={desc}
            onChangeText={setDesc}
            multiline
          />
        </ScrollView>

        {/* Footer */}
        <Footer />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  container: {
    padding: 30,
    // paddingBottom: 100,
    alignItems: 'center',
    width: '100%'
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
  dropdownContainer: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.3),
    borderRadius: 10,
    backgroundColor: themeColor4.bgColor(1),
    paddingHorizontal: 12,
    height: 50
  },
  placeholderStyle: {
    color: themeColor10.bgColor(0.5),
  },
  selectedTextStyle: {
    color: themeColor10.bgColor(1),
  },
  inputSearchStyle: {
    height: 50,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(179, 179, 179, 0.59)',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  conditionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
  },
  conditionButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  conditionActive: {
    backgroundColor: '#2196F3',
  },
  conditionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    justifyContent: 'center',
  },
  arrowButton: {
    backgroundColor: '#005b9f',
    height: 40,
    width: 40,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#fff',
    fontSize: 20,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
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
    fontWeight: 'bold',
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
