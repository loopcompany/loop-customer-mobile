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
import React, { useState } from 'react';
import { themeColor4} from "../theme/Color";
export default function Header() {
  return (
      <View style={styles.header}>
        <Image source={require('../assets/next.png')} style={styles.arrow} />
        <Text style={styles.headerText}>پیام</Text>
        <Image source={require('../assets/back.png')  } style={styles.arrow} />
      </View>
  )
}
const styles = StyleSheet.create({
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
});