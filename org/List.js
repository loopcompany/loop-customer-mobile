// صفحه‌ی ورودی کاربر سازمانی - فقط دو مسیر دارد: «انتخاب جامع» و
// «انتخاب سیستماتیک». هر دو کاشی ستونی و در مرکز صفحه چیده می‌شوند: «جامع» بالا
// و «سیستماتیک» پایین آن، هرکدام با آیکون و عنوان کاملاً هم‌مرکز (افقی و عمودی).
import React, { useMemo } from 'react';
import { View, Image, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { ImageBackground } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import HintBadge from '@components/HintBadge';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import { createStyles } from '@styles/NewStyles';

const entryOptions = [
  {
    id: 'comprehensive',
    title: 'انتخاب جامع',
    image: require('@assets/jame.jpg'),
    screen: 'ComprehensiveSelectionScreen',
    hint: 'در «انتخاب جامع» تمام خدمات نرم‌افزاری، سخت‌افزاری و تامین تجهیزات سازمان را یکجا در یک فرم کامل ثبت می‌کنید.',
  },
  {
    id: 'systematic',
    title: 'انتخاب سیستماتیک',
    image: require('@assets/systematic.png'),
    screen: 'SystematicCategoryScreen',
    hint: 'در «انتخاب سیستماتیک» دسته‌بندی مورد نظر (کیس، لپ‌تاپ، پرینتر و ...) را جداگانه انتخاب و سفارش می‌دهید.',
  },
];

const List = ({ navigation }) => {
  const { i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const organizationName = useSelector(
    (state) => state?.organization?.profile?.company_name
  );

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <ImageBackground
        cachePolicy={'memory-disk'}
        imageStyle={{ opacity: 0.8 }}
        source={
          Platform.OS === 'web'
            ? require('@assets/loopbackground.webp')
            : require('@assets/moon.jpg')
        }
        style={[NewStyles.container, { backgroundColor: '#020305', paddingBottom: 30 }]}
        contentPosition={'center'}
        contentFit={'cover'}
      >
        <CustomStatusBar />
        <ScreenHeaders title={organizationName || 'سازمانی / دولتی'} />

        <View style={styles.logoWrapper}>
          <Image source={require('@assets/logo.png')} style={NewStyles.logo} />
        </View>

        {/* کاشی «جامع» بالا و «سیستماتیک» پایین آن، هر دو در مرکز صفحه */}
        <View style={styles.grid}>
          {entryOptions.map((item) => (
            <View key={item.id} style={styles.optionWrapper}>
              <TouchableOpacity
                style={styles.tile}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Image source={item.image} style={styles.tileIcon} />
                <Text style={[NewStyles.title4, styles.tileTitle]}>{item.title}</Text>
              </TouchableOpacity>
              <HintBadge hint={item.hint} title={item.title} style={styles.hintBadge} />
            </View>
          ))}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const createLocalStyles = (NewStyles) =>
  StyleSheet.create({
    logoWrapper: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 5,
    },
    grid: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
    },
    optionWrapper: {
      position: 'relative',
      alignItems: 'center',
    },
    tile: {
      width: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileIcon: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
      borderRadius: 20,
      marginBottom: 10,
    },
    tileTitle: {
      textAlign: 'center',
    },
    // علامت راهنما گوشه‌ی بالای کاشی می‌نشیند تا ابعاد خود کاشی دست‌نخورده بماند.
    hintBadge: {
      position: 'absolute',
      top: 10,
      right: 0,
    },
  });

export default List;
