// screens/TrainingRegistrationScreen.js
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaders from "../components/ScreenHeaders";
import { themeColor14 } from "../theme/Color";
import Footer from "./Footer";
import NewStyles from "../styles/NewStyles";

export default function TrainingRegistrationScreen({ navigation }) {
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ScreenHeaders 
        title="ثبت نام دوره‌های آموزشی" 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      <View style={styles.contentBox}>
        <Text
          style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
        >
          مراحل ثبت و توضیحات{"\n"}
          فقط سایت{"\n"}
          پر کردن اطلاعات ضروری{"\n"}
          شماره ثابت ۰۲۱{"\n"}
          شماره همراه{"\n"}
          آدرس{"\n"}
          همه موارد ضروری
        </Text>
      </View>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColor14.bgColor(1),
  },
  contentBox: {
    // marginTop: 40,
    padding: 20,
    flex: 1,

  },
  title: {
    backgroundColor: "#a6d7f7",
    color: "#003366",
    fontWeight: "bold",
    fontSize: 18,
    padding: 10,
    textAlign: "center",
    borderRadius: 10,
  },
  description: {
    backgroundColor: "#fff",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    textAlign: "right",
    fontSize: 14,
    color: "#333",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  footerText: {
    fontWeight: "bold",
    color: "#003366",
  },
});
