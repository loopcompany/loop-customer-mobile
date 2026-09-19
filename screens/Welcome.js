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
  const token = useSelector((state) => state.auth.token);
  const isRestored = useSelector((state) => state.auth.isRestored);

  // این صفحه مقصدِ بعد از خروج از حساب هم هست، پس نباید بی‌قید به صفحه‌ی
  // نیازمندِ ورود برود.
  //
  // `useLogout` lands here, so this screen is shown to signed-out users as
  // often as to signed-in ones. Sending everyone on to `OrderMenuScreen` put a
  // just-logged-out user straight back into a guarded screen, which then
  // bounced them again — a visible round trip through the wrong page. Pick the
  // destination from the session instead.
  useEffect(() => {
    if (!isRestored) return undefined;

    const timer = setTimeout(() => {
      navigation.replace(token ? 'OrderMenuScreen' : 'SignInLanding');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isRestored, token, navigation]);

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
