import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, StatusBar, Platform } from "react-native";
import React from "react";
import NewStyles from "../styles/NewStyles";
import { themeColor4 } from "../theme/Color";
import { useNavigation } from "@react-navigation/native";

const ScreenHeaders = ({ 
  title, 
  // Old API (deprecated but still supported for backward compatibility)
  onPressLeft,    
  onPressRight,
  // New API (recommended - more clear naming)
  onBackPress
}) => {
  const { width } = Dimensions.get('window');
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const navigation = useNavigation();
  
  // Priority: new API > old API > default navigation.goBack()
  const handleBack = onBackPress || onPressLeft || (() => {navigation.goBack()});
  
  return (
    <View style={[styles.header, NewStyles.rowWrapper, { 
      width: width,
      paddingTop: statusBarHeight,
      height: 50 + statusBarHeight
    }]}>
      {/* Right side: Empty space for symmetry */}
      <View style={styles.iconContainer} />
      
      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={[NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
      </View>
      
      {/* Left side: Back button (RTL) */}
      <TouchableOpacity 
        onPress={handleBack} 
        style={[styles.iconContainer, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Image source={require("../assets/back.png")} style={styles.arrow} />
        <Text style={[NewStyles.title10,styles.titleText]}>قبلی</Text>
      </TouchableOpacity>
      
      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={[NewStyles.title, NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
      </View>

      <View style={{ flex: 1 }} />
      {/* Left side: Next button (RTL) */}
      {/* <TouchableOpacity 
        onPress={handleNext} 
        style={[styles.iconContainer, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text style={styles.titleText}>بعدی</Text>
        <Image source={require("../assets/next.png")} style={styles.arrow} />
      </TouchableOpacity> */}
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
    minWidth: 60,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  arrow: {
    width: 24,
    height: 24,
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
    fontSize: 12,
    // fontFamily: 'VazirBold',
  },
});
