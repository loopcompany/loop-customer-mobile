// SoftwareInstallScreen.js

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  FlatList,
} from "react-native";
import Footer from "./Footer";
import CheckBox from './../components/CheckBox';
import NewStyles from "../styles/NewStyles";
import { themeColor4 } from "../theme/Color";
import ScreenHeaders from "../components/ScreenHeaders";
import ScreenTitle from "../components/ScreenTitle";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function SoftwareInstallScreen({ navigation }) {


  const data = [
    {
      id: '1',
      title: "نصب نرم‌افزارهای کاربردی / عمومی / آفیس",
    },
    {
      id: '2',
      title: "نصب نرم‌افزارهای گرافیکی / تخصصی",
    },
    {
      id: '3',
      title: "نصب نرم‌افزار آموزش مجازی مدارس و ویندوز",
    },
    {
      id: '4',
      title: "نصب برنامه‌های سخت‌افزار و پرینتر آفلاین",
      value:1
    },
    {
      id: '5',
      title: "نصب برنامه‌های سخت‌افزار و پرینتر آنلاین",
      value:1

    },
    {
      id: '6',
      title: "کیس روشن نمی‌شود",
      value:1
    },
    {
      id: '7',
      title: "کیس کار نمی‌کند",
    },
    {
      id: '8',
      title: "کیس کند است",
    },
    {
      id: '9',
      title: "کیس ریست می‌شود",
    },
  ]
  return (
       
    <ImageBackground source={require("../assets/moon.jpg")} style={styles.background} >

      <ScreenHeaders 
        title={'لپ تاپ'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      {/* عنوان اصلی */}


      <FlatList
        ListHeaderComponent={() => {
          return (
            <ScreenTitle title={'نرم افزار'}   onPress={() => navigation.navigate("WindowsInstallScreen")}/>
          )
        }}
        data={data}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        renderItem={({ item }) => {
          return (
            <CheckBox item={item} />
          )
        }}
      />
      <View style={{ width: '100%', padding: 10 }}>
        <TextInput
          placeholder="درخواست دیگری دارید بنویسید..."
          placeholderTextColor={themeColor4.bgColor(0.7)}
          style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
        />
      </View>
   
      
    
    </ImageBackground>
     
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    padding: 30,
    alignItems: "center",
  },
  title: {
    backgroundColor: "#005b9f",
    color: "#00ffcc",
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  greenButton: {
    backgroundColor: "#8BC34A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  yellowButton: {
    backgroundColor: "#ffeb3b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  blackText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  input: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  phone: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    backgroundColor: "#FFFF",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#005b9f",
  },
  arrow: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    justifyContent: "center",
  },
});
