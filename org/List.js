// صفحه‌ی ورودی کاربر سازمانی - فقط دو مسیر دارد: «انتخاب جامع» و
// «انتخاب سیستماتیک».
//
// ظاهر کاشی‌ها عیناً همان کاشی‌های پوشه‌ای صفحه‌ی «انتخاب سیستماتیک» است
// (components/Folder.js روی پس‌زمینه‌ی ماه)، چون قبلاً «انتخاب جامع» خودش یکی از
// همان پوشه‌ها بود. حالا از آن شبکه حذف شده و اینجا در کنار «انتخاب سیستماتیک»
// نشسته است.
import React, { useMemo } from 'react';
import { View, Image, Platform, StyleSheet } from 'react-native';
import { ImageBackground } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Folder from '@components/Folder';
import HintBadge from '@components/HintBadge';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import { createStyles } from '@styles/NewStyles';

const entryOptions = [
  {
    id: 'comprehensive',
    title: 'انتخاب جامع',
    image: require('@assets/icons/sections/critical-infra.png'),
    screen: 'ComprehensiveSelectionScreen',
    hint: 'در «انتخاب جامع» تمام خدمات نرم‌افزاری، سخت‌افزاری و تامین تجهیزات سازمان را یکجا در یک فرم کامل ثبت می‌کنید.',
  },
  {
    id: 'systematic',
    title: 'انتخاب سیستماتیک',
    image: require('@assets/icons/sections/order-actions.png'),
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

        {/* همان چیدمان و همان اندازه‌ی کاشی‌های صفحه‌ی «انتخاب سیستماتیک» */}
        <View style={styles.grid}>
          {entryOptions.map((item) => (
            <View key={item.id} style={styles.optionWrapper}>
              <Folder
                title={item.title}
                imageSource={item.image}
                onPress={() => navigation.navigate(item.screen)}
              />
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
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 10,
    },
    optionWrapper: {
      position: 'relative',
    },
    // علامت راهنما گوشه‌ی بالای کاشی می‌نشیند تا ابعاد خود کاشی دست‌نخورده بماند.
    hintBadge: {
      position: 'absolute',
      top: 10,
      right: 0,
    },
  });

export default List;
