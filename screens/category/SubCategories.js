import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, FlatList, RefreshControl, Platform } from "react-native";
import Folder from "../../components/Folder";
import NewStyles from "../../styles/NewStyles";
import CustomStatusBar from '../../components/CustomStatusBar';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { SafeAreaView } from "react-native-safe-area-context";
import categoriesAPI from '../../services/CategoriesApi';
import { useDispatch } from 'react-redux';
import { fetchSteps } from '../../slices/stepSlice';
import ScreenHeaders from '../../components/ScreenHeaders';
import { setCategory } from "../../slices/categorySlice";
import Loader from "../../components/Loader";
import { ImageBackground } from "expo-image";
import { withOrganizationAccess, ACCESS_PRESETS } from "../../components/withOrganizationAccess";

const SubCategories = ({ navigation, route }) => {
  const { categoryId, categoryTitle } = route.params;
  const [subCategories, setSubCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loader, setLoader] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await categoriesAPI.getSubCategories(categoryId);
        // API shape: { success: true, data: [...] }
        console.log(res.data?.children);

        const categories = Array.isArray(res.data?.children) ? res.data?.children : (res.data?.children || res.data || []);

        if (mounted) setSubCategories(categories);
      } catch (err) {
        console.error('Failed to load subcategories:', err);
        showToastOrAlert('خطا در دریافت زیردسته‌ها');
      } finally {
        setRefreshing(false);
        setLoader(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [categoryId, refreshing]);

  if (loader) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: "off", bottom: "off" }}>
      <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={"cover"}>

        <CustomStatusBar />
        <View style={{ flex: 1 }}>
          {/* Header */}
          <ScreenHeaders
            title={categoryTitle || 'زیردسته‌ها'}
            
            showLeftIcon={true}
          />

          {/* لوگو بالا */}
          <View style={styles.logoWrapper}>
            <Image source={require("../../assets/logo.png")} style={NewStyles.logo} />
          </View>

          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
            data={subCategories}
            renderItem={({ item }) => {
              return <Folder title={item?.title} image={item?.image_path} onPress={async () => {
                if (item?.has_subcategory === 1) {
                  // اگر دارای زیر دسته است، به SubCategories برو
                  console.log('📂 [SubCategories] باز کردن زیر دسته:', item.title);
                  navigation.navigate('SubCategories', { categoryId: item.id, categoryTitle: item.title });
                } else {
                  // اگر زیر دسته ندارد، به steps برو و fetchSteps صدا بزن
                  console.log('🎯 [SubCategories] انتخاب دسته‌بندی نهایی:', item.title);
                  console.log('🎯 [SubCategories] اطلاعات کامل آیتم:', JSON.stringify(item, null, 2));
                  console.log('🎯 [SubCategories] شروع دریافت مراحل برای ID:', item.id);

                  try {
                    dispatch(setCategory(item));
                    const result = await dispatch(fetchSteps(item.id));

                    navigation.navigate('Steps', { categoryId: item.id, categoryTitle: item.title });
                  } catch (error) {
                    console.log('❌ [SubCategories] خطا در dispatch fetchSteps:', error);
                  }
                }
              }} />;
            }}
            keyExtractor={item => item?.id?.toString()}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// محافظت از صفحه انتخاب زیردسته - بخشی از جریان ثبت سفارش
export default withOrganizationAccess(SubCategories, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'SubCategories'
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 35,
    marginBottom: 5,
  },
  logo: {
    width: 160,
    height: 90,
    resizeMode: "contain",
  },
  folderList: {
    flex: 1,
  },
  folderItem: {
    width: 80,
    alignItems: "center",
    margin: 12,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: "50%",
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  folderText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  footer: {
    bottom: 10,
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 15,
  },
  footerLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  supportButton: {
    backgroundColor: "#005b9f",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
  },
  supportText: {
    color: "#fff",
    fontWeight: "bold",
  },
  language: {
    color: "#fff",
    fontSize: 16,
  },
  phone: {
    color: "#fff",
    fontSize: 16,
  },
  menuBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 10,
    width: "90%",
    maxHeight: "70%",
    marginBottom: 20,
  },
  menuScroll: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    color: "#000",
  },
});