import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import HintBadge from '../components/HintBadge';
import { themeColor0, themeColor4 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';

const entryOptions = [
  {
    id: 'comprehensive',
    title: 'انتخاب جامع',
    icon: 'share-social-outline',
    screen: 'ComprehensiveSelectionScreen',
    hint: 'در «انتخاب جامع» تمام خدمات نرم‌افزاری، سخت‌افزاری و تامین تجهیزات سازمان را یکجا در یک فرم کامل ثبت می‌کنید.',
  },
  {
    id: 'systematic',
    title: 'انتخاب سیستماتیک',
    icon: 'checkmark-circle-outline',
    screen: 'SystematicCategoryScreen',
    hint: 'در «انتخاب سیستماتیک» دسته‌بندی مورد نظر (کیس، لپ‌تاپ، پرینتر و ...) را جداگانه انتخاب و سفارش می‌دهید.',
  },
];

const List = ({ navigation }) => {
  const organizationName = useSelector(
    (state) => state?.organization?.profile?.company_name
  );

  return (
    <ImageBackground
      source={require('../assets/moon.jpg')}
      style={{ flex: 1 }}
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <CustomStatusBar />
      <ScreenHeaders title={organizationName || 'سازمانی / دولتی'} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 140, height: 70, resizeMode: 'contain', marginBottom: 50 }}
        />

        <View style={{ width: '100%' }}>
          {entryOptions.map((item) => (
            <View key={item.id} style={styles.optionWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.screen)}
                style={styles.iconTile}
              >
                <Ionicons name={item.icon} size={38} color={themeColor4.bgColor(1)} />
              </TouchableOpacity>

              <View style={styles.labelRow}>
                <View style={styles.hintBadgeSpacer} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(item.screen)}
                  style={styles.labelRibbon}
                >
                  <Text style={styles.labelText}>{item.title}</Text>
                </TouchableOpacity>
                <HintBadge hint={item.hint} title={item.title} style={styles.hintBadge} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconTile: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: themeColor0.bgColor(1),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  labelRibbon: {
    backgroundColor: themeColor0.bgColor(0.92),
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  labelText: {
    color: themeColor4.bgColor(1),
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'VazirBold',
    textAlign: 'center',
  },
  hintBadge: {
    marginLeft: 8,
  },
  hintBadgeSpacer: {
    width: 32,
  },
});

export default List;
