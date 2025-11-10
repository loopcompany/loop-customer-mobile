import React from "react";
import { View, Image, StyleSheet, ScrollView, Linking, Platform, } from "react-native";
import Menuitem from "../../components/Menuitem";
import NewStyles from "../../styles/NewStyles";
import { ImageBackground } from "expo-image";
const callSupport = () => {
  Linking.openURL("tel:09012955939"); // شماره دلخواهت
};

export default function OrderMenuScreen({ navigation }) {
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/webbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={Platform.OS==='web' ? "cover":  "contain"}>
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
