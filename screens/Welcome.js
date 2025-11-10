import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import NewStyles from "../styles/NewStyles";
import { themeColor0, themeColor1, themeColor4, themeColor10 } from "../theme/Color";
import { ImageBackground } from "expo-image";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Welcome({ navigation }) {
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleMainPress = () => {
    // 🔒 چک کنیم کاربر لاگین کرده یا نه
    if (isAuthenticated) {
      // کاربر لاگین کرده → به صفحه اصلی بره
      navigation.navigate("MainApp", { screen: 'FolderScreen' });
    } else {
      // کاربر لاگین نکرده → به صفحه لاگین فردی بره
      navigation.navigate("SignInLanding");
    }
  };

  const handleOrganizationPress = () => {
    // هدایت به صفحه انتخاب نوع سازمانی
    navigation.navigate("Grouping");
  };

  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../assets/webbackground.webp') : require("../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit={Platform.OS === 'web' ? "cover" : "contain"}>
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

          {/* دکمه ورود سازمانی */}
          <View style={styles.organizationButtonContainer}>
            <TouchableOpacity
              style={styles.organizationButton}
              onPress={handleOrganizationPress}
            >
              <Icon name="business" size={24} color={themeColor4.color} />
              <Text style={styles.organizationButtonText}>
                ورود سازمانی / شرکتی
              </Text>
              <Icon name="arrow-back" size={24} color={themeColor4.color} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  organizationButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  organizationButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColor1.bgColor(0.9),
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  organizationButtonText: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor4.color,
    textAlign: 'center',
    flex: 1,
  },
});
