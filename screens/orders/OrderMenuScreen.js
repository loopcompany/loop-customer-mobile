import React from "react";
import { View, Image, StyleSheet, ScrollView, Linking, Platform, } from "react-native";
import Menuitem from "../../components/Menuitem";
import NewStyles from "../../styles/NewStyles";
import { ImageBackground } from "expo-image";
import { withOrganizationAccess, ACCESS_PRESETS } from "../../components/withOrganizationAccess";
const callSupport = () => {
  Linking.openURL("tel:09012955939"); // شماره دلخواهت
};

function OrderMenuScreen({ navigation }) {
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={"cover"}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, , NewStyles.center]}>
          <Image
            source={require("../../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.container, NewStyles.center]}>
          <Menuitem
            style={{ width: "75%" }}
            title={"سفارش سیستماتیک"}
            subTitle={"(انتخابی)"}
            onPress={() => {
              navigation.navigate("SignInLanding");
            }}
          />

          <Menuitem
            style={{ width: "75%" }}
            title={"سفارش فوری"}
            subTitle={"(تماس)"}
            onPress={callSupport}
          />

          <Menuitem
            style={{ width: "75%" }}
            title={"هوش مصنوعی"}
            subTitle={"(به زودی)"}
            onPress={() => {
              navigation.navigate("SignInLanding");
            }}
          />
        </View>
        <View style={[styles.container, NewStyles.center]}>
          <Menuitem
            style={{ width: "75%" }}
            title={"سازمانی / شرکتی"}
            onPress={() => {
              navigation.navigate("Grouping");
            }}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  glassbutton: {
    width: "90%",
    backgroundColor: "rgba(70, 100,255,0.5)",
    borderRadius: 20,
    marginVertical: 10,
    paddingBottom: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    width: '100%',
  },

  menuButton: {
    backgroundColor: "rgba(70, 100,255,0.5)",
    paddingVertical: 15,
    paddingHorizontal: 40,

    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  menuText: {
    color: "#ffff66",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 26,
  },
  bottomButton: {
    backgroundColor: "#66ccff",
    marginTop: 50,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: "#00f",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
    width: "90%",
    alignItems: "center",
  },
  bottomText: {
    color: "#ffe600",
    fontSize: 18,
    fontWeight: "bold",
  },
});

// محافظت از صفحه منوی سفارشات - نقطه ورود به مدیریت سفارشات
// نکته: OrderMenuScreen برای کاربران لاگین نکرده هم باید در دسترس باشد
export default withOrganizationAccess(OrderMenuScreen, {
    allowOrganizationAccess: true,
    requireCompleteAccess: false, // کاربران لاگین نکرده هم می‌توانند ببینند
    customAccessCheck: ({ hasCompleteAccess, isOrganizationUser, isAuthenticated }) => {
      // اگر کاربر لاگین نکرده، اجازه دسترسی بده (بعداً در FolderScreen چک می‌شود)
      if (!isAuthenticated) {
        return { allowed: true };
      }
      
      // اگر کاربر فردی است، دسترسی آزاد
      if (!isOrganizationUser) {
        return { allowed: true };
      }
      
      // اگر کاربر سازمانی است، باید تایید کامل داشته باشد
      return {
        allowed: hasCompleteAccess,
        title: "نیاز به تایید کامل",
        message: "برای مشاهده منوی سفارشات، باید هم پروفایل و هم قرارداد شما تایید شده باشد",
        showRetry: true
      };
    },
    screenName: 'OrderMenuScreen'
});
