import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import NewStyles from "@styles/NewStyles";
import { themeColor0, themeColor10 } from "@theme/Color";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";
import { fetchContacts } from "@slices/contactSlice";
import { useDispatch } from "react-redux";

// مدت نمایش خوش‌آمد پیش از صفحه‌ی ورود/ثبت‌نام
const WELCOME_MS = 4000;

export default function Welcome({ navigation }) {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  // بعد از این خوش‌آمد، مهمان به صفحه‌ی ورود/ثبت‌نام می‌رود — نه به منوی سفارش.
  // تا ۱۴۰۵/۰۹/۰۲ مقصد OrderMenuScreen بود و کاربر با بازکردن اپ، بدون هیچ
  // صفحه‌ی ورود یا ثبت‌نامی، مستقیم وارد صفحه‌ی اصلی می‌شد. این صفحه مقصدِ بعد از
  // خروج از حساب هم هست، پس آن مسیر هم همین‌جا به صفحه‌ی ورود می‌رسد.
  const enterSignIn = useCallback(() => navigation.replace('SignInLanding'), [navigation]);
  useEffect(() => {
    const timer = setTimeout(enterSignIn, WELCOME_MS);
    dispatch(fetchContacts());
    return () => clearTimeout(timer);
  }, [dispatch, enterSignIn]);
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('@assets/loopbackground.webp') : require("@assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={"cover"}>
      <TouchableWithoutFeedback onPress={enterSignIn}>
        <View style={[{ flex: 1, backgroundColor: themeColor0.bgColor(0.25) }, NewStyles.center]}>


          <Text style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}>{t("Hello")}</Text>
          <Text
            style={[NewStyles.title1, { textAlign: "center", fontSize: 45 }]}
          >
            {t("To the essence of the future")}
          </Text>
          <View style={[{}, NewStyles.center]}>

            <Image
              source={require("@assets/logo.png")}
              style={NewStyles.logo}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
          >
            {t("Welcome")}
          </Text>
          {/* لمس صفحه، انتظار را کوتاه می‌کند و همان صفحه‌ی ورود/ثبت‌نام را باز می‌کند */}
          <Text style={[NewStyles.title4, { textAlign: "center", fontSize: 14, opacity: 0.75, marginTop: 18 }]}>
            {t("Tap to continue")}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 100,
  },
});
