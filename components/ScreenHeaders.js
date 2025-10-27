import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, StatusBar, Platform } from "react-native";
import React from "react";
import NewStyles from "../styles/NewStyles";
import { themeColor4 } from "../theme/Color";

const ScreenHeaders = ({ title, onPressLeft, onPressRight }) => {
  const { width } = Dimensions.get('window');
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  
  return (
    <View style={[styles.header, NewStyles.rowWrapper, { 
      width: width,
      paddingTop: statusBarHeight,
      height: 50 + statusBarHeight
    }]}>
      <TouchableOpacity onPress={onPressRight} style={styles.iconContainer}>
        <Image source={require("../assets/next.png")} style={styles.arrow} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={[NewStyles.title, NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
      </View>
      <TouchableOpacity onPress={onPressLeft} style={styles.iconContainer}>
        <Image source={require("../assets/back.png")} style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
};

export default ScreenHeaders;

const styles = StyleSheet.create({
  header: {
    backgroundColor: themeColor4.bgColor(1),
    height: 50,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  titleText: {
    textAlign: "center",
    fontSize: 16,
  },
});
