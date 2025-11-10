import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import NewStyles from "../styles/NewStyles";
import { themeColor0, themeColor10 } from "../theme/Color";
import { ImageBackground } from "expo-image";

export default function Welcome({ navigation }) {
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../assets/webbackground.webp') : require("../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={Platform.OS==='web' ? "cover":  "contain"}>
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate("OrderMenuScreen");
        }}
      >
        <View style={{ flex: 1, backgroundColor: themeColor0.bgColor(0.25) }}>
          <View style={[{ flex: 1 }, NewStyles.center]}>
            <Image
              source={require("../assets/logo.png")}
              style={NewStyles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={[{ flex: 2, gap: 15 }]}>
            <Text
              style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
            >
              سلام
            </Text>
            <Text
              style={[NewStyles.title1, { textAlign: "center", fontSize: 45 }]}
            >
              به جوهر آینده
            </Text>
            <Text
              style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
            >
              خوش آمدید
            </Text>
          </View>
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
