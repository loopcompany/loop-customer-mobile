import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
  ScrollView,
  FlatList,
} from "react-native";
import Footer from "./Footer";
import Folder from "../components/Folder";
import NewStyles from "../styles/NewStyles";
import CustomStatusBar from './../components/CustomStatusBar';
import { handleError, showToastOrAlert } from './../helpers/Common';
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FolderScreen({ navigation }) {
  const userToken = useSelector(state=>state.auth.token)
  // تابع دسترسی به ابجکت های یک استیت
  console.log(userToken);
  const fetchToken = async()=>{
    const userId = await AsyncStorage.getItem("userId");
    // گت کوکی
    console.log(userId);
    
  }
  // const [menuVisible, setMenuVisible] = useState(false);
  // const [selectedItems, setSelectedItems] = useState({});

  // const menuItems = [
  //   'سفارش‌های جاری / رزرو',
  //   'سازمانی / شرکتی',
  //   'سفارش‌ها',
  //   'تراکنش‌ها',
  //   'لوپ‌نامه‌ها',
  //   'پیش‌رسید',
  //   'رسید',
  //   'ادرس‌های منتخب',
  //   'کیف پول',
  //   'ثبت نام دوره‌های آموزشی',
  //   'طرح‌های تشویقی',
  //   'عضویت سرویس / محصول',
  //   'درخواست',
  //   'ثبت / پیگیری تلفن',
  //   'نظرات و پیشنهادات',
  //   'مهلت تست / گارانتی',
  //   'یادداشت',
  //   'بیشتر بدانید',
  //   'قوانین / درباره لوپ',
  // ];

  // const toggleItem = (item) => {
  //   setSelectedItems((prev) => ({
  //     ...prev,
  //     [item]: !prev[item],
  //   }));
  // }
  const folders = [
    {
      id: 1,
      title: "لپ تاپ",
      screen:'GuideScreen'
    },
    {
      id: 2,
      title: "کیس",
    },
    {
      id: 3,
      title: "مانیتور",
    },
    {
      id: 4,
      title: "آل این وان",
    },
    {
      id: 5,
      title: "چاپگر",
    },
    {
      id: 6,
      title: "هارد دیسک",
    },
    {
      id: 7,
      title: "تجهیز مدارس",
    },
  ];
  fetchToken() 
  return (
    <ImageBackground
      source={require("../assets/moon.jpg")}
      style={NewStyles.container}
    >
      <CustomStatusBar/>
      <View style={{ flex: 1 }}>
        {/* لوگو بالا */}
        <View style={styles.logoWrapper}>
          <Image source={require("../assets/logo.png")} style={NewStyles.logo} />
        </View>
        <FlatList
          data={folders}
          renderItem={({ item, index }) => {
            return <Folder title={item?.title} onPress={()=>{
              if(item?.screen){

                navigation.navigate(item?.screen)
              }else{
                showToastOrAlert('به زودی')
              }
            }} />;
          }}
          keyExtractor={item=>item?.id}
        />
        
        <Footer />
      </View>
    </ImageBackground>
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
