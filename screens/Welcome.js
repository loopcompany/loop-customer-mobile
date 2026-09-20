import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";

export default function Welcome({ navigation }) {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const isRestored = useSelector((state) => state.auth.isRestored);

  // این صفحه هم مقصدِ بعد از اسپلش است و هم مقصدِ بعد از خروج از حساب، و در هر
  // دو حالت به منوی ورودی می‌رود — چون همان منو است که هر دو مسیر ورود (مشتری و
  // سازمانی) از آن باز می‌شوند.
  //
  // Both the cold start and `useLogout` land here, and both continue to the
  // entry menu. Branching on the token used to send signed-out visitors
  // straight to `SignInLanding`, which skipped the menu — and with it the only
  // route to the organisation login. `OrderMenuScreen` is a public route now,
  // so there is no guard to bounce off and no round trip to avoid.
  //
  // `isRestored` is still waited on: `token: null` means "not read yet" as much
  // as "signed out" on a cold start, and the menu's own contents do not depend
  // on it, but anything downstream does.
  useEffect(() => {
    if (!isRestored) return undefined;

    const timer = setTimeout(() => {
      navigation.replace('OrderMenuScreen');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isRestored, navigation]);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [])
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('@assets/loopbackground.webp') : require("@assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={"cover"}>
      <TouchableWithoutFeedback
        onPress={() => {
          // navigation.navigate("OrderMenuScreen");
        }}
      >
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
