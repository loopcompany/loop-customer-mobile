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

import Folder from '@components/Folder';
import Loader from '@components/Loader';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import categoriesAPI from '@services/CategoriesApi';
import { imageUri } from '@services/URL';
import { fetchSteps } from '@slices/stepSlice';
import { describeApiError } from '@utils/apiErrorHandler';
import { setCategory } from '@slices/categorySlice';
import { showAlert, showToastOrAlert } from '@helpers/Common';
import { useMenu } from '@contexts/MenuContext';
import { createStyles } from '@styles/NewStyles';
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

// ستون سمت چپ دقیقاً سه کاشی دارد و «ضایعات» کاشی سوم همان ستون است؛ بقیه‌ی
// کاشی‌ها در ستون دوم می‌نشینند.
const LEFT_COLUMN_SIZE = 3;

// ستون چپ = [حساب کاربری، اولین دسته، ضایعات]. پس جای «ضایعات» در فهرست دسته‌ها
// (بدون کاشی حساب کاربری) یکی مانده به انتهای ستون چپ است.
const TRASH_INDEX_IN_CATEGORIES = LEFT_COLUMN_SIZE - 2;

// آیکون اختصاصی «ضایعات». حتی وقتی دسته‌ها از API می‌آیند همین آیکون محلی
// استفاده می‌شود تا کاشی ضایعات همه‌جا یک شکل باشد.
const TRASH_ICON = require('@assets/icons/hardware-services/trash.png');

const SystematicCategoryScreen = ({ navigation }) => {
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
  const [loader, setLoader] = useState(true);

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
        showToastOrAlert(`${L('خطا در دریافت دسته‌ها')} — ${describeApiError(err, t)}`);
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

    // «ضایعات» هنوز فعال نیست: به‌جای ورود به مراحل، فقط پیام «به زودی» می‌دهد.
    // مراحل این دسته در systematicFlows.js آماده است و هر وقت فعال شد، حذف همین
    // شرط کافی است.
    if (systematicId === 'trash') {
      showAlert(L('ضایعات'), L('این بخش به زودی فعال می‌شود.'));
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
      const result = await dispatch(fetchSteps({ categoryId: source?.id, token }));
      // dispatch خطای thunk را پرتاب نمی‌کند؛ بدون این بررسی کاربر بی‌پیام به مراحلِ خالی می‌رفت.
      if (fetchSteps.rejected.match(result)) {
        showToastOrAlert(result.payload || t('An unexpected error occurred!'));
        return;
      }
      dispatch(setCategory(source));
      navigation.navigate('Steps', {
        categoryId: source?.id,
        categoryTitle: source?.title,
      });
    } catch (error) {
      console.log('❌ [SystematicCategoryScreen] خطا در dispatch fetchSteps:', error);
    }
  };

  // کاشی‌های نمایشی: «حساب کاربری» اول، بعد دسته‌هایی که مسیر سیستماتیک دارند
  // («انتخاب جامع» اینجا کاشی ندارد چون مسیر جداگانه‌ای است).
  // بدون useMemo ساخته می‌شود تا onPress همیشه آخرین مقدار user/token را ببیند.
  const buildTiles = () => {
    const categories = items.filter((entry) => {
      const categoryId = resolveSystematicCategoryId(entry.apiItem);
      const isComprehensive = entry.apiItem?.id === 'comprehensive' ||
                             entry.title === 'انتخاب جامع' ||
                             entry.title === 'Comprehensive Selection';
      return categoryId !== 'user_account' && !isComprehensive;
    });

    const accountTile = {
      key: 'user_account',
      title: 'حساب کاربری',
      imageSource: { uri: `${imageUri}/userfolder/Profile.png` },
      onPress: () => navigation.navigate('Profile'),
    };

    const rest = categories.map((entry) => ({
      key: entry.key,
      title: entry.title,
      image: entry.image,
      // ضایعات همیشه با آیکون محلی جدید نمایش داده می‌شود.
      imageSource:
        resolveSystematicCategoryId(entry.apiItem) === 'trash'
          ? TRASH_ICON
          : entry.imageSource,
      onPress: () => openCategory(entry),
      isTrash: resolveSystematicCategoryId(entry.apiItem) === 'trash',
    }));

    // «ضایعات» را به کاشی سومِ ستون چپ می‌بریم؛ بقیه ترتیب خودشان را نگه می‌دارند.
    const trashIndex = rest.findIndex((tile) => tile.isTrash);
    if (trashIndex > -1) {
      const [trashTile] = rest.splice(trashIndex, 1);
      rest.splice(Math.min(TRASH_INDEX_IN_CATEGORIES, rest.length), 0, trashTile);
    }

    return [accountTile, ...rest];
  };

  const tiles = buildTiles();
  const leftColumn = tiles.slice(0, LEFT_COLUMN_SIZE);
  const rightColumn = tiles.slice(LEFT_COLUMN_SIZE);

  const renderTile = (tile) => (
    <Folder
      key={tile.key}
      title={L(tile.title)}
      image={tile.image}
      imageSource={tile.imageSource}
      onPress={tile.onPress}
    />
  );

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
          <View style={styles.column}>{leftColumn.map(renderTile)}</View>
          <View style={styles.column}>{rightColumn.map(renderTile)}</View>
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
    // دو ستون واقعی (نه ردیف wrap): ستون چپ سه کاشی و ستون راست بقیه. چون هر
    // ستون مستقل پر می‌شود، تعداد کاشی‌های ستون چپ ثابت می‌ماند.
    grid: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      // border-box است، پس فاصله‌ی لبه‌ی چپ باید margin باشد نه padding - وگرنه
      // از عرض محتوا کم می‌شود و ستون دوم به ردیف بعد می‌افتد.
      width: TILE_WIDTH * 2 + GRID_GAP,
      marginLeft: spacing.sm,
      columnGap: GRID_GAP,
      paddingBottom: spacing.lg,
    },
    column: {
      width: TILE_WIDTH,
    },
  });

export default SystematicCategoryScreen;
