import useRealtimeRefresh from '../hooks/useRealtimeRefresh';
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
import { useMenu } from '@contexts/MenuContext';
import { createStyles } from '@styles/NewStyles';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import {
  SYSTEMATIC_CATEGORIES,
  getFlow,
  resolveSystematicCategoryId,
} from './systematicFlows';
import { L } from './orgI18n';

// عرض کاشی در components/Folder.js و فاصله‌ی بین دو ستون
const TILE_WIDTH = 100;
const GRID_GAP = spacing.sm;

const SystematicCategoryScreen = ({ navigation }) => {
  useRealtimeRefresh(["catalog"], () => loadCategories());
  const { t, i18n } = useTranslation();
  // فضای رزرو شده زیر شبکه‌ی کاشی‌ها تا ردیف آخر زیر داک شناور پایین پنهان نشود
  const { footerSpace } = useMenu();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const dispatch = useDispatch();
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.user?.data);

  const [folders, setFolders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  // کاشی‌ها تصویر محلی دارند و باید بی‌درنگ نمایش داده شوند. تا ۱۴۰۵/۰۹/۰۲ صفحه تا
  // رسیدن پاسخ /categories یک Loader نشان می‌داد و کاربر آن را «دیر لود شدن
  // آیکون‌ها» می‌دید. پاسخ سرور فقط برای شناسه‌ی دسته‌ها در پس‌زمینه می‌آید.
  const [loader, setLoader] = useState(false);

  const loadCategories = async () => {
    // ‎/categories یک endpoint احراز هویت‌شده است. توکن را AuthInitializer به صورت
    // async از AsyncStorage بازیابی می‌کند، پس در اولین render هنوز null است و
    // درخواست قطعاً 401 می‌گیرد. تا آمدن توکن درخواست نفرست؛ این effect با تغییر
    // توکن دوباره اجرا می‌شود. تا آن موقع کاشی‌های محلی نمایش داده می‌شوند.
    if (!token) {
      setRefreshing(false);
      setLoader(false);
      return;
    }

    try {
      const res = await categoriesAPI.getCategories();
      // شکل پاسخ API: { success: true, data: [...] }
      const categories = Array.isArray(res.data) ? res.data : res.data || res.data?.data || [];
      setFolders(categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      // 401 یعنی نشست منقضی شده و interceptor خودش هشدار «ورود مجدد» را
      // نشان می‌دهد؛ پیام دوم ندهیم.
      if (err?.response?.status !== 401) {
        showToastOrAlert(L('خطا در دریافت دسته‌ها'));
      }
      setFolders([]);
    } finally {
      setRefreshing(false);
      setLoader(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  // اگر API در دسترس نبود، همان هشت دسته با آیکون‌های محلی نشان داده می‌شوند تا
  // صفحه هیچ‌وقت خالی نماند.
  const items = useMemo(() => {
    const order=['user_account','monitor','trash','laptop','case','all_in_one','printer_copy','hard_disk'];
    return order.map((id)=> {
      const local=SYSTEMATIC_CATEGORIES.find((entry)=>entry.id===id);
      const remote=folders.find((entry)=>resolveSystematicCategoryId(entry)===id);
      return {key:id,title:local.title,imageSource:local.image,iconName:local.iconName,apiItem:remote || local};
    });
  }, [folders]);

  const openCategory = async (entry) => {
    const source = entry.apiItem;
    const systematicId = resolveSystematicCategoryId(source);

    // کاشی «حساب کاربری» مرحله‌ای ندارد و مستقیم صفحه‌ی پروفایل را باز می‌کند.
    if (systematicId === 'trash') { showToastOrAlert(L('به زودی')); return; }
    if (systematicId === 'user_account') {
      navigation.navigate(user?.account_type && !['individual','indiviual'].includes(user.account_type)?'OrganizationProfile':'Profile');
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
        backendCategoryId: Number.isInteger(Number(source?.id)) ? Number(source.id) : null,
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
        style={[NewStyles.container, { backgroundColor: '#020305', paddingBottom: 30 + footerSpace }]}
        contentPosition={'center'}
        contentFit={'cover'}
      >
        <CustomStatusBar />
        <ScreenHeaders title={L('انتخاب سیستماتیک')} />

        <View style={styles.logoWrapper}>
          <Image source={require('@assets/logo.png')} style={NewStyles.logo} />
        </View>

        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* کاشی حساب کاربری - بالای شبکه، با همان آیکون اصلی کارفرما */}
          <Folder
            title={L('حساب کاربری')}
            imageSource={require('@assets/icons/systematic/account.webp')}
            onPress={() => navigation.navigate(user?.account_type && !['individual','indiviual'].includes(user.account_type)?'OrganizationProfile':'Profile')}
          />

          {items
            .filter((entry) => {
              const categoryId = resolveSystematicCategoryId(entry.apiItem);
              const isComprehensive = entry.apiItem?.id === 'comprehensive' ||
                                     entry.title === 'انتخاب جامع' ||
                                     entry.title === 'Comprehensive Selection';
              return categoryId !== 'user_account' && !isComprehensive;
            })
            .map((entry) => (
              <Folder
                key={entry.key}
                // «Trash» در هر دو زبان همین‌طور نوشته می‌شود. کاشی غیرفعال نیست:
                // با ضربه، openCategory پیام «به زودی» را نشان می‌دهد.
                title={entry.key === 'trash' ? 'Trash' : L(entry.title)}
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
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const createLocalStyles = (NewStyles) =>
  StyleSheet.create({
    logoWrapper: {
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    gridScroll: {
      flex: 1,
    },
    // دو کاشی در هر ردیف - ۸ کاشی یعنی ۴ ردیف. کاشی‌ها عرض ۱۰۰ خودشان را نگه
    // می‌دارند و شبکه چسبیده به سمت چپ صفحه می‌ماند؛ عرض شبکه دقیقاً اندازه‌ی
    // دو کاشی + فاصله است تا هیچ‌وقت کاشی سومی در ردیف جا نشود.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignSelf: 'flex-start',
      // border-box است، پس فاصله‌ی لبه‌ی چپ باید margin باشد نه padding - وگرنه
      // از عرض محتوا کم می‌شود و ستون دوم به ردیف بعد می‌افتد.
      width: TILE_WIDTH * 2 + GRID_GAP,
      marginLeft: spacing.sm,
      columnGap: GRID_GAP,
      paddingBottom: spacing.lg,
    },
  });

export default SystematicCategoryScreen;
