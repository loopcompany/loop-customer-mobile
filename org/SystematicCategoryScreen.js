// صفحه‌ی «انتخاب سیستماتیک».
//
// این صفحه دقیقاً همان شبکه‌ی کاشی‌های صفحه‌ی اصلی قبلی است
// (screens/FolderScreen.js): همان پس‌زمینه‌ی ماه، همان لوگو، همان چیدمان
// ستونی wrap و همان آیکون‌های سروری دسته‌ها (حساب کاربری، لپ تاپ،
// پرینتر/کپی، مانیتور، کیس، ضایعات، آل این وان، هارد دیسک).
//
// تفاوت فقط در مقصد کلیک است: اگر برای آن دسته مسیر سیستماتیک تعریف شده باشد
// (org/systematicFlows.js) وارد stepper همان دسته می‌شویم، در غیر این صورت
// همان رفتار قبلی صفحه‌ی اصلی (زیر‌دسته / Steps) حفظ می‌شود.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ImageBackground } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import Folder from '@components/Folder';
import Loader from '@components/Loader';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import categoriesAPI from '@services/CategoriesApi';
import { imageUri } from '@services/URL';
import { fetchSteps } from '@slices/stepSlice';
import { setCategory } from '@slices/categorySlice';
import { showToastOrAlert } from '@helpers/Common';
import { createStyles } from '@styles/NewStyles';
import { colors } from '@theme/Color';
import {
  SYSTEMATIC_CATEGORIES,
  getFlow,
  resolveSystematicCategoryId,
} from './systematicFlows';

const SystematicCategoryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const dispatch = useDispatch();
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.user?.data);

  const [folders, setFolders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loader, setLoader] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories(token);
      // شکل پاسخ API: { success: true, data: [...] }
      const categories = Array.isArray(res.data) ? res.data : res.data || res.data?.data || [];
      setFolders(categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      showToastOrAlert('خطا در دریافت دسته‌ها');
      setFolders([]);
    } finally {
      setRefreshing(false);
      setLoader(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  // اگر API در دسترس نبود، همان هشت دسته با آیکون‌های محلی نشان داده می‌شوند تا
  // صفحه هیچ‌وقت خالی نماند.
  const items = useMemo(() => {
    if (folders.length) {
      return folders.map((item) => ({
        key: String(item?.id),
        title: item?.title,
        image: item?.image_path,
        apiItem: item,
      }));
    }
    return SYSTEMATIC_CATEGORIES.map((item) => ({
      key: item.id,
      title: item.title,
      imageSource: item.image,
      iconName: item.iconName,
      apiItem: item,
    }));
  }, [folders]);

  const openCategory = async (entry) => {
    const source = entry.apiItem;
    const systematicId = resolveSystematicCategoryId(source);

    // کاشی «حساب کاربری» مرحله‌ای ندارد و مستقیم صفحه‌ی پروفایل را باز می‌کند.
    if (systematicId === 'user_account') {
      navigation.navigate('Profile');
      return;
    }

    // تا وقتی اطلاعات کاربر کامل نشده، ثبت سفارش ممکن نیست - همان گارد
    // صفحه‌ی اصلی قبلی.
    if (!user?.code) {
      showToastOrAlert(
        t('To place an order, first complete your information in the account section.')
      );
      return;
    }

    if (systematicId && getFlow(systematicId).length) {
      navigation.navigate('SystematicDeviceScreen', {
        categoryId: systematicId,
        categoryTitle: entry.title,
      });
      return;
    }

    // دسته‌ای که مسیر سیستماتیک ندارد - رفتار قبلی صفحه‌ی اصلی
    if (source?.has_subcategory === 1) {
      navigation.push('SubCategories', {
        categoryId: source.id,
        categoryTitle: source.title,
      });
      return;
    }

    try {
      await dispatch(fetchSteps({ categoryId: source?.id, token }));
      dispatch(setCategory(source));
      navigation.navigate('Steps', {
        categoryId: source?.id,
        categoryTitle: source?.title,
      });
    } catch (error) {
      console.log('❌ [SystematicCategoryScreen] خطا در dispatch fetchSteps:', error);
    }
  };

  if (loader) {
    return <Loader />;
  }

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
        <ScreenHeaders title="انتخاب سیستماتیک" />

        <View>
          <ScrollView
            style={styles.logoScroll}
            contentContainerStyle={styles.logoScrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <View style={styles.logoWrapper}>
              <Image source={require('@assets/logo.png')} style={NewStyles.logo} />
            </View>
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {/* کاشی حساب کاربری - مثل قبل بالای شبکه و با همان آیکون سروری */}
          <Folder
            title="User Account"
            imageSource={{ uri: `${imageUri}/userfolder/Profile.png` }}
            onPress={() => navigation.navigate('Profile')}
          />

          {items
            .filter((entry) => resolveSystematicCategoryId(entry.apiItem) !== 'user_account')
            .map((entry) => (
              <Folder
                key={entry.key}
                title={entry.title}
                image={entry.image}
                imageSource={entry.imageSource}
                icon={
                  entry.iconName ? (
                    <Ionicons
                      name={entry.iconName}
                      size={56}
                      color={colors.textInverse.color}
                    />
                  ) : null
                }
                onPress={() => openCategory(entry)}
              />
            ))}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const createLocalStyles = (NewStyles) =>
  StyleSheet.create({
    logoScroll: {
      height: 110,
      width: '100%',
    },
    logoScrollContent: {
      height: 110,
    },
    logoWrapper: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 5,
    },
    // چیدمان ستونی wrap - همان چیدمان صفحه‌ی اصلی قبلی: کاشی‌ها از بالا به پایین
    // پر می‌شوند و بعد به ستون بعدی می‌روند.
    grid: {
      flex: 1,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 10,
    },
  });

export default SystematicCategoryScreen;
