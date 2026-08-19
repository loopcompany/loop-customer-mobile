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
import { useDispatch } from "react-redux";

export default function Welcome({ navigation }) {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const navigateToMainApp = () => {
    setTimeout(() => {
      navigation.replace('OrderMenuScreen');
    }, 4000);
  };
  useEffect(() => {
    navigateToMainApp()
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
