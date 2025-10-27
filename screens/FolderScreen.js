import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ImageBackground, FlatList} from "react-native";
import Folder from "../components/Folder";
import NewStyles from "../styles/NewStyles";
import CustomStatusBar from './../components/CustomStatusBar';
import { handleError, showToastOrAlert } from './../helpers/Common';
import { SafeAreaView } from "react-native-safe-area-context";
import categoriesAPI from '../services/CategoriesApi';
import { useDispatch } from 'react-redux';
import { fetchSteps } from '../slices/stepSlice';
import { setCategory } from "../slices/categorySlice";

export default function FolderScreen({ navigation }) {

  const [folders, setFolders] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        // API shape: { success: true, data: [...] }
        const categories = Array.isArray(res.data) ? res.data : (res.data || res.data?.data || []);
        if (mounted) setFolders(categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
        showToastOrAlert('خطا در دریافت دسته‌ها');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: "off", bottom: "off" }}>
      <ImageBackground
        source={require("../assets/moon.jpg")}
        style={NewStyles.container}
      >
        <CustomStatusBar />
        <View style={{ flex: 1 }}>
          {/* لوگو بالا */}
          <View style={styles.logoWrapper}>
            <Image source={require("../assets/logo.png")} style={NewStyles.logo} />
          </View>
          <FlatList
            data={folders}
            renderItem={({ item }) => {
              return <Folder title={item?.title} onPress={() => {
                if (item?.has_subcategory === 1) {
                  // اگر دارای زیر دسته است، به SubCategories برو
                  navigation.push('SubCategories', { categoryId: item.id, categoryTitle: item.title });
                } else {
                  // اگر زیر دسته ندارد، به steps برو و fetchSteps صدا بزن
                  dispatch(fetchSteps(item.id));
                  dispatch(setCategory(item));
                  navigation.navigate('Steps', { categoryId: item.id, categoryTitle: item.title });
                }
              }} />;
            }}
            keyExtractor={item => item?.id?.toString()}
          />


        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

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
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "flex-start",
    // paddingHorizontal: 20,
    flex: 1,
  },
  folderItem: {
    width: 80,
    alignItems: "center",
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
