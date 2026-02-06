import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ImageBackground,
  SafeAreaView,
  FlatList,
} from "react-native";
import Footer from "./Footer";
import NewStyles from "../styles/NewStyles";
import { themeColor4 } from "../theme/Color";
import CustomStatusBar from "../components/CustomStatusBar";
import ScreenHeaders from "../components/ScreenHeaders";
import ScreenTitle from "../components/ScreenTitle";
import CheckBox from "../components/CheckBox";
export default function HardwareIssueScreen({ navigation }) {
  const issues = [
    {
      id: "1",
      title: "کیس روشن نمی‌شود"
    },
    {
      id: "2",
      title: "کیس کار نمی‌کند",
    },
    {
      id: "3",
      title: "کیس کند است",
    },
    {
      id: "4",
      title: "کیس ریست می‌شود",
      value: 1
    },
    {
      id: "5",
      title: "کیس هنگ می‌کند",
    },
    {
      id: "6",
      title: "کیس صدا دارد",
    },
    {
      id: "7",
      title: "کیس داغ می‌شود",
    },
    {
      id: "8",
      title: "مانیتور تصویر ندارد",
      value: 1
    },
    {
      id: "9",
      title: "کیبورد کار نمی‌کند",
    },
    {
      id: "10",
      title: "ماوس کار نمی‌کند",
    },
    {
      id: "11",
      title: "پورت‌ها کار نمی‌کنند",
    },
    {
      id: "12",
      title: "سایر مشکلات...",
    },

  ];

  return (
    <ImageBackground source={require("../assets/moon.jpg")} style={NewStyles.container} >
      <CustomStatusBar />
      <ScreenHeaders
        title={'لپ تاپ'}
      />
      <FlatList
        data={issues}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        ListHeaderComponent={() => {
          return (
            <ScreenTitle title={'سخت افزار'} />
          )
        }}
        renderItem={({ item }) => {
          return (
            <CheckBox item={item} />
          )
        }}
      />

      <View style={{ width: '100%', padding: 10 }}>
        <TextInput
          placeholder="درخواست دیگری دارید بنویسید..."
          placeholderTextColor="#fff"
          style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
        />
      </View>

    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  nextButton: {
    position: "absolute",
    top: 40,
    right: 10,

    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 10,
  },
  nextText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "300",
  },
  container: {
    padding: 20,
    // paddingBottom: 100,
    // alignItems: 'stretch',
    padding: 30,
  },
  title: {
    backgroundColor: "#005b9f",
    color: "#00ffcc",
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ffeb3b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
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
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
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
    backgroundColor: themeColor4.bgColor(1),
    height: 50
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 8,
    textAlign: "right",
  },
});
