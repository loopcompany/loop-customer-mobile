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

function FolderScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [folders, setFolders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loader, setLoader] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user?.data);
  const token = useSelector(state => state?.auth?.token);
  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories(token);
      // API shape: { success: true, data: [...] }
      const categories = Array.isArray(res.data)
        ? res.data
        : res.data || res.data?.data || [];
      setFolders(categories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      showToastOrAlert("خطا در دریافت دسته‌ها");
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
        <View style={{ flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, paddingHorizontal: 10, }}>

          <TouchableOpacity style={[styles.button, NewStyles.center, { justifyContent: 'flex-start' }]} onPress={() => {
            navigation.navigate("Profile")
          }} >
            <Image
              source={{ uri: `${imageUri}/userfolder/Profile.png` }}
              style={[styles.folderIcon]}
            />
            <Text style={NewStyles.title4}>{("User Account")}</Text>
          </TouchableOpacity>
          {
            folders.map((item) => {
              return (
                <View key={item?.id}>
                  <Folder
                    title={item?.title}
                    image={item?.image_path}
                    onPress={async () => {
                      if (item?.id == 'trash') {
                        showToastOrAlert(t("(Coming soon)"))
                        return
                      }
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
        </View>
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
