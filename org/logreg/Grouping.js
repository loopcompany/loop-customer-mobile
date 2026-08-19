import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable, Platform, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import Footer from "../../screens/Footer";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor3, themeColor4 } from "../../theme/Color";
import CustomStatusBar from "../../components/CustomStatusBar";
import { ImageBackground } from "expo-image";
import { createStyles } from '../../styles/NewStyles';
import TransparentButton from "../../components/TransparentButton";
import { imageUri, mainUri } from "../../services/URL";
import { useSelector } from "react-redux";
const Grouping = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  // const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [isOrganizationalGuideOpen, setIsOrganizationalGuideOpen] = useState(false);
  const handleOrganizationalLogin = () => {
    navigation.navigate("Login");
  };

  const handleCompanyLogin = () => {
    // Navigate to company login
    navigation.navigate("Login"); // You can create a separate company login screen if needed
  };
  const pdf = useSelector(state=>state.pdf?.data)
  return (
    <View style={[NewStyles.container, { flex: 1 }]}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t("Organization / Company")}
      />

      {/* Background with image */}
      <ImageBackground
        cachePolicy={"memory-disk"}
        source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")}
        style={[NewStyles.container, { backgroundColor: "#020305" }]}
        contentPosition={"center"}
        contentFit="cover"
      >
        {/* Top section with header text */}
        <Pressable
          onPress={() => { navigation.navigate('OrganizationTermsScreen') }}
          style={{
            alignItems: "center",
            paddingTop: 30,
            paddingBottom: 30,
            paddingHorizontal: 25,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 15,
              borderWidth: 1.5,
              borderColor: "#333",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "VazirBold",
                textAlign: "center",
                color: "#333",
                lineHeight: 18,
              }}
            >
              {t("System terms and conditions in the organization / company panel")}
            </Text>
          </View>
        </Pressable>

        {/* Central tower-like structure */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-start",
            paddingHorizontal: 20,
            paddingTop: 100,
          }}
        >
          {/* Organizational Section */}
          <View
            style={{
              width: "100%",
              marginBottom: 50,
              alignItems: "center",
            }}
          >
            {/* Main header - سازمانی / دولتی */}
            <View
              style={{
                width: "75%",
                backgroundColor: "#1a4480",
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                elevation: 8,
                shadowColor: "#1a4480",
                shadowOpacity: 0.5,
                shadowRadius: 8,
                position: "relative",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >

                {t("Organization / Company")}
              </Text>
              {/* Arrow down */}
              <View
                style={{
                  position: "absolute",
                  bottom: -10,
                  alignSelf: "center",
                  width: 0,
                  height: 0,
                  borderLeftWidth: 12,
                  borderRightWidth: 12,
                  borderTopWidth: 10,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: "#1a4480",
                }}
              />
            </View>

            {/* Login button for organizational */}
            <TouchableOpacity
              onPress={handleOrganizationalLogin}
              style={{
                width: "60%",
                backgroundColor: "#4a90e2",
                borderRadius: 8,
                paddingVertical: 10,
                marginTop: 8,
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
                shadowColor: "#4a90e2",
                shadowOpacity: 0.4,
                shadowRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
                {t("Login to account")}
              </Text>
            </TouchableOpacity>
            <TransparentButton
              onPress={() => { Linking.openURL(`${imageUri}/${pdf?.organ}`) }}
              customStyle={[{ borderColor: themeColor0.bgColor(1), borderWidth: 1, width: '70%', maxWidth: 400, backgroundColor: themeColor4.bgColor(0.5) }, NewStyles.border10]}
              title={t("Organizational Application Guide")}
              customTextStyle={NewStyles.title}
            />
          </View>

        </View>

      </ImageBackground>
    </View>
  );
};

export default Grouping;
