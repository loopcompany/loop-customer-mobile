import { SYSTEMATIC_CATEGORIES, resolveSystematicCategoryId } from '@org/systematicFlows';
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Folder from "@components/Folder";
import CustomStatusBar from "@components/CustomStatusBar";
import { handleError, showToastOrAlert } from "@helpers/Common";
import { SafeAreaView } from "react-native-safe-area-context";
import categoriesAPI from "@services/CategoriesApi";
import { useDispatch, useSelector } from "react-redux";
import { fetchSteps } from "@slices/stepSlice";
import { setCategory } from "@slices/categorySlice";
import Loader from "@components/Loader";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";
import { createStyles } from "@styles/NewStyles";
import { imageUri } from "@services/URL";
import { Text } from "react-native";

// ترتیب کاشی‌های شبکه (حساب کاربری جداگانه بالای آن است): مانیتور، Trash، لپ تاپ،
// کیس، آل این وان، پرینتر / کپی، هارد — همان ترتیب سند کارفرما (۲۵ آبان ۱۴۰۵، بند ۲۹).
const TILE_ORDER = ['monitor', 'trash', 'laptop', 'case', 'all_in_one', 'printer_copy', 'hard_disk'];

// کاشی‌هایی که از همان اول با تصاویر محلی نمایش داده می‌شوند؛ پاسخ سرور فقط
// شناسه‌ی سروری هر دسته را به آن‌ها اضافه می‌کند.
const localTiles = () =>
  TILE_ORDER.map((id) => {
    const local = SYSTEMATIC_CATEGORIES.find((entry) => entry.id === id);
    return { title: local.title, localImage: local.image, systematicId: id };
  });

function FolderScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  // کاشی‌ها از همان اول با تصاویر محلیِ اصلی کارفرما نمایش داده می‌شوند؛ پاسخ
  // /categories فقط شناسه‌ی سروری هر دسته را اضافه می‌کند. تا ۱۴۰۵/۰۹/۰۲ صفحه تا
  // رسیدن پاسخ سرور Loader نشان می‌داد و کاربر آن را «دیر لود شدن آیکون‌ها» می‌دید.
  const [folders, setFolders] = useState(localTiles);
  const [refreshing, setRefreshing] = useState(false);
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user?.data);
  const token = useSelector(state => state?.auth?.token);
  const loadCategories = async () => {
    // ‎/categories احراز هویت می‌خواهد و توکن به صورت async توسط AuthInitializer
    // بازیابی می‌شود، پس در اولین render هنوز null است. تا آمدن توکن درخواست
    // نفرست — این effect با تغییر توکن دوباره اجرا می‌شود.
    if (!token) {
      setRefreshing(false);
      setLoader(false);
      return;
    }

    try {
      const res = await categoriesAPI.getCategories();
      // API shape: { success: true, data: [...] }
      const categories = Array.isArray(res.data)
        ? res.data
        : res.data || res.data?.data || [];
      setFolders(TILE_ORDER.map((id)=>{const remote=categories.find((entry)=>resolveSystematicCategoryId(entry)===id);const local=SYSTEMATIC_CATEGORIES.find((entry)=>entry.id===id);return {...remote,title:local.title,localImage:local.image,systematicId:id};}));
    } catch (err) {
      console.error("Failed to load categories:", err);
      // 401 را interceptor با هشدار «ورود مجدد» مدیریت می‌کند؛ پیام دوم ندهیم.
      if (err?.response?.status !== 401) {
        showToastOrAlert("خطا در دریافت دسته‌ها");
      }
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

  if (loader) {
    return <Loader />;
  }

  return (
    <SafeAreaView
      style={NewStyles.container}
      edges={{ top: "off", bottom: "off" }}
    >
      <ImageBackground cachePolicy={'memory-disk'} imageStyle={{ opacity: 0.8, }} source={Platform.OS === 'web' ? require('@assets/loopbackground.webp') : require("@assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305', paddingBottom: 30 }]} contentPosition={'center'} contentFit={"cover"}>
        <CustomStatusBar />
        <View>
          <ScrollView style={{ height: 140, width: '100%' }} refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          } contentContainerStyle={{ height: 140 }}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("@assets/logo.png")}
                style={NewStyles.logo}
              />
            </View>

          </ScrollView>
        </View>
        <ScrollView style={{flex:1}} contentContainerStyle={{width:230,maxWidth:'100%',alignSelf:'flex-start',flexDirection:'row',flexWrap:'wrap',gap:10,paddingHorizontal:10,paddingBottom:100}}>

          <TouchableOpacity style={[styles.button, NewStyles.center, { justifyContent: 'flex-start' }]} onPress={() => {
            navigation.navigate("Profile")
          }} >
            <Image
              source={require('@assets/icons/systematic/account.webp')}
              style={[styles.folderIcon]}
            />
            <Text style={NewStyles.title4}>{t("User Account")}</Text>
          </TouchableOpacity>
          {
            folders.map((item) => {
              return (
                <View key={item.systematicId || item.id}>
                  <Folder
                    // «Trash» در هر دو زبان همین‌طور نوشته می‌شود؛ کاشی غیرفعال نیست و
                    // با ضربه پیام «به زودی» را نشان می‌دهد.
                    title={item?.systematicId === 'trash' ? 'Trash' : item?.title}
                    imageSource={item?.localImage}
                    image={item?.localImage ? undefined : item?.image_path}
                    onPress={async () => {
                      if (item?.systematicId === 'trash') {
                        showToastOrAlert(t("(Coming soon)"))
                        return
                      }
                      if (!item?.id) {showToastOrAlert(t('این دسته‌بندی فعلاً در دسترس نیست.')); return;}
                      if (!user?.code) {
                        showToastOrAlert(t("To place an order, first complete your information in the account section."))
                        return
                      }
                      if (item?.has_subcategory === 1) {
                        navigation.push("SubCategories", {
                          categoryId: item.id,
                          categoryTitle: item.title,
                        });
                      } else {
                        try {
                          await dispatch(fetchSteps({ categoryId: item.id, token }));

                          dispatch(setCategory(item));
                          navigation.navigate("Steps", {
                            categoryId: item.id,
                            categoryTitle: item.title,
                          });
                        } catch (error) {
                          console.log(
                            "❌ [FolderScreen] خطا در dispatch fetchSteps:",
                            error
                          );
                        }
                      }
                    }}
                  />
                </View>
              )
            })
          }
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 60,
  },
  button: {
    // backgroundColor: themeColor10.bgColor(0.2),
    // paddingHorizontal: 40,
    marginTop: 10,
    width: 100,
    height: 120,
    // paddingVertical: 20,
    alignItems: "flex-end",
    // aspectRatio: 1, 
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
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "flex-start",
    // paddingHorizontal: 20,
    flex: 1,
  },
  folderItem: {
    margin: 12,
    // flexDirection: 'row-reverse',
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: "50%",
  },
  folderIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius: 20
  },
  folderText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  footer: {
    // position: "absolute",
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

// محافظت از صفحه اصلی انتخاب دسته‌بندی - نقطه شروع ثبت سفارش
export default FolderScreen
