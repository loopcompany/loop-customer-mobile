import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Footer from "@screens/Footer";
import ScreenHeaders from "@components/ScreenHeaders";
import NewStyles from "@styles/NewStyles";
import { themeColor0, themeColor1, themeColor3, themeColor4, colors } from "@theme/Color";
import { spacing } from "@theme/Spacing";
import { radius } from "@theme/Radius";
import { fontSize, getFontFamily } from "@theme/Typography";
import { shadow } from "@theme/Shadows";
import CustomStatusBar from "@components/CustomStatusBar";
import { ImageBackground } from "expo-image";
import { createStyles } from '@styles/NewStyles';
import TransparentButton from "@components/TransparentButton";
import { imageUri, mainUri } from "@services/URL";
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
        source={Platform.OS === 'web' ? require('@assets/loopbackground.webp') : require("@assets/moon.jpg")}
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
            {/* عنوان بخش «سازمانی / شرکتی» - عمداً کوچک‌تر از دکمه‌ی ورود است
                تا کاربر دکمه‌ی واقعی عمل را اشتباه نگیرد. */}
            <View
              style={{
                width: "58%",
                backgroundColor: colors.primary.bgColor(0.75),
                borderRadius: radius.sm,
                paddingVertical: spacing.sm,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginBottom: spacing.sm,
                ...shadow.sm,
              }}
            >
              <Text
                style={{
                  color: colors.textInverse.color,
                  fontSize: fontSize.sm,
                  fontFamily: getFontFamily('bold', i18n.language),
                  textAlign: "center",
                }}
              >

                {t("Organization / Company")}
              </Text>
              {/* Arrow down */}
              <View
                style={{
                  position: "absolute",
                  bottom: -8,
                  alignSelf: "center",
                  width: 0,
                  height: 0,
                  borderLeftWidth: 9,
                  borderRightWidth: 9,
                  borderTopWidth: 8,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: colors.primary.bgColor(0.75),
                }}
              />
            </View>

            {/* دکمه‌ی ورود - عمل اصلی این صفحه: بزرگ، پررنگ و با آیکون تا در نگاه
                اول به‌عنوان دکمه دیده شود. */}
            <TouchableOpacity
              onPress={handleOrganizationalLogin}
              activeOpacity={0.85}
              accessibilityRole="button"
              style={{
                width: "86%",
                maxWidth: 420,
                // سرمه‌ای اصلی اپ با حاشیه‌ی طلایی - همان ترکیبی که نوار عنوان
                // صفحه‌های دیگر دارد، و روی پس‌زمینه‌ی آبی روشن هم خوانا می‌ماند.
                backgroundColor: colors.primary.bgColor(1),
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: colors.accent.bgColor(1),
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.lg,
                marginTop: spacing.xl,
                marginBottom: spacing.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
                ...shadow.lg,
              }}
            >
              <Ionicons name="log-in-outline" size={26} color={colors.accent.color} />
              <Text
                style={{
                  color: colors.textInverse.color,
                  fontSize: fontSize.xl,
                  fontFamily: getFontFamily('bold', i18n.language),
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
