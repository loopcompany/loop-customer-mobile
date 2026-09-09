import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Platform } from "react-native";
import React from "react";
import { useTranslation } from 'react-i18next';
import NewStyles from "@styles/NewStyles";
import { themeColor4 } from "@theme/Color";
import { useNavigation } from "@react-navigation/native";

const ScreenHeaders = ({
  title,
  // Old API (deprecated but still supported for backward compatibility)
  onPressLeft,
  onPressRight,
  // New API (recommended - more clear naming)
  onBackPress
}) => {
  const { t } = useTranslation();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const navigation = useNavigation();

  // Priority: new API > old API > default navigation.goBack()
  const handleBack = onBackPress || onPressLeft || (() => {
    if (Platform.OS == 'web') {
      window.history.back()
    } else {
      navigation.goBack()
    }
  });

  return (
    <View style={[styles.header, NewStyles.rowWrapper, {
      paddingTop: statusBarHeight,
      height: 50 + statusBarHeight
    }]}>
      {/* Right side: Empty space for symmetry */}
      <View style={styles.iconContainer} />

      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={[NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit> {title} </Text>
      </View>

      {/* Left side: Back button (RTL) */}
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.iconContainer, NewStyles.row]}
      >
         <Image source={require("@assets/gif/prev.gif")} style={styles.arrow} />
        <Text style={[NewStyles.title10, styles.titleText]}>{t("Back")}</Text>
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
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  iconContainer: {
    minWidth: 56,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 4,
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
    paddingHorizontal: 12,
  },
  titleText: {
    textAlign: "center",
    fontSize: 12,
    marginRight: 4,
  },
});
