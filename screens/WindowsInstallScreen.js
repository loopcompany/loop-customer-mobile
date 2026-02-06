// WindowsInstallScreen.js

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  SafeAreaView,
  FlatList,
} from "react-native";
import Footer from "./Footer";
import ScreenHeaders from "../components/ScreenHeaders";
import RadioButton from "../components/RadioButton";
import ScreenTitle from "../components/ScreenTitle";
import NewStyles from "../styles/NewStyles";
export default function WindowsInstallScreen({ navigation }) {
  const windowsVersions = [
    {
      id: 1,
      title: "ویندوز 11",
    }
    , {
      id: 2,
      title: "ویندوز 10",
    }
    , {
      id: 3,
      title: "ویندوز 8.1",
      value: 1
    }
    ,
    {
      id: 4,
      title: "ویندوز 7",
    },
    {
      id: 5,
      title: "ویندوز XP",
    },
    {
      id: 6,
      title: "ویندوز سرور",
    },
    {
      id: 7,
      title: "سیستم عامل Mac",
    },



  ];

  return (
    <ImageBackground source={require("../assets/moon.jpg")} style={NewStyles.container} >
      <ScreenHeaders
        title={'لپ تاپ'}
      />

      <FlatList
        contentContainerStyle={{ gap: 10, padding: 10 }}
        ListHeaderComponent={() => {
          return (

            <ScreenTitle title={'نصب سیستم عامل'} onPress={() => navigation.navigate("DeviceModelInfoScreen")} />
          )
        }}
        data={windowsVersions}
        renderItem={({ item }) => {
          return (
            <RadioButton item={item} />
          )
        }}
      />

    </ImageBackground>
  );
}

const styles = StyleSheet.create({

});
